/* ==========================================================================
   API de comentários — Vercel Serverless Function

   Fala com o Redis de dois jeitos: por TCP (Redis Cloud, usando o pacote
   redis) ou pela API REST (Upstash, usando fetch). Escolhe sozinho pelo
   formato da variavel que a Vercel injetou.

   CONFIGURAÇÃO — só uma coisa é obrigatória:

     Criar o banco na Vercel (Storage > Create Database > Redis).
     Ao conectá-lo ao projeto, a Vercel injeta sozinha:
        KV_REDIS_URL (TCP)  ou  KV_REST_API_URL + KV_REST_API_TOKEN (REST)

   A senha de moderação é definida pela própria tela /blog/moderacao.html
   na primeira vez que ela for aberta, e fica guardada no Redis com
   scrypt + sal. Não precisa criar variável de ambiente nem republicar.

   Quem preferir travar a senha por variável pode definir MODERACAO_TOKEN;
   nesse caso ela tem prioridade e a tela de primeiro acesso é desligada.

   ROTAS
     GET  /api/comentarios?slug=...     lista os aprovados
     GET  /api/comentarios?estado=1     diz se a senha já foi definida
     POST /api/comentarios              envia comentário (fica pendente)
     POST {acao:'definir-senha'}        só funciona enquanto não houver senha
     GET  /api/comentarios?fila=1       lista pendentes    (exige senha)
     POST {acao:'aprovar'|'recusar'}    modera             (exige senha)
   ========================================================================== */

const crypto = require('crypto');

/* Acha a conexao do Redis. Aceita dois formatos:
   - REST (Upstash): par *_REST_API_URL + *_REST_API_TOKEN, falado por fetch
   - TCP (Redis Cloud): uma URL redis:// ou rediss://, falada pelo cliente
   Assim funciona com qualquer banco que a Vercel ofereca, e com qualquer
   prefixo de variavel que tenha sido escolhido na criacao. */
function acharConexao() {
  const e = process.env;

  const url   = e.KV_REST_API_URL   || e.UPSTASH_REDIS_REST_URL;
  const token = e.KV_REST_API_TOKEN || e.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) return { modo: 'rest', url: url, token: token };

  const SUF = '_REST_API_URL';
  for (const chave of Object.keys(e)) {
    if (!chave.endsWith(SUF)) continue;
    const base = chave.slice(0, -SUF.length);
    /* o READ_ONLY_TOKEN nao serve: ele nao grava */
    const t = e[base + '_REST_API_TOKEN'];
    if (e[chave] && t) return { modo: 'rest', url: e[chave], token: t };
  }

  for (const chave of Object.keys(e)) {
    const v = e[chave];
    if (typeof v === 'string' && /^rediss?:\/\//.test(v)) return { modo: 'tcp', url: v };
  }
  return { modo: null };
}

const conexao   = acharConexao();
const URL_REDIS = conexao.url || null;
const TOKEN     = conexao.token || null;
const MODO      = conexao.modo;
const SENHA_ENV = process.env.MODERACAO_TOKEN || '';

const LIMITE_NOME = 60;
const LIMITE_TEXTO = 2000;
const MAX_POR_MINUTO = 3;
const MIN_SENHA = 12;

/* O cliente TCP é reaproveitado entre invocações quentes: abrir conexão
   a cada comentário custaria mais que o próprio comando. */
let clienteTcp = null;

async function conectarTcp() {
  if (clienteTcp && clienteTcp.isOpen) return clienteTcp;
  const { createClient } = require('redis');
  clienteTcp = createClient({ url: URL_REDIS });
  /* sem este ouvinte, um erro de socket derruba a função inteira */
  clienteTcp.on('error', function () {});
  await clienteTcp.connect();
  return clienteTcp;
}

async function redis(comando) {
  const partes = comando.map(String);

  if (MODO === 'tcp') {
    const c = await conectarTcp();
    return c.sendCommand(partes);
  }

  const r = await fetch(URL_REDIS, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(partes)
  });
  if (!r.ok) throw new Error('redis ' + r.status);
  return (await r.json()).result;
}

/* aceita só o que parece caminho de artigo, para ninguém inventar chave */
function limparSlug(s) {
  if (typeof s !== 'string') return null;
  const limpo = s.trim().toLowerCase().replace(/[^a-z0-9/_.-]/g, '').slice(0, 120);
  return limpo || null;
}

/* guarda texto puro; quem exibe escapa. Aqui só tiramos os sinais que
   permitiriam injetar marcação, e normalizamos as quebras de linha */
function limparTexto(s, max) {
  if (typeof s !== 'string') return '';
  return s.replace(/[<>]/g, '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
}

function ipDe(req) {
  const h = req.headers['x-forwarded-for'];
  return (Array.isArray(h) ? h[0] : (h || '')).split(',')[0].trim() || 'sem-ip';
}

function senhaEnviada(req) {
  const h = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return h || (req.query && req.query.token) || '';
}

/* comparação de tempo constante: não vaza o tamanho nem o conteúdo
   pela duração da resposta */
function iguais(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

function derivar(senha, sal) {
  return crypto.scryptSync(String(senha), sal, 32).toString('hex');
}

async function autorizado(req) {
  const dada = senhaEnviada(req);
  if (!dada) return false;

  if (SENHA_ENV) return iguais(dada, SENHA_ENV);

  const guardada = await redis(['GET', 'cfg:senha']);
  if (!guardada) return false;
  const [sal, hash] = String(guardada).split(':');
  if (!sal || !hash) return false;
  return iguais(derivar(dada, sal), hash);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  /* no modo TCP não existe token: a credencial vem dentro da própria URL */
  if (!MODO) {
    return res.status(503).json({ erro: 'banco-nao-configurado' });
  }

  try {
    /* ---------- primeiro acesso: já existe senha? ------------------- */
    if (req.method === 'GET' && req.query.estado) {
      if (SENHA_ENV) return res.status(200).json({ senhaDefinida: true, porVariavel: true });
      const g = await redis(['GET', 'cfg:senha']);
      return res.status(200).json({ senhaDefinida: !!g, porVariavel: false });
    }

    /* ---------- fila de moderação ---------------------------------- */
    if (req.method === 'GET' && req.query.fila) {
      if (!(await autorizado(req))) return res.status(401).json({ erro: 'nao-autorizado' });
      const bruto = await redis(['HGETALL', 'pend']);
      const itens = [];
      /* HGETALL volta como lista achatada [campo, valor, ...] em um
         cliente e como objeto {campo: valor} em outro. Aceita os dois. */
      const valores = Array.isArray(bruto)
        ? bruto.filter(function (_, i) { return i % 2 === 1; })
        : Object.values(bruto || {});
      valores.forEach(function (v) {
        try { itens.push(JSON.parse(String(v))); } catch (e) { /* item corrompido: ignora */ }
      });
      itens.sort((a, b) => b.data - a.data);
      return res.status(200).json({ itens });
    }

    /* ---------- lista pública -------------------------------------- */
    if (req.method === 'GET') {
      const slug = limparSlug(req.query.slug);
      if (!slug) return res.status(400).json({ erro: 'slug-invalido' });
      const bruto = await redis(['LRANGE', 'apr:' + slug, '0', '199']);
      const itens = (bruto || []).map(function (s) {
        try {
          const c = JSON.parse(s);
          return { id: c.id, nome: c.nome, texto: c.texto, data: c.data, resposta: c.resposta || null };
        } catch (e) { return null; }
      }).filter(Boolean);
      return res.status(200).json({ itens });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ erro: 'metodo-nao-permitido' });
    }

    const corpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    /* ---------- definir a senha, uma única vez ---------------------- */
    if (corpo.acao === 'definir-senha') {
      if (SENHA_ENV) return res.status(409).json({ erro: 'senha-por-variavel' });
      const jaTem = await redis(['GET', 'cfg:senha']);
      if (jaTem) return res.status(409).json({ erro: 'senha-ja-definida' });

      const nova = String(corpo.senha || '');
      if (nova.length < MIN_SENHA) return res.status(400).json({ erro: 'senha-curta' });

      const sal = crypto.randomBytes(16).toString('hex');
      /* SETNX: se dois pedidos chegarem juntos, só o primeiro grava */
      const gravou = await redis(['SETNX', 'cfg:senha', sal + ':' + derivar(nova, sal)]);
      if (gravou !== 1) return res.status(409).json({ erro: 'senha-ja-definida' });
      return res.status(201).json({ ok: true });
    }

    /* ---------- moderar -------------------------------------------- */
    if (corpo.acao === 'aprovar' || corpo.acao === 'recusar') {
      if (!(await autorizado(req))) return res.status(401).json({ erro: 'nao-autorizado' });
      const id = String(corpo.id || '').slice(0, 40);
      if (!id) return res.status(400).json({ erro: 'id-ausente' });

      const guardado = await redis(['HGET', 'pend', id]);
      if (!guardado) return res.status(404).json({ erro: 'nao-encontrado' });

      await redis(['HDEL', 'pend', id]);

      if (corpo.acao === 'aprovar') {
        const c = JSON.parse(guardado);
        if (corpo.resposta) c.resposta = limparTexto(corpo.resposta, LIMITE_TEXTO);
        delete c.email;   /* o e-mail nunca vai para a lista pública */
        await redis(['LPUSH', 'apr:' + c.slug, JSON.stringify(c)]);
      }
      return res.status(200).json({ ok: true });
    }

    /* ---------- novo comentário ------------------------------------ */
    const slug = limparSlug(corpo.slug);
    if (!slug) return res.status(400).json({ erro: 'slug-invalido' });

    /* campo isca: humano nunca preenche, robô costuma preencher tudo.
       Responde 200 de propósito, para o robô achar que funcionou */
    if (corpo.site) return res.status(200).json({ ok: true });

    if (corpo.consentimento !== true) return res.status(400).json({ erro: 'consentimento-obrigatorio' });

    const nome  = limparTexto(corpo.nome, LIMITE_NOME);
    const texto = limparTexto(corpo.texto, LIMITE_TEXTO);
    if (nome.length < 2)  return res.status(400).json({ erro: 'nome-curto' });
    if (texto.length < 4) return res.status(400).json({ erro: 'texto-curto' });

    /* freio por IP */
    const chaveIp = 'rl:' + ipDe(req);
    const quantos = await redis(['INCR', chaveIp]);
    if (quantos === 1) await redis(['EXPIRE', chaveIp, '60']);
    if (quantos > MAX_POR_MINUTO) return res.status(429).json({ erro: 'muitas-tentativas' });

    const item = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      slug: slug,
      nome: nome,
      texto: texto,
      data: Date.now()
    };
    /* e-mail é opcional e nunca volta na listagem pública */
    if (typeof corpo.email === 'string' && corpo.email.includes('@')) {
      item.email = corpo.email.trim().slice(0, 120);
    }

    await redis(['HSET', 'pend', item.id, JSON.stringify(item)]);
    return res.status(201).json({ ok: true, moderacao: true });

  } catch (e) {
    return res.status(500).json({ erro: 'falha-interna' });
  }
};

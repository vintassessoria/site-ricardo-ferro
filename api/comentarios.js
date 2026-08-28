/* ==========================================================================
   API de comentários — Vercel Serverless Function

   Sem dependência de npm: fala com o Redis pela API REST, usando o fetch
   que já vem no Node. Por isso o projeto continua sem build.

   VARIÁVEIS DE AMBIENTE (a Vercel injeta as duas primeiras sozinha
   quando você cria o banco em Storage > Create Database > Redis):
     KV_REST_API_URL      ou  UPSTASH_REDIS_REST_URL
     KV_REST_API_TOKEN    ou  UPSTASH_REDIS_REST_TOKEN
     MODERACAO_TOKEN      -> essa você cria: uma senha longa qualquer.
                             É o que protege a tela de moderação.

   ROTAS
     GET  /api/comentarios?slug=...          lista os aprovados
     POST /api/comentarios                   envia um comentário (fica pendente)
     GET  /api/comentarios?fila=1            lista pendentes   (exige token)
     POST /api/comentarios  {acao:'aprovar'} aprova ou recusa   (exige token)
   ========================================================================== */

const URL_REDIS = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN     = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const SENHA_MOD = process.env.MODERACAO_TOKEN;

const LIMITE_NOME = 60;
const LIMITE_TEXTO = 2000;
const MAX_POR_MINUTO = 3;

async function redis(comando) {
  const r = await fetch(URL_REDIS, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(comando)
  });
  if (!r.ok) throw new Error('redis ' + r.status);
  const j = await r.json();
  return j.result;
}

/* aceita so o que parece caminho de artigo, para ninguem inventar chave */
function limparSlug(s) {
  if (typeof s !== 'string') return null;
  const limpo = s.trim().toLowerCase().replace(/[^a-z0-9/_.-]/g, '').slice(0, 120);
  return limpo || null;
}

/* guarda texto puro; quem exibe escapa. Aqui so tiramos os sinais que
   permitiriam injetar marcação, e normalizamos as quebras de linha */
function limparTexto(s, max) {
  if (typeof s !== 'string') return '';
  return s.replace(/[<>]/g, '').replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, max);
}

function ipDe(req) {
  const h = req.headers['x-forwarded-for'];
  return (Array.isArray(h) ? h[0] : (h || '')).split(',')[0].trim() || 'sem-ip';
}

function autorizado(req) {
  if (!SENHA_MOD) return false;
  const dado = (req.headers.authorization || '').replace(/^Bearer\s+/i, '') || (req.query && req.query.token) || '';
  /* comparação de tamanho fixo para não vazar o tamanho pelo tempo */
  if (dado.length !== SENHA_MOD.length) return false;
  let dif = 0;
  for (let i = 0; i < SENHA_MOD.length; i++) dif |= dado.charCodeAt(i) ^ SENHA_MOD.charCodeAt(i);
  return dif === 0;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (!URL_REDIS || !TOKEN) {
    return res.status(503).json({ erro: 'banco-nao-configurado' });
  }

  try {
    /* ---------- fila de moderação ---------------------------------- */
    if (req.method === 'GET' && req.query.fila) {
      if (!autorizado(req)) return res.status(401).json({ erro: 'nao-autorizado' });
      const bruto = await redis(['HGETALL', 'pend']);
      const itens = [];
      /* o REST devolve [campo, valor, campo, valor, ...] */
      for (let i = 1; i < (bruto || []).length; i += 2) {
        try { itens.push(JSON.parse(bruto[i])); } catch (e) { /* item corrompido: ignora */ }
      }
      itens.sort((a, b) => b.data - a.data);
      return res.status(200).json({ itens });
    }

    /* ---------- lista pública -------------------------------------- */
    if (req.method === 'GET') {
      const slug = limparSlug(req.query.slug);
      if (!slug) return res.status(400).json({ erro: 'slug-invalido' });
      const bruto = await redis(['LRANGE', 'apr:' + slug, '0', '199']);
      const itens = (bruto || []).map(function (s) {
        try { const c = JSON.parse(s); return { id: c.id, nome: c.nome, texto: c.texto, data: c.data, resposta: c.resposta || null }; }
        catch (e) { return null; }
      }).filter(Boolean);
      return res.status(200).json({ itens });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ erro: 'metodo-nao-permitido' });
    }

    const corpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    /* ---------- moderar -------------------------------------------- */
    if (corpo.acao === 'aprovar' || corpo.acao === 'recusar') {
      if (!autorizado(req)) return res.status(401).json({ erro: 'nao-autorizado' });
      const id = String(corpo.id || '').slice(0, 40);
      if (!id) return res.status(400).json({ erro: 'id-ausente' });

      const guardado = await redis(['HGET', 'pend', id]);
      if (!guardado) return res.status(404).json({ erro: 'nao-encontrado' });

      await redis(['HDEL', 'pend', id]);

      if (corpo.acao === 'aprovar') {
        const c = JSON.parse(guardado);
        if (corpo.resposta) c.resposta = limparTexto(corpo.resposta, LIMITE_TEXTO);
        await redis(['LPUSH', 'apr:' + c.slug, JSON.stringify(c)]);
      }
      return res.status(200).json({ ok: true });
    }

    /* ---------- novo comentário ------------------------------------ */
    const slug = limparSlug(corpo.slug);
    if (!slug) return res.status(400).json({ erro: 'slug-invalido' });

    /* campo isca: humano nunca preenche, robô costuma preencher tudo */
    if (corpo.site) return res.status(200).json({ ok: true, ignorado: true });

    if (corpo.consentimento !== true) return res.status(400).json({ erro: 'consentimento-obrigatorio' });

    const nome  = limparTexto(corpo.nome, LIMITE_NOME);
    const texto = limparTexto(corpo.texto, LIMITE_TEXTO);
    if (nome.length < 2)  return res.status(400).json({ erro: 'nome-curto' });
    if (texto.length < 4) return res.status(400).json({ erro: 'texto-curto' });

    /* freio por IP: 3 por minuto */
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
    /* e-mail e opcional e nunca volta na listagem publica */
    if (typeof corpo.email === 'string' && corpo.email.includes('@')) {
      item.email = corpo.email.trim().slice(0, 120);
    }

    await redis(['HSET', 'pend', item.id, JSON.stringify(item)]);
    return res.status(201).json({ ok: true, moderacao: true });

  } catch (e) {
    return res.status(500).json({ erro: 'falha-interna' });
  }
};

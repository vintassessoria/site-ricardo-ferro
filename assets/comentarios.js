/* ==========================================================================
   Comentários — front

   Fala com /api/comentarios. O texto é escapado na hora de exibir: o
   servidor já remove < e >, mas confiar em uma camada só é como deixar a
   porta destrancada porque o portão está fechado.
   ========================================================================== */
(function () {
  'use strict';

  var area = document.getElementById('area-comentarios');
  if (!area) return;

  /* identifica o artigo pelo caminho, sem query string: assim um link
     com utm_ nao cria uma discussao separada */
  var slug = location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase() || 'index';

  var MAPA = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return MAPA[c]; });
  }

  function quebras(s) {
    return esc(s).replace(/\n/g, '<br>');
  }

  function quando(ms) {
    return new Date(ms).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  area.innerHTML = '<p class="com-carregando">Carregando comentários…</p>';

  var lista = document.createElement('div');
  lista.className = 'com-lista';

  function desenharLista(itens) {
    if (!itens.length) {
      lista.innerHTML = '<p class="com-vazio">Ainda não há comentários. Seja o primeiro.</p>';
      return;
    }
    lista.innerHTML = itens.map(function (c) {
      var resposta = '';
      if (c.resposta) {
        resposta = '<div class="com-resposta">' +
                     '<p class="com-resposta-quem">Resposta do Dr. Ricardo Ferro</p>' +
                     '<p>' + quebras(c.resposta) + '</p>' +
                   '</div>';
      }
      var inicial = esc(String(c.nome).trim().charAt(0).toUpperCase() || '?');
      return '<article class="com-item">' +
               '<div class="com-topo">' +
                 '<span class="com-avatar">' + inicial + '</span>' +
                 '<div>' +
                   '<p class="com-nome">' + esc(c.nome) + '</p>' +
                   '<p class="com-data">' + quando(c.data) + '</p>' +
                 '</div>' +
               '</div>' +
               '<p class="com-texto">' + quebras(c.texto) + '</p>' +
               resposta +
             '</article>';
    }).join('');
  }

  function montarForm() {
    var form = document.createElement('form');
    form.className = 'com-form';
    form.noValidate = true;
    form.innerHTML =
      '<h3>Deixe seu comentário</h3>' +
      '<p class="com-aviso-lgpd">Este espaço é público. Não escreva sintomas, exames ou dados pessoais aqui — ' +
        'para falar do seu caso, use o <a href="https://wa.me/556191332384" target="_blank" rel="noopener noreferrer">WhatsApp</a>.</p>' +
      '<div class="com-linha">' +
        '<label>Nome<input type="text" name="nome" maxlength="60" autocomplete="name"></label>' +
        '<label>E-mail <span>(opcional, não aparece no site)</span><input type="email" name="email" maxlength="120" autocomplete="email"></label>' +
      '</div>' +
      '<label>Comentário<textarea name="texto" rows="5" maxlength="2000"></textarea></label>' +
      '<div class="com-isca" aria-hidden="true"><label>Site<input type="text" name="site" tabindex="-1" autocomplete="off"></label></div>' +
      '<label class="com-check"><input type="checkbox" name="consentimento"> ' +
        'Concordo que meu nome e meu comentário fiquem visíveis publicamente nesta página.</label>' +
      '<div class="com-acoes">' +
        '<button type="submit" class="btn-hero">Enviar comentário</button>' +
        '<p class="com-retorno" role="status"></p>' +
      '</div>';

    var retorno = form.querySelector('.com-retorno');
    var botao   = form.querySelector('button');

    var MSG = {
      'muitas-tentativas': 'Você enviou vários comentários seguidos. Aguarde um minuto.',
      'texto-curto': 'O comentário está curto demais.',
      'nome-curto': 'Informe um nome com pelo menos duas letras.',
      'consentimento-obrigatorio': 'É preciso marcar a caixa de concordância.',
      'banco-nao-configurado': 'Os comentários ainda não foram ativados neste site.'
    };

    function avisar(texto, classe) {
      retorno.textContent = texto;
      retorno.className = 'com-retorno' + (classe ? ' ' + classe : '');
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var d = new FormData(form);

      if (!String(d.get('nome') || '').trim() || !String(d.get('texto') || '').trim()) {
        return avisar('Preencha o nome e o comentário.', 'erro');
      }
      if (!d.get('consentimento')) {
        return avisar('É preciso marcar a caixa de concordância.', 'erro');
      }

      botao.disabled = true;
      avisar('Enviando…');

      fetch('/api/comentarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug,
          nome: d.get('nome'),
          email: d.get('email'),
          texto: d.get('texto'),
          site: d.get('site'),
          consentimento: true
        })
      })
      .then(function (r) {
        return r.json().then(function (j) { return { ok: r.ok, j: j }; });
      })
      .then(function (res) {
        botao.disabled = false;
        if (res.ok) {
          form.reset();
          return avisar('Comentário enviado. Ele aparece assim que for aprovado.', 'certo');
        }
        avisar(MSG[res.j.erro] || 'Não foi possível enviar agora. Tente novamente.', 'erro');
      })
      .catch(function () {
        botao.disabled = false;
        avisar('Sem conexão com o servidor. Tente novamente.', 'erro');
      });
    });

    return form;
  }

  fetch('/api/comentarios?slug=' + encodeURIComponent(slug))
    .then(function (r) {
      /* 503 = banco ausente na Vercel. 404 = a função nem existe
         (preview local, ou deploy sem a pasta /api). Nos dois casos a
         mensagem útil é a mesma. */
      if (r.status === 503 || r.status === 404) throw new Error('nao-configurado');
      return r.json();
    })
    .then(function (j) {
      area.innerHTML = '';
      desenharLista(j.itens || []);
      area.appendChild(lista);
      area.appendChild(montarForm());
    })
    .catch(function (e) {
      if (e && e.message === 'nao-configurado') {
        area.innerHTML =
          '<div class="comentarios-aviso">' +
            '<p><strong>Os comentários ainda não foram ativados.</strong></p>' +
            '<p>Falta criar o banco na Vercel. O passo a passo está em <code>COMENTARIOS.md</code>.</p>' +
            '<a class="btn-outline" href="https://wa.me/556191332384" target="_blank" rel="noopener noreferrer">Enviar dúvida pelo WhatsApp</a>' +
          '</div>';
        return;
      }
      area.innerHTML = '<p class="com-vazio">Não foi possível carregar os comentários agora.</p>';
    });
})();

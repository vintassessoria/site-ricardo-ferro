/* ==========================================================================
   Comentários do blog

   Um site estático não guarda comentário sozinho: não há banco nem
   servidor. Quem guarda é um serviço externo. Este arquivo liga o site
   a um deles — basta preencher CONFIG abaixo e publicar.

   ESCOLHA UMA DAS DUAS:

   1) Disqus  -> qualquer visitante comenta (e-mail ou rede social).
      É o único que um paciente comum consegue usar sem barreira.
      Crie a conta em disqus.com, pegue o "shortname" e coloque:
          provedor: 'disqus',
          conta:    'seu-shortname'

   2) Giscus  -> guarda os comentários no GitHub Discussions.
      Gratuito e sem anúncios, MAS exige conta no GitHub para comentar.
      Serve para público técnico, não para paciente. Configure em
      giscus.app e cole os quatro valores em giscus{}.
          provedor: 'giscus',

   Enquanto CONFIG.provedor for 'nenhum', a área mostra um aviso em vez
   de uma caixa quebrada.
   ========================================================================== */
(function () {
  'use strict';

  var CONFIG = {
    provedor: 'nenhum',      // 'disqus' | 'giscus' | 'nenhum'
    conta: '',               // shortname do Disqus

    giscus: {
      repo: '',              // ex.: vintassessoria/site-ricardo-ferro
      repoId: '',
      category: 'Comentários',
      categoryId: ''
    }
  };

  var area = document.getElementById('area-comentarios');
  if (!area) return;

  /* ---- nada configurado: avisa em vez de deixar um buraco ---------- */
  if (CONFIG.provedor === 'nenhum') {
    area.innerHTML =
      '<div class="comentarios-aviso">' +
        '<p><strong>Os comentários ainda não estão ligados.</strong></p>' +
        '<p>Falta escolher e configurar o serviço em <code>assets/comentarios.js</code>. ' +
        'Enquanto isso, quem quiser tirar uma dúvida pode falar direto com a equipe.</p>' +
        '<a class="btn-outline" href="https://wa.me/556191332384" target="_blank" rel="noopener noreferrer">Enviar dúvida pelo WhatsApp</a>' +
      '</div>';
    return;
  }

  /* ---- Disqus ------------------------------------------------------ */
  if (CONFIG.provedor === 'disqus' && CONFIG.conta) {
    var alvo = document.createElement('div');
    alvo.id = 'disqus_thread';
    area.appendChild(alvo);

    window.disqus_config = function () {
      /* trava a identidade do tópico na URL sem query string, senão
         cada link com utm_ vira uma discussão separada */
      this.page.url = location.origin + location.pathname;
      this.page.identifier = location.pathname;
    };

    var s = document.createElement('script');
    s.src = 'https://' + CONFIG.conta + '.disqus.com/embed.js';
    s.setAttribute('data-timestamp', String(Date.now()));
    s.async = true;
    document.head.appendChild(s);
    return;
  }

  /* ---- Giscus ------------------------------------------------------ */
  if (CONFIG.provedor === 'giscus' && CONFIG.giscus.repo) {
    var g = document.createElement('script');
    g.src = 'https://giscus.app/client.js';
    g.async = true;
    g.crossOrigin = 'anonymous';
    g.setAttribute('data-repo', CONFIG.giscus.repo);
    g.setAttribute('data-repo-id', CONFIG.giscus.repoId);
    g.setAttribute('data-category', CONFIG.giscus.category);
    g.setAttribute('data-category-id', CONFIG.giscus.categoryId);
    g.setAttribute('data-mapping', 'pathname');
    g.setAttribute('data-reactions-enabled', '1');
    g.setAttribute('data-input-position', 'top');
    g.setAttribute('data-lang', 'pt');
    g.setAttribute('data-theme', 'light');
    area.appendChild(g);
    return;
  }

  /* ---- configurado pela metade ------------------------------------- */
  area.innerHTML = '<div class="comentarios-aviso"><p>Serviço de comentários escolhido, mas faltam dados da conta em <code>assets/comentarios.js</code>.</p></div>';
})();

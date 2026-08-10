/* ==========================================================================
   Dr. Ricardo Ferro — interações e efeitos de scroll
   ========================================================================== */
(function () {
  'use strict';

  var header      = document.getElementById('header');
  var burger      = document.getElementById('burger');
  var progressBar = document.getElementById('progressBar');
  var progressWrap= document.querySelector('.scroll-progress');
  var toTop       = document.getElementById('toTop');
  var ringFill    = document.getElementById('ringFill');
  var hero        = document.querySelector('.hero');
  var heroInner   = document.querySelector('.hero-inner');

  var RING = 2 * Math.PI * 20;   // circunferência do anel (r=20)

  /* ======================================================================
     1. FIAÇÃO AUTOMÁTICA
     Em vez de sujar o HTML com dezenas de atributos, o JS marca aqui
     quem ganha parallax e quais títulos são revelados palavra a palavra.
     ====================================================================== */

  /* [seletor, deslocamento em px ao longo de uma tela de rolagem] */
  var PARALLAX = [
    ['.blob-1',            170],
    ['.blob-2',           -140],
    ['.soft-blob',         110],
    ['.hero-media-wrap',    95],
    ['.sobre-media-wrap',   80],
    ['.service-num',       140],
    ['.head-center',        60],
    ['.head-left',          60],
    ['.service-ico',        30],
    ['.bento-ico',          26],
    ['.diff-ico',           26],
    ['.step-circle',        34],
    ['.cta-media img',      90],
    ['.map',                45]
  ];

  PARALLAX.forEach(function (pair) {
    document.querySelectorAll(pair[0]).forEach(function (el) {
      /* nunca em quem já tem parallax vindo do HTML */
      if (!el.hasAttribute('data-parallax')) el.setAttribute('data-parallax', pair[1]);
    });
  });

  var parallaxEls = [].slice.call(document.querySelectorAll('[data-parallax]'));

  /* títulos: h1 e h2 sobem palavra a palavra */
  document.querySelectorAll('h1, h2').forEach(function (h) {
    h.setAttribute('data-reveal', 'text');
  });

  /* ======================================================================
     2. QUEBRA DOS TÍTULOS EM PALAVRAS
     Percorre os nós de texto e embrulha cada palavra numa "janela".
     Elementos internos (como o <span class="hl">) são preservados, então
     as cores e o degradê do título continuam intactos.
     ====================================================================== */
  /* Elementos que NÃO podem ser quebrados por dentro: o degradê do título
     usa background-clip:text, que não pinta dentro de um descendente com
     overflow oculto e transform. Eles entram inteiros, numa janela só.  */
  var WHOLE = '.grad-text';

  function wrapInMask(el, parent) {
    var mask  = document.createElement('span');
    var inner = document.createElement('i');
    mask.className = 'mask';
    parent.replaceChild(mask, el);
    inner.appendChild(el);
    mask.appendChild(inner);
  }

  function splitWords(root) {
    (function walk(node) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {                       // nó de texto
          if (!n.textContent.trim()) return;
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var mask = document.createElement('span');
            var word = document.createElement('i');
            mask.className = 'mask';
            word.textContent = part;
            mask.appendChild(word);
            frag.appendChild(mask);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.className !== 'mask') {
          if (n.matches && n.matches(WHOLE)) wrapInMask(n, node);
          else walk(n);                               // desce nos elementos
        }
      });
    })(root);

    /* cascata: cada palavra sai um pouco depois da anterior */
    [].slice.call(root.querySelectorAll('.mask > i')).forEach(function (i, idx) {
      i.style.setProperty('--wd', (idx * 55) + 'ms');
    });
  }

  document.querySelectorAll('[data-reveal="text"]').forEach(splitWords);

  /* ======================================================================
     3. LOOP ÚNICO DE SCROLL
     Tudo que depende da rolagem roda aqui, sincronizado com o refresh
     da tela (requestAnimationFrame).
     ====================================================================== */
  var ticking = false;
  var lastY   = 0;

  function onScroll() {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }

  function update() {
    ticking = false;
    var y  = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;

    /* --- header: fundo sólido, e recolhe ao descer -------------------- */
    header.classList.toggle('scrolled', y > 40);
    header.classList.toggle('hide', y > lastY + 4 && y > vh * 0.8);
    lastY = y;

    /* --- progresso de leitura (barra + anel do botão) ----------------- */
    var max = document.documentElement.scrollHeight - vh;
    var pct = max > 0 ? Math.min(Math.max(y / max, 0), 1) : 0;
    progressBar.style.transform = 'scaleX(' + pct + ')';
    progressWrap.classList.toggle('show', y > 40);
    ringFill.style.strokeDashoffset = (RING * (1 - pct)).toFixed(2);

    /* --- botão voltar ao topo ----------------------------------------- */
    toTop.classList.toggle('show', y > vh * 0.9);

    /* --- hero: recua e some enquanto a página passa por cima ---------- */
    if (heroInner && hero) {
      var p = Math.min(y / (hero.offsetHeight || vh), 1);
      heroInner.style.transform = 'scale(' + (1 - p * 0.12) + ') translateY(' + (p * -40) + 'px)';
      heroInner.style.opacity   = String(Math.max(1 - p * 1.45, 0));
      /* já totalmente coberto: tira da composição para não pesar */
      hero.style.visibility = p >= 1 ? 'hidden' : 'visible';
    }

    /* --- parallax -----------------------------------------------------
       O deslocamento vem da distância entre o centro do elemento e o
       centro da tela, então funciona em qualquer ponto da página.     */
    for (var i = 0; i < parallaxEls.length; i++) {
      var el = parallaxEls[i];
      var r  = el.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) continue;      // fora da tela
      var speed    = parseFloat(el.getAttribute('data-parallax')) || 0;
      var progress = (r.top + r.height / 2 - vh / 2) / vh;    // -1 .. 1
      el.style.setProperty('--py', (-progress * speed).toFixed(1) + 'px');
    }

    /* --- scrollspy ----------------------------------------------------- */
    var current = null;
    for (var j = 0; j < spy.length; j++) {
      if (spy[j].section.getBoundingClientRect().top <= vh * 0.35) current = spy[j].link;
    }
    for (var k = 0; k < navLinks.length; k++) {
      navLinks[k].classList.toggle('active', navLinks[k] === current);
    }
  }

  var navLinks = [].slice.call(document.querySelectorAll('.nav-desktop a'));
  var spy = navLinks.map(function (a) {
    var id = (a.getAttribute('href') || '').replace('#', '');
    return { link: a, section: id ? document.getElementById(id) : null };
  }).filter(function (s) { return s.section; });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();

  /* ======================================================================
     4. REVELAR AO ENTRAR NA TELA
     ====================================================================== */
  var items = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -80px 0px' });
    [].forEach.call(items, function (el) { io.observe(el); });
  } else {
    [].forEach.call(items, function (el) { el.classList.add('is-visible'); });
  }

  /* ======================================================================
     5. CONTADORES
     ====================================================================== */
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var dur = 1800, t0 = null;

    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));  // easeOutCubic
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target;
    }
    requestAnimationFrame(frame);
  }

  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countUp(e.target);
        cio.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    [].forEach.call(counters, function (el) { cio.observe(el); });
  } else {
    [].forEach.call(counters, function (el) { el.textContent = el.getAttribute('data-count'); });
  }

  /* ======================================================================
     5b. FAIXA DE DEPOIMENTOS
     Duplica os cards para o loop não ter emenda e calcula a duração a
     partir da largura, para a velocidade ficar igual com 4 ou 40
     avaliações. Assim o HTML guarda cada avaliação uma vez só.
     ====================================================================== */
  var track = document.getElementById('marqueeTrack');
  if (track) {
    var SPEED = 45;   /* pixels por segundo */

    [].slice.call(track.children).forEach(function (card) {
      var copy = card.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      /* a cópia não recebe foco de teclado: é conteúdo repetido */
      copy.querySelectorAll('summary, a, button').forEach(function (el) {
        el.setAttribute('tabindex', '-1');
      });
      track.appendChild(copy);
    });

    var setDuration = function () {
      var half = track.scrollWidth / 2;
      if (half > 0) track.style.setProperty('--dur', (half / SPEED).toFixed(1) + 's');
    };
    setDuration();
    window.addEventListener('resize', setDuration);
    /* as fontes mudam a largura dos cards ao carregar */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setDuration);

    /* abrir uma resposta muda a altura: recalcula para não desalinhar */
    track.addEventListener('toggle', setDuration, true);
  }

  /* ======================================================================
     6. MENU MOBILE
     ====================================================================== */
  burger.addEventListener('click', function () {
    var open = header.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  document.querySelectorAll('.mobile-menu a').forEach(function (a) {
    a.addEventListener('click', function () {
      header.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ======================================================================
     7. VOLTAR AO TOPO
     ====================================================================== */
  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ======================================================================
     8. FAQ (sanfona, um aberto por vez)
     ====================================================================== */
  document.querySelectorAll('.acc-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc-item');
      var wasOpen = item.classList.contains('open');

      document.querySelectorAll('.acc-item.open').forEach(function (other) {
        other.classList.remove('open');
        other.querySelector('.acc-trigger').setAttribute('aria-expanded', 'false');
      });

      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ======================================================================
     9. PLACEHOLDER DE FOTO some quando a imagem real carrega
     ====================================================================== */
  document.querySelectorAll('.photo-frame').forEach(function (frame) {
    var img = frame.querySelector('img');
    if (!img) return;
    var done = function () { if (img.naturalWidth) frame.classList.add('has-photo'); };
    if (img.complete) done();
    else img.addEventListener('load', done);
  });
})();

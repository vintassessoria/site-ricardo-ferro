/* ==========================================================================
   Gerador do blog

   Lê artigo-modelo.html como casca e injeta o conteúdo de cada artigo
   definido em _artigos.js. Depois reescreve os cards de index.html a
   partir da mesma fonte, para a lista nunca ficar fora de sincronia.

   USO:  node blog/_gerar.js
   ========================================================================== */

const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const SITE = 'https://www.drricardoferro.com';
const molde = fs.readFileSync(path.join(DIR, 'artigo-modelo.html'), 'utf8');
const artigos = require('./_artigos.js');

function minutos(html) {
  const texto = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return Math.max(1, Math.round(texto.split(' ').length / 200)) + ' min de leitura';
}

function trocarBloco(html, inicio, fim, novo) {
  const i = html.indexOf(inicio);
  const j = html.indexOf(fim, i);
  if (i < 0 || j < 0) throw new Error('bloco nao encontrado: ' + inicio.slice(0, 40));
  return html.slice(0, i) + novo + html.slice(j + fim.length);
}

/* --------------------------------------------------------------------------
   1. Páginas dos artigos
   -------------------------------------------------------------------------- */
artigos.forEach(function (a) {
  let h = molde;

  h = h.replace(/<title>[^<]*<\/title>/, '<title>' + a.titulo + ' | Blog Dr. Ricardo Ferro</title>');
  h = h.replace(/(<meta name="description" content=")[^"]*(")/, '$1' + a.resumo + '$2');
  h = h.replace(/(<link rel="canonical" href=")[^"]*(")/, '$1' + SITE + '/blog/' + a.slug + '$2');
  h = h.replace(/(<meta property="og:url" content=")[^"]*(")/, '$1' + SITE + '/blog/' + a.slug + '$2');
  h = h.replace(/(<meta property="og:title" content=")[^"]*(")/, '$1' + a.titulo + '$2');
  h = h.replace(/(<meta name="twitter:title" content=")[^"]*(")/, '$1' + a.titulo + '$2');
  h = h.replace(/(<meta property="og:description" content=")[^"]*(")/, '$1' + a.resumo + '$2');
  h = h.replace(/(<meta name="twitter:description" content=")[^"]*(")/, '$1' + a.resumo + '$2');
  h = h.replace(/<meta name="robots"[^>]*>\n?/, '');

  h = h.replace('<span class="post-tag ph">[Categoria]</span>', '<span class="post-tag">' + a.categoria + '</span>');
  h = h.replace('<h1 class="ph">[Título do artigo]</h1>', '<h1>' + a.titulo + '</h1>');

  h = trocarBloco(h, '<div class="artigo-meta">', '</div>',
    '<div class="artigo-meta">\n        <span>' + a.dataTexto + '</span>\n' +
    '        <span class="sep">•</span>\n        <span>' + minutos(a.corpo) + '</span>\n' +
    '        <span class="sep">•</span>\n        <span>Dr. Ricardo Ferro</span>\n      </div>');

  h = trocarBloco(h, '<div class="post-cover photo-frame ratio-16-9 r-lg artigo-capa"', '</div>',
    '<div class="post-cover photo-frame ratio-16-9 r-lg artigo-capa has-photo">\n' +
    '      <img src="' + a.capa + '" alt="' + a.capaAlt + '">\n    </div>');

  h = trocarBloco(h, '<div class="container artigo-largura artigo-corpo">', '  </div>',
    '<div class="container artigo-largura artigo-corpo">\n' + a.corpo + '\n  </div>');

  fs.writeFileSync(path.join(DIR, a.slug + '.html'), h);
  console.log('  ' + a.slug + '.html  (' + minutos(a.corpo) + ')');
});

/* --------------------------------------------------------------------------
   2. Listagem

   O recorte é por LINHA, do <div class="posts"> até o </div> que fecha a
   lista. Procurar o próximo </div> por texto não serve: o primeiro que
   aparece é o de dentro do primeiro card, e os antigos sobreviveriam.
   -------------------------------------------------------------------------- */
const arqIndex = path.join(DIR, 'index.html');
let idx = fs.readFileSync(arqIndex, 'utf8');

const cards = artigos.map(function (a, i) {
  return '      <article class="post" data-reveal style="--d:' + (i * 110) + 'ms">\n' +
         '        <a class="post-cover photo-frame ratio-16-9 has-photo" href="/blog/' + a.slug + '">\n' +
         '          <img src="' + a.capa + '" alt="" loading="lazy">\n' +
         '        </a>\n' +
         '        <div class="post-body">\n' +
         '          <span class="post-tag">' + a.categoria + '</span>\n' +
         '          <h3><a href="/blog/' + a.slug + '">' + a.titulo + '</a></h3>\n' +
         '          <p>' + a.resumo + '</p>\n' +
         '          <p class="post-meta">' + a.dataTexto + ' &bull; ' + minutos(a.corpo) + '</p>\n' +
         '        </div>\n' +
         '      </article>';
}).join('\n\n');

const linhas = idx.split('\n');
const ini = linhas.findIndex(function (l) { return l.includes('<div class="posts">'); });
let fim = linhas.findIndex(function (l, n) {
  return n > ini && (l.includes('class="blog-aviso"') || l.includes('</section>'));
});
while (fim > ini && linhas[fim].trim().indexOf('</div>') !== 0) fim--;
if (ini < 0 || fim <= ini) throw new Error('nao achei os limites da listagem');

idx = linhas.slice(0, ini + 1).join('\n') + '\n\n' + cards + '\n\n' + linhas.slice(fim).join('\n');

/* o aviso de "cards de exemplo" não faz mais sentido */
const iAviso = idx.indexOf('    <div class="blog-aviso"');
if (iAviso > -1) {
  const jAviso = idx.indexOf('</div>', idx.indexOf('</p>', iAviso)) + '</div>'.length;
  idx = idx.slice(0, iAviso) + idx.slice(jAviso + 1);
}

fs.writeFileSync(arqIndex, idx);
console.log('\n' + artigos.length + ' artigos gerados, listagem atualizada.');

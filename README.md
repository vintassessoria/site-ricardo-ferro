# Dr. Ricardo Ferro — Landing Page

Site estático de página única. Sem build, sem dependências: é só HTML, CSS e
JavaScript puro. Abre com duplo clique no `index.html` ou serve em qualquer
hospedagem estática.

## Estrutura

```
index.html          página inteira
assets/style.css    estilos (a paleta fica no topo do arquivo)
assets/script.js    efeitos de scroll, menu, FAQ e faixa de depoimentos
fotos/              imagens — ver fotos/LEIA-ME.txt
```

## Paleta

Tudo sai das variáveis no topo de `assets/style.css`:

| Variável      | Valor     | Onde aparece                              |
| ------------- | --------- | ----------------------------------------- |
| `--primary`   | `#4e4d53` | hero, rodapé, ícones, botão de topo       |
| `--secondary` | `#6d6c75` | botão "Agendar", rótulos de seção         |
| `--accent`    | `#28af60` | estrelas, checks, barra de progresso      |
| `--ink`       | `250 4% 31%` | tinta das sombras e véus               |

Mudando `--primary`, `--secondary` e `--ink` o site inteiro acompanha.

## Editar conteúdo

- **Depoimentos** — cada avaliação é um `<article class="review">` dentro de
  `#marqueeTrack`. Não duplique os cards à mão: o JavaScript clona a fileira
  para o loop ficar sem emenda e recalcula a velocidade sozinho.
- **FAQ** — cada pergunta é um `<div class="acc-item">`.
- **Fotos** — mantenha os nomes dos arquivos e as proporções descritas em
  `fotos/LEIA-ME.txt`. As de 4:5 precisam ser mesmo 4:5, senão o
  `object-fit: cover` corta pelo centro.
- **WhatsApp** — o número `556191332384` aparece em vários links. Busque e
  substitua em `index.html`.

## Rodar localmente

```bash
npx serve -l 4321 .
```

## Publicar

Hospedagem estática, sem configuração. Na Vercel, importar o repositório e
deixar todos os campos de build em branco (Framework Preset: `Other`).

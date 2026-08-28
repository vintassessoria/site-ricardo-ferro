# Ativar os comentários

O código está pronto. Faltam **3 passos na Vercel**, uns 5 minutos.
Nenhuma senha precisa passar por terceiros — você mesmo cria tudo.

---

## 1. Criar o banco

No painel da Vercel, dentro do projeto `site-ricardo-ferro`:

**Storage → Create Database → Redis** (Upstash) → região **São Paulo (gru1)**,
que é onde o site já roda.

Ao conectar o banco ao projeto, a Vercel injeta sozinha as variáveis
`KV_REST_API_URL` e `KV_REST_API_TOKEN`. **Não precisa copiar nada.**

O plano gratuito cobre 10.000 comandos por dia. Um comentário gasta ~3.

---

## 2. Criar a senha de moderação

**Settings → Environment Variables → Add**

| Campo | Valor |
| --- | --- |
| Name | `MODERACAO_TOKEN` |
| Value | uma senha longa que só vocês saibam |
| Environments | marque os três |

Essa senha é o que protege a tela de moderação. Use algo longo — 30
caracteres aleatórios, não uma palavra.

---

## 3. Publicar de novo

**Deployments → ⋯ no último → Redeploy**

Variável de ambiente nova só vale a partir do próximo deploy. Sem esse
passo, o site continua respondendo que o banco não está configurado.

---

## Como funciona no dia a dia

**Quem comenta** preenche nome, comentário e marca a caixa de
consentimento. O e-mail é opcional e **nunca aparece no site** — serve
só para vocês responderem em particular, se quiserem.

**O comentário não aparece na hora.** Fica numa fila até ser aprovado.

**Para moderar**, abra:

```
https://site-ricardo-ferro.vercel.app/blog/moderacao.html
```

Digite a senha do passo 2. A cada comentário você pode:

- **Aprovar** — publica na página do artigo
- **Recusar** — descarta
- **Responder** — o texto que você escrever aparece junto do comentário,
  destacado como "Resposta do Dr. Ricardo Ferro"

A página tem `noindex`, então não entra no Google. Mas o endereço não é
segredo — quem protege é a senha.

---

## O que já está protegido

- **Spam de robô** — campo isca invisível; quem preenche é descartado em
  silêncio, sem avisar o robô que foi pego.
- **Enxurrada** — no máximo 3 envios por minuto por IP.
- **Injeção de código** — o servidor remove `<` e `>` ao gravar, e o
  front escapa tudo de novo ao exibir. Duas camadas de propósito.
- **Tamanho** — nome até 60 caracteres, comentário até 2.000.
- **Senha** — a comparação é de tempo constante, para não vazar o
  tamanho da senha por medição.

---

## O que ainda merece atenção

**LGPD.** Nome e comentário ficam públicos, e o visitante consente
explicitamente antes de enviar. O aviso acima do formulário pede para não
escrever sintomas nem dados de exame. Ainda assim, alguém vai escrever —
e aí é caso de recusar o comentário e responder pelo WhatsApp.

**CFM.** Ao responder publicamente, o Dr. Ricardo deve manter a resposta
genérica e educativa. Conduta sobre caso específico não deve ser dada em
comentário público.

Vale a política de privacidade citar que a página tem comentários e o que
é feito com o e-mail. Hoje o rodapé aponta para `#` — a página ainda não
existe.

---

## Para desativar

Apague a variável `MODERACAO_TOKEN` e desconecte o banco. A área de
comentários volta a mostrar o aviso com o atalho para o WhatsApp, sem
quebrar nada.

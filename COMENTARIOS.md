# Ativar os comentários

O código está pronto. Falta **1 passo**, uns 2 minutos, e é um passo que
só você pode dar: criar o banco dentro da sua conta da Vercel.

---

## Passo único: criar o banco

No painel da Vercel, dentro do projeto `site-ricardo-ferro`:

**Storage → Create Database → Redis** (Upstash) → região **São Paulo (gru1)**,
que é onde o site já roda → **Connect** ao projeto.

Ao conectar, a Vercel injeta sozinha as variáveis `KV_REST_API_URL` e
`KV_REST_API_TOKEN`. **Você não copia chave nenhuma.**

O plano gratuito do Upstash cobre **500 mil comandos por mês**, 256 MB de
dados e 10 GB de trafego. Abrir um artigo gasta 1 comando; enviar um
comentario gasta 3. Para um blog de clinica isso nao chega perto do teto.
O cartao de credito so entra se voce quiser passar para o plano pago.

Depois disso, os comentários já funcionam.

---

## A senha de moderação

Não é variável de ambiente. Abra:

```
https://www.drricardoferro.com/blog/moderacao.html
```

Na primeira vez, a tela pede para **criar** a senha (mínimo 12
caracteres). Ela é guardada no banco com scrypt e sal — nem eu nem
ninguém consegue ler depois.

**Guarde essa senha.** Não há recuperação: para trocar, é preciso apagar
a chave `cfg:senha` no banco e criar outra.

> Faça isso logo depois de criar o banco. Entre a criação e o seu
> primeiro acesso existe uma janela em que qualquer pessoa que
> descobrisse o endereço poderia definir a senha antes de você. É a
> mesma lógica de uma instalação nova de WordPress.
>
> Se preferir fechar essa janela, defina a variável `MODERACAO_TOKEN`
> em Settings → Environment Variables e republique. Ela tem prioridade
> e desliga a tela de primeiro acesso.

---

## Como funciona no dia a dia

**Quem comenta** preenche nome, comentário e marca a caixa de
consentimento. O e-mail é opcional e **nunca aparece no site** — serve
só para vocês responderem em particular.

**O comentário não aparece na hora.** Fica numa fila até ser aprovado.

**Para moderar**, abra a mesma página e digite a senha. A cada
comentário você pode:

- **Aprovar** — publica na página do artigo
- **Recusar** — descarta
- **Responder** — o texto aparece junto do comentário, destacado como
  "Resposta do Dr. Ricardo Ferro"

A página tem `noindex`, então não entra no Google. Mas o endereço não é
segredo — quem protege é a senha.

---

## O que já está protegido

- **Spam de robô** — campo isca invisível. Quem preenche é descartado em
  silêncio, com resposta de sucesso, para o robô não perceber que caiu.
- **Enxurrada** — no máximo 3 envios por minuto por IP.
- **Injeção de código** — o servidor remove `<` e `>` ao gravar, e o
  front escapa tudo de novo ao exibir. Duas camadas de propósito.
- **Tamanho** — nome até 60 caracteres, comentário até 2.000.
- **Senha** — guardada com scrypt + sal, comparada em tempo constante.
- **Corrida na criação da senha** — gravação com `SETNX`: se dois
  pedidos chegarem juntos, só o primeiro vale.
- **E-mail** — apagado do registro no momento da aprovação, então não
  existe nem por acidente na listagem pública.

---

## O que ainda merece atenção

**LGPD.** Nome e comentário ficam públicos, e o visitante consente antes
de enviar. O aviso acima do formulário pede para não escrever sintomas
nem exames. Ainda assim alguém vai escrever — e aí é recusar o
comentário e responder pelo WhatsApp.

**CFM.** Ao responder publicamente, a resposta deve ser genérica e
educativa. Conduta sobre caso específico não cabe em comentário público.

A política de privacidade do rodapé ainda aponta para `#`. Com
comentários no ar, ela passa a ser necessária: precisa dizer que a
página coleta nome, comentário e e-mail opcional, e o que é feito com
esses dados.

---

## Para desativar

Desconecte o banco na Vercel. A área de comentários volta a mostrar o
aviso com o atalho para o WhatsApp, sem quebrar nada.

---

## Custos

**O banco é gratuito.** O plano free do Upstash dá 500 mil comandos por
mês, 256 MB e 10 GB de tráfego, sem pedir cartão. Abrir um artigo gasta
1 comando; enviar um comentário gasta 3. Um blog de clínica não encosta
nesse teto.

**As funções também.** O plano Hobby da Vercel inclui até 1 milhão de
invocações de função por mês.

### Mas tem um porém, e ele não é sobre comentários

As Fair Use Guidelines da Vercel dizem, com todas as letras, que o plano
Hobby é **só para uso pessoal não comercial**, e que uso comercial exige
Pro ou Enterprise. A definição deles inclui explicitamente projetos em
que um funcionário ou consultor pago escreveu o código.

O site de um consultório médico, feito por uma agência, se encaixa
nessa definição. **Isso já valia antes dos comentários** — vale desde o
primeiro deploy.

O plano Pro custa US$ 20/mês e vem com US$ 20 de crédito de uso
incluído, o que na prática cobre o consumo de um site desse porte.

Conferido em vercel.com/pricing e vercel.com/docs/limits/fair-use-guidelines.
Preço muda; vale reconferir antes de decidir.

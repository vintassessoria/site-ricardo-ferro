/* ==========================================================================
   Conteúdo dos artigos do blog

   Cada artigo é um objeto aqui. Depois de editar, rode:
       node blog/_gerar.js
   e os arquivos .html são reescritos com o cabeçalho e o rodapé atuais.

   PARA CRIAR UM ARTIGO NOVO: copie um bloco, troque slug, título, resumo,
   categoria, data e corpo. O tempo de leitura é calculado sozinho.

   IMPORTANTE: as capas hoje usam fotos da clínica, que servem mas não são
   do assunto. Trocar por imagem do tema quando houver.
   ========================================================================== */

module.exports = [

  {
    slug: 'quando-procurar-um-urologista',
    titulo: 'Quando procurar um urologista',
    resumo: 'Sinais que merecem avaliação, a partir de que idade fazer exames de rotina e por que adiar costuma custar caro.',
    categoria: 'Saúde do homem',
    dataTexto: '9 de setembro de 2026',
    capa: '/fotos/clinica-04.jpg',
    capaAlt: 'Consultório da clínica do Dr. Ricardo Ferro',
    corpo: `
    <p class="destaque">A resposta curta: a partir dos 45 a 50 anos, mesmo sem sintoma nenhum. E em qualquer idade, se algo mudou e não voltou ao normal.</p>

    <p>A maior parte dos homens chega ao urologista tarde. Não por falta de sintoma, mas porque o sintoma foi sendo explicado de outro jeito — é da idade, é cansaço, é estresse, passa sozinho. Alguns passam mesmo. Outros são a primeira manifestação de algo que teria tratamento simples se descoberto cedo.</p>

    <h2>Exames de rotina: a partir de quando</h2>

    <p>A recomendação geral é começar o acompanhamento entre os 45 e os 50 anos, mesmo sem queixa alguma. Homens com histórico familiar de câncer de próstata, ou de ascendência africana, costumam começar antes — por volta dos 45, às vezes antes disso, dependendo do caso.</p>

    <p>Rotina aqui não quer dizer procedimento invasivo. Na maioria das vezes é conversa, exame físico e exames de sangue. O objetivo é ter um ponto de partida: saber como está agora para reconhecer mudança depois.</p>

    <h2>Sinais que pedem avaliação em qualquer idade</h2>

    <p>Não é preciso esperar a idade de rotina se algo mudou. Merecem consulta:</p>

    <ul>
      <li><strong>Dificuldade para urinar</strong> — jato fraco, demora para começar, sensação de não esvaziar por completo</li>
      <li><strong>Acordar várias vezes à noite para urinar</strong>, quando isso não acontecia antes</li>
      <li><strong>Urgência</strong> — vontade repentina, difícil de segurar</li>
      <li><strong>Sangue na urina ou no sêmen</strong>, mesmo uma única vez</li>
      <li><strong>Dor</strong> ao urinar, na região pélvica, nos testículos ou na lombar</li>
      <li><strong>Alterações na ereção</strong> que se mantêm por semanas</li>
      <li><strong>Caroço ou mudança de tamanho</strong> em um dos testículos</li>
      <li><strong>Infecções urinárias de repetição</strong></li>
    </ul>

    <p>Um detalhe que costuma passar despercebido: alterações na ereção podem ser o primeiro sinal de problemas circulatórios ou metabólicos, antes de qualquer sintoma cardíaco. Não é assunto só de vida sexual.</p>

    <blockquote>Sintoma que dura mais de duas ou três semanas e não melhora sozinho merece ser olhado. Não porque seja necessariamente grave — mas porque descobrir cedo é o que mantém as opções de tratamento abertas.</blockquote>

    <h2>Por que adiar costuma custar caro</h2>

    <p>Boa parte das condições urológicas evolui devagar e em silêncio. O câncer de próstata em fase inicial normalmente não dá sintoma nenhum — quando dá, já não está mais no começo. A próstata aumentada vai forçando a bexiga por anos até que o dano se torne permanente.</p>

    <p>Descoberto cedo, o leque de tratamentos é maior e menos agressivo. Descoberto tarde, o leque se fecha.</p>

    <h2>O que esperar da primeira consulta</h2>

    <p>Uma consulta urológica começa com conversa. Histórico, hábitos, medicações em uso, o que mudou e desde quando. O exame físico é rápido. Exames complementares, quando necessários, são pedidos a partir dessa avaliação — não antes dela.</p>

    <p>Vale levar: lista de medicamentos que você toma, exames anteriores, se tiver, e histórico de doença na família. E vale falar do que incomoda mesmo que pareça constrangedor. O consultório é o lugar onde isso é rotina.</p>

    <h2>O constrangimento é o maior obstáculo</h2>

    <p>Vale dizer com todas as letras: o exame de toque retal leva menos de um minuto, não exige preparo e é desconfortável muito mais pela expectativa que pela realidade. Ele não é o único método de avaliação, e a decisão sobre quais exames fazer é conversada.</p>

    <p>Nenhum constrangimento de alguns segundos justifica anos de convivência com um problema que teria solução.</p>
`
  },

  {
    slug: 'cirurgia-robotica-na-urologia',
    titulo: 'Cirurgia robótica na urologia: o que é e o que muda para o paciente',
    resumo: 'Como funciona a cirurgia robótica, em quais casos ela é indicada em urologia e o que realmente muda na recuperação.',
    categoria: 'Cirurgia robótica',
    dataTexto: '9 de setembro de 2026',
    capa: '/fotos/tour-capa.jpg',
    capaAlt: 'Recepção da clínica do Dr. Ricardo Ferro',
    corpo: `
    <p class="destaque">O robô não opera sozinho. Quem opera é o cirurgião — o equipamento traduz o movimento das mãos dele em movimentos menores e mais precisos, dentro do corpo.</p>

    <p>É a confusão mais comum, e vale desfazer logo. A cirurgia robótica é uma cirurgia feita por um cirurgião, do começo ao fim. O sistema não tem autonomia, não decide nada e não executa nenhum passo por conta própria. Ele é um instrumento — sofisticado, mas instrumento.</p>

    <h2>Como funciona na prática</h2>

    <p>O cirurgião opera sentado a um console, a poucos metros do paciente. Ele enxerga o campo cirúrgico em três dimensões, com ampliação de até dez vezes. As mãos dele comandam controles que movem braços articulados acoplados a instrumentos finos, introduzidos por incisões de cerca de um centímetro.</p>

    <p>Duas características mudam o que é possível fazer:</p>

    <ul>
      <li><strong>Amplitude de movimento</strong> — os instrumentos giram além do que um punho humano alcança, o que permite trabalhar em ângulos impossíveis na cirurgia aberta ou na laparoscopia convencional</li>
      <li><strong>Filtro de tremor</strong> — o sistema reduz a escala do movimento e elimina a trepidação natural da mão, o que importa muito ao dissecar estruturas de poucos milímetros</li>
    </ul>

    <p>É essa combinação que faz diferença em regiões estreitas e cercadas de estruturas delicadas — que é exatamente o caso da pelve masculina.</p>

    <h2>Em quais casos é indicada</h2>

    <p>Em urologia, as aplicações mais consolidadas são:</p>

    <ul>
      <li><strong>Prostatectomia radical</strong> — retirada da próstata em casos de câncer</li>
      <li><strong>Nefrectomia parcial</strong> — retirada apenas do tumor renal, preservando o rim</li>
      <li><strong>Cistectomia</strong> — cirurgias de bexiga</li>
      <li><strong>Pieloplastia</strong> — correção de obstrução na saída do rim</li>
    </ul>

    <p>A nefrectomia parcial ilustra bem o ganho: preservar rim saudável exige remover o tumor com margem exata e reconstruir o que ficou, contra o tempo. Precisão aí não é conforto, é o que viabiliza a preservação.</p>

    <h2>O que muda para quem opera</h2>

    <p>As vantagens descritas na literatura e observadas na prática são consistentes:</p>

    <ul>
      <li>Menor perda de sangue durante o procedimento</li>
      <li>Menos dor no pós-operatório</li>
      <li>Internação mais curta</li>
      <li>Cicatrizes pequenas, em vez de uma incisão longa</li>
      <li>Retorno mais rápido às atividades do dia a dia</li>
    </ul>

    <p>No caso da prostatectomia, há ainda um ponto que preocupa muito quem vai operar: a preservação dos feixes nervosos ligados à função erétil e ao controle urinário. A visão ampliada em três dimensões ajuda a identificá-los e a trabalhar rente a eles.</p>

    <blockquote>Vale ser honesto: resultado não depende só do equipamento. Depende do estágio da doença, das condições de saúde de cada um e, sobretudo, da experiência de quem opera. O robô amplia o que o cirurgião sabe fazer — ele não substitui esse conhecimento.</blockquote>

    <h2>A experiência de quem está no console</h2>

    <p>Cirurgia robótica tem curva de aprendizado longa. Os estudos mostram diferença de resultado conforme o volume de procedimentos que a equipe realiza. Por isso, ao avaliar a indicação, pergunte quantas cirurgias daquele tipo o cirurgião já fez, e não apenas se o hospital tem o equipamento.</p>

    <h2>Não é indicada para todo mundo</h2>

    <p>Existem situações em que a cirurgia aberta ou a laparoscópica continua sendo a melhor escolha — por características do tumor, por cirurgias abdominais anteriores, por condições clínicas específicas. A escolha da técnica faz parte da avaliação individual, e um bom serviço oferece a que serve ao caso, não a que está disponível.</p>
`
  },

  {
    slug: 'laser-holep-prostata-aumentada',
    titulo: 'Laser HoLEP: o que é e quando é indicado para próstata aumentada',
    resumo: 'O que é a hiperplasia prostática benigna, como funciona a enucleação com laser de Hólmio e em que casos ela é considerada.',
    categoria: 'Próstata',
    dataTexto: '9 de setembro de 2026',
    capa: '/fotos/clinica-03.jpg',
    capaAlt: 'Sala de espera da clínica do Dr. Ricardo Ferro',
    corpo: `
    <p class="destaque">Próstata aumentada não é câncer. É uma condição benigna, muito comum a partir dos 50 anos — e que tem tratamento, inclusive quando a próstata é grande.</p>

    <p>A hiperplasia prostática benigna, ou HPB, é o crescimento não canceroso da próstata. Como a glândula envolve o canal por onde a urina sai, esse crescimento aperta o canal e atrapalha o fluxo. Daí os sintomas.</p>

    <h2>Como se manifesta</h2>

    <ul>
      <li>Jato urinário fraco ou que falha no meio</li>
      <li>Demora para começar a urinar</li>
      <li>Sensação de bexiga que não esvaziou</li>
      <li>Levantar várias vezes à noite</li>
      <li>Urgência e aumento da frequência durante o dia</li>
    </ul>

    <p>Costuma se instalar devagar, ao longo de anos, e é por isso que tanta gente se adapta sem perceber — reduz o líquido à noite, mapeia banheiros, evita viagem longa. A rotina vai encolhendo em silêncio.</p>

    <p>Quando não tratada, a obstrução pode levar a infecções de repetição, cálculos na bexiga, retenção urinária aguda e, nos casos mais avançados, comprometimento dos rins.</p>

    <h2>O que é o HoLEP</h2>

    <p>HoLEP é a sigla para enucleação da próstata com laser de Hólmio. A abordagem é diferente das técnicas que raspam o tecido em fatias: o laser separa o tecido que cresceu e obstrui da cápsula que o envolve, e o remove inteiro.</p>

    <p>A comparação que costuma ajudar é a da laranja. As técnicas de raspagem retiram a polpa aos poucos, por partes. O HoLEP descola a polpa da casca e retira o conjunto. O tecido removido é enviado para análise.</p>

    <p>Todo o procedimento é feito pela uretra. Não há corte externo, nem cicatriz.</p>

    <h2>Por que importa remover tudo</h2>

    <p>É o ponto que diferencia a técnica. Ao retirar todo o tecido obstrutivo, sobra pouco material para voltar a crescer — o que se reflete em índices baixos de necessidade de nova cirurgia ao longo dos anos.</p>

    <p>Além disso, o laser de Hólmio cauteriza enquanto corta, o que reduz o sangramento durante o procedimento. Isso amplia as possibilidades de tratamento para pacientes que usam anticoagulantes, situação em que outras técnicas exigem mais cuidado.</p>

    <blockquote>O HoLEP é considerado independentemente do tamanho da próstata. Em glândulas muito volumosas, onde antes a alternativa costumava ser a cirurgia aberta, ele evita o corte abdominal.</blockquote>

    <h2>Quando é indicado</h2>

    <p>Costuma ser considerado quando há sintomas moderados a graves que não responderam ao tratamento com medicamentos, ou quando já houve complicações — retenção urinária, infecções repetidas, cálculos, repercussão sobre os rins.</p>

    <p>Nem todo aumento de próstata precisa de cirurgia. Muitos casos são acompanhados clinicamente ou tratados com medicação por anos. A indicação vem da combinação entre o quanto os sintomas atrapalham a vida, os achados dos exames e as condições de saúde de cada um.</p>

    <h2>O que esperar depois</h2>

    <p>A internação costuma ser curta e o cateter permanece por pouco tempo. É comum haver ardência e urgência urinária nas primeiras semanas, que diminuem ao longo da recuperação.</p>

    <p>Um efeito que merece ser conversado antes: a ejaculação retrógrada, em que o sêmen segue para a bexiga em vez de sair pela uretra. É frequente após cirurgias de próstata, não faz mal à saúde e não afeta a sensação do orgasmo, mas interfere na fertilidade — e por isso deve ser discutido com quem tem planos de ter filhos.</p>

    <p>Cada recuperação é individual, e as expectativas devem ser alinhadas na consulta, diante do seu caso.</p>
`
  }

];

// =========================================================
// 1. SLIDES (CARROSSEL)
// =========================================================
document.querySelectorAll('[data-slide]').forEach((slide) => {
  const itens = slide.querySelectorAll('.slide-item');
  const indicadoresContainer = slide.querySelector('.slide-indicadores');
  let atual = 0;
  let intervalo;
  let startX = 0;
  let endX = 0;

  if (indicadoresContainer && itens.length > 0) {
    itens.forEach((_, index) => {
      const ponto = document.createElement('button');
      ponto.className = 'slide-ponto' + (index === 0 ? ' ativo' : '');
      ponto.addEventListener('click', () => { mostrar(index); reiniciar(); });
      indicadoresContainer.appendChild(ponto);
    });
  }

  function mostrar(i) {
    if (i < 0) i = itens.length - 1;
    if (i >= itens.length) i = 0;
    itens.forEach((item, idx) => item.classList.toggle('ativo', idx === i));
    if (indicadoresContainer) {
      const pontos = indicadoresContainer.querySelectorAll('.slide-ponto');
      pontos.forEach((ponto, idx) => ponto.classList.toggle('ativo', idx === i));
    }
    atual = i;
  }
  function proxima() { mostrar(atual + 1); }
  function reiniciar() {
    clearInterval(intervalo);
    if (itens.length > 1) intervalo = setInterval(proxima, 5000);
  }
  reiniciar();

  slide.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; clearInterval(intervalo); }, { passive: true });
  slide.addEventListener('touchmove', (e) => { endX = e.touches[0].clientX; }, { passive: true });
  slide.addEventListener('touchend', () => {
    if (startX - endX > 50) { proxima(); } 
    else if (endX - startX > 50) { mostrar(atual - 1); }
    startX = 0; endX = 0; reiniciar();
  });
});

// =========================================================
// 2. NAVEGAÇÃO DO DASHBOARD
// =========================================================
const navItems = document.querySelectorAll('[data-target]');
const pages = document.querySelectorAll('.dashboard-page');
const mainContainer = document.querySelector('.main-content');

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => nav.classList.remove('active'));
    if(item.classList.contains('nav-item') && !item.classList.contains('sidebar-logo')) item.classList.add('active');
    
    pages.forEach(page => page.classList.remove('active'));
    const targetId = item.getAttribute('data-target');
    const targetPage = document.getElementById(targetId);
    if (targetPage) targetPage.classList.add('active');

    // Volta ao topo ao trocar de página
    if(mainContainer) mainContainer.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  });
});

// Fecha modais com ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
});

// =========================================================
// 3. DADOS E GRÁFICOS
// =========================================================
const graficosConfig = {
  '7,1%': { titulo: 'Taxa de Analfabetismo', fonte: 'IBGE - PNAD Contínua', link: 'https://www.ibge.gov.br/estatisticas/sociais/educacao/17270-pnad-continua.html', tipo: 'bar', labels: ['Brancos', 'Pretos/Pardos'], data: [3.2, 7.1], max: 10 },
  '14,1 p.p.': { titulo: 'Aprendizado Adequado (Português)', fonte: 'Saeb/Inep', link: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/saeb', tipo: 'bar', labels: ['Brancos', 'Pretos/Pardos'], data: [45.6, 31.5], max: 50 },
  '9,2 anos': { titulo: 'Média de Anos de Estudo', fonte: 'IBGE - PNAD Contínua', link: 'https://www.ibge.gov.br/estatisticas/sociais/educacao/17270-pnad-continua.html', tipo: 'bar', labels: ['Brancos', 'Pretos/Pardos'], data: [10.8, 9.2], max: 12 },
  '55%': { titulo: 'Perfil Racial dos Docentes', fonte: 'Censo Escolar/Inep', link: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-escolar', tipo: 'doughnut', labels: ['Brancos', 'Pretos/Pardos'], data: [55, 45] }
};

if (typeof Chart !== 'undefined') {
  const reduz = matchMedia('(prefers-reduced-motion: reduce)').matches;
  Chart.defaults.color = '#aa9f8c';
  Chart.defaults.font.family = 'Inter, sans-serif';
  Chart.defaults.plugins.tooltip.backgroundColor = '#c8932b';
  Chart.defaults.plugins.tooltip.titleColor = '#14110e';
  Chart.defaults.plugins.tooltip.bodyColor = '#14110e';
  Chart.defaults.plugins.tooltip.titleFont = { weight: 'bold' };
  Chart.defaults.animation = reduz ? false : { duration: 1000, easing: 'easeOutQuart' };
}

let currentChart = null;

function renderizarGraficoNoModal(config) {
  const ctx = document.getElementById('canvas-modal');
  if (currentChart) currentChart.destroy();

  const gradientCreme = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
  gradientCreme.addColorStop(0, '#f2e9d8'); gradientCreme.addColorStop(1, '#aa9f8c');
  const gradientOcre = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
  gradientOcre.addColorStop(0, '#c8932b'); gradientOcre.addColorStop(1, '#7a541f');

  const opcoesBase = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#f2e9d8', font: { size: 14 } } },
      y: { grid: { color: 'rgba(242, 233, 216, 0.05)' }, beginAtZero: true, max: config.max || undefined, ticks: { color: '#aa9f8c' } }
    }
  };

  if (config.tipo === 'bar') {
    currentChart = new Chart(ctx, { type: 'bar', data: { labels: config.labels, datasets: [{ data: config.data, backgroundColor: [gradientCreme, gradientOcre], borderRadius: 6, maxBarThickness: 80 }] }, options: opcoesBase });
  } else if (config.tipo === 'doughnut') {
    currentChart = new Chart(ctx, { type: 'doughnut', data: { labels: config.labels, datasets: [{ data: config.data, backgroundColor: [gradientCreme, gradientOcre], borderWidth: 0, hoverOffset: 10 }] }, options: { ...opcoesBase, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#f2e9d8', padding: 20, usePointStyle: true } } } } });
  }
}

// Animação de contagem dos números
function contar(el) {
  const m = el.textContent.match(/(\d+(?:[.,]\d+)?)/);
  if (!m || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const alvo = parseFloat(m[1].replace(',', '.'));
  const casas = (m[1].split(/[.,]/)[1] || '').length;
  const antes = el.textContent.slice(0, m.index);
  const depois = el.textContent.slice(m.index + m[1].length);
  const t0 = performance.now(), dur = 1100;
  (function passo(t) {
    const p = Math.min((t - t0) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 4);
    el.textContent = antes + (alvo * ease).toFixed(casas).replace('.', ',') + depois;
    if (p < 1) requestAnimationFrame(passo);
  })(t0);
}

const lista = document.getElementById('lista-dados');
if (lista) {
  fetch('data/dados.json')
    .then(r => r.json())
    .then(json => {
      lista.innerHTML = '';
      json.dados.forEach(item => {
        const cartao = document.createElement('article');
        cartao.className = 'cartao-dado';
        cartao.addEventListener('click', () => {
          const config = graficosConfig[item.numero];
          if (config) {
            document.getElementById('titulo-grafico').innerText = config.titulo;
            document.getElementById('fonte-grafico').innerText = `Fonte: ${config.fonte}`;
            renderizarGraficoNoModal(config);
            document.getElementById('modal-grafico').classList.add('active');
          }
        });
        const config = graficosConfig[item.numero];
        const linkFonte = config ? config.link : '#';
        const textoFonte = config ? config.fonte : item.fonte;
        cartao.innerHTML = `<p class="dado-numero">${item.numero}</p><p class="dado-descricao">${item.descricao}</p><p class="dado-fonte"><a href="${linkFonte}" target="_blank" onclick="event.stopPropagation()">${textoFonte}</a><span>${item.ano}</span></p>`;
        lista.appendChild(cartao);
      });
      // Inicia animação de contagem
      setTimeout(() => lista.querySelectorAll('.dado-numero').forEach(contar), 100);
    })
    .catch(e => { lista.innerHTML = '<p class="dados-aviso">Erro ao carregar os dados.</p>'; });
}

const modalGrafico = document.getElementById('modal-grafico');
document.getElementById('fechar-modal').addEventListener('click', () => modalGrafico.classList.remove('active'));
modalGrafico.addEventListener('click', (e) => { if (e.target === modalGrafico) modalGrafico.classList.remove('active'); });

// =========================================================
// 4. LÓGICA DA ESTANTE DE LIVROS
// =========================================================
const livrosData = [
  { titulo: "A Cor de Coraline", autora: "Alexandre Rampazo", editora: "Rocco Pequenos Leitores", ano: "2017", capa: "assets/capas/cor-de-coraline.jpg", resenhaTexto: "Coraline ouve do amigo Pedrinho o pedido “me empresta o lápis cor de pele?” e fica intrigada: qual é, afinal, a cor da pele? Ao revisitar sua caixa de lápis, ela descobre que cada tom é bonito e que é a diversidade que dá beleza ao mundo. Vencedor do Selo Seleção Cátedra 10 Unesco e finalista do Prêmio Jabuti 2018, o livro de Alexandre Rampazo propõe uma conversa sensível sobre identidade, diversidade e pertencimento desde a primeira infância. A obra convida a criança a refletir sobre a representatividade e a pluralidade de tons que formam a pele humana.", linkAmazon: "https://www.amazon.com.br/cor-Coraline-Alexandre-Rampazo/dp/6589642028/" },
  { titulo: "O Pequeno Príncipe Preto", autora: "Rodrigo França", editora: "Nova Fronteira", ano: "2020", capa: "assets/capas/pequeno-principe-preto.jpg", resenhaTexto: "Em um minúsculo planeta, o Pequeno Príncipe Preto vive ao lado de sua única companheira, uma árvore Baobá. Quando as ventanias chegam, ele viaja por outros planetas espalhando amor e empatia. Adaptação de uma peça infantil de Rodrigo França, o livro celebra a importância de valorizar quem somos e de onde viemos, mostrando a força dos laços de afeto e da coletividade. O livro traz uma narrativa ancestral africana e resgata a autoestima e o orgulho da identidade negra na infância.", linkAmazon: "https://www.amazon.com.br/pequeno-pr%C3%ADncipe-preto-Rodrigo-Fran%C3%A7a-ebook/dp/B084CX1YYD/" },
  { titulo: "Da Minha Janela", autora: "Otávio Júnior", editora: "Companhia das Letrinhas", ano: "2019", capa: "assets/capas/da-minha-janela.jpg", resenhaTexto: "Sentado à janela de uma casa em uma favela do Rio de Janeiro, o narrador observa o mundo: pessoas, cores, gestos, bichos. Cada cena vira uma pequena descoberta sobre a vida que acontece ao redor. Com texto sensível de Otávio Júnior e ilustrações vibrantes de Vanina Starkoff, o livro convida o leitor a olhar com atenção para as vidas que muitas vezes passam despercebidas. Vencedor do Prêmio Jabuti 2020 na categoria Infantil, a obra apresenta a periferia de forma poética, fugindo de estereótipos e valorizando o cotidiano e a cultura das comunidades.", linkAmazon: "https://www.amazon.com.br/dp/8574068748" },
  { titulo: "Amor de Cabelo", autora: "Matthew A. Cherry", editora: "Galerinha Record", ano: "2020", capa: "assets/capas/amor-de-cabelo.jpg", resenhaTexto: "A obra Amor de Cabelo, de Matthew A. Cherry, é ideal para trabalhar a educação antirracista infantil por apresentar, de maneira recreativa e acessível, a construção da autoestima e a valorização da identidade negra. Nessa perspectiva, pode estimular crianças negras a reconhecerem seus cabelos, traços e características como elementos de sua identidade e cultura. A relação afetiva com o cabelo possibilita discussões sobre autoaceitação, representatividade e padrões estéticos que historicamente desvalorizam características negras.", linkAmazon: "https://www.amazon.com.br/dp/8501119768" },
  { titulo: "Flávia e o Bolo de Chocolate", autora: "Míriam Leitão", editora: "Rocco Pequenos Leitores", ano: "2015", capa: "assets/capas/flavia-e-o-bolo-de-chocolate.jpg", resenhaTexto: "Flávia e o Bolo de Chocolate, de Míriam Leitão, pode ser uma ferramenta importante para a educação antirracista na infância por tratar, de forma sensível e próxima do universo infantil, da descoberta e da aceitação da própria identidade. A história permite conversar sobre as características físicas de Flávia e sobre o reconhecimento de sua identidade negra, abrindo espaço para que as crianças percebam que diferentes aparências e origens fazem parte da diversidade humana.", linkAmazon: "https://www.amazon.com.br/dp/8562500755" },
  { titulo: "Ave Alegria", autora: "Sylvia Orthof", editora: "Gaia Editora", ano: "2014", capa: "assets/capas/ave-alegria.jpg", resenhaTexto: "Recomendamos o livro Ave Alegria, de Sylvia Orthof, para ser utilizado como recurso para a educação antirracista infantil por apresentar, de maneira lúdica e acessível às crianças, valores relacionados à justiça, à igualdade e à diversidade cultural. A partir desses princípios, a obra pode ser trabalhada sob uma ótica antirracista, estimulando crianças a reconhecer diferentes culturas e identidades negras não valorizadas. Sua valorização daquilo que é 'bom, justo e belo' possibilita ao educador criar discussões que relacionem literatura, diversidade e respeito às diferenças.", linkAmazon: "https://www.amazon.com.br/dp/8575554387" }
];

const livrosGrid = document.getElementById('livros-grid');
if (livrosGrid) {
  livrosData.forEach((livro, index) => {
    const card = document.createElement('div');
    card.className = 'livro-card';
    card.innerHTML = `<img src="${livro.capa}" alt="Capa de ${livro.titulo}"><h4>${livro.titulo}</h4><p>${livro.autora}</p>`;
    card.addEventListener('click', () => abrirModalLivro(index));
    livrosGrid.appendChild(card);
  });
}

const modalLivro = document.getElementById('modal-livro');
function abrirModalLivro(index) {
  const livro = livrosData[index];
  document.getElementById('modal-livro-capa').src = livro.capa;
  document.getElementById('modal-livro-titulo').innerText = livro.titulo;
  document.getElementById('modal-livro-autor').innerText = livro.autora;
  document.getElementById('modal-livro-editora').innerText = livro.editora;
  document.getElementById('modal-livro-ano').innerText = livro.ano;
  document.getElementById('modal-livro-resenha-texto').innerText = livro.resenhaTexto;
  document.getElementById('modal-livro-amazon').href = livro.linkAmazon;
  modalLivro.classList.add('active');
}
document.getElementById('fechar-modal-livro').addEventListener('click', () => modalLivro.classList.remove('active'));

// =========================================================
// 5. LÓGICA DO CINEBLUES (ESTILO NETFLIX COM -HO)
// =========================================================
const filmesData = [
  // --- JÁ EXIBIDOS ---
  {
    id: 0,
    titulo: "Histórias Cruzadas",
    ano: "2011",
    direcao: "Tate Taylor",
    genero: "Drama",
    classificacao: "12 anos",
    poster: "assets/filmes/historias-cruzadas.jpg",
    imagemFundo: "assets/filmes/historias-cruzadas-ho.jpeg", // Nome com -ho
    sinopse: "Uma jovem escritora decide entrevistar as mulheres negras que passaram a vida cuidando de famílias brancas nos anos 60. O que começa como um projeto de escrita se transforma em um ato de coragem e amizade.",
    temas: "Racismo estrutural, segregação, o papel da mulher negra na sociedade e a importância da escuta.",
    exibido: true,
    infantil: false
  },
  {
    id: 1,
    titulo: "Corra!",
    ano: "2017",
    direcao: "Jordan Peele",
    genero: "Suspense / Terror",
    classificacao: "16 anos",
    poster: "assets/filmes/corra.jpg",
    imagemFundo: "assets/filmes/corra-ho.jpg", // Nome com -ho
    sinopse: "Chris, um jovem negro, vai passar o fim de semana na casa dos pais de sua namorada branca. O que parecia ser uma recepção calorosa logo se revela um pesadelo perturbador sobre apropriação cultural e racismo velado.",
    temas: "Apropriação cultural, racismo velado, hipocrisia da sociedade liberal e o horror do racismo cotidiano.",
    exibido: true,
    infantil: false
  },
  
  // --- RECOMENDAÇÕES INFANTIS ---
  {
    id: 2,
    titulo: "A Princesa e o Sapo",
    ano: "2009",
    direcao: "Ron Clements, John Musker",
    genero: "Animação / Infantil",
    classificacao: "Livre",
    poster: "assets/filmes/princesa-e-o-sapo.jpg",
    imagemFundo: "assets/filmes/princesa-e-o-sapo-ho.jpeg",
    sinopse: "Tiana é uma jovem negra de Nova Orleans que trabalha duro para realizar seu sonho de abrir um restaurante. Ao beijar um príncipe transformado em sapo, ela embarca em uma aventura que mudará sua vida.",
    temas: "Representatividade negra, empoderamento feminino, cultura de Nova Orleans, valorização do trabalho.",
    exibido: false,
    infantil: true
  },
  {
    id: 3,
    titulo: "Kiriku e a Feiticeira",
    ano: "1998",
    direcao: "Michel Ocelot",
    genero: "Animação / Infantil",
    classificacao: "Livre",
    poster: "assets/filmes/kiriku.jpg",
    imagemFundo: "assets/filmes/kiriku-ho.jpeg",
    sinopse: "Na África Ocidental, um bebê nasce falando e andando. Kiriku, um menino minúsculo e muito veloz, decide enfrentar a temida feiticeira Karabá para salvar sua aldeia.",
    temas: "Mitologia africana, ancestralidade, coragem, resistência e a força da comunidade.",
    exibido: false,
    infantil: true
  },
  {
    id: 4,
    titulo: "Cada um na sua casa",
    ano: "2020",
    direcao: "Kris Pearn, Cory Evans",
    genero: "Animação / Infantil",
    classificacao: "Livre",
    poster: "assets/filmes/cada-um-na-sua-casa.jpg",
    imagemFundo: "assets/filmes/cada-um-na-sua-casa-ho.jpeg",
    sinopse: "Cansados da negligência dos pais, os irmãos Willoughby criam um plano para se livrar deles. Durante a jornada, eles encontram uma nova família e aprendem sobre empatia e afeto.",
    temas: "Diversidade familiar, empatia, quebra de ciclos tóxicos e a importância do afeto.",
    exibido: false,
    infantil: true
  }
];

const cineGridExibidos = document.getElementById('cine-grid-exibidos');
const cineGridInfantil = document.getElementById('cine-grid-infantil');
const cineHero = document.getElementById('cine-hero');
let filmeAtualId = 0; 

function atualizarHero(filme) {
  document.getElementById('hero-titulo').innerText = filme.titulo;
  document.getElementById('hero-meta').innerText = `${filme.ano} · ${filme.genero} · ${filme.classificacao}`;
  document.getElementById('hero-sinopse').innerText = filme.sinopse;
  
  if(filme.imagemFundo) {
    cineHero.style.backgroundImage = `url('${filme.imagemFundo}')`;
  } else {
    cineHero.style.backgroundImage = `linear-gradient(to right, var(--bg) 0%, rgba(20,17,14,0.5) 100%)`; 
  }

  const seloHero = document.getElementById('hero-selo');
  seloHero.style.display = filme.exibido ? 'inline-block' : 'none';
  filmeAtualId = filme.id;
}

// Configura os cards
if (cineGridExibidos && cineGridInfantil) {
  filmesData.forEach((filme) => {
    const card = document.createElement('div');
    card.className = 'filme-card-netflix';
    card.innerHTML = `
      ${filme.exibido ? '<div class="selo-card-exibido">Já Exibido</div>' : ''}
      <img src="${filme.poster}" alt="Pôster de ${filme.titulo}" onerror="this.src='https://via.placeholder.com/300x450/111/FFF?text=Falta+Foto'">
    `;
    
    card.addEventListener('click', () => {
      atualizarHero(filme);
      if(mainContainer) mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    if (filme.infantil) cineGridInfantil.appendChild(card);
    else cineGridExibidos.appendChild(card);
  });

  atualizarHero(filmesData.find(f => f.exibido));
}

// Animação Ghost no Cineblues (Extraída do behaviors.js)
const originalAtualizarHero = atualizarHero;
window.atualizarHero = function(filme) {
  const fundoAnterior = cineHero.style.backgroundImage;
  originalAtualizarHero(filme);
  
  if(mainContainer) mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const fantasma = document.createElement('div');
  fantasma.className = 'cine-hero-ghost';
  fantasma.style.backgroundImage = fundoAnterior;
  cineHero.prepend(fantasma);
  requestAnimationFrame(() => fantasma.classList.add('some'));
  setTimeout(() => fantasma.remove(), 800);
  
  const conteudo = cineHero.querySelector('.cine-hero-content');
  conteudo.classList.remove('troca'); void conteudo.offsetWidth; conteudo.classList.add('troca');
};

// Sobrescreve o evento de clique dos cards para usar a nova função
document.querySelectorAll('.filme-card-netflix').forEach((card, index) => {
  // Remove o listener antigo clonando o nó
  const novoCard = card.cloneNode(true);
  card.parentNode.replaceChild(novoCard, card);
  
  novoCard.addEventListener('click', () => {
    const filme = filmesData[index];
    window.atualizarHero(filme);
  });
});


document.getElementById('btn-hero-detalhes').addEventListener('click', () => abrirModalFilme(filmeAtualId));
const modalFilme = document.getElementById('modal-filme');
const btnFecharFilme = document.getElementById('fechar-modal-filme');

function abrirModalFilme(index) {
  const filme = filmesData.find(f => f.id === index);
  if(!filme) return;
  
  document.getElementById('modal-filme-poster').src = filme.poster;
  document.getElementById('modal-filme-titulo').innerText = filme.titulo;
  document.getElementById('modal-filme-ano').innerText = filme.ano;
  document.getElementById('modal-filme-direcao').innerText = filme.direcao;
  document.getElementById('modal-filme-classificacao').innerText = filme.classificacao;
  document.getElementById('modal-filme-sinopse').innerText = filme.sinopse;
  document.getElementById('modal-filme-temas').innerText = filme.temas;
  
  const seloModal = document.getElementById('modal-filme-selo');
  seloModal.style.display = filme.exibido ? 'block' : 'none';
  modalFilme.classList.add('active');
}

if (btnFecharFilme) btnFecharFilme.addEventListener('click', () => modalFilme.classList.remove('active'));
if (modalFilme) modalFilme.addEventListener('click', (e) => { if (e.target === modalFilme) modalFilme.classList.remove('active'); });

// =========================================================
// 6. QUIZ — QUEBRANDO SILÊNCIOS
// =========================================================

// =========================================================
// 1. CONEXÃO COM O SUPABASE
// =========================================================

// Preencha com os dados do projeto Supabase.
// Utilize a chave pública (publishable/anon), nunca a service_role.

const SUPABASE_URL = "SUA_URL_DO_SUPABASE";
const SUPABASE_ANON_KEY = "SUA_CHAVE_PUBLICA_DO_SUPABASE";

let supabaseClient = null;

if (
  window.supabase &&
  SUPABASE_URL !== "SUA_URL_DO_SUPABASE" &&
  SUPABASE_ANON_KEY !== "SUA_CHAVE_PUBLICA_DO_SUPABASE"
) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
} else {
  console.warn("Configure a URL e a chave pública do Supabase.");
}

// =========================================================
// 2. PERGUNTAS DO QUIZ
// =========================================================

// Os perfis são registrados internamente.
// O participante não verá a classificação das alternativas.

const perguntasQuiz = [
  {
    id: "1",
    texto: `Você presencia uma situação em uma escola na qual uma criança negra é associada a uma fantasia de macaco. A situação provoca desconforto entre algumas pessoas presentes, mas ninguém parece saber como reagir.

O que você faria diante dessa situação?`,

    opcoes: [
      {
        letra: "A",
        texto: "Procuraria compreender melhor o ocorrido, conversando com outras pessoas e buscando informações sobre como situações semelhantes afetam crianças negras.",
        perfil: "reflexao",
        pontos: 2
      },
      {
        letra: "B",
        texto: "Tentaria acolher a criança e sua família, demonstrando apoio e procurando os responsáveis pela escola para que o caso fosse devidamente apurado.",
        perfil: "acao",
        pontos: 3
      },
      {
        letra: "C",
        texto: "Preferiria não me envolver diretamente, considerando que a situação deveria ser resolvida pela família e pela direção da escola.",
        perfil: "omissao",
        pontos: 0
      },
      {
        letra: "D",
        texto: "Questionaria imediatamente a atitude dos envolvidos, demonstrando indignação e exigindo uma explicação pelo ocorrido.",
        perfil: "reativa",
        pontos: 1
      }
    ]
  },

  {
    id: "2",
    texto: `Você está em uma farmácia quando ouve uma funcionária fazer um comentário racista sobre uma mulher negra, utilizando a expressão "escurecendo a loja". Algumas pessoas percebem o comentário, mas a rotina do estabelecimento continua normalmente.

Como você reagiria?`,

    opcoes: [
      {
        letra: "A",
        texto: "Chamaria a atenção da funcionária naquele momento, deixando claro que o comentário foi inadequado e que não deveria ser tratado como brincadeira.",
        perfil: "reativa",
        pontos: 1
      },
      {
        letra: "B",
        texto: "Evitaria participar da situação, pois não teria certeza de como agir e acreditaria que a própria empresa deveria tomar alguma providência.",
        perfil: "omissao",
        pontos: 0
      },
      {
        letra: "C",
        texto: "Procuraria apoiar a mulher atingida, orientando-a sobre os canais de denúncia e buscando registrar uma reclamação formal junto à empresa.",
        perfil: "acao",
        pontos: 3
      },
      {
        letra: "D",
        texto: "Depois de presenciar a situação, pesquisaria sobre racismo no ambiente de trabalho e sobre a responsabilidade dos estabelecimentos diante de atitudes discriminatórias.",
        perfil: "reflexao",
        pontos: 2
      }
    ]
  },

  {
    id: "3",
    texto: `Você está em um shopping e percebe que dois adolescentes negros estão sendo observados e abordados por funcionários de segurança de maneira diferente de outros clientes. A situação parece constrangedora, mas não há uma explicação clara para a abordagem.

O que você faria?`,

    opcoes: [
      {
        letra: "A",
        texto: "Procuraria entender o que motivou a abordagem, observando a situação e buscando informações sobre práticas de discriminação racial em espaços comerciais.",
        perfil: "reflexao",
        pontos: 2
      },
      {
        letra: "B",
        texto: "Aproximaria-me dos adolescentes para oferecer apoio e, se necessário, ajudaria a encaminhar uma reclamação à administração do shopping.",
        perfil: "acao",
        pontos: 3
      },
      {
        letra: "C",
        texto: "Questionaria os seguranças sobre o motivo da abordagem, demonstrando que percebi a diferença de tratamento.",
        perfil: "reativa",
        pontos: 1
      },
      {
        letra: "D",
        texto: "Continuaria minhas atividades no shopping, entendendo que não seria adequado interferir em uma abordagem realizada pelos funcionários.",
        perfil: "omissao",
        pontos: 0
      }
    ]
  },

  {
    id: "4",
    texto: `Você encontra uma notícia sobre vendedores ambulantes negros que relatam episódios de violência e abordagens policiais abusivas durante o trabalho nas ruas de São Paulo. A situação gera comentários nas redes sociais, alguns minimizando os acontecimentos.

Como você se posicionaria diante disso?`,

    opcoes: [
      {
        letra: "A",
        texto: "Acompanharia as discussões sem participar, pois consideraria que não possui informações suficientes para opinar sobre o assunto.",
        perfil: "omissao",
        pontos: 0
      },
      {
        letra: "B",
        texto: "Responderia aos comentários que minimizam a situação, questionando a postura das pessoas e demonstrando indignação com o ocorrido.",
        perfil: "reativa",
        pontos: 1
      },
      {
        letra: "C",
        texto: "Buscaria compreender o contexto, pesquisando sobre racismo estrutural, desigualdade social e a relação entre esses fatores e a violência contra trabalhadores negros.",
        perfil: "reflexao",
        pontos: 2
      },
      {
        letra: "D",
        texto: "Compartilharia informações verificadas sobre o caso, valorizaria os relatos dos trabalhadores e procuraria divulgar iniciativas e organizações que atuam na defesa de seus direitos.",
        perfil: "acao",
        pontos: 3
      }
    ]
  }
];

// =========================================================
// 3. QUINTA PERGUNTA — RESPOSTA ABERTA
// =========================================================

const perguntaAberta = {
  id: "5",
  texto: `Uma família de Caruaru, em Pernambuco, sofreu ofensas racistas de uma vizinha durante um longo período. Os ataques incluíam comentários ofensivos sobre a cor da pele e comparações com animais. O caso chegou à Justiça, e a responsável foi condenada pelo crime de racismo.

Imagine que você estivesse no lugar dessa família.

O que você faria diante dessas situações? Como agiria para enfrentar o racismo, buscar apoio e lidar com a continuidade dessas ofensas?`
};

// =========================================================
// 4. VARIÁVEIS DO QUIZ
// =========================================================

let perguntaAtual = 0;
let pontuacaoTotal = 0;
let respostasUsuario = {};
let classificacaoCasos = {};
let salvamentoIniciado = false;

// =========================================================
// 5. CONTROLE DAS TELAS
// =========================================================

function trocarTela(idTela) {
  document.querySelectorAll(".quiz-screen").forEach(tela => {
    tela.classList.remove("active");
  });

  const tela = document.getElementById(idTela);

  if (tela) {
    tela.classList.add("active");
  }

  if (mainContainer) {
    mainContainer.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
}

// =========================================================
// 6. INICIAR QUIZ
// =========================================================

function iniciarQuiz() {
  perguntaAtual = 0;
  pontuacaoTotal = 0;
  respostasUsuario = {};
  classificacaoCasos = {};
  salvamentoIniciado = false;

  trocarTela("quiz-perguntas");
  renderizarPergunta();
}

// =========================================================
// 7. RENDERIZAR PERGUNTAS
// =========================================================

function renderizarPergunta() {
  const total = 5;

  const texto = document.getElementById("pergunta-texto");
  const container = document.getElementById("pergunta-opcoes");
  const barra = document.getElementById("barra-progresso");
  const progressoTexto = document.getElementById("quiz-progresso-texto");
  const contador = document.getElementById("quiz-contador");
  const btnAberta = document.getElementById("btn-proxima-aberta");

  if (!texto || !container || !barra || !contador) return;

  const porcentagem = Math.round((perguntaAtual / total) * 100);

  contador.innerText = `Pergunta ${perguntaAtual + 1} de ${total}`;
  barra.style.width = `${porcentagem}%`;

  if (progressoTexto) {
    progressoTexto.innerText = `${porcentagem}%`;
  }

  container.innerHTML = "";
  container.classList.remove("travado");

  if (btnAberta) {
    btnAberta.style.display = "none";
  }

  // Q1 até Q4: múltipla escolha

  if (perguntaAtual < 4) {
    const pergunta = perguntasQuiz[perguntaAtual];

    texto.innerText = pergunta.texto;

    pergunta.opcoes.forEach(opcao => {
      const botao = document.createElement("button");

      botao.type = "button";
      botao.className = "opcao-btn";

      const letra = document.createElement("span");
      letra.className = "opcao-letra";
      letra.innerText = opcao.letra;

      const descricao = document.createElement("span");
      descricao.innerText = opcao.texto;

      botao.appendChild(letra);
      botao.appendChild(descricao);

      botao.addEventListener("click", () => {
        if (container.classList.contains("travado")) return;

        container.classList.add("travado");
        botao.classList.add("selecionada");

        // Guarda a alternativa e sua classificação interna.
        respostasUsuario[pergunta.id] = opcao.letra;

        pontuacaoTotal += opcao.pontos;

        setTimeout(() => {
          perguntaAtual++;
          renderizarPergunta();
        }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 100 : 500);
      });

      container.appendChild(botao);
    });

  } else {
    // Q5: resposta aberta

    texto.innerText = perguntaAberta.texto;

    const textarea = document.createElement("textarea");

    textarea.className = "input-aberto";
    textarea.id = "resposta-aberta";
    textarea.placeholder = "Escreva o que você faria nessa situação...";
    textarea.rows = 6;
    textarea.maxLength = 3000;

    container.appendChild(textarea);

    if (btnAberta) {
      btnAberta.innerText = "Concluir respostas";
      btnAberta.style.display = "inline-flex";
    }
  }
}

// =========================================================
// 8. AVANÇAR PERGUNTA ABERTA
// =========================================================

function avancarPerguntaAberta() {
  const textarea = document.getElementById("resposta-aberta");

  if (!textarea) return;

  const resposta = textarea.value.trim();

  if (resposta.length < 10) {
    alert("Escreva uma resposta um pouco mais completa antes de continuar.");
    textarea.focus();
    return;
  }

  respostasUsuario["5"] = resposta;

  // Após a Q5, inicia a dinâmica de classificação.
  iniciarClassificacao();
}

// =========================================================
// 9. CLASSIFICAÇÃO DOS CINCO CASOS
// =========================================================

const casos = [
  {
    id: "caso1",
    titulo: "Máscara de Macaco na Escola"
  },
  {
    id: "caso2",
    titulo: '"Escurecendo a Loja" na Drogasil'
  },
  {
    id: "caso3",
    titulo: "Abordagem em Shopping"
  },
  {
    id: "caso4",
    titulo: "Violência Policial com Ambulantes"
  },
  {
    id: "caso5",
    titulo: "Ofensas contra uma Família"
  }
];

function iniciarClassificacao() {
  trocarTela("quiz-classificacao");

  const pool = document.getElementById("casos-pool");

  if (!pool) return;

  pool.innerHTML = "";

  classificacaoCasos = {};

  const zonaReal = document.querySelector("#zona-real .drop-area");
  const zonaFicticio = document.querySelector("#zona-ficticio .drop-area");

  if (zonaReal) zonaReal.innerHTML = "";
  if (zonaFicticio) zonaFicticio.innerHTML = "";

  casos.forEach(caso => {
    const card = document.createElement("div");

    card.className = "caso-card";
    card.id = caso.id;
    card.innerText = caso.titulo;
    card.draggable = true;
    card.dataset.estado = "";

    card.addEventListener("dragstart", event => {
      event.dataTransfer.setData("text/plain", caso.id);
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
    });

    // Clique: alterna entre não classificado, real e fictício.
    card.addEventListener("click", () => {
      const estadoAtual = card.dataset.estado;

      if (estadoAtual === "") {
        moverCaso(caso.id, "real");
      } else if (estadoAtual === "real") {
        moverCaso(caso.id, "ficticio");
      } else {
        moverCaso(caso.id, "");
      }
    });

    pool.appendChild(card);
  });

  configurarZonasDeArraste();
}

function moverCaso(id, destino) {
  const card = document.getElementById(id);

  if (!card) return;

  const pool = document.getElementById("casos-pool");

  if (destino === "real") {
    const area = document.querySelector("#zona-real .drop-area");
    area.appendChild(card);

  } else if (destino === "ficticio") {
    const area = document.querySelector("#zona-ficticio .drop-area");
    area.appendChild(card);

  } else {
    pool.appendChild(card);
  }

  card.dataset.estado = destino;

  if (destino) {
    classificacaoCasos[id] = destino;
  } else {
    delete classificacaoCasos[id];
  }
}

function configurarZonasDeArraste() {
  document.querySelectorAll(".drop-zone").forEach(zona => {

    zona.ondragover = event => {
      event.preventDefault();
      zona.classList.add("drag-over");
    };

    zona.ondragleave = () => {
      zona.classList.remove("drag-over");
    };

    zona.ondrop = event => {
      event.preventDefault();
      zona.classList.remove("drag-over");

      const id = event.dataTransfer.getData("text/plain");

      moverCaso(id, zona.dataset.tipo);
    };
  });
}

// =========================================================
// 10. REVELAÇÃO DOS CASOS
// =========================================================

function mostrarRevelacao() {
  if (Object.keys(classificacaoCasos).length !== 5) {
    alert("Classifique todos os cinco casos antes de continuar.");
    return;
  }

  trocarTela("quiz-revelacao");
}

// =========================================================
// 11. NOTÍCIAS
// =========================================================

function mostrarNoticias() {
  trocarTela("quiz-noticias");
}

// =========================================================
// 12. DEFINIÇÃO DO PERFIL
// =========================================================

function calcularPerfil() {
  let perfil = "";
  let feedback = "";

  // A pontuação máxima é 12.
  // Cada questão vale de 0 a 3 pontos.

  if (pontuacaoTotal <= 3) {
    perfil = "Omissão / Passividade";

    feedback = `Suas respostas indicam uma tendência a não intervir diretamente diante de situações de racismo. Isso pode estar relacionado à insegurança, ao receio de conflitos ou à dificuldade de reconhecer formas de agir.

O silêncio também pode contribuir para a permanência de práticas discriminatórias. Buscar conhecimento e desenvolver estratégias de apoio são passos importantes para transformar essa postura.`;

  } else if (pontuacaoTotal <= 6) {
    perfil = "Reação Reativa";

    feedback = `Suas respostas indicam uma tendência a reagir de maneira imediata diante de situações de racismo, demonstrando incômodo e disposição para questionar atitudes discriminatórias.

Entretanto, é importante desenvolver estratégias que aliem posicionamento, acolhimento e encaminhamentos responsáveis, para que a reação também contribua para mudanças efetivas.`;

  } else if (pontuacaoTotal <= 9) {
    perfil = "Reflexão Crítica";

    feedback = `Suas respostas demonstram uma tendência a procurar compreender as situações, analisar seus contextos e reconhecer como o racismo se manifesta na sociedade.

A reflexão é fundamental para o letramento racial. O desafio é transformar esse conhecimento em atitudes concretas de enfrentamento, apoio e mobilização coletiva.`;

  } else {
    perfil = "Ação Antirracista Consciente";

    feedback = `Suas respostas indicam uma tendência a combinar posicionamento, acolhimento e busca por medidas concretas diante de situações de racismo.

A ação antirracista exige continuidade: apoiar pessoas atingidas, questionar práticas discriminatórias, buscar os canais adequados e contribuir para transformar os espaços sociais.`;

  }

  return { perfil, feedback };
}

// =========================================================
// 13. MOSTRAR DIAGNÓSTICO
// =========================================================

async function mostrarDiagnostico() {
  const resultado = calcularPerfil();

  document.getElementById("resultado-perfil").innerText =
    resultado.perfil;

  document.getElementById("resultado-texto").innerText =
    resultado.feedback;

  trocarTela("quiz-resultado");

  // Evita salvar duas vezes se o botão for acionado novamente.
  if (!salvamentoIniciado) {
    salvamentoIniciado = true;

    await salvarNoBancoDeDados(
      pontuacaoTotal,
      resultado.perfil,
      respostasUsuario
    );
  }
}

// =========================================================
// 14. SALVAR NO SUPABASE
// =========================================================

async function salvarNoBancoDeDados(pontuacao, perfil, respostas) {

  if (!supabaseClient) {
    console.error("Supabase não está conectado.");
    return;
  }

  const dadosParaSalvar = {
    pontuacao: pontuacao,
    perfil: perfil,

    q1: respostas["1"] || null,
    q2: respostas["2"] || null,
    q3: respostas["3"] || null,
    q4: respostas["4"] || null,

    q5_aberta: respostas["5"] || null
  };

  try {
    const { data, error } = await supabaseClient
      .from("respostas_quiz")
      .insert([dadosParaSalvar])
      .select();

    if (error) {
      console.error("Erro ao salvar respostas:", error.message);
      alert("Não foi possível salvar suas respostas. Tente novamente.");
      salvamentoIniciado = false;
      return;
    }

    console.log("Respostas salvas com sucesso!", data);

  } catch (erro) {
    console.error("Erro inesperado:", erro);
    salvamentoIniciado = false;
  }
}

// =========================================================
// 15. COMPARTILHAR RESULTADO
// =========================================================

function compartilharResultado() {
  const perfil = document.getElementById("resultado-perfil").innerText;

  const mensagem =
    `Participei do Desafio de Reflexão do projeto Quebrando Silêncios e meu resultado foi: ${perfil}. Vamos refletir e construir práticas antirracistas!`;

  const url =
    "https://wa.me/?text=" + encodeURIComponent(mensagem);

  window.open(url, "_blank");
}

// =========================================================
// 16. REINICIAR QUIZ
// =========================================================

function reiniciarQuiz() {
  perguntaAtual = 0;
  pontuacaoTotal = 0;
  respostasUsuario = {};
  classificacaoCasos = {};
  salvamentoIniciado = false;

  trocarTela("quiz-intro");
}

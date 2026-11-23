// =========================================================
// 0. CONEXÃO COM O SUPABASE
// =========================================================
const SUPABASE_URL = "https://lbitnzlqswandimarczg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_sYqi0iyrLVRQ91WHoJ3H7Q_8G086stf";

let supabaseClient = null;

if (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("[Supabase] Cliente inicializado com sucesso.");
  } catch (err) {
    console.error("[Supabase] Erro ao inicializar o cliente:", err);
  }
} else {
  console.warn("[Supabase] Biblioteca supabase-js ou credenciais ausentes.");
}

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
// 2. NAVEGAÇÃO DO DASHBOARD E ANIMAÇÃO DO MENU
// =========================================================
const navItems = document.querySelectorAll('[data-target]');
const pages = document.querySelectorAll('.dashboard-page');
const mainContainer = document.querySelector('.main-content');
const navIndicator = document.querySelector('.nav-indicator');

// Atualiza a posição da bolinha que desliza no menu mobile
function updateNavIndicator() {
  const activeItem = document.querySelector('.sidebar-nav .nav-item.active');
  if (!activeItem || !navIndicator) return;

  if (window.innerWidth > 768) {
    navIndicator.style.opacity = '0';
    return;
  }
  navIndicator.style.opacity = '1';

  const itemLeft = activeItem.offsetLeft;
  const itemWidth = activeItem.offsetWidth;
  const indicatorWidth = 44;
  const translateX = itemLeft + (itemWidth / 2) - (indicatorWidth / 2);
  
  navIndicator.style.transform = `translateX(${translateX}px)`;
}

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => nav.classList.remove('active'));
    if(item.classList.contains('nav-item') && !item.classList.contains('sidebar-logo')) {
      item.classList.add('active');
      updateNavIndicator();
    }
    
    pages.forEach(page => page.classList.remove('active'));
    const targetId = item.getAttribute('data-target');
    const targetPage = document.getElementById(targetId);
    if (targetPage) targetPage.classList.add('active');

    if(mainContainer) mainContainer.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  });
});

window.addEventListener('resize', updateNavIndicator);
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(updateNavIndicator, 100);
});

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
// 5. LÓGICA DO CINEBLUES
// =========================================================
const filmesData = [
  { id: 0, titulo: "Histórias Cruzadas", ano: "2011", direcao: "Tate Taylor", genero: "Drama", classificacao: "12 anos", poster: "assets/filmes/historias-cruzadas.jpg", imagemFundo: "assets/filmes/historias-cruzadas-ho.jpeg", sinopse: "Uma jovem escritora decide entrevistar as mulheres negras que passaram a vida cuidando de famílias brancas nos anos 60. O que começa como um projeto de escrita se transforma em um ato de coragem e amizade.", temas: "Racismo estrutural, segregação, o papel da mulher negra na sociedade e a importância da escuta.", exibido: true, infantil: false },
  { id: 1, titulo: "Corra!", ano: "2017", direcao: "Jordan Peele", genero: "Suspense / Terror", classificacao: "16 anos", poster: "assets/filmes/corra.jpg", imagemFundo: "assets/filmes/corra-ho.jpg", sinopse: "Chris, um jovem negro, vai passar o fim de semana na casa dos pais de sua namorada branca. O que parecia ser uma recepção calorosa logo se revela um pesadelo perturbador sobre apropriação cultural e racismo velado.", temas: "Apropriação cultural, racismo velado, hipocrisia da sociedade liberal e o horror do racismo cotidiano.", exibido: true, infantil: false },
  { id: 2, titulo: "A Princesa e o Sapo", ano: "2009", direcao: "Ron Clements, John Musker", genero: "Animação / Infantil", classificacao: "Livre", poster: "assets/filmes/princesa-e-o-sapo.jpg", imagemFundo: "assets/filmes/princesa-e-o-sapo-ho.jpeg", sinopse: "Tiana é uma jovem negra de Nova Orleans que trabalha duro para realizar seu sonho de abrir um restaurante. Ao beijar um príncipe transformado em sapo, ela embarca em uma aventura que mudará sua vida.", temas: "Representatividade negra, empoderamento feminino, cultura de Nova Orleans, valorização do trabalho.", exibido: false, infantil: true },
  { id: 3, titulo: "Kiriku e a Feiticeira", ano: "1998", direcao: "Michel Ocelot", genero: "Animação / Infantil", classificacao: "Livre", poster: "assets/filmes/kiriku.jpg", imagemFundo: "assets/filmes/kiriku-ho.jpeg", sinopse: "Na África Ocidental, um bebê nasce falando e andando. Kiriku, um menino minúsculo e muito veloz, decide enfrentar a temida feiticeira Karabá para salvar sua aldeia.", temas: "Mitologia africana, ancestralidade, coragem, resistência e a força da comunidade.", exibido: false, infantil: true },
  { id: 4, titulo: "Cada um na sua casa", ano: "2020", direcao: "Kris Pearn, Cory Evans", genero: "Animação / Infantil", classificacao: "Livre", poster: "assets/filmes/cada-um-na-sua-casa.jpg", imagemFundo: "assets/filmes/cada-um-na-sua-casa-ho.jpeg", sinopse: "Cansados da negligência dos pais, os irmãos Willoughby criam um plano para se livrar deles. Durante a jornada, eles encontram uma nova família e aprendem sobre empatia e afeto.", temas: "Diversidade familiar, empatia, quebra de ciclos tóxicos e a importância do afeto.", exibido: false, infantil: true }
];

const cineGridExibidos = document.getElementById('cine-grid-exibidos');
const cineGridInfantil = document.getElementById('cine-grid-infantil');
const cineHero = document.getElementById('cine-hero');
let filmeAtualId = 0; 

function atualizarHero(filme) {
  if (!filme || !cineHero) return;

  const fundoAnterior = cineHero.style.backgroundImage;

  document.getElementById('hero-titulo').innerText = filme.titulo;
  document.getElementById('hero-meta').innerText = `${filme.ano} · ${filme.genero} · ${filme.classificacao}`;
  document.getElementById('hero-sinopse').innerText = filme.sinopse;
  
  if(filme.imagemFundo) {
    cineHero.style.backgroundImage = `url('${filme.imagemFundo}')`;
  } else {
    cineHero.style.backgroundImage = `linear-gradient(to right, var(--bg) 0%, rgba(20,17,14,0.5) 100%)`; 
  }

  const seloHero = document.getElementById('hero-selo');
  if (seloHero) seloHero.style.display = filme.exibido ? 'inline-block' : 'none';
  filmeAtualId = filme.id;

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && fundoAnterior) {
    const fantasma = document.createElement('div');
    fantasma.className = 'cine-hero-ghost';
    fantasma.style.backgroundImage = fundoAnterior;
    cineHero.prepend(fantasma);
    requestAnimationFrame(() => fantasma.classList.add('some'));
    setTimeout(() => fantasma.remove(), 800);
  }

  const conteudo = cineHero.querySelector('.cine-hero-content');
  if (conteudo) {
    conteudo.classList.remove('troca');
    void conteudo.offsetWidth;
    conteudo.classList.add('troca');
  }
}

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
// 6. QUIZ — PERGUNTAS
// =========================================================
const perguntasQuiz = [
  {
    id: "1",
    texto: `Você é mãe (ou pai) de uma criança negra de três anos que vai participar de uma atividade na escola. Em casa, seu filho comenta animado que você o levará fantasiado de palhaço. Ao chegar à escola, porém, as professoras colocam uma máscara de macaco no rosto dele para a apresentação.

Como você agiria diante dessa situação?`,
    opcoes: [
      { letra: "A", texto: "Ficaria muito constrangida(o), mas tentaria não criar clima na frente das outras crianças. Depois, em casa, evitaria tocar no assunto para não magoar meu filho.", perfil: "omissao", pontos: 0 },
      { letra: "B", texto: "Interromperia a atividade, retiraria a máscara do meu filho, acolheria ele e registraria formalmente o ocorrido com a direção, exigindo providências e acompanhamento pedagógico.", perfil: "acao", pontos: 3 },
      { letra: "C", texto: "Discutiria exaltada(o) com as professoras na frente de todo mundo, gritando que a escola é racista, e sairia levando meu filho sem buscar encaminhamento formal.", perfil: "reativa", pontos: 1 },
      { letra: "D", texto: "Conversaria com a coordenação ainda no mesmo dia e pediria uma reunião com a direção para entender por que aquela fantasia foi escolhida para uma criança negra, mas sem registrar queixa formal.", perfil: "reflexao", pontos: 2 }
    ]
  },
  {
    id: "2",
    texto: `Você trabalha em uma farmácia e, no seu primeiro dia, uma colega de trabalho diz que você está "escurecendo a loja". Outras pessoas escutam o comentário, mas a rotina do estabelecimento continua normalmente.

Como você reagiria diante dessa situação?`,
    opcoes: [
      { letra: "A", texto: "Registraria o ocorrido por escrito, comunicaria a chefia imediatamente e buscaria orientação sobre como formalizar uma denúncia por racismo no ambiente de trabalho, preservando testemunhas.", perfil: "acao", pontos: 3 },
      { letra: "B", texto: "Fingiria que não ouvi, continuaria o expediente e passaria a evitar essa colega, com medo de retaliação ou de perder o emprego.", perfil: "omissao", pontos: 0 },
      { letra: "C", texto: "Conversaria com a colega em particular, diria que o comentário é racista e não será tolerado, e depois procuraria a chefia para relatar o episódio e pedir providências.", perfil: "reflexao", pontos: 2 },
      { letra: "D", texto: "Responderia à colega com ironia e elevaria o tom na frente dos clientes, deixando claro que ela é racista, mas sem registrar ou comunicar o fato à empresa.", perfil: "reativa", pontos: 1 }
    ]
  },
  {
    id: "3",
    texto: `Você é uma pessoa negra e está passeando em um shopping com seus amigos. Em determinado momento, percebe que os seguranças passam a acompanhar seus movimentos e, em seguida, abordam você de maneira diferente dos outros clientes — mesmo sem nenhum motivo aparente.

Como você agiria diante dessa situação?`,
    opcoes: [
      { letra: "A", texto: "Partiria para a discussão com os seguranças, elevaria o tom e chamaria a atenção de todo o shopping, sem registrar nomes ou procurar canais formais.", perfil: "reativa", pontos: 1 },
      { letra: "B", texto: "Aceleraria o passo e sairia do shopping sem falar nada, para evitar confusão e não estragar o passeio dos meus amigos.", perfil: "omissao", pontos: 0 },
      { letra: "C", texto: "Exigiria saber o motivo da abordagem, pediria a identificação dos seguranças, gravaria a situação e acionaria o gerente do shopping e a Defensoria Pública, orientando meus amigos a fazer o mesmo.", perfil: "acao", pontos: 3 },
      { letra: "D", texto: "Manteria a calma, perguntaria ao segurança o motivo da abordagem e solicitaria o nome dele e do supervisor, registrando a situação para depois procurar o shopping e órgãos de defesa.", perfil: "reflexao", pontos: 2 }
    ]
  },
  {
    id: "4",
    texto: `Você trabalha como ambulante no centro de São Paulo. Durante sua jornada, você sofre abordagens policiais abusivas e violentas — com frequência maior do que outros trabalhadores do mesmo local.

Como você agiria diante dessa situação?`,
    opcoes: [
      { letra: "A", texto: "Depois da abordagem, procuraria me informar sobre meus direitos, conversaria com outros ambulantes sobre o ocorrido e buscaria orientação sobre como denunciar a violência policial.", perfil: "reflexao", pontos: 2 },
      { letra: "B", texto: "Evitaria qualquer reação, guardaria meus produtos e mudaria de lugar, sem registrar a abordagem ou procurar meus direitos, para não ter problemas.", perfil: "omissao", pontos: 0 },
      { letra: "C", texto: "Reagiria à abordagem com gritos e enfrentamento direto aos policiais, sem me preocupar em registrar provas ou buscar apoio jurídico naquele momento.", perfil: "reativa", pontos: 1 },
      { letra: "D", texto: "Manteria a calma para evitar escalada da violência, mas registraria a abordagem com testemunhas, buscaria apoio da Defensoria Pública e de organizações de direitos humanos, e denunciaria formalmente.", perfil: "acao", pontos: 3 }
    ]
  }
];

const perguntaAberta = {
  id: "5",
  texto: `Uma família de Caruaru, em Pernambuco, sofreu ofensas racistas recorrentes de uma vizinha durante um longo período. Os ataques incluíam comentários ofensivos sobre a cor da pele e comparações com animais. O caso chegou à Justiça e a responsável foi condenada pelo crime de racismo.

Imagine que você e sua família estão passando por essa situação.

O que você faria para enfrentar o ocorrido e proteger sua família?`
};

// =========================================================
// 7. VARIÁVEIS DE ESTADO DO QUIZ
// =========================================================
let perguntaAtual = 0;
let pontuacaoTotal = 0;
let respostasUsuario = {};
let classificacaoCasos = {};
let casoSelecionadoId = null;
let salvamentoIniciado = false;

function trocarTela(idTela) {
  document.querySelectorAll(".quiz-screen").forEach(tela => tela.classList.remove("active"));
  const tela = document.getElementById(idTela);
  if (tela) tela.classList.add("active");
  if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: "smooth" });
}

function iniciarQuiz() {
  perguntaAtual = 0;
  pontuacaoTotal = 0;
  respostasUsuario = {};
  classificacaoCasos = {};
  casoSelecionadoId = null;
  salvamentoIniciado = false;
  resetarRegistro();
  trocarTela("quiz-perguntas");
  renderizarPergunta();
}

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
  if (progressoTexto) progressoTexto.innerText = `${porcentagem}%`;

  container.innerHTML = "";
  container.classList.remove("travado");
  if (btnAberta) btnAberta.style.display = "none";

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

  // Reativa a animação de entrada a cada troca de pergunta e volta ao topo
  [texto, container].forEach(el => {
    el.classList.remove("entra");
    void el.offsetWidth;
    el.classList.add("entra");
  });
  if (mainContainer) mainContainer.scrollTo({ top: 0 });
  window.scrollTo({ top: 0 });
}

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
  iniciarClassificacao();
}

const casos = [
  { id: "caso1", titulo: "Máscara de Macaco na Escola" },
  { id: "caso2", titulo: '"Escurecendo a Loja" na Drogasil' },
  { id: "caso3", titulo: "Abordagem em Shopping" },
  { id: "caso4", titulo: "Violência Policial com Ambulantes" },
  { id: "caso5", titulo: "Ofensas contra uma Família" }
];

function iniciarClassificacao() {
  trocarTela("quiz-classificacao");

  const pool = document.getElementById("casos-pool");
  if (!pool) return;

  pool.innerHTML = "";
  classificacaoCasos = {};
  casoSelecionadoId = null;

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
      card.classList.remove("selecionado");
      casoSelecionadoId = null;
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));

    card.addEventListener("click", (e) => {
      e.stopPropagation();
      if (card.dataset.estado !== "") {
        moverCaso(caso.id, ""); // Se já estava classificado, clicar devolve pro pool
        casoSelecionadoId = null;
        return;
      }

      if (casoSelecionadoId === caso.id) {
        card.classList.remove("selecionado");
        casoSelecionadoId = null;
      } else {
        document.querySelectorAll('.caso-card').forEach(c => c.classList.remove('selecionado'));
        card.classList.add("selecionado");
        casoSelecionadoId = caso.id;
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
    document.querySelector("#zona-real .drop-area").appendChild(card);
  } else if (destino === "ficticio") {
    document.querySelector("#zona-ficticio .drop-area").appendChild(card);
  } else {
    pool.appendChild(card);
  }

  card.dataset.estado = destino;
  card.classList.remove("selecionado");
  casoSelecionadoId = null;

  if (destino) classificacaoCasos[id] = destino;
  else delete classificacaoCasos[id];
}

function configurarZonasDeArraste() {
  // Usa propriedades "on..." (e não addEventListener) para não acumular
  // ouvintes duplicados cada vez que o quiz é refeito.
  document.querySelectorAll(".drop-zone").forEach(zona => {
    zona.ondragover = event => {
      event.preventDefault();
      zona.classList.add("drag-over");
    };
    zona.ondragleave = () => zona.classList.remove("drag-over");
    zona.ondrop = event => {
      event.preventDefault();
      zona.classList.remove("drag-over");
      const id = event.dataTransfer.getData("text/plain");
      moverCaso(id, zona.dataset.tipo);
    };
    zona.onclick = () => {
      if (casoSelecionadoId) {
        moverCaso(casoSelecionadoId, zona.dataset.tipo);
      }
    };
  });

  // Clicar na área vazia do grupo inicial devolve o caso selecionado
  const pool = document.getElementById("casos-pool");
  pool.onclick = (e) => {
    if (e.target === pool && casoSelecionadoId) {
      moverCaso(casoSelecionadoId, "");
    }
  };
}

function mostrarRevelacao() {
  if (Object.keys(classificacaoCasos).length !== 5) {
    alert("Classifique todos os cinco casos antes de continuar.");
    return;
  }
  trocarTela("quiz-revelacao");
}

function mostrarNoticias() {
  trocarTela("quiz-noticias");
}

// Faixas de reflexão (0–12 pontos). São categorias pedagógicas desta atividade,
// não um diagnóstico psicológico nem uma definição de caráter.
const FAIXAS_REFLEXAO = [
  { max: 3,  titulo: "Um primeiro olhar",         sintese: "Nesta atividade, suas respostas indicam um primeiro olhar sobre o racismo no cotidiano. Ouvir, estudar e conversar abrem caminhos para agir." },
  { max: 6,  titulo: "Despertar crítico",         sintese: "Nesta atividade, você demonstrou incômodo e disposição para se posicionar. O próximo passo é unir reação, acolhimento e encaminhamentos responsáveis." },
  { max: 9,  titulo: "Consciência em construção", sintese: "Nesta atividade, você buscou compreender contextos e reconhecer como o racismo se manifesta. O desafio é transformar a reflexão em atitudes concretas." },
  { max: 12, titulo: "Compromisso antirracista",  sintese: "Nesta atividade, suas respostas combinam posicionamento, acolhimento e busca por canais adequados. A ação antirracista é contínua e coletiva." }
];

function faixaDaPontuacao(pontos) {
  return FAIXAS_REFLEXAO.find(f => pontos <= f.max) || FAIXAS_REFLEXAO[FAIXAS_REFLEXAO.length - 1];
}

function calcularPerfil() {
  const perfil = faixaDaPontuacao(pontuacaoTotal).titulo;
  let feedback = "";

  if (pontuacaoTotal <= 3) {
    feedback = `Suas respostas indicam uma tendência a não intervir diretamente diante de situações de racismo. Isso pode estar relacionado à insegurança, ao receio de conflitos ou à dificuldade de reconhecer formas de agir.

O silêncio também pode contribuir para a permanência de práticas discriminatórias. Buscar conhecimento e desenvolver estratégias de apoio são passos importantes para transformar essa postura.`;
  } else if (pontuacaoTotal <= 6) {
    feedback = `Suas respostas indicam uma tendência a reagir de maneira imediata diante de situações de racismo, demonstrando incômodo e disposição para questionar atitudes discriminatórias.

Entretanto, é importante desenvolver estratégias que aliem posicionamento, acolhimento e encaminhamentos responsáveis, para que a reação também contribua para mudanças efetivas.`;
  } else if (pontuacaoTotal <= 9) {
    feedback = `Suas respostas demonstram uma tendência a procurar compreender as situações, analisar seus contextos e reconhecer como o racismo se manifesta na sociedade.

A reflexão é fundamental para o letramento racial. O desafio é transformar esse conhecimento em atitudes concretas de enfrentamento, apoio e mobilização coletiva.`;
  } else {
    feedback = `Suas respostas indicam uma tendência a combinar posicionamento, acolhimento e busca por medidas concretas diante de situações de racismo.

A ação antirracista exige continuidade: apoiar pessoas atingidas, questionar práticas discriminatórias, buscar os canais adequados e contribuir para transformar os espaços sociais.`;
  }

  return { perfil, feedback };
}

async function mostrarDiagnostico() {
  const resultado = calcularPerfil();

  document.getElementById("resultado-perfil").innerText = resultado.perfil;
  document.getElementById("resultado-texto").innerText = resultado.feedback;

  trocarTela("quiz-resultado");

  // O registro é preenchido antes do salvamento: funciona mesmo se o banco falhar.
  atualizarRegistro();
  ajustarPreviaRegistro();

  if (!salvamentoIniciado) {
    salvamentoIniciado = true;
    await salvarNoBancoDeDados(pontuacaoTotal, resultado.perfil, respostasUsuario);
  }
}

// =========================================================
// 8. MEU REGISTRO DE APRENDIZAGEM
// A arte é desenhada em 540 px de largura e exportada com escala 2
// (1080x1920 no Stories, 1080x1080 no Quadrado).
// A foto é processada só no navegador: nunca é enviada ao Supabase.
// =========================================================
const REG_LARGURA = 540;
const REG_ALTURAS = { stories: 960, square: 540 };
const REG_ESCALA = 1080 / REG_LARGURA;
const regEstado = { cor: 'ochre', formato: 'stories', foto: null };

const regEl = id => document.getElementById(id);
const regCard = regEl('card-registro');
const regArea = regCard ? regCard.parentElement : null;
const regInputNome = regEl('input-nome');
const regInputFoto = regEl('input-foto');
const regFotoWrap = regEl('card-foto-wrap');
const regBtnRemover = regEl('btn-remover-foto');
const regBtnUpload = document.querySelector('.btn-upload');
const regBotoesCor = document.querySelectorAll('.color-opt');
const regBotoesFormato = document.querySelectorAll('.format-opt');

function aplicarCorRegistro(cor) {
  if (!regCard) return;
  regEstado.cor = cor;
  regCard.classList.remove('bg-ochre', 'bg-black', 'bg-offwhite');
  regCard.classList.add(`bg-${cor}`);
  regBotoesCor.forEach(b => {
    const ativo = b.dataset.cor === cor;
    b.classList.toggle('active', ativo);
    b.setAttribute('aria-pressed', String(ativo));
  });
}

function aplicarFormatoRegistro(formato) {
  if (!regCard) return;
  regEstado.formato = formato;
  regCard.classList.remove('formato-stories', 'formato-square');
  regCard.classList.add(`formato-${formato}`);
  regBotoesFormato.forEach(b => {
    const ativo = b.dataset.formato === formato;
    b.classList.toggle('active', ativo);
    b.setAttribute('aria-pressed', String(ativo));
  });
  ajustarPreviaRegistro();
}

// Escala a arte (540 px) para caber na área da prévia, sem distorcer
function ajustarPreviaRegistro() {
  if (!regCard || !regArea) return;
  const larg = regArea.clientWidth || REG_LARGURA;
  const alt = REG_ALTURAS[regEstado.formato];
  const k = Math.min(1, larg / REG_LARGURA, (window.innerHeight * 0.78) / alt);
  regCard.style.transform = `scale(${k})`;
  regCard.style.left = `${Math.max(0, (larg - REG_LARGURA * k) / 2)}px`;
  regArea.style.height = `${alt * k}px`;
}

function atualizarNomeRegistro() {
  const nomeEl = regEl('card-nome');
  if (!nomeEl) return;
  const nome = regInputNome ? regInputNome.value.trim() : '';
  nomeEl.textContent = nome || 'Participante';
}

function atualizarRegistro() {
  const perfilEl = regEl('card-perfil');
  const sinteseEl = regEl('card-sintese');
  if (!perfilEl || !sinteseEl) return;
  const faixa = faixaDaPontuacao(pontuacaoTotal);
  perfilEl.textContent = faixa.titulo;
  sinteseEl.textContent = faixa.sintese;
}

function definirFotoRegistro(dataUrl) {
  if (!regFotoWrap) return;
  regEstado.foto = dataUrl;
  regFotoWrap.style.backgroundImage = dataUrl ? `url("${dataUrl}")` : '';
  regFotoWrap.style.display = dataUrl ? 'block' : 'none';
  if (dataUrl) {
    regFotoWrap.setAttribute('role', 'img');
    regFotoWrap.setAttribute('aria-label', 'Foto do participante');
  }
  if (regBtnRemover) regBtnRemover.hidden = !dataUrl;
  if (regBtnUpload) regBtnUpload.textContent = dataUrl ? 'Trocar imagem' : 'Escolher imagem';
}

async function lerFotoRegistro(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, erro) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = erro;
      i.src = url;
    });
    // Redimensiona sem distorcer (mantém a proporção) e aplica a orientação EXIF
    const esc = Math.min(1, 1400 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * esc);
    c.height = Math.round(img.naturalHeight * esc);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    definirFotoRegistro(c.toDataURL('image/jpeg', 0.9));
  } catch (e) {
    console.error('[Registro] Não foi possível ler a imagem:', e);
    alert('Não foi possível abrir essa imagem. Tente uma foto em JPG ou PNG.');
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Limpa nome, foto, cor e formato entre participantes (totem compartilhado)
function resetarRegistro() {
  if (!regCard) return;
  if (regInputNome) regInputNome.value = '';
  if (regInputFoto) regInputFoto.value = '';
  atualizarNomeRegistro();
  definirFotoRegistro(null);
  aplicarCorRegistro('ochre');
  aplicarFormatoRegistro('stories');
}

if (regCard) {
  regBotoesCor.forEach(b => b.addEventListener('click', () => aplicarCorRegistro(b.dataset.cor)));
  regBotoesFormato.forEach(b => b.addEventListener('click', () => aplicarFormatoRegistro(b.dataset.formato)));
  if (regInputNome) regInputNome.addEventListener('input', atualizarNomeRegistro);
  if (regInputFoto) regInputFoto.addEventListener('change', () => lerFotoRegistro(regInputFoto.files[0]));
  if (regBtnRemover) regBtnRemover.addEventListener('click', () => {
    definirFotoRegistro(null);
    if (regInputFoto) regInputFoto.value = '';
  });
  if ('ResizeObserver' in window) new ResizeObserver(ajustarPreviaRegistro).observe(regArea);
  window.addEventListener('resize', ajustarPreviaRegistro);

  resetarRegistro();
  atualizarRegistro();
  ajustarPreviaRegistro();
}

// Exportação em PNG com as dimensões exatas, só da arte (sem os controles)
async function baixarRegistro() {
  const btn = regEl('btn-baixar-registro');
  const rotulo = btn ? btn.innerHTML : '';
  let palco = null;
  try {
    if (!window.html2canvas) throw new Error('html2canvas não carregou');
    if (btn) { btn.disabled = true; btn.textContent = 'Gerando imagem…'; }

    await document.fonts.ready;
    await Promise.all([
      document.fonts.load('800 40px "Bricolage Grotesque"'),
      document.fonts.load('600 24px "Bricolage Grotesque"'),
      document.fonts.load('400 16px Inter'),
      document.fonts.load('600 16px Inter')
    ]);

    // Clona só a arte, sem escala nem posicionamento da prévia, em tamanho real
    const altura = REG_ALTURAS[regEstado.formato];
    const clone = regCard.cloneNode(true);
    clone.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
    clone.removeAttribute('id');
    clone.style.transform = 'none';
    clone.style.position = 'relative';
    clone.style.left = '0';
    clone.style.top = '0';
    palco = document.createElement('div');
    palco.style.cssText = 'position:fixed;left:-10000px;top:0;pointer-events:none;';
    palco.appendChild(clone);
    document.body.appendChild(palco);

    const bruto = await html2canvas(clone, {
      scale: REG_ESCALA, width: REG_LARGURA, height: altura,
      backgroundColor: null, useCORS: true, logging: false, scrollX: 0, scrollY: 0
    });

    // Garante as dimensões exatas (1080x1920 ou 1080x1080)
    const final = document.createElement('canvas');
    final.width = 1080;
    final.height = Math.round(altura * REG_ESCALA);
    final.getContext('2d').drawImage(bruto, 0, 0, final.width, final.height);

    const blob = await new Promise(ok => final.toBlob(ok, 'image/png'));
    if (!blob) throw new Error('Falha ao gerar o PNG');

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `quebrando-silencios-registro-${regEstado.formato}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 4000);
  } catch (e) {
    console.error('[Registro] Erro ao gerar a imagem:', e);
    alert('Não foi possível gerar a imagem. Tente novamente.');
  } finally {
    if (palco) palco.remove();
    if (btn) { btn.disabled = false; btn.innerHTML = rotulo; }
  }
}

// =========================================================
// 9. SALVAR NO BANCO (Supabase)
// Só as colunas existentes em public.respostas_quiz.
// A foto e o nome do registro NUNCA são enviados.
// =========================================================
async function salvarNoBancoDeDados(pontuacao, perfil, respostas) {
  if (!supabaseClient) {
    console.error("[Supabase] Cliente não inicializado — resposta NÃO foi enviada.");
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
    const { error } = await supabaseClient
      .from("respostas_quiz")
      .insert([dadosParaSalvar]);

    if (error) {
      // Falha de salvamento não interrompe a experiência do participante
      console.error("[Supabase] Erro ao salvar:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return;
    }

    console.log("[Supabase] Resposta do quiz salva com sucesso.");
  } catch (erro) {
    console.error("[Supabase] Erro inesperado:", erro);
  }
}

function reiniciarQuiz() {
  perguntaAtual = 0;
  pontuacaoTotal = 0;
  respostasUsuario = {};
  classificacaoCasos = {};
  casoSelecionadoId = null;
  salvamentoIniciado = false;
  resetarRegistro();
  trocarTela("quiz-intro");
}
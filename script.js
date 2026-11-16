// ===================== Slides (Carrossel) =====================
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
// NAVEGAÇÃO DO DASHBOARD
// =========================================================
const navItems = document.querySelectorAll('[data-target]');
const pages = document.querySelectorAll('.dashboard-page');

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => nav.classList.remove('active'));
    
    if(item.classList.contains('nav-item') && !item.classList.contains('sidebar-logo')) {
       item.classList.add('active');
    }
    
    pages.forEach(page => page.classList.remove('active'));
    const targetId = item.getAttribute('data-target');
    const targetPage = document.getElementById(targetId);
    if (targetPage) targetPage.classList.add('active');
  });
});

// =========================================================
// DADOS E GRÁFICOS (HOME)
// =========================================================
const graficosConfig = {
  '7,1%': { 
    titulo: 'Taxa de Analfabetismo', 
    fonte: 'IBGE - PNAD Contínua', 
    link: 'https://www.ibge.gov.br/estatisticas/sociais/educacao/17270-pnad-continua.html',
    tipo: 'bar', labels: ['Brancos', 'Pretos/Pardos'], data: [3.2, 7.1], max: 10 
  },
  '14,1 p.p.': { 
    titulo: 'Aprendizado Adequado (Português)', 
    fonte: 'Saeb/Inep', 
    link: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/saeb',
    tipo: 'bar', labels: ['Brancos', 'Pretos/Pardos'], data: [45.6, 31.5], max: 50 
  },
  '9,2 anos': { 
    titulo: 'Média de Anos de Estudo', 
    fonte: 'IBGE - PNAD Contínua', 
    link: 'https://www.ibge.gov.br/estatisticas/sociais/educacao/17270-pnad-continua.html',
    tipo: 'bar', labels: ['Brancos', 'Pretos/Pardos'], data: [10.8, 9.2], max: 12 
  },
  '55%': { 
    titulo: 'Perfil Racial dos Docentes', 
    fonte: 'Censo Escolar/Inep', 
    link: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-escolar',
    tipo: 'doughnut', labels: ['Brancos', 'Pretos/Pardos'], data: [55, 45] 
  }
};

if (typeof Chart !== 'undefined') {
  Chart.defaults.color = '#a0a0a0';
  Chart.defaults.font.family = 'Inter, sans-serif';
  Chart.defaults.plugins.tooltip.backgroundColor = '#c8932b';
  Chart.defaults.plugins.tooltip.titleColor = '#000';
  Chart.defaults.plugins.tooltip.bodyColor = '#000';
  Chart.defaults.plugins.tooltip.titleFont = { weight: 'bold' };
}

let currentChart = null;

function renderizarGraficoNoModal(config) {
  const ctx = document.getElementById('canvas-modal');
  if (currentChart) currentChart.destroy();

  const gradientCreme = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
  gradientCreme.addColorStop(0, '#ffffff');
  gradientCreme.addColorStop(1, '#a1a1aa');

  const gradientOcre = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
  gradientOcre.addColorStop(0, '#e0a337');
  gradientOcre.addColorStop(1, '#8a6215');

  const opcoesBase = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#fff', font: { size: 14 } } },
      y: { grid: { color: 'rgba(250, 246, 238, 0.05)' }, beginAtZero: true, max: config.max || undefined }
    }
  };

  if (config.tipo === 'bar') {
    currentChart = new Chart(ctx, { 
      type: 'bar', 
      data: { labels: config.labels, datasets: [{ data: config.data, backgroundColor: [gradientCreme, gradientOcre], borderRadius: 8, maxBarThickness: 80 }] }, 
      options: opcoesBase 
    });
  } else if (config.tipo === 'doughnut') {
    currentChart = new Chart(ctx, { 
      type: 'doughnut', 
      data: { labels: config.labels, datasets: [{ data: config.data, backgroundColor: [gradientCreme, gradientOcre], borderWidth: 0, hoverOffset: 10 }] }, 
      options: { ...opcoesBase, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#fff', padding: 20, usePointStyle: true } } } } 
    });
  }
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

        cartao.innerHTML =
          `<p class="dado-numero">${item.numero}</p>
           <p class="dado-descricao">${item.descricao}</p>
           <p class="dado-fonte">
             <a href="${linkFonte}" target="_blank" onclick="event.stopPropagation()">${textoFonte}</a>
             <span>${item.ano}</span>
           </p>`;
        lista.appendChild(cartao);
      });
    })
    .catch(e => {
      lista.innerHTML = '<p class="dados-aviso">Erro ao carregar os dados.</p>';
    });
}

const modalGrafico = document.getElementById('modal-grafico');
document.getElementById('fechar-modal').addEventListener('click', () => modalGrafico.classList.remove('active'));
modalGrafico.addEventListener('click', (e) => { if (e.target === modalGrafico) modalGrafico.classList.remove('active'); });


// =========================================================
// LÓGICA DA ESTANTE DE LIVROS
// =========================================================
const livrosData = [
  {
    titulo: "A Cor de Coraline",
    autora: "Alexandre Rampazo",
    editora: "Rocco Pequenos Leitores",
    ano: "2017",
    capa: "assets/capas/cor-de-coraline.jpg",
    resenhaTexto: "Coraline ouve do amigo Pedrinho o pedido “me empresta o lápis cor de pele?” e fica intrigada: qual é, afinal, a cor da pele? Ao revisitar sua caixa de lápis, ela descobre que cada tom é bonito e que é a diversidade que dá beleza ao mundo. Vencedor do Selo Seleção Cátedra 10 Unesco e finalista do Prêmio Jabuti 2018, o livro de Alexandre Rampazo propõe uma conversa sensível sobre identidade, diversidade e pertencimento desde a primeira infância. A obra convida a criança a refletir sobre a representatividade e a pluralidade de tons que formam a pele humana.",
    linkAmazon: "https://www.amazon.com.br/cor-Coraline-Alexandre-Rampazo/dp/6589642028/ref=sr_1_1_so_ABIS_BOOK?dib=eyJ2IjoiMSJ9.v36CgCJZ4vL50WuQFhjo4gKMNrMQfiv5oAtDTJjYbKLGjHj071QN20LucGBJIEps.zxIiz8zN5X7UYnaCbuYcvWkeqhvVIaIgVBEUVarLzDg&dib_tag=se&keywords=A+Cor+de+Coraline+Alexandre+Rampazo&qid=1794857583&sr=8-1"
  },
  {
    titulo: "O Pequeno Príncipe Preto",
    autora: "Rodrigo França",
    editora: "Nova Fronteira",
    ano: "2020",
    capa: "assets/capas/pequeno-principe-preto.jpg",
    resenhaTexto: "Em um minúsculo planeta, o Pequeno Príncipe Preto vive ao lado de sua única companheira, uma árvore Baobá. Quando as ventanias chegam, ele viaja por outros planetas espalhando amor e empatia. Adaptação de uma peça infantil de Rodrigo França, o livro celebra a importância de valorizar quem somos e de onde viemos, mostrando a força dos laços de afeto e da coletividade. O livro traz uma narrativa ancestral africana e resgata a autoestima e o orgulho da identidade negra na infância, apresentando às crianças a importância de se reconhecerem e se amarem como são.",
    linkAmazon: "https://www.amazon.com.br/pequeno-pr%C3%ADncipe-preto-Rodrigo-Fran%C3%A7a-ebook/dp/B084CX1YYD/ref=sr_1_1?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=3FA1Q0E9KGONZ&dib=eyJ2IjoiMSJ9.11K4_oZ53IQ3uSG-h2Gv0g.SvNklvJ60IKp3ITKUkw5FBwVkNWvuPQk0D1SpM69xqg&dib_tag=se&keywords=2.+O+Pequeno+Pr%C3%ADncipe+Preto+%28Rodrigo+Fran%C3%A7a%2C+Nova+Fronteira%2C+2020%29&qid=1794857695&sprefix=2.+o+pequeno+pr%C3%ADncipe+preto+rodrigo+fran%C3%A7a+nova+fronteira+2020+%2Caps%2C510&sr=8-1"
  },
  {
    titulo: "Da Minha Janela",
    autora: "Otávio Júnior",
    editora: "Companhia das Letrinhas",
    ano: "2019",
    capa: "assets/capas/da-minha-janela.jpg",
    resenhaTexto: "Sentado à janela de uma casa em uma favela do Rio de Janeiro, o narrador observa o mundo: pessoas, cores, gestos, bichos. Cada cena vira uma pequena descoberta sobre a vida que acontece ao redor. Com texto sensível de Otávio Júnior e ilustrações vibrantes de Vanina Starkoff, o livro convida o leitor a olhar com atenção para as vidas que muitas vezes passam despercebidas. Vencedor do Prêmio Jabuti 2020 na categoria Infantil, a obra apresenta a periferia de forma poética, fugindo de estereótipos e valorizando o cotidiano e a cultura das comunidades.",
    linkAmazon: "https://www.amazon.com.br/dp/8574068748?lv=shuf&channelId=425&plpRedirect=mhFallback"
  },
  {
    titulo: "Amor de Cabelo",
    autora: "Matthew A. Cherry",
    editora: "Galerinha Record",
    ano: "2020",
    capa: "assets/capas/amor-de-cabelo.jpg",
    resenhaTexto: "A obra Amor de Cabelo, de Matthew A. Cherry, é ideal para trabalhar a educação antirracista infantil por apresentar, de maneira recreativa e acessível, a construção da autoestima e a valorização da identidade negra. Nessa perspectiva, pode estimular crianças negras a reconhecerem seus cabelos, traços e características como elementos de sua identidade e cultura. A relação afetiva com o cabelo possibilita discussões sobre autoaceitação, representatividade e padrões estéticos que historicamente desvalorizam características negras. Assim, a obra contribui para a valorização da estética negra e o reconhecimento de diferentes formas de beleza desde a infância.",
    linkAmazon: "https://www.amazon.com.br/dp/8501119768?lv=shuf&channelId=425&plpRedirect=mhFallback"
  },
  {
    titulo: "Flávia e o Bolo de Chocolate",
    autora: "Míriam Leitão",
    editora: "Rocco Pequenos Leitores",
    ano: "2015",
    capa: "assets/capas/flavia-e-o-bolo-de-chocolate.jpg",
    resenhaTexto: "Flávia e o Bolo de Chocolate, de Míriam Leitão, pode ser uma ferramenta importante para a educação antirracista na infância por tratar, de forma sensível e próxima do universo infantil, da descoberta e da aceitação da própria identidade. A história permite conversar sobre as características físicas de Flávia e sobre o reconhecimento de sua identidade negra, abrindo espaço para que as crianças percebam que diferentes aparências e origens fazem parte da diversidade humana. A narrativa também favorece reflexões sobre pertencimento e representatividade, ajudando a construir uma relação positiva com as características negras e a combater, desde cedo, ideias que associam a diferença a algo negativo.",
    linkAmazon: "https://www.amazon.com.br/dp/8562500755?lv=shuf&channelId=425&plpRedirect=mhFallback"
  },
  {
    titulo: "Ave Alegria",
    autora: "Sylvia Orthof",
    editora: "Gaia Editora",
    ano: "2014",
    capa: "assets/capas/ave-alegria.jpg",
    resenhaTexto: "Recomendamos o livro Ave Alegria, de Sylvia Orthof, para ser utilizado como recurso para a educação antirracista infantil por apresentar, de maneira lúdica e acessível às crianças, valores relacionados à justiça, à igualdade e à diversidade cultural. A partir desses princípios, a obra pode ser trabalhada sob uma ótica antirracista, estimulando crianças a reconhecer diferentes culturas e identidades negras não valorizadas. Sua valorização daquilo que é 'bom, justo e belo', associada aos temas de diversidade cultural e justiça social indicados pela própria proposta pedagógica da obra, possibilita ao educador criar discussões que relacionem literatura, diversidade e respeito às diferenças.",
    linkAmazon: "https://www.amazon.com.br/dp/8575554387?lv=shuf&channelId=425&plpRedirect=mhFallback"
  }
];

const livrosGrid = document.getElementById('livros-grid');
if (livrosGrid) {
  livrosData.forEach((livro, index) => {
    const card = document.createElement('div');
    card.className = 'livro-card';
    card.innerHTML = `
      <img src="${livro.capa}" alt="Capa de ${livro.titulo}">
      <h4>${livro.titulo}</h4>
      <p>${livro.autora}</p>
    `;
    card.addEventListener('click', () => abrirModalLivro(index));
    livrosGrid.appendChild(card);
  });
}

const modalLivro = document.getElementById('modal-livro');
const btnFecharLivro = document.getElementById('fechar-modal-livro');

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

if (btnFecharLivro) btnFecharLivro.addEventListener('click', () => modalLivro.classList.remove('active'));
if (modalLivro) modalLivro.addEventListener('click', (e) => { if (e.target === modalLivro) modalLivro.classList.remove('active'); });


// =========================================================
// LÓGICA DO CINEBLUES
// =========================================================
const filmesData = [
  {
    titulo: "Histórias Cruzadas",
    ano: "2011",
    genero: "Drama",
    classificacao: "12 anos",
    imagemFundo: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1600&auto=format&fit=crop",
    poster: "https://upload.wikimedia.org/wikipedia/pt/9/9d/The_Help_Film_Poster.jpg",
    sinopse: "Uma jovem escritora decide entrevistar as mulheres negras que passaram a vida cuidando de famílias brancas nos anos 60. O que começa como um projeto de escrita se transforma em um ato de coragem e amizade.",
    temas: "Racismo estrutural, segregação, o papel da mulher negra na sociedade e a importância da escuta."
  },
  {
    titulo: "Corra!",
    ano: "2017",
    genero: "Suspense / Terror",
    classificacao: "16 anos",
    poster: "https://upload.wikimedia.org/wikipedia/pt/1/17/Get_Out_%28filme%29.jpg",
    sinopse: "Chris, um jovem negro, vai passar o fim de semana na casa dos pais de sua namorada branca. O que parecia ser uma recepção calorosa logo se revela um pesadelo perturbador sobre apropriação cultural e racismo velado.",
    temas: "Apropriação cultural, racismo velado, hipocrisia da sociedade liberal e o horror do racismo cotidiano."
  },
  {
    titulo: "Estrelas Além do Tempo",
    ano: "2016",
    genero: "Drama / História",
    classificacao: "Livre",
    poster: "https://upload.wikimedia.org/wikipedia/pt/f/ff/Hidden_Figures_poster.jpg",
    sinopse: "A história real de Katherine Johnson, Dorothy Vaughan e Mary Jackson, três matemáticas negras da NASA que foram cruciais para a corrida espacial americana, enfrentando o racismo e a segregação para provar seu valor.",
    temas: "Representatividade negra na ciência, segregação racial, empoderamento feminino negro e meritocracia."
  },
  {
    titulo: "Pantera Negra",
    ano: "2018",
    genero: "Ação / Ficção",
    classificacao: "12 anos",
    poster: "https://upload.wikimedia.org/wikipedia/pt/1/1c/Black_Panther_film_poster.jpg",
    sinopse: "T'Challa retorna a Wakanda para assumir o trono após a morte do pai. Ele precisa defender seu país de um inimigo que questiona a política de isolamento de Wakanda em relação ao resto do mundo, especialmente diante da diáspora africana.",
    temas: "Afrofuturismo, ancestralidade, diáspora africana, responsabilidade social e o poder da representatividade."
  }
];

const cineGrid = document.getElementById('cine-grid');
const cineHero = document.getElementById('cine-hero');

if (cineGrid && cineHero) {
  const destaque = filmesData[0];
  document.getElementById('hero-titulo').innerText = destaque.titulo;
  document.getElementById('hero-meta').innerText = `${destaque.ano} · ${destaque.genero} · ${destaque.classificacao}`;
  document.getElementById('hero-sinopse').innerText = destaque.sinopse;
  
  if(destaque.imagemFundo) {
    cineHero.style.backgroundImage = `url('${destaque.imagemFundo}')`;
  }

  filmesData.forEach((filme, index) => {
    const card = document.createElement('div');
    card.className = 'filme-card';
    card.innerHTML = `
      <img src="${filme.poster}" alt="Pôster de ${filme.titulo}">
      <div class="filme-card-info">
        <h4>${filme.titulo}</h4>
        <p>${filme.ano} · ${filme.genero}</p>
      </div>
    `;
    card.addEventListener('click', () => abrirModalFilme(index));
    cineGrid.appendChild(card);
  });
}

const modalFilme = document.getElementById('modal-filme');
const btnFecharFilme = document.getElementById('fechar-modal-filme');

function abrirModalFilme(index) {
  const filme = filmesData[index];
  
  document.getElementById('modal-filme-poster').src = filme.poster;
  document.getElementById('modal-filme-titulo').innerText = filme.titulo;
  document.getElementById('modal-filme-meta').innerText = `${filme.ano} · ${filme.genero} · ${filme.classificacao}`;
  document.getElementById('modal-filme-sinopse').innerText = filme.sinopse;
  document.getElementById('modal-filme-temas').innerText = filme.temas;

  modalFilme.classList.add('active');
}

if (btnFecharFilme) btnFecharFilme.addEventListener('click', () => modalFilme.classList.remove('active'));
if (modalFilme) modalFilme.addEventListener('click', (e) => { if (e.target === modalFilme) modalFilme.classList.remove('active'); });
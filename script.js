// =========================================================
// 1. NAVEGAÇÃO DO DASHBOARD (Troca de páginas)
// =========================================================
const navItems = document.querySelectorAll('[data-target]');
const pages = document.querySelectorAll('.dashboard-page');

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Tira o active de todos os botões do menu lateral
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => nav.classList.remove('active'));
    
    // Se for um item do menu normal, coloca o active. (Se for a logo, não coloca).
    if(item.classList.contains('nav-item') && !item.classList.contains('sidebar-logo')) {
       item.classList.add('active');
    }
    
    // Troca a página
    pages.forEach(page => page.classList.remove('active'));
    const targetId = item.getAttribute('data-target');
    const targetPage = document.getElementById(targetId);
    if (targetPage) targetPage.classList.add('active');
  });
});

// =========================================================
// 2. CARROSSEL DE IMAGENS DA HOME
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
// 3. DADOS E GRÁFICOS (Com Modal)
// =========================================================
const graficosConfig = {
  '7,1%': { titulo: 'Taxa de Analfabetismo', fonte: 'IBGE (2023)', tipo: 'bar', labels: ['Brancos', 'Pretos/Pardos'], data: [3.2, 7.1], max: 10 },
  '14,1 p.p.': { titulo: 'Aprendizado Adequado (Português)', fonte: 'Saeb/Inep (2023)', tipo: 'bar', labels: ['Brancos', 'Pretos/Pardos'], data: [45.6, 31.5], max: 50 },
  '9,2 anos': { titulo: 'Média de Anos de Estudo', fonte: 'IBGE (2023)', tipo: 'bar', labels: ['Brancos', 'Pretos/Pardos'], data: [10.8, 9.2], max: 12 },
  '55%': { titulo: 'Perfil Racial dos Docentes', fonte: 'Censo Escolar (2023)', tipo: 'doughnut', labels: ['Brancos', 'Pretos/Pardos'], data: [55, 45] }
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
    responsive: true,
    maintainAspectRatio: false,
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
  } 
  else if (config.tipo === 'doughnut') {
    currentChart = new Chart(ctx, { 
      type: 'doughnut', 
      data: { labels: config.labels, datasets: [{ data: config.data, backgroundColor: [gradientCreme, gradientOcre], borderWidth: 0, hoverOffset: 10 }] }, 
      options: { ...opcoesBase, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#fff', padding: 20, usePointStyle: true } } } } 
    });
  }
}

const listaDados = document.getElementById('lista-dados');
if (listaDados) {
  fetch('data/dados.json')
    .then(r => r.json())
    .then(json => {
      listaDados.innerHTML = '';
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
          } else {
            alert("Gráfico em construção para este dado.");
          }
        });

        cartao.innerHTML =
          `<p class="dado-numero">${item.numero}</p>
           <p class="dado-descricao">${item.descricao}</p>
           <p class="dado-fonte"><span>${item.fonte}</span><span>${item.ano}</span></p>`;
        listaDados.appendChild(cartao);
      });
    })
    .catch(e => {
      listaDados.innerHTML = '<p class="dados-aviso">Erro ao carregar os dados.</p>';
    });
}

const modalGrafico = document.getElementById('modal-grafico');
const fecharGrafico = document.getElementById('fechar-modal');
if(fecharGrafico) fecharGrafico.addEventListener('click', () => modalGrafico.classList.remove('active'));
if(modalGrafico) modalGrafico.addEventListener('click', (e) => { if (e.target === modalGrafico) modalGrafico.classList.remove('active'); });


// =========================================================
// 4. LÓGICA DA ESTANTE DE LIVROS
// =========================================================
const livrosData = [
  {
    titulo: "A Cor de Coraline",
    autora: "Alexandre Rampazo",
    editora: "Rocco Pequenos Leitores",
    ano: "2017",
    capa: "assets/capas/cor-de-coraline.jpg",
    sinopse: "Coraline ouve do amigo Pedrinho o pedido “me empresta o lápis cor de pele?” e fica intrigada: qual é, afinal, a cor da pele? Ao revisitar sua caixa de lápis, ela descobre que cada tom é bonito e que é a diversidade que dá beleza ao mundo. Vencedor do Selo Seleção Cátedra 10 Unesco e finalista do Prêmio Jabuti 2018.",
    linkAmazon: "https://www.amazon.com.br/cor-Coraline-Alexandre-Rampazo/dp/6589642028/ref=sr_1_1_so_ABIS_BOOK?dib=eyJ2IjoiMSJ9.v36CgCJZ4vL50WuQFhjo4gKMNrMQfiv5oAtDTJjYbKLGjHj071QN20LucGBJIEps.zxIiz8zN5X7UYnaCbuYcvWkeqhvVIaIgVBEUVarLzDg&dib_tag=se&keywords=A+Cor+de+Coraline+Alexandre+Rampazo&qid=1794857583&sr=8-1"
  },
  {
    titulo: "O Pequeno Príncipe Preto",
    autora: "Rodrigo França",
    editora: "Nova Fronteira",
    ano: "2020",
    capa: "assets/capas/pequeno-principe-preto.jpg",
    sinopse: "Em um minúsculo planeta, o Pequeno Príncipe Preto vive ao lado de sua única companheira, uma árvore Baobá. Quando as ventanias chegam, ele viaja por outros planetas espalhando amor e empatia. Adaptação de uma peça infantil de Rodrigo França, o livro celebra a importância de valorizar quem somos e de onde viemos.",
    linkAmazon: "https://www.amazon.com.br/pequeno-pr%C3%ADncipe-preto-Rodrigo-Fran%C3%A7a-ebook/dp/B084CX1YYD/ref=sr_1_1?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=3FA1Q0E9KGONZ&dib=eyJ2IjoiMSJ9.11K4_oZ53IQ3uSG-h2Gv0g.SvNklvJ60IKp3ITKUkw5FBwVkNWvuPQk0D1SpM69xqg&dib_tag=se&keywords=2.+O+Pequeno+Pr%C3%ADncipe+Preto+%28Rodrigo+Fran%C3%A7a%2C+Nova+Fronteira%2C+2020%29&qid=1794857695&sprefix=2.+o+pequeno+pr%C3%ADncipe+preto+rodrigo+fran%C3%A7a+nova+fronteira+2020+%2Caps%2C510&sr=8-1"
  },
  {
    titulo: "Da Minha Janela",
    autora: "Otávio Júnior",
    editora: "Companhia das Letrinhas",
    ano: "2019",
    capa: "assets/capas/da-minha-janela.jpg",
    sinopse: "Sentado à janela de uma casa em uma favela do Rio de Janeiro, o narrador observa o mundo: pessoas, cores, gestos, bichos. Cada cena vira uma pequena descoberta sobre a vida que acontece ao redor. Com texto sensível de Otávio Júnior e ilustrações vibrantes de Vanina Starkoff, o livro convida o leitor a olhar com atenção para as vidas que muitas vezes passam despercebidas. Vencedor do Prêmio Jabuti 2020.",
    linkAmazon: "https://www.amazon.com.br/dp/8574068748?lv=shuf&channelId=425&plpRedirect=mhFallback"
  },
  {
    titulo: "Amor de Cabelo",
    autora: "Matthew A. Cherry",
    editora: "Galerinha Record",
    ano: "2020",
    capa: "assets/capas/amor-de-cabelo.jpg",
    sinopse: "A obra Amor de Cabelo é ideal para trabalhar a educação antirracista infantil por apresentar, de maneira recreativa e acessível, a construção da autoestima e a valorização da identidade negra. Nessa perspectiva, pode estimular crianças negras a reconhecerem seus cabelos, traços e características como elementos de sua identidade e cultura.",
    linkAmazon: "https://www.amazon.com.br/dp/8501119768?lv=shuf&channelId=425&plpRedirect=mhFallback"
  },
  {
    titulo: "Flávia e o Bolo de Chocolate",
    autora: "Míriam Leitão",
    editora: "Rocco Pequenos Leitores",
    ano: "2015",
    capa: "assets/capas/flavia-e-o-bolo-de-chocolate.jpg",
    sinopse: "Flávia e o Bolo de Chocolate pode ser uma ferramenta importante para a educação antirracista na infância por tratar, de forma sensível e próxima do universo infantil, da descoberta e da aceitação da própria identidade. A história permite conversar sobre as características físicas de Flávia e sobre o reconhecimento de sua identidade negra.",
    linkAmazon: "https://www.amazon.com.br/dp/8562500755?lv=shuf&channelId=425&plpRedirect=mhFallback"
  },
  {
    titulo: "Ave Alegria",
    autora: "Sylvia Orthof",
    editora: "Gaia Editora",
    ano: "2014",
    capa: "assets/capas/ave-alegria.jpg",
    sinopse: "Recomendamos o livro Ave Alegria para ser utilizado como recurso para a educação antirracista infantil por apresentar, de maneira lúdica e acessível às crianças, valores relacionados à justiça, à igualdade e à diversidade cultural. A obra pode ser trabalhada sob uma ótica antirracista, estimulando crianças a reconhecer diferentes culturas.",
    linkAmazon: "https://www.amazon.com.br/dp/8575554387?lv=shuf&channelId=425&plpRedirect=mhFallback"
  }
];

// Renderizar o carrossel de livros
const carrosselLivros = document.getElementById('livros-carrossel');
if (carrosselLivros) {
  livrosData.forEach((livro, index) => {
    const card = document.createElement('div');
    card.className = 'livro-card';
    card.innerHTML = `
      <img src="${livro.capa}" alt="Capa de ${livro.titulo}">
      <h4>${livro.titulo}</h4>
      <p>${livro.autora}</p>
    `;
    card.addEventListener('click', () => abrirModalLivro(index));
    carrosselLivros.appendChild(card);
  });
}

// Lógica do Modal de Livro
const modalLivro = document.getElementById('modal-livro');
const btnFecharLivro = document.getElementById('fechar-modal-livro');

function abrirModalLivro(index) {
  const livro = livrosData[index];
  
  document.getElementById('modal-livro-capa').src = livro.capa;
  document.getElementById('modal-livro-titulo').innerText = livro.titulo;
  document.getElementById('modal-livro-autor').innerText = livro.autora;
  document.getElementById('modal-livro-editora').innerText = `Editora: ${livro.editora}`;
  document.getElementById('modal-livro-ano').innerText = `Ano: ${livro.ano}`;
  document.getElementById('modal-livro-sinopse').innerText = livro.sinopse;
  document.getElementById('modal-livro-amazon').href = livro.linkAmazon;

  modalLivro.classList.add('active');
}

if (btnFecharLivro) btnFecharLivro.addEventListener('click', () => modalLivro.classList.remove('active'));
if (modalLivro) modalLivro.addEventListener('click', (e) => { if (e.target === modalLivro) modalLivro.classList.remove('active'); });

// Botões de navegação (setinhas do carrossel de livros)
const btnPrevLivro = document.getElementById('btn-prev-livro');
const btnNextLivro = document.getElementById('btn-next-livro');

if (btnPrevLivro && btnNextLivro && carrosselLivros) {
  btnPrevLivro.addEventListener('click', () => {
    carrosselLivros.scrollBy({ left: -200, behavior: 'smooth' });
  });
  btnNextLivro.addEventListener('click', () => {
    carrosselLivros.scrollBy({ left: 200, behavior: 'smooth' });
  });
}
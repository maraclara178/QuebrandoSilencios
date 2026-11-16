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
// NAVEGAÇÃO DO DASHBOARD (Troca de páginas)
// =========================================================
const navItems = document.querySelectorAll('[data-target]');
const pages = document.querySelectorAll('.dashboard-page');

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    
    // Atualiza botões ativos
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(nav => nav.classList.remove('active'));
    if(item.classList.contains('nav-item') && !item.classList.contains('header-profile')) {
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
// DADOS E GRÁFICOS (Com Modal)
// =========================================================
const dadosInfo = {
  '7,1%': { id: 'graficoAnalfabetismo', titulo: 'Taxa de Analfabetismo', fonte: 'IBGE (2023)' },
  '14,1': { id: 'graficoAprendizado', titulo: 'Aprendizado Adequado (Português)', fonte: 'Saeb/Inep (2023)' },
  '9,2': { id: 'graficoAnosEstudo', titulo: 'Média de Anos de Estudo', fonte: 'IBGE (2023)' },
  '55%': { id: 'graficoProfessores', titulo: 'Perfil Racial dos Docentes', fonte: 'Censo Escolar (2023)' }
};

// Configuração Global do Chart.js
if (typeof Chart !== 'undefined') {
  Chart.defaults.color = '#a0a0a0';
  Chart.defaults.font.family = 'Inter, sans-serif';
  Chart.defaults.plugins.tooltip.backgroundColor = '#c8932b';
  Chart.defaults.plugins.tooltip.titleColor = '#000';
  Chart.defaults.plugins.tooltip.bodyColor = '#000';
}

// Variável para armazenar o gráfico atual e não bugar ao abrir outro
let currentChart = null;

// Função que cria os gráficos dentro do Modal
function renderizarGraficoNoModal(tipo) {
  const ctx = document.getElementById('canvas-modal');
  if (currentChart) currentChart.destroy(); // Destrói o gráfico anterior

  const opcoesBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#fff' } },
      y: { grid: { color: 'rgba(250, 246, 238, 0.1)' }, beginAtZero: true }
    }
  };

  if (tipo === 'graficoAnalfabetismo') {
    currentChart = new Chart(ctx, { type: 'bar', data: { labels: ['Brancos', 'Pretos/Pardos'], datasets: [{ data: [3.2, 7.1], backgroundColor: ['#faf6ee', '#c8932b'], borderRadius: 6 }] }, options: opcoesBase });
  } 
  else if (tipo === 'graficoAnosEstudo') {
    currentChart = new Chart(ctx, { type: 'bar', data: { labels: ['Brancos', 'Pretos/Pardos'], datasets: [{ data: [10.8, 9.2], backgroundColor: ['#faf6ee', '#c8932b'], borderRadius: 6 }] }, options: opcoesBase });
  } 
  else if (tipo === 'graficoAprendizado') {
    currentChart = new Chart(ctx, { type: 'bar', data: { labels: ['Brancos', 'Pretos/Pardos'], datasets: [{ data: [45.6, 31.5], backgroundColor: ['#faf6ee', '#c8932b'], borderRadius: 6 }] }, options: opcoesBase });
  } 
  else if (tipo === 'graficoProfessores') {
    currentChart = new Chart(ctx, { 
      type: 'doughnut', 
      data: { labels: ['Brancos', 'Pretos/Pardos'], datasets: [{ data: [55, 45], backgroundColor: ['#faf6ee', '#c8932b'], borderWidth: 0 }] }, 
      options: { ...opcoesBase, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } } } 
    });
  }
}

// Carrega os dados da Home
const lista = document.getElementById('lista-dados');
if (lista) {
  fetch('data/dados.json')
    .then(r => r.json())
    .then(json => {
      lista.innerHTML = '';
      json.dados.forEach(item => {
        const cartao = document.createElement('article');
        cartao.className = 'cartao-dado';
        
        // Adiciona o evento de clique no cartão para abrir o modal
        cartao.addEventListener('click', () => {
          // Procura a chave baseada no número do item
          let chave = Object.keys(dadosInfo).find(k => item.numero.includes(k.replace(',', '.')));
          
          // Fallback de segurança
          if (chave) {
            document.getElementById('titulo-grafico').innerText = dadosInfo[chave].titulo;
            document.getElementById('fonte-grafico').innerText = `Fonte: ${dadosInfo[chave].fonte}`;
            renderizarGraficoNoModal(dadosInfo[chave].id);
            document.getElementById('modal-grafico').classList.add('active');
          } else {
            // Se não achar, só abre um aviso
             alert("Detalhes do gráfico em construção.");
          }
        });

        cartao.innerHTML =
          `<p class="dado-numero">${item.numero}</p>
           <p class="dado-descricao">${item.descricao}</p>
           <p class="dado-fonte"><span>${item.fonte}</span><span>${item.ano}</span></p>`;
        lista.appendChild(cartao);
      });
    })
    .catch(e => {
      lista.innerHTML = '<p class="dados-aviso">Erro ao carregar dados.</p>';
    });
}

// Fechar o Modal
document.getElementById('fechar-modal').addEventListener('click', () => {
  document.getElementById('modal-grafico').classList.remove('active');
});
document.getElementById('modal-grafico').addEventListener('click', (e) => {
  if (e.target.id === 'modal-grafico') {
    document.getElementById('modal-grafico').classList.remove('active');
  }
});

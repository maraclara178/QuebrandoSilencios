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
// DADOS E GRÁFICOS (Com Modal)
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
      y: { 
        grid: { color: 'rgba(250, 246, 238, 0.05)' }, 
        beginAtZero: true,
        max: config.max || undefined
      }
    }
  };

  if (config.tipo === 'bar') {
    currentChart = new Chart(ctx, { 
      type: 'bar', 
      data: { 
        labels: config.labels, 
        datasets: [{ 
          data: config.data, 
          backgroundColor: [gradientCreme, gradientOcre], 
          borderRadius: 8,
          maxBarThickness: 80
        }] 
      }, 
      options: opcoesBase 
    });
  } 
  else if (config.tipo === 'doughnut') {
    currentChart = new Chart(ctx, { 
      type: 'doughnut', 
      data: { 
        labels: config.labels, 
        datasets: [{ 
          data: config.data, 
          backgroundColor: [gradientCreme, gradientOcre], 
          borderWidth: 0,
          hoverOffset: 10
        }] 
      }, 
      options: { 
        ...opcoesBase, 
        cutout: '65%', 
        plugins: { legend: { position: 'bottom', labels: { color: '#fff', padding: 20, usePointStyle: true } } } 
      } 
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
          } else {
            alert("Gráfico em construção para este dado.");
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
      lista.innerHTML = '<p class="dados-aviso">Erro ao carregar os dados.</p>';
    });
}

const modal = document.getElementById('modal-grafico');
document.getElementById('fechar-modal').addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
// ===================== Menu mobile (Não usado no dashboard, mas mantido por segurança) =====================

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
  function anterior() { mostrar(atual - 1); }

  function reiniciar() {
    clearInterval(intervalo);
    if (itens.length > 1) intervalo = setInterval(proxima, 5000);
  }
  reiniciar();

  // Touch para celular
  slide.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; clearInterval(intervalo); }, { passive: true });
  slide.addEventListener('touchmove', (e) => { endX = e.touches[0].clientX; }, { passive: true });
  slide.addEventListener('touchend', () => {
    if (startX - endX > 50) { proxima(); } 
    else if (endX - startX > 50) { anterior(); }
    startX = 0; endX = 0; reiniciar();
  });

  slide.addEventListener('mouseenter', () => clearInterval(intervalo));
  slide.addEventListener('mouseleave', reiniciar);
});

// ===================== Dados do JSON =====================
const lista = document.getElementById('lista-dados');
if (lista) {
  fetch('data/dados.json')
    .then((resposta) => {
      if (!resposta.ok) throw new Error('Não foi possível carregar.');
      return resposta.json();
    })
    .then((json) => {
      lista.innerHTML = '';
      json.dados.forEach((item) => {
        const cartao = document.createElement('article');
        cartao.className = 'cartao-dado';
        cartao.innerHTML =
          '<p class="dado-numero">' + item.numero + '</p>' +
          '<p class="dado-descricao">' + item.descricao + '</p>' +
          '<p class="dado-fonte"><span>' + item.fonte + '</span><span>' + item.ano + '</span></p>';
        lista.appendChild(cartao);
      });
    })
    .catch((erro) => {
      lista.innerHTML = '<p class="dados-aviso">Erro ao carregar dados. (' + erro.message + ')</p>';
    });
}

// ===================== Gráficos (Chart.js) =====================
if (typeof Chart !== 'undefined') {
  Chart.defaults.color = '#a0a0a0';
  Chart.defaults.font.family = 'Inter, sans-serif';
  
  Chart.defaults.plugins.tooltip.backgroundColor = '#c8932b';
  Chart.defaults.plugins.tooltip.titleColor = '#000000';
  Chart.defaults.plugins.tooltip.bodyColor = '#000000';
  Chart.defaults.plugins.tooltip.titleFont = { weight: 'bold' };

  const opcoesBase = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false, drawBorder: false }, ticks: { color: '#fff' } },
      y: { grid: { color: 'rgba(250, 246, 238, 0.05)' }, border: { display: false }, beginAtZero: true }
    }
  };

  const ctx1 = document.getElementById('graficoAnalfabetismo');
  if (ctx1) new Chart(ctx1, { type: 'bar', data: { labels: ['Brancos', 'Pretos/Pardos'], datasets: [{ data: [3.2, 7.1], backgroundColor: ['#faf6ee', '#c8932b'], borderRadius: 6 }] }, options: opcoesBase });

  const ctx2 = document.getElementById('graficoAnosEstudo');
  if (ctx2) new Chart(ctx2, { type: 'bar', data: { labels: ['Brancos', 'Pretos/Pardos'], datasets: [{ data: [10.8, 9.2], backgroundColor: ['#faf6ee', '#c8932b'], borderRadius: 6 }] }, options: opcoesBase });

  const ctx3 = document.getElementById('graficoAprendizado');
  if (ctx3) new Chart(ctx3, { type: 'bar', data: { labels: ['Brancos', 'Pretos/Pardos'], datasets: [{ data: [45.6, 31.5], backgroundColor: ['#faf6ee', '#c8932b'], borderRadius: 6 }] }, options: opcoesBase });

  const ctx4 = document.getElementById('graficoProfessores');
  if (ctx4) new Chart(ctx4, { type: 'doughnut', data: { labels: ['Brancos', 'Pretos/Pardos'], datasets: [{ data: [55, 45], backgroundColor: ['#faf6ee', '#c8932b'], borderWidth: 0 }] }, options: { ...opcoesBase, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } } } });
}

// =========================================================
// NAVEGAÇÃO DO DASHBOARD (TROCA DE PÁGINAS SEM RECARREGAR)
// =========================================================
const navItems = document.querySelectorAll('.nav-item[data-target]');
const pages = document.querySelectorAll('.dashboard-page');

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault(); // Impede o link de pular na tela
    
    // 1. Remove a classe 'active' de todos os botões e páginas
    navItems.forEach(nav => nav.classList.remove('active'));
    pages.forEach(page => page.classList.remove('active'));
    
    // 2. Adiciona 'active' no botão clicado
    item.classList.add('active');
    
    // 3. Encontra e mostra a página correspondente
    const targetId = item.getAttribute('data-target');
    const targetPage = document.getElementById(targetId);
    if (targetPage) {
      targetPage.classList.add('active');
    }
  });
});
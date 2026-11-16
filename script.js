// ===================== Menu cell =====================
const botaoMenu = document.querySelector('.menu-botao');
const nav = document.querySelector('.nav-principal');

if (botaoMenu && nav) {
  botaoMenu.addEventListener('click', () => {
    const aberto = botaoMenu.getAttribute('aria-expanded') === 'true';
    botaoMenu.setAttribute('aria-expanded', String(!aberto));
    nav.classList.toggle('aberto', !aberto);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      botaoMenu.setAttribute('aria-expanded', 'false');
      nav.classList.remove('aberto');
    });
  });
}

// ===================== slides (carrossel estilo Instagram) =====================
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
      ponto.setAttribute('aria-label', `Ir para imagem ${index + 1}`);
      ponto.addEventListener('click', () => {
        mostrar(index);
        reiniciar();
      });
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
    if (itens.length > 1) {
      intervalo = setInterval(proxima, 5000);
    }
  }
  reiniciar();

  slide.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    clearInterval(intervalo);
  }, { passive: true });

  slide.addEventListener('touchmove', (e) => {
    endX = e.touches[0].clientX;
  }, { passive: true });

  slide.addEventListener('touchend', () => {
    if (startX - endX > 50) { proxima(); } 
    else if (endX - startX > 50) { anterior(); }
    startX = 0;
    endX = 0;
    reiniciar();
  });

  slide.addEventListener('mouseenter', () => clearInterval(intervalo));
  slide.addEventListener('mouseleave', reiniciar);
});

// ===================== Animações ao rolar =====================
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((entrada) => {
    if (entrada.isIntersecting) {
      entrada.target.classList.add('visivel');
      observador.unobserve(entrada.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.animar').forEach((el) => observador.observe(el));

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
      lista.innerHTML = '<p class="dados-aviso">Não foi possível carregar os dados. (' + erro.message + ')</p>';
    });
}

// ===================== Gráficos (Chart.js) =====================
if (typeof Chart !== 'undefined') {
  Chart.defaults.color = '#a0a0a0';
  Chart.defaults.font.family = 'ui-sans-serif, system-ui, sans-serif';
  Chart.defaults.font.size = 13;
  
  Chart.defaults.plugins.tooltip.backgroundColor = '#c8932b';
  Chart.defaults.plugins.tooltip.titleColor = '#000000';
  Chart.defaults.plugins.tooltip.bodyColor = '#000000';
  Chart.defaults.plugins.tooltip.titleFont = { weight: 'bold' };
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 4;

  const opcoesBarra = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false, drawBorder: false } },
      y: {
        grid: { color: 'rgba(250, 246, 238, 0.05)' },
        border: { display: false },
        beginAtZero: true
      }
    },
    animation: { y: { easing: 'easeOutQuart', duration: 1200 } }
  };

  const ctxAnalfabetismo = document.getElementById('graficoAnalfabetismo');
  if (ctxAnalfabetismo) {
    new Chart(ctxAnalfabetismo, {
      type: 'bar',
      data: {
        labels: ['Brancos', 'Pretos/Pardos'],
        datasets: [{
          data: [3.2, 7.1],
          backgroundColor: ['#faf6ee', '#c8932b'],
          borderRadius: 6,
          maxBarThickness: 60
        }]
      },
      options: {
        ...opcoesBarra,
        scales: { ...opcoesBarra.scales, y: { ...opcoesBarra.scales.y, max: 10 } }
      }
    });
  }

  const ctxAnosEstudo = document.getElementById('graficoAnosEstudo');
  if (ctxAnosEstudo) {
    new Chart(ctxAnosEstudo, {
      type: 'bar',
      data: {
        labels: ['Brancos', 'Pretos/Pardos'],
        datasets: [{
          data: [10.8, 9.2],
          backgroundColor: ['#faf6ee', '#c8932b'],
          borderRadius: 6,
          maxBarThickness: 60
        }]
      },
      options: {
        ...opcoesBarra,
        scales: { ...opcoesBarra.scales, y: { ...opcoesBarra.scales.y, max: 12 } }
      }
    });
  }

  const ctxAprendizado = document.getElementById('graficoAprendizado');
  if (ctxAprendizado) {
    new Chart(ctxAprendizado, {
      type: 'bar',
      data: {
        labels: ['Brancos', 'Pretos/Pardos'],
        datasets: [{
          data: [45.6, 31.5],
          backgroundColor: ['#faf6ee', '#c8932b'],
          borderRadius: 6,
          maxBarThickness: 60
        }]
      },
      options: {
        ...opcoesBarra,
        scales: { ...opcoesBarra.scales, y: { ...opcoesBarra.scales.y, max: 50 } }
      }
    });
  }

  const ctxProfessores = document.getElementById('graficoProfessores');
  if (ctxProfessores) {
    new Chart(ctxProfessores, {
      type: 'doughnut',
      data: {
        labels: ['Brancos', 'Pretos/Pardos/Outros'],
        datasets: [{
          data: [55, 45],
          backgroundColor: ['#faf6ee', '#c8932b'],
          borderColor: '#141414', 
          borderWidth: 4, 
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%', 
        plugins: {
          legend: { 
            position: 'bottom',
            labels: { color: '#faf6ee', padding: 20, usePointStyle: true, boxWidth: 8 } 
          }
        }
      }
    });
  }
}
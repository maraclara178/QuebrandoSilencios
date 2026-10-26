// ===================== Menu mobile =====================
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

// ===================== Alternar tema =====================
const botaoTema = document.getElementById('tema-botao');
const raiz = document.documentElement;

const temaSalvo = localStorage.getItem('tema');
if (temaSalvo === 'escuro' || temaSalvo === 'claro') {
  raiz.setAttribute('data-tema', temaSalvo);
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  raiz.setAttribute('data-tema', 'escuro');
}

if (botaoTema) {
  botaoTema.addEventListener('click', () => {
    const atual = raiz.getAttribute('data-tema') === 'escuro' ? 'escuro' : 'claro';
    const novo = atual === 'escuro' ? 'claro' : 'escuro';
    raiz.setAttribute('data-tema', novo);
    localStorage.setItem('tema', novo);
  });
}

// ===================== Slides (Carrossel estilo Instagram) =====================
document.querySelectorAll('[data-slide]').forEach((slide) => {
  const itens = slide.querySelectorAll('.slide-item');
  const indicadoresContainer = slide.querySelector('.slide-indicadores');
  let atual = 0;
  let intervalo;
  
  // Variáveis para o Swipe (Touch)
  let startX = 0;
  let endX = 0;

  // Criar os tracinhos (indicadores) dinamicamente
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
    
    // Atualiza as imagens
    itens.forEach((item, idx) => item.classList.toggle('ativo', idx === i));
    
    // Atualiza os tracinhos
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
      intervalo = setInterval(proxima, 5000); // Passa a cada 5 segundos
    }
  }
  reiniciar();

  // --- Lógica de Touch (Swipe para celular) ---
  slide.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    clearInterval(intervalo);
  }, { passive: true });

  slide.addEventListener('touchmove', (e) => {
    endX = e.touches[0].clientX;
  }, { passive: true });

  slide.addEventListener('touchend', () => {
    if (startX - endX > 50) { // Arrastou para a esquerda (próxima)
      proxima();
    } else if (endX - startX > 50) { // Arrastou para a direita (anterior)
      anterior();
    }
    startX = 0;
    endX = 0;
    reiniciar();
  });

  // Pausar autoplay ao passar o mouse (Desktop)
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

// ===================== Faixa de stats (Google Sheets) =====================
const URL_STATS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT_kl5syjVx823jHhmsdW6ZF_uCjQLFbdVNE4t2Bpp5KdHmUwkhxigAy9wuiUmuYLT-2eaoHpcshEgb/pub?output=csv';

function animarStat(el) {
  const alvo = parseInt(el.dataset.contador, 10) || 0;
  const duracao = 900;
  const inicio = performance.now();

  function passo(agora) {
    const progresso = Math.min((agora - inicio) / duracao, 1);
    const valor = Math.floor(progresso * alvo);
    el.textContent = valor.toLocaleString('pt-BR');
    if (progresso < 1) requestAnimationFrame(passo);
    else el.textContent = alvo.toLocaleString('pt-BR');
  }
  requestAnimationFrame(passo);
}

function dispararAnimacaoStats() {
  document.querySelectorAll('.faixa-stats [data-contador]').forEach(animarStat);
}

async function carregarStats() {
  const faixa = document.querySelector('.faixa-stats');
  if (!faixa) return;

  if (!URL_STATS || URL_STATS.includes('COLE_AQUI')) {
    dispararAnimacaoStats();
    return;
  }

  try {
    const resp = await fetch(URL_STATS);
    if (!resp.ok) throw new Error('Planilha indisponível');
    const texto = await resp.text();

    const linhas = texto.trim().split('\n').slice(1);

    linhas.forEach((linha) => {
      const partes = [];
      let atual = '';
      let dentroAspas = false;
      for (let i = 0; i < linha.length; i++) {
        const c = linha[i];
        if (c === '"') { dentroAspas = !dentroAspas; continue; }
        if (c === ',' && !dentroAspas) { partes.push(atual); atual = ''; continue; }
        atual += c;
      }
      partes.push(atual);

      const campo = (partes[0] || '').trim();
      const valor = (partes[1] || '').trim();
      const desc = (partes[2] || '').trim();

      if (!campo) return;

      const numeroEl = faixa.querySelector(`[data-campo="${campo}"]`);
      if (numeroEl && valor) numeroEl.dataset.contador = valor;

      const descEl = faixa.querySelector(`[data-campo-desc="${campo}"]`);
      if (descEl && desc) descEl.textContent = desc;
    });

    dispararAnimacaoStats();
  } catch (erro) {
    console.warn('Stats: não foi possível ler a planilha. Usando valores do HTML.', erro);
    dispararAnimacaoStats();
  }
}

carregarStats();

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
const ctxAnalfabetismo = document.getElementById('graficoAnalfabetismo');

if (ctxAnalfabetismo && typeof Chart !== 'undefined') {
  new Chart(ctxAnalfabetismo, {
    type: 'bar',
    data: {
      labels: ['Brancos', 'Pretos/Pardos'],
      datasets: [{
        label: 'Taxa de Analfabetismo (%)',
        data: [3.2, 7.1], // Dados do IBGE 2023
        backgroundColor: ['#faf6ee', '#c8932b'], 
        borderWidth: 0,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          ticks: { color: '#a0a0a0' },
          grid: { color: 'rgba(250, 246, 238, 0.1)' }
        },
        x: {
          ticks: { color: '#faf6ee', font: { weight: 'bold' } },
          grid: { display: false }
        }
      }
    }
  });
}
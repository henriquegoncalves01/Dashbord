
const dadosTabela = [
  { id: 1, mes: 'Jan', regiao: 'Norte',        total: 210, noPrazo: 185, tempo: 2.8, custo: 19.50, status: 'late' },
  { id: 2, mes: 'Jan', regiao: 'Sul',          total: 230, noPrazo: 218, tempo: 2.1, custo: 17.80, status: 'ok' },
  { id: 3, mes: 'Fev', regiao: 'Sudeste',      total: 260, noPrazo: 247, tempo: 2.0, custo: 17.20, status: 'ok' },
  { id: 4, mes: 'Fev', regiao: 'Nordeste',     total: 200, noPrazo: 180, tempo: 2.6, custo: 18.90, status: 'late' },
  { id: 5, mes: 'Mar', regiao: 'Centro-Oeste', total: 190, noPrazo: 174, tempo: 2.4, custo: 18.10, status: 'ok' },
  { id: 6, mes: 'Mar', regiao: 'Norte',        total: 215, noPrazo: 191, tempo: 2.9, custo: 19.80, status: 'late' },
  { id: 7, mes: 'Abr', regiao: 'Sul',          total: 240, noPrazo: 228, tempo: 2.0, custo: 17.50, status: 'ok' },
  { id: 8, mes: 'Abr', regiao: 'Sudeste',      total: 265, noPrazo: 253, tempo: 1.9, custo: 16.90, status: 'ok' },
  { id: 9, mes: 'Mai', regiao: 'Nordeste',     total: 205, noPrazo: 186, tempo: 2.5, custo: 18.60, status: 'late' },
  { id: 10, mes: 'Mai', regiao: 'Centro-Oeste', total: 195, noPrazo: 179, tempo: 2.3, custo: 18.00, status: 'ok' },
  { id: 11, mes: 'Jun', regiao: 'Norte',        total: 220, noPrazo: 199, tempo: 2.7, custo: 19.40, status: 'late' },
  { id: 12, mes: 'Jun', regiao: 'Sul',          total: 245, noPrazo: 235, tempo: 1.9, custo: 17.10, status: 'ok' }
];

const nomesMeses = { Jan: 'Janeiro', Fev: 'Fevereiro', Mar: 'Março', Abr: 'Abril', Mai: 'Maio', Jun: 'Junho' };
const ordemMeses = ['Jan','Fev','Mar','Abr','Mai','Jun'];
const regioes = ['Norte','Sul','Sudeste','Nordeste','Centro-Oeste'];

let trendChart, regionChart, pieChart;
const isDark = matchMedia('(prefers-color-scheme: dark)').matches;
const textColor = isDark ? '#cfcfcf' : '#444';


function calcularResumo(lista) {
  const total = lista.reduce((s, i) => s + i.total, 0);
  const noPrazo = lista.reduce((s, i) => s + i.noPrazo, 0);
  const atraso = total - noPrazo;
  const taxaEntrega = total ? (noPrazo / total) * 100 : 0;
  const taxaAtraso = total ? (atraso / total) * 100 : 0;
  const tempoMedio = lista.length ? lista.reduce((s, i) => s + i.tempo, 0) / lista.length : 0;
  const custoMedio = lista.length ? lista.reduce((s, i) => s + i.custo, 0) / lista.length : 0;
  return { total, noPrazo, atraso, taxaEntrega, taxaAtraso, tempoMedio, custoMedio };
}

function atualizarCards(resumo) {
  document.getElementById('totalEntregas').textContent = resumo.total.toLocaleString('pt-BR');
  document.getElementById('taxaEntrega').textContent = resumo.taxaEntrega.toFixed(1) + '%';
  document.getElementById('taxaAtraso').textContent = resumo.taxaAtraso.toFixed(1) + '%';
  document.getElementById('tempoMedio').textContent = resumo.tempoMedio.toFixed(1) + ' dias';
  document.getElementById('custoMedio').textContent = 'R$ ' + resumo.custoMedio.toFixed(2).replace('.', ',');
}

function atualizarTabela(lista) {
  const tbody = document.getElementById('tabelaDados');
  tbody.innerHTML = '';

  lista.forEach(item => {
    const atrasoQtd = item.total - item.noPrazo;
    const taxaEntregaItem = ((item.noPrazo / item.total) * 100).toFixed(1);
    const taxaAtrasoItem = ((atrasoQtd / item.total) * 100).toFixed(1);

    let badgeClass = 'ok';
    let badgeLabel = 'No prazo';
    if (item.status === 'late') {
      badgeClass = 'late';
      badgeLabel = 'Atenção';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.id}</td>
      <td>${item.mes}</td>
      <td>${item.regiao}</td>
      <td>${item.total}</td>
      <td>${item.noPrazo}</td>
      <td>${atrasoQtd}</td>
      <td>${taxaEntregaItem}%</td>
      <td>${taxaAtrasoItem}%</td>
      <td>${item.tempo.toFixed(1)}</td>
      <td>R$ ${item.custo.toFixed(2)}</td>
      <td><span class="badge ${badgeClass}">${badgeLabel}</span></td>
    `;
    tbody.appendChild(tr);
  });


  const resumo = calcularResumo(lista);
  const tfoot = document.getElementById('tabelaRodape');
  tfoot.innerHTML = `
    <tr>
      <td colspan="3">Total / Média</td>
      <td>${resumo.total}</td>
      <td>${resumo.noPrazo}</td>
      <td>${resumo.atraso}</td>
      <td>${resumo.taxaEntrega.toFixed(1)}%</td>
      <td>${resumo.taxaAtraso.toFixed(1)}%</td>
      <td>${resumo.tempoMedio.toFixed(1)}</td>
      <td>R$ ${resumo.custoMedio.toFixed(2)}</td>
      <td>--</td>
    </tr>
  `;
}

function atualizarGraficos(periodo, lista) {
  if (periodo === 'ano') {
    // Gráfico 1: tendência mensal (no prazo x atraso) ao longo do ano
    const labels = ordemMeses;
    const noPrazoArr = [];
    const atrasoArr = [];
    ordemMeses.forEach(mes => {
      const itensMes = dadosTabela.filter(d => d.mes === mes);
      const r = calcularResumo(itensMes);
      noPrazoArr.push(Number(r.taxaEntrega.toFixed(1)));
      atrasoArr.push(Number(r.taxaAtraso.toFixed(1)));
    });

    document.getElementById('tituloGrafico1').textContent = 'Entregas no prazo vs. com atraso (mensal)';
    trendChart.data.labels = labels;
    trendChart.data.datasets[0].data = noPrazoArr;
    trendChart.data.datasets[1].data = atrasoArr;
    trendChart.update();

    // Gráfico 2: taxa de atraso por região (acumulado no ano)
    document.getElementById('tituloGrafico2').textContent = 'Taxa de atraso por região (%) — ano';
    const atrasoRegiaoArr = regioes.map(reg => {
      const itensReg = dadosTabela.filter(d => d.regiao === reg);
      if (itensReg.length === 0) return 0;
      return Number(calcularResumo(itensReg).taxaAtraso.toFixed(1));
    });
    regionChart.data.labels = regioes;
    regionChart.data.datasets[0].data = atrasoRegiaoArr;
    regionChart.update();

  } else {
    // Gráfico 1: taxa no prazo x atraso por região no mês selecionado
    document.getElementById('tituloGrafico1').textContent = `Entregas no prazo vs. com atraso por região — ${nomesMeses[periodo]}`;
    const regioesNoMes = regioes.filter(reg => lista.some(d => d.regiao === reg));
    const noPrazoArr = regioesNoMes.map(reg => {
      const item = lista.find(d => d.regiao === reg);
      return Number(((item.noPrazo / item.total) * 100).toFixed(1));
    });
    const atrasoArr = regioesNoMes.map(reg => {
      const item = lista.find(d => d.regiao === reg);
      return Number((((item.total - item.noPrazo) / item.total) * 100).toFixed(1));
    });

    trendChart.data.labels = regioesNoMes;
    trendChart.data.datasets[0].data = noPrazoArr;
    trendChart.data.datasets[1].data = atrasoArr;
    trendChart.update();

    // Gráfico 2: taxa de atraso por região no mês selecionado
    document.getElementById('tituloGrafico2').textContent = `Taxa de atraso por região (%) — ${nomesMeses[periodo]}`;
    regionChart.data.labels = regioesNoMes;
    regionChart.data.datasets[0].data = atrasoArr;
    regionChart.update();
  }

  // Gráfico 3: distribuição (pizza) sempre reflete o período selecionado
  const resumo = calcularResumo(lista);
  document.getElementById('tituloGrafico3').textContent = periodo === 'ano' ? 'Distribuição das entregas — ano' : `Distribuição das entregas — ${nomesMeses[periodo]}`;
  pieChart.data.datasets[0].data = [
    Number(resumo.taxaEntrega.toFixed(1)),
    Number(resumo.taxaAtraso.toFixed(1))
  ];
  pieChart.update();
}

function aplicarFiltro(periodo) {
  const lista = periodo === 'ano' ? dadosTabela : dadosTabela.filter(d => d.mes === periodo);
  const resumo = calcularResumo(lista);

  document.getElementById('periodoAtual').textContent = periodo === 'ano' ? 'Ano completo' : nomesMeses[periodo];
  document.getElementById('tituloTabela').textContent = periodo === 'ano'
    ? 'Detalhamento das entregas — ano completo'
    : `Detalhamento das entregas — ${nomesMeses[periodo]}`;

  atualizarCards(resumo);
  atualizarTabela(lista);
  atualizarGraficos(periodo, lista);
}

// ----- Inicialização dos gráficos -----
trendChart = new Chart(document.getElementById('trendChart'), {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'No prazo (%)',
        data: [],
        borderColor: '#1D9E75',
        backgroundColor: '#1D9E75',
        tension: 0.3,
        fill: false
      },
      {
        label: 'Com atraso (%)',
        data: [],
        borderColor: '#D85A30',
        backgroundColor: '#D85A30',
        borderDash: [6, 3],
        tension: 0.3,
        fill: false
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 100, ticks: { color: textColor, callback: v => v + '%' } },
      x: { ticks: { color: textColor } }
    }
  }
});

regionChart = new Chart(document.getElementById('regionChart'), {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      label: 'Taxa de atraso (%)',
      data: [],
      backgroundColor: '#378ADD',
      borderRadius: 4
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 20, ticks: { color: textColor, callback: v => v + '%' } },
      x: { ticks: { color: textColor } }
    }
  }
});

pieChart = new Chart(document.getElementById('pieChart'), {
  type: 'pie',
  data: {
    labels: ['No prazo', 'Com atraso'],
    datasets: [{
      data: [],
      backgroundColor: ['#1D9E75', '#D85A30']
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: textColor } }
    }
  }
});


document.getElementById('filtroPeriodo').addEventListener('change', e => {
  aplicarFiltro(e.target.value);
});

aplicarFiltro('ano');
import Highcharts from 'highcharts'

Highcharts.setOptions({
  chart: {
    backgroundColor: 'transparent',
    style: {
      fontFamily: "'DM Sans', system-ui, sans-serif",
    },
  },
  title: {
    style: {
      color: '#e8eef4',
      fontWeight: '600',
      fontSize: '1rem',
    },
  },
  subtitle: {
    style: { color: '#8b9aab' },
  },
  legend: {
    itemStyle: { color: '#c5d0db' },
    itemHoverStyle: { color: '#e8eef4' },
  },
  xAxis: {
    labels: { style: { color: '#8b9aab' } },
    lineColor: '#2a3644',
    tickColor: '#2a3644',
  },
  yAxis: {
    title: { style: { color: '#8b9aab' } },
    labels: { style: { color: '#8b9aab' } },
    gridLineColor: '#2a3644',
  },
  tooltip: {
    backgroundColor: '#1c2530',
    borderColor: '#2a3644',
    style: { color: '#e8eef4' },
  },
  credits: { enabled: false },
  colors: ['#2dd4bf', '#38bdf8', '#a78bfa', '#fbbf24', '#f87171', '#34d399'],
})

export const CHART_COLORS = [
  '#2dd4bf',
  '#38bdf8',
  '#a78bfa',
  '#fbbf24',
  '#f87171',
  '#34d399',
]

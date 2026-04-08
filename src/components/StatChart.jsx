import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement,
  Title, Tooltip, Legend, Filler,
)

const DARK_GRID = 'rgba(155,135,245,0.08)'
const DARK_TICK = 'rgba(255,255,255,0.3)'

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#110e25',
      borderColor: 'rgba(155,135,245,0.2)',
      borderWidth: 1,
      titleColor: '#f0eeff',
      bodyColor: '#9d97c0',
      padding: 10,
      cornerRadius: 10,
    },
  },
  scales: {
    x: {
      grid: { color: DARK_GRID },
      ticks: { color: DARK_TICK, font: { family: 'Outfit', size: 11 } },
    },
    y: {
      grid: { color: DARK_GRID },
      ticks: { color: DARK_TICK, font: { family: 'Outfit', size: 11 } },
      beginAtZero: true,
    },
  },
}

/* ── Pity Histogram ─────────────────────────────────────────── */
export function PityHistogram({ histogram, softPity, hardPity }) {
  if (!histogram || histogram.length === 0) return <EmptyChart />

  const labels = histogram.map(b => b.label)
  const counts = histogram.map(b => b.count)

  const colors = histogram.map(b => {
    const start = parseInt(b.label)
    if (start >= softPity) return 'rgba(245,158,11,0.8)'
    if (start >= softPity - 10) return 'rgba(167,139,250,0.7)'
    return 'rgba(155,135,245,0.5)'
  })

  const data = {
    labels,
    datasets: [{
      label: '5★ Pulls',
      data: counts,
      backgroundColor: colors,
      borderRadius: 6,
      borderSkipped: false,
    }],
  }

  return (
    <div style={{ height: 180 }}>
      <Bar data={data} options={{ ...baseOptions, plugins: { ...baseOptions.plugins, legend: { display: false } } }} />
    </div>
  )
}

/* ── Banner Distribution Doughnut ───────────────────────────── */
export function BannerDistribution({ distribution }) {
  const nonZero = distribution.filter(d => d.count > 0)
  if (nonZero.length === 0) return <EmptyChart />

  const data = {
    labels: nonZero.map(d => d.label),
    datasets: [{
      data: nonZero.map(d => d.count),
      backgroundColor: nonZero.map(d => d.color + 'cc'),
      borderColor: nonZero.map(d => d.color),
      borderWidth: 1.5,
      hoverOffset: 6,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        display: true,
        position: 'right',
        labels: {
          color: 'rgba(255,255,255,0.5)',
          font: { family: 'Outfit', size: 11 },
          padding: 12,
          boxWidth: 12,
          boxHeight: 12,
          borderRadius: 3,
        },
      },
      tooltip: baseOptions.plugins.tooltip,
    },
  }

  return (
    <div style={{ height: 180 }}>
      <Doughnut data={data} options={options} />
    </div>
  )
}

/* ── Daily Pulls Line Chart ─────────────────────────────────── */
export function DailyPullsChart({ dailyData }) {
  if (!dailyData || dailyData.length === 0) return <EmptyChart />

  // Limit to last 60 days for readability
  const recent = dailyData.slice(-60)

  const data = {
    labels: recent.map(d => d.date.slice(5)), // MM-DD
    datasets: [{
      label: 'Pulls',
      data: recent.map(d => d.count),
      borderColor: '#9b87f5',
      backgroundColor: 'rgba(155,135,245,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 2,
      pointHoverRadius: 5,
      borderWidth: 2,
    }],
  }

  const options = {
    ...baseOptions,
    plugins: { ...baseOptions.plugins },
  }

  return (
    <div style={{ height: 160 }}>
      <Line data={data} options={options} />
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center h-32 text-sm" style={{ color: 'var(--text-muted)' }}>
      Not enough data yet
    </div>
  )
}

import { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import type { AnomalyDTO } from '../types/compliance'
import './theme'

type Props = {
  anomalies: AnomalyDTO[]
  title?: string
}

const SEVERITY_ORDER = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const
const SEVERITY_COLORS: Record<string, string> = {
  LOW: '#34d399',
  MEDIUM: '#fbbf24',
  HIGH: '#fdba74',
  CRITICAL: '#f87171',
}

export default function AnomalySeverityChart({
  anomalies,
  title = 'Anomalies by severity',
}: Props) {
  const counts = useMemo(() => {
    const map: Record<string, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    }
    for (const a of anomalies) {
      map[a.severity] = (map[a.severity] ?? 0) + 1
    }
    return map
  }, [anomalies])

  const options = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: 'bar', height: 280 },
      title: { text: title },
      xAxis: {
        categories: [...SEVERITY_ORDER],
      },
      yAxis: {
        min: 0,
        allowDecimals: false,
        title: { text: 'Count' },
      },
      legend: { enabled: false },
      plotOptions: {
        bar: {
          borderWidth: 0,
          borderRadius: 3,
          colorByPoint: true,
          colors: SEVERITY_ORDER.map((s) => SEVERITY_COLORS[s]),
          dataLabels: {
            enabled: true,
            color: '#e8eef4',
            style: { textOutline: 'none' },
          },
        },
      },
      series: [
        {
          type: 'bar',
          name: 'Anomalies',
          data: SEVERITY_ORDER.map((s) => counts[s]),
        },
      ],
    }),
    [counts, title],
  )

  if (anomalies.length === 0) {
    return <p className="muted">No anomalies to chart.</p>
  }

  return (
    <div className="chart-panel">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  )
}

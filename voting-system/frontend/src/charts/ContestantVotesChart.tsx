import { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import type { ContestantCount } from '../types/compliance'
import './theme'

type Props = {
  contestantCounts: ContestantCount[]
  title?: string
}

export default function ContestantVotesChart({
  contestantCounts,
  title = 'Votes by contestant',
}: Props) {
  const options = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: 'column', height: 340 },
      title: { text: title },
      xAxis: {
        categories: contestantCounts.map((c) => c.contestantName),
        crosshair: true,
      },
      yAxis: {
        min: 0,
        title: { text: 'Votes' },
        allowDecimals: false,
      },
      legend: { enabled: false },
      plotOptions: {
        column: {
          borderRadius: 4,
          borderWidth: 0,
          colorByPoint: true,
          dataLabels: {
            enabled: true,
            color: '#e8eef4',
            style: { textOutline: 'none', fontWeight: '500' },
          },
        },
      },
      series: [
        {
          type: 'column',
          name: 'Votes',
          data: contestantCounts.map((c) => c.voteCount),
        },
      ],
    }),
    [contestantCounts, title],
  )

  if (contestantCounts.length === 0) {
    return <p className="muted">No contestant vote data to chart.</p>
  }

  return (
    <div className="chart-panel">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  )
}

import { useMemo } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import type { ContestantCount } from '../types/compliance'
import './theme'

type Props = {
  contestantCounts: ContestantCount[]
  title?: string
}

export default function VoteSharePieChart({
  contestantCounts,
  title = 'Vote share',
}: Props) {
  const options = useMemo<Highcharts.Options>(
    () => ({
      chart: { type: 'pie', height: 340 },
      title: { text: title },
      tooltip: {
        pointFormat: '<b>{point.y}</b> votes ({point.percentage:.1f}%)',
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          borderWidth: 0,
          dataLabels: {
            enabled: true,
            format: '{point.name}: {point.percentage:.1f}%',
            style: { color: '#e8eef4', textOutline: 'none' },
          },
        },
      },
      series: [
        {
          type: 'pie',
          name: 'Votes',
          data: contestantCounts.map((c) => ({
            name: c.contestantName,
            y: c.voteCount,
          })),
        },
      ],
    }),
    [contestantCounts, title],
  )

  if (contestantCounts.length === 0) {
    return <p className="muted">No vote share data to chart.</p>
  }

  return (
    <div className="chart-panel">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  )
}

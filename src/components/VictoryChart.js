// Ensure VictoryChart component updates subtitle based on user's timezone
import React, { useEffect } from 'react';
import { VictoryChart, VictoryBar, VictoryAxis, VictoryLabel } from 'victory';
import moment from 'moment-timezone';

const VictoryChartComponent = ({ expenses }) => {
  const [subtitle, setSubtitle] = React.useState('');

  useEffect(() => {
    const userTimezone = localStorage.getItem('userTimezone') || 'UTC';
    const formattedDate = moment().tz(userTimezone).format('YYYY-MM-DD HH:mm:ss Z');
    setSubtitle(`As of: ${formattedDate}`);
  }, []);

  return (
    <div>
      <VictoryChart domainPadding={{ x: 20, y: 30 }}>
        <VictoryBar data={expenses} />
        <VictoryAxis />
        <VictoryLabel textAnchor="middle" verticalAnchor="end" dy={-10} style={{ fontSize: 14 }}>{subtitle}</VictoryLabel>
      </VictoryChart>
    </div>
  );
};

export default VictoryChartComponent;
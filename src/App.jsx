import React, { useState, useMemo } from 'react';
import Timeline from './Timeline';
import Controls from './Controls';
import backgroundImage from './assets/bg5.jpg'; 

export default function App() {
  // Default rates after defined periods
  const [defaultRates, setDefaultRates] = useState([
    { start: 0, rate: 25, calculationMode: 'perHour', until: 120 },
    { start: 120, rate: 20, calculationMode: 'perMinute', until: 180 },
    { start: 180, rate: 50, calculationMode: 'fixed', until: Infinity }
  ]);

  const [endTime, setEndTime] = useState(240);

  // Compute maxTime for timeline (based on largest until or endTime)
  const maxTime = useMemo(() => {
    let maxDefault = endTime;
    for (const r of defaultRates) {
      const until = r.until === Infinity ? endTime : r.until;
      if (until > maxDefault) maxDefault = until;
    }
    return maxDefault;
  }, [defaultRates, endTime]);

  // Calculate total cost based solely on defaultRates
  const totalCost = useMemo(() => {
    return calculateTotalCost(defaultRates, endTime);
  }, [defaultRates, endTime]);

  return (
    <div 
      className="min-h-screen p-4 bg-gray-100"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,  // Use the imported image here
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <h1 className="text-2xl font-bold mb-4 text-white">Chained Default / Subsequent Rates with Deletion</h1>
      <div className="border p-4 bg-white rounded shadow">
        <Timeline defaultRates={defaultRates} endTime={endTime} maxTime={maxTime} />
        <Controls 
          defaultRates={defaultRates} 
          setDefaultRates={setDefaultRates} 
          endTime={endTime}
          setEndTime={setEndTime}
          totalCost={totalCost}
        />
      </div>
    </div>
  );
}

function calculateTotalCost(defaultRates, endTime) {
  let cost = 0;
  let current = 0;
  const sortedRates = [...defaultRates].sort((a,b) => a.start - b.start);

  for (const segment of sortedRates) {
    if (current >= endTime) break;
    if (endTime <= segment.start) continue;
    const segStart = Math.max(current, segment.start);
    const segEnd = segment.until === Infinity ? endTime : Math.min(endTime, segment.until);
    const usedMinutes = segEnd - segStart;
    if (usedMinutes > 0) {
      if (segment.calculationMode === 'perHour') {
        cost += segment.rate * (usedMinutes / 60);
      } else if (segment.calculationMode === 'perMinute') {
        cost += segment.rate * usedMinutes;
      } else if (segment.calculationMode === 'fixed') {
        cost += segment.rate;
      }
      current = segEnd;
    }
  }

  return Math.round(cost * 100) / 100;
}

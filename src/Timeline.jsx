import React, { useMemo } from 'react';

export default function Timeline({defaultRates, endTime, maxTime}) {
  const pxPerMin = 100/30; // Scale: 30 min = 100px

  const intervals = useMemo(() => {
    const interval = 30;
    const count = Math.ceil(maxTime / interval);
    return Array.from({length: count+1}, (_, i) => i * interval);
  }, [maxTime]);

  const getColor = (mode) => {
    if (mode === 'perHour') return 'bg-green-500';
    if (mode === 'perMinute') return 'bg-blue-500';
    if (mode === 'fixed') return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <div className="relative overflow-x-scroll w-full h-24 border-b border-t border-gray-300 bg-purple-100">
      <div className="relative" style={{minWidth: intervals.length * 100 + 'px', height:'100%'}}>
        {/* Draw timeline lines */}
        {intervals.map((time) => (
          <div key={time} className="absolute h-full border-l border-gray-400" style={{left: time * pxPerMin}}>
            <span className="text-xs text-gray-500 absolute top-0">
              {Math.floor(time/60)}:{(time%60).toString().padStart(2,'0')}
            </span>
          </div>
        ))}

        {/* Draw Default Rate segments */}
        {defaultRates.map((r,i) => {
          const segStart = r.start;
          const segEnd = r.until === Infinity ? maxTime : r.until;
          const left = segStart * pxPerMin;
          const width = Math.max(0, (segEnd - segStart) * pxPerMin);
          const colorClass = getColor(r.calculationMode);
          return (
            <div
              key={i}
              className={`absolute border-r border-2 ${colorClass} text-white flex items-center justify-center text-xs`}
              style={{left, bottom:'0', height:'20px', width}}
            >
              {r.rate}/{r.calculationMode === 'perHour' ? 'hr' : r.calculationMode === 'perMinute' ? 'min' : 'fixed'}
            </div>
          );
        })}

        {/* End Time Marker */}
        <div 
          className="absolute top-0 h-full border-l-2 border-red-500"
          style={{left: endTime * pxPerMin}}
        />
      </div>
    </div>
  );
}
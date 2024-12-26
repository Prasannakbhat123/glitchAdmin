import React from 'react';

export default function Controls({
  defaultRates,
  setDefaultRates,
  endTime,
  setEndTime,
  totalCost,
}) {
  const addDefaultRate = () => {
    // Add a new segment starting from the last segment's 'until' or 0 if none
    let start = 0;
    if (defaultRates.length > 0) {
      const last = defaultRates[defaultRates.length - 1];
      start = last.until === Infinity ? last.start : last.until;
    }
    setDefaultRates([
      ...defaultRates,
      { start, rate: 10, calculationMode: 'perHour', until: Infinity },
    ]);
  };

  const updateDefaultRate = (index, field, value) => {
    const updated = [...defaultRates];
    let val = value;
    if (field === 'start' || field === 'until') {
      val = value === '' ? Infinity : parseInt(value, 10);
      if (isNaN(val)) val = Infinity;
    } else if (field === 'rate') {
      val = parseFloat(value);
    }
    updated[index][field] = val;

    // If we changed 'until', adjust the next segment's start to maintain continuity
    if (field === 'until') {
      const currentSegment = updated[index];
      // Only if not the last segment and 'until' is not Infinity
      if (index < updated.length - 1 && currentSegment.until !== Infinity) {
        const nextSegment = updated[index + 1];
        nextSegment.start = currentSegment.until;
        if (
          nextSegment.until !== Infinity &&
          nextSegment.until < nextSegment.start
        ) {
          nextSegment.until = nextSegment.start;
        }
      }
    }

    // If we changed 'start':
    if (field === 'start' && updated[index].until !== Infinity) {
      if (updated[index].start > updated[index].until) {
        updated[index].until = updated[index].start;
      }
    }

    setDefaultRates(updated);
  };

  const deleteRate = (index) => {
    const updated = [...defaultRates];
    const deletedSegment = updated[index];
    updated.splice(index, 1);

    // If we delete a segment and there's a previous and next segment, ensure continuity
    if (index > 0 && index <= updated.length - 1) {
      // Now at 'index' we have the next segment after deletion
      const prevSegment = updated[index - 1];
      const nextSegment = updated[index];
      // Chain the next segment's start to the prev segment's until
      if (prevSegment.until !== Infinity) {
        nextSegment.start = prevSegment.until;
        if (
          nextSegment.until !== Infinity &&
          nextSegment.until < nextSegment.start
        ) {
          nextSegment.until = nextSegment.start;
        }
      } else {
        // If prevSegment.until is Infinity, then nextSegment start can't adjust logically.
        // It might remain as is, or you could set it equal to prevSegment.start.
        // We'll leave it as is because Infinity means open-ended.
      }
    } else if (index === 0 && updated.length > 0) {
      // If we removed the first segment, we can start the next from 0
      updated[0].start = 0;
      if (
        updated[0].until !== Infinity &&
        updated[0].until < updated[0].start
      ) {
        updated[0].until = updated[0].start;
      }
    }

    setDefaultRates(updated);
  };

  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* Default / Subsequent Rates */}
      <div>
        <h2 className="font-bold text-2xl text-purple-200">Default / Subsequent Rates</h2>
        <button
          onClick={addDefaultRate}
          className="bg-purple-500 text-white font-bold text-base py-1 rounded-full px-5 mt-3 mb-5"
        >
          Add Rate
        </button>
        <ul className="text-sm space-y-2">
          {defaultRates.map((r, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className='text-white text-lg'>From</span>
              <input
                type="number"
                value={r.start === Infinity ? '' : r.start}
                onChange={(e) => updateDefaultRate(i, 'start', e.target.value)}
                className="border border-purple-500 p-1 w-20 px-4 rounded-full bg-white bg-opacity-20 backdrop-blur-md text-white text-base"
              />
              <span className='text-white text-lg '>min to</span>
              <input
                type="number"
                value={r.until === Infinity ? '' : r.until}
                onChange={(e) => updateDefaultRate(i, 'until', e.target.value)}
                className="border border-purple-500 p-1 w-20 rounded-full px-4 bg-white bg-opacity-20 backdrop-blur-md text-base text-white"
                placeholder="∞"
              />
              :
              <input
                type="number"
                value={r.rate}
                onChange={(e) => updateDefaultRate(i, 'rate', e.target.value)}
                className="border border-purple-500 p-1 px-4 rounded-full w-20 bg-white bg-opacity-20 backdrop-blur-md text-base text-white"
              />
           <select
  value={r.calculationMode}
  onChange={(e) => updateDefaultRate(i, 'calculationMode', e.target.value)}
  className="border border-purple-500 p-1 px-4 rounded-full text-base bg-white bg-opacity-20 backdrop-blur-md shadow-lg text-white appearance-none"
>
  <option value="perHour" className="bg-transparent text-black">Per Hour</option>
  <option value="perMinute" className="bg-transparent text-black">Per Minute</option>
  <option value="fixed" className="bg-transparent text-black">Fixed</option>
</select>

              <button
                onClick={() => deleteRate(i)}
                className="bg-red-500 text-white px-2 py-1 rounded"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* End Time & Total Cost */}
      <div>
        <h2 className="font-bold mb-3 text-2xl text-purple-400 mt-5">Calculate Cost</h2>
        <div className="flex items-center gap-2">
          <span className='text-purple-200 text-lg font-semibold'>End Time (min):</span>
          <input
            type="number"
            value={endTime}
            onChange={(e) => setEndTime(parseInt(e.target.value, 10))}
            className="border rounded-full px-2 border-purple-500 p-1 w-24"
          />
        </div>
        <div className=" mt-4 text-lg font-semibold text-purple-100">
          Total Cost: <span className='ml-4 text-3xl text-white font-bold'>${totalCost}</span>
        </div>
      </div>
    </div>
  );
}

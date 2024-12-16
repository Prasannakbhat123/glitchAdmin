import React, { useState } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

export default function Blocks({ blocks, setBlocks }) {
  const pxPerMin = 100 / 30; // 30 min = 100px
  const snapInterval = 15; // snap to 15-min increments

  // Local state for editing modes
  const [editBlockId, setEditBlockId] = useState(null);

  const onBlockDragStop = (id, data) => {
    setBlocks((prev) =>
      prev.map((block) => {
        if (block.id === id) {
          const deltaMinutes = data.x / pxPerMin;
          const newStart = block.start + deltaMinutes;
          const snappedStart =
            Math.round(newStart / snapInterval) * snapInterval;
          return { ...block, start: Math.max(0, snappedStart) };
        }
        return block;
      })
    );
  };

  const onBlockResize = (id, widthPx) => {
    const newDuration = widthPx / pxPerMin;
    // Snap duration to nearest 15 min as well
    const snappedDuration = Math.max(
      snapInterval,
      Math.round(newDuration / snapInterval) * snapInterval
    );
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id ? { ...block, duration: snappedDuration } : block
      )
    );
  };

  const updateCalculationMode = (id, newMode) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, calculationMode: newMode } : b))
    );
    setEditBlockId(null);
  };

  return (
    <div className="relative h-16" style={{ minWidth: '2000px' }}>
      {blocks.map((block) => {
        const left = block.start * pxPerMin;
        const width = block.duration * pxPerMin;
        const displayText =
          block.calculationMode === 'fixed'
            ? `Fixed: ${block.price}`
            : `${block.price}/${
                block.calculationMode === 'perHour' ? 'hr' : 'min'
              }`;

        return (
          <Draggable
            key={block.id}
            axis="x"
            grid={[pxPerMin * snapInterval, 0]}
            position={{ x: left, y: 0 }}
            onStop={(e, data) => onBlockDragStop(block.id, data)}
          >
            <div className="absolute top-2 h-12 bg-blue-500 text-white flex items-center px-2 rounded shadow group">
              <ResizableBox
                width={width}
                height={40}
                minConstraints={[pxPerMin * snapInterval, 40]} // minimum 15 minutes
                maxConstraints={[Infinity, 40]}
                handleSize={[8, 40]}
                onResizeStop={(e, { size }) =>
                  onBlockResize(block.id, size.width)
                }
              >
                <div
                  className="h-full flex items-center justify-center relative"
                  style={{ width: width }}
                >
                  {displayText}
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs opacity-0 group-hover:opacity-100 rounded">
                    Click to edit mode
                  </div>
                </div>
              </ResizableBox>
              {/* On click, toggle calculationMode edit */}
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={() => setEditBlockId(block.id)}
              />
              {editBlockId === block.id && (
                <div className="absolute top-full mt-1 bg-white text-black border p-2 rounded shadow">
                  <div className="flex flex-col text-sm">
                    <button
                      onClick={() => updateCalculationMode(block.id, 'fixed')}
                      className="hover:bg-gray-200 px-2 py-1"
                    >
                      Fixed
                    </button>
                    <button
                      onClick={() => updateCalculationMode(block.id, 'perHour')}
                      className="hover:bg-gray-200 px-2 py-1"
                    >
                      Per Hour
                    </button>
                    <button
                      onClick={() =>
                        updateCalculationMode(block.id, 'perMinute')
                      }
                      className="hover:bg-gray-200 px-2 py-1"
                    >
                      Per Minute
                    </button>
                    <button
                      onClick={() => setEditBlockId(null)}
                      className="mt-2 text-red-500 text-xs"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Draggable>
        );
      })}
    </div>
  );
}

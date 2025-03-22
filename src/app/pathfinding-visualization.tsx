'use client';

import { useState, useEffect } from 'react';
import { Play, Eraser, Flag, MapPin, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AStar from './aStarAlgorithm';

// Cell types
export type CellType =
  | 'empty'
  | 'wall'
  | 'start'
  | 'end'
  | 'visited'
  | 'path'
  | 'current';

// Tool types
type ToolType = 'start' | 'end' | 'wall' | 'eraser';

export default function PathfindingVisualization() {
  const [gridSize, setGridSize] = useState({ rows: 15, cols: 25 });
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolType>('wall');
  const [startPosition, setStartPosition] = useState<[number, number] | null>(
    null
  );
  const [endPosition, setEndPosition] = useState<[number, number] | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [speed, setSpeed] = useState(50); // ms delay between steps

  // Initialize grid - create an empty grid without start/end points
  useEffect(() => {
    const newGrid = Array(gridSize.rows)
      .fill(null)
      .map(() => Array(gridSize.cols).fill('empty' as CellType));

    setGrid(newGrid);
  }, [gridSize]);

  // Add this useEffect after the other useEffect
  useEffect(() => {
    // Adjust grid size based on screen width while maintaining aspect ratio
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        // Small mobile
        setGridSize({ rows: 9, cols: 15 }); // Maintain ~3:5 aspect ratio
      } else if (width < 768) {
        // Larger mobile/small tablet
        setGridSize({ rows: 12, cols: 20 }); // Maintain ~3:5 aspect ratio
      } else {
        setGridSize({ rows: 15, cols: 25 }); // Default for larger screens
      }

      // Reset start and end positions when window size changes
      setStartPosition(null);
      setEndPosition(null);
      setIsFinished(false);
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle cell click
  const handleCellInteraction = (row: number, col: number) => {
    if (isRunning) return;

    const newGrid = [...grid.map((row) => [...row])];

    // Handle different tools
    if (selectedTool === 'start') {
      // Remove previous start position
      if (startPosition) {
        newGrid[startPosition[0]][startPosition[1]] = 'empty';
      }
      newGrid[row][col] = 'start';
      setStartPosition([row, col]);
    } else if (selectedTool === 'end') {
      // Remove previous end position
      if (endPosition) {
        newGrid[endPosition[0]][endPosition[1]] = 'empty';
      }
      newGrid[row][col] = 'end';
      setEndPosition([row, col]);
    } else if (selectedTool === 'wall') {
      // Don't overwrite start or end
      if (newGrid[row][col] !== 'start' && newGrid[row][col] !== 'end') {
        newGrid[row][col] = 'wall';
      }
    } else if (selectedTool === 'eraser') {
      // Don't erase start or end
      if (newGrid[row][col] !== 'start' && newGrid[row][col] !== 'end') {
        newGrid[row][col] = 'empty';
      }
    }

    setGrid(newGrid);
  };

  // Reset the visualization but keep walls and start/end points
  const resetVisualization = () => {
    const newGrid = [...grid.map((row) => [...row])];

    for (let i = 0; i < gridSize.rows; i++) {
      for (let j = 0; j < gridSize.cols; j++) {
        if (
          newGrid[i][j] === 'visited' ||
          newGrid[i][j] === 'path' ||
          newGrid[i][j] === 'current'
        ) {
          newGrid[i][j] = 'empty';
        }
      }
    }

    // Ensure start and end are still marked
    if (startPosition) newGrid[startPosition[0]][startPosition[1]] = 'start';
    if (endPosition) newGrid[endPosition[0]][endPosition[1]] = 'end';

    setGrid(newGrid);
    setIsFinished(false);
  };

  const runAStar = () => {
    AStar(
      startPosition,
      endPosition,
      isRunning,
      setIsRunning,
      resetVisualization,
      grid,
      setGrid,
      speed,
      setIsFinished,
      gridSize
    );
  };

  // Clear the entire grid
  const clearGrid = () => {
    if (isRunning) return;

    const newGrid = Array(gridSize.rows)
      .fill(null)
      .map(() => Array(gridSize.cols).fill('empty' as CellType));

    setGrid(newGrid);
    setStartPosition(null);
    setEndPosition(null);
    setIsFinished(false);
  };

  // Get cell color based on type
  const getCellColor = (type: CellType) => {
    switch (type) {
      case 'empty':
        return 'bg-white border border-gray-200';
      case 'wall':
        return 'bg-gray-800';
      case 'start':
        return 'bg-green-500';
      case 'end':
        return 'bg-red-500';
      case 'visited':
        return 'bg-blue-200';
      case 'current':
        return 'bg-blue-400';
      case 'path':
        return 'bg-yellow-400';
      default:
        return 'bg-white border border-gray-200';
    }
  };

  return (
    <div className='flex flex-col items-center p-2 sm:p-4 w-full max-w-6xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Pathfinding Visualization</h1>

      <div className='flex flex-col w-full gap-4 mb-4'>
        <div className='grid grid-rows-2 gap-4 justify-center'>
          <div className='flex flex-col gap-2'>
            <h2 className='text-lg font-semibold text-center'>Tools</h2>
            <div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-2 justify-center'>
              <Button
                variant={selectedTool === 'start' ? 'default' : 'outline'}
                onClick={() => setSelectedTool('start')}
                disabled={isRunning}
                className='flex items-center justify-center gap-1 px-2 sm:px-3'
                size='sm'
              >
                <MapPin size={16} />
                <span className='sm:inline'>Start</span>
              </Button>
              <Button
                variant={selectedTool === 'end' ? 'default' : 'outline'}
                onClick={() => setSelectedTool('end')}
                disabled={isRunning}
                className='flex items-center justify-center gap-1 px-2 sm:px-3'
                size='sm'
              >
                <Flag size={16} />
                <span className='sm:inline'>End</span>
              </Button>
              <Button
                variant={selectedTool === 'wall' ? 'default' : 'outline'}
                onClick={() => setSelectedTool('wall')}
                disabled={isRunning}
                className='flex items-center justify-center gap-1 px-2 sm:px-3'
                size='sm'
              >
                <Square size={16} />
                <span className='sm:inline'>Wall</span>
              </Button>
              <Button
                variant={selectedTool === 'eraser' ? 'default' : 'outline'}
                onClick={() => setSelectedTool('eraser')}
                disabled={isRunning}
                className='flex items-center justify-center gap-1 px-2 sm:px-3'
                size='sm'
              >
                <Eraser size={16} />
                <span className='sm:inline'>Eraser</span>
              </Button>
            </div>
          </div>

          <div className='flex flex-col gap-2'>
            <h2 className='text-lg font-semibold text-center'>Actions</h2>
            <div className='grid grid-cols-2 sm:flex sm:flex-wrap gap-2 justify-center'>
              <Button
                onClick={runAStar}
                disabled={isRunning || !startPosition || !endPosition}
                className='flex items-center justify-center gap-1 px-2 sm:px-3'
                size='sm'
              >
                <Play size={16} />
                <span className='sm:inline'>
                  {isFinished ? 'Run Again' : 'Run'}
                </span>
              </Button>
              <Button
                variant='outline'
                onClick={resetVisualization}
                disabled={isRunning}
                className='px-2 sm:px-3'
                size='sm'
              >
                <span className='sm:inline'>Reset</span>
              </Button>
              <Button
                variant='outline'
                onClick={clearGrid}
                disabled={isRunning}
                className='px-2 sm:px-3'
                size='sm'
              >
                <span className='sm:inline'>Clear All</span>
              </Button>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2 mb-4 w-full max-w-xs mx-auto'>
          <span className='text-sm'>Speed:</span>
          <input
            type='range'
            min='10'
            max='200'
            value={200 - speed}
            onChange={(e) => setSpeed(200 - Number.parseInt(e.target.value))}
            disabled={isRunning}
            className='flex-1'
          />
          <span className='text-sm'>
            {speed === 10 ? 'Fast' : speed === 200 ? 'Slow' : 'Medium'}
          </span>
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-4 md:flex md:flex-wrap gap-x-4 gap-y-2 mb-4 text-sm justify-center'>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 sm:w-4 sm:h-4 bg-white border border-gray-200'></div>
            <span>Empty</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 sm:w-4 sm:h-4 bg-gray-800'></div>
            <span>Wall</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 sm:w-4 sm:h-4 bg-green-500'></div>
            <span>Start</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 sm:w-4 sm:h-4 bg-red-500'></div>
            <span>End</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 sm:w-4 sm:h-4 bg-blue-200'></div>
            <span>Visited</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 sm:w-4 sm:h-4 bg-blue-400'></div>
            <span>Current</span>
          </div>
          <div className='flex items-center gap-1'>
            <div className='w-3 h-3 sm:w-4 sm:h-4 bg-yellow-400'></div>
            <span>Path</span>
          </div>
        </div>
      </div>

      <div
        className='grid gap-0 border border-gray-300'
        style={{
          gridTemplateRows: `repeat(${gridSize.rows}, minmax(0, 1fr))`,
          gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))`,
        }}
        onMouseDown={() => setIsMouseDown(true)}
        onMouseUp={() => setIsMouseDown(false)}
        onMouseLeave={() => setIsMouseDown(false)}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${getCellColor(
                cell
              )} transition-colors duration-100`}
              onMouseDown={() => handleCellInteraction(rowIndex, colIndex)}
              onMouseEnter={() => {
                if (isMouseDown) {
                  handleCellInteraction(rowIndex, colIndex);
                }
              }}
            />
          ))
        )}
      </div>

      <div className='mt-4 text-sm text-gray-600'>
        {isFinished && !isRunning && (
          <p>
            {grid.some((row, i) =>
              row.some(
                (cell, j) =>
                  cell === 'path' &&
                  !(i === startPosition?.[0] && j === startPosition?.[1]) &&
                  !(i === endPosition?.[0] && j === endPosition?.[1])
              )
            )
              ? 'Path found! The yellow cells show the shortest path.'
              : 'No path found between start and end points.'}
          </p>
        )}
      </div>
    </div>
  );
}

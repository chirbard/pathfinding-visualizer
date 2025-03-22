import { CellType } from '@/app/pathfinding-visualization';

const AStar = async (
  startPosition: [number, number] | null,
  endPosition: [number, number] | null,
  isRunning: boolean,
  setIsRunning: (running: boolean) => void,
  resetVisualization: () => void,
  grid: CellType[][],
  setGrid: (grid: CellType[][]) => void,
  speed: number,
  setIsFinished: (finished: boolean) => void,
  gridSize: { rows: number; cols: number }
) => {
  if (!startPosition || !endPosition || isRunning) return;

  setIsRunning(true);
  resetVisualization();

  const newGrid = [...grid.map((row) => [...row])];

  // Heuristic function (Manhattan distance)
  const heuristic = (a: [number, number], b: [number, number]) => {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
  };

  // Priority queue for open set
  const openSet: [number, number][] = [startPosition];
  const closedSet: Set<string> = new Set();

  // For node-to-node navigation and path reconstruction
  const cameFrom: Record<string, [number, number]> = {};

  // Cost from start to current node
  const gScore: Record<string, number> = {};
  gScore[`${startPosition[0]},${startPosition[1]}`] = 0;

  // Estimated total cost from start to goal through current node
  const fScore: Record<string, number> = {};
  fScore[`${startPosition[0]},${startPosition[1]}`] = heuristic(
    startPosition,
    endPosition
  );

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  while (openSet.length > 0) {
    // Find node with lowest fScore
    let current: [number, number] | null = null;
    let lowestFScore = Number.POSITIVE_INFINITY;
    let currentIndex = -1;

    for (let i = 0; i < openSet.length; i++) {
      const node = openSet[i];
      const nodeKey = `${node[0]},${node[1]}`;

      if (!fScore[nodeKey] || fScore[nodeKey] < lowestFScore) {
        lowestFScore = fScore[nodeKey] || Number.POSITIVE_INFINITY;
        current = node;
        currentIndex = i;
      }
    }

    if (!current) break;

    // Remove current from openSet
    openSet.splice(currentIndex, 1);

    const currentKey = `${current[0]},${current[1]}`;

    // If we reached the end
    if (current[0] === endPosition[0] && current[1] === endPosition[1]) {
      // Reconstruct path
      const path: [number, number][] = [];
      let temp: [number, number] | undefined = current;

      while (temp) {
        path.push(temp);
        temp = cameFrom[`${temp[0]},${temp[1]}`];
      }

      // Visualize the path
      for (let i = path.length - 2; i > 0; i--) {
        const [r, c] = path[i];
        newGrid[r][c] = 'path';
        setGrid([...newGrid]);
        await sleep(speed / 2);
      }

      setIsRunning(false);
      setIsFinished(true);
      return;
    }

    // Add to closed set
    closedSet.add(currentKey);

    // Mark as visited in the grid (except start and end)
    if (
      newGrid[current[0]][current[1]] !== 'start' &&
      newGrid[current[0]][current[1]] !== 'end'
    ) {
      newGrid[current[0]][current[1]] = 'visited';
    }

    // Visualize current node being processed
    setGrid([...newGrid]);
    await sleep(speed);

    // Check neighbors
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]; // Up, Down, Left, Right

    for (const [dx, dy] of directions) {
      const neighborRow = current[0] + dx;
      const neighborCol = current[1] + dy;

      // Check if neighbor is valid
      if (
        neighborRow < 0 ||
        neighborRow >= gridSize.rows ||
        neighborCol < 0 ||
        neighborCol >= gridSize.cols ||
        newGrid[neighborRow][neighborCol] === 'wall' ||
        closedSet.has(`${neighborRow},${neighborCol}`)
      ) {
        continue;
      }

      const neighborKey = `${neighborRow},${neighborCol}`;
      const tentativeGScore = (gScore[currentKey] || 0) + 1;

      // If this path to neighbor is better than any previous one
      if (!gScore[neighborKey] || tentativeGScore < gScore[neighborKey]) {
        // Record the best path
        cameFrom[neighborKey] = current;
        gScore[neighborKey] = tentativeGScore;
        fScore[neighborKey] =
          tentativeGScore + heuristic([neighborRow, neighborCol], endPosition);

        // Add neighbor to openSet if not there
        if (!openSet.some(([r, c]) => r === neighborRow && c === neighborCol)) {
          openSet.push([neighborRow, neighborCol]);

          // Visualize nodes in open set (except start and end)
          if (
            newGrid[neighborRow][neighborCol] !== 'start' &&
            newGrid[neighborRow][neighborCol] !== 'end'
          ) {
            newGrid[neighborRow][neighborCol] = 'current';
          }
        }
      }
    }

    setGrid([...newGrid]);
    await sleep(speed);
  }

  // No path found
  setIsRunning(false);
  setIsFinished(true);
};

export default AStar;

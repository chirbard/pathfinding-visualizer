import { CellType } from '@/app/pathfinding-visualization';
import GridNode from './gridNode';

const BFS = async (
  startPosition: [number, number] | null,
  endPosition: [number, number] | null,
  isRunning: boolean,
  setIsRunning: (running: boolean) => void,
  resetVisualization: () => void,
  grid: CellType[][],
  setGrid: (grid: CellType[][]) => void,
  speed: number,
  setIsFinished: (finished: boolean) => void
) => {
  if (!startPosition || !endPosition || isRunning) return;

  setIsRunning(true);
  resetVisualization();

  let queue: Array<[number, number]> = [startPosition];
  // let currentLocation: [number, number] = startPosition;

  const nodeGrid: GridNode[][] = grid.map((row) =>
    row.map((cell) => new GridNode(cell))
  );

  const newGrid = [...grid.map((row) => [...row])];

  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  //console.log('start', startPosition);
  // start position is [y, x]

  let directions = [
    [-1, 0], // up
    [1, 0], // down
    [0, -1], // left
    [0, 1], // right
  ];

  let foundEndPosition: [number, number] | null = null;

  while (queue.length > 0) {
    const currentLocation = queue.shift();
    if (currentLocation == undefined) break;
    const x = currentLocation[1];
    const y = currentLocation[0];
    for (let i = 0; i < directions.length; i++) {
      const newX = x + directions[i][1];
      const newY = y + directions[i][0];
      if (
        newX >= 0 &&
        newX < nodeGrid[0].length &&
        newY >= 0 &&
        newY < nodeGrid.length
      ) {
        // check if the new node is end
        if (nodeGrid[newY][newX].getData() == 'end') {
          foundEndPosition = [newY, newX];
          nodeGrid[newY][newX].setLast([y, x]);
          queue = [];
          break;
        }

        // check if the new node is empty
        if (nodeGrid[newY][newX].getData() == 'empty') {
          nodeGrid[newY][newX].setData('visited');
          nodeGrid[newY][newX].setLast([y, x]);
          queue.push([newY, newX]);
        }
      }
    }

    //
    //
    // update visualization
    for (let i = 0; i < nodeGrid.length; i++) {
      for (let j = 0; j < nodeGrid[i].length; j++) {
        const node = nodeGrid[i][j];
        newGrid[i][j] = node.getData() as CellType;
      }
    }
    setGrid([...newGrid]);
    await sleep(speed);
  }

  if (foundEndPosition != null) {
    const [y, x] = foundEndPosition;
    let locationArray = traverseNodes(nodeGrid, [y, x]);

    locationArray.pop(); // remove the end node
    locationArray.shift(); // remove the start node
    while (locationArray.length > 0) {
      const [y, x] = locationArray.pop()!;
      newGrid[y][x] = 'path';
      setGrid([...newGrid]);
      await sleep(speed);
    }
  }

  setIsRunning(false);
  setIsFinished(true);
};

function traverseNodes(
  grid: GridNode[][],
  startLocation: [number, number]
): number[][] {
  let locationArray: number[][] = [startLocation];
  let x = startLocation[1];
  let y = startLocation[0];
  let currentNode = grid[y][x];
  let nextLocation = currentNode.getLast();
  while (nextLocation != undefined) {
    locationArray.push(nextLocation);
    let newX = nextLocation[1];
    let newY = nextLocation[0];
    let currentNode = grid[newY][newX];
    nextLocation = currentNode.getLast();
  }
  return locationArray;
}

export default BFS;

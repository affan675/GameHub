// js/game_state.js

/**
 * GameState holds all mutable state for the current session.
 * It tracks board modifications, ball position, and win conditions.
 */
const GameState = (function() {
  
  // Core state variables
  let currentLevelData = null;
  let grid = [];
  let ballRow = 0;
  let ballCol = 0;
  let totalPaintable = 0;
  let paintedCount = 0;
  let isLevelComplete = false;
  let isMoving = false; // Prevents overlapping moves

  /**
   * Initializes the game state with new level data.
   * Deep copies the grid to prevent mutating original templates.
   */
  function initState(levelData) {
    currentLevelData = levelData;
    grid = JSON.parse(JSON.stringify(levelData.grid));
    ballRow = levelData.startRow;
    ballCol = levelData.startCol;
    isLevelComplete = false;
    isMoving = false;
    
    calculatePaintableCells();
    
    // Ensure start position is painted
    if (grid[ballRow][ballCol] && !grid[ballRow][ballCol].painted) {
      grid[ballRow][ballCol].painted = true;
      paintedCount++;
    }
  }

  /**
   * Scans the grid to count how many cells can be painted.
   */
  function calculatePaintableCells() {
    totalPaintable = 0;
    paintedCount = 0;
    
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        const cell = grid[r][c];
        if (cell && cell.type !== 'wall') {
          totalPaintable++;
          if (cell.painted) {
            paintedCount++;
          }
        }
      }
    }
  }

  /**
   * Resets the current level back to its initial state.
   */
  function resetState() {
    if (currentLevelData) {
      initState(currentLevelData);
    }
  }

  /**
   * Checks if all paintable cells have been painted.
   */
  function checkWinCondition() {
    if (paintedCount >= totalPaintable && !isLevelComplete) {
      isLevelComplete = true;
      return true;
    }
    return false;
  }

  /**
   * Marks a specific cell as painted and increments the counter.
   */
  function paintCell(r, c) {
    if (grid[r][c] && !grid[r][c].painted && grid[r][c].type !== 'wall') {
      grid[r][c].painted = true;
      paintedCount++;
    }
  }

  // Expose getters and setters
  return {
    init: initState,
    reset: resetState,
    getGrid: () => grid,
    getRows: () => grid.length,
    getCols: () => grid.length > 0 ? grid[0].length : 0,
    getBallPos: () => ({ r: ballRow, c: ballCol }),
    setBallPos: (r, c) => { ballRow = r; ballCol = c; },
    paint: paintCell,
    isWin: checkWinCondition,
    isComplete: () => isLevelComplete,
    getLevelId: () => currentLevelData ? currentLevelData.id : 1,
    getDifficulty: () => currentLevelData ? currentLevelData.difficulty : 'Unknown',
    setMoving: (state) => { isMoving = state; },
    getMoving: () => isMoving
  };

})();
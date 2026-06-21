// js/justify.js

/**
 * LevelJustifier simulates exact gameplay to guarantee solvability.
 * Now optimized with a Fast-Fail Pre-Check and a Time Limit to prevent UI freezes.
 */
const LevelJustifier = (function() {
  
  function getGameStateHash(r, c, grid) {
    let hash = `${r},${c}:`;
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j] && grid[i][j].type !== 'wall') {
          hash += grid[i][j].painted ? '1' : '0';
        }
      }
    }
    return hash;
  }

  /**
   * FAST PASS: Standard Flood-Fill to ensure all cells are physically connected.
   * If they aren't, there is an isolated pocket, and the board is physically impossible.
   */
  function isContiguous(grid, startRow, startCol, totalPaintable) {
    const visited = Array(grid.length).fill().map(() => Array(grid[0].length).fill(false));
    const queue = [[startRow, startCol]];
    visited[startRow][startCol] = true;
    let count = 1;

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    while (queue.length > 0) {
      const [r, c] = queue.shift();
      
      for (let [dr, dc] of dirs) {
        let nr = r + dr;
        let nc = c + dc;
        
        if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) {
          if (grid[nr][nc] && grid[nr][nc].type !== 'wall' && !visited[nr][nc]) {
            visited[nr][nc] = true;
            count++;
            queue.push([nr, nc]);
          }
        }
      }
    }
    return count === totalPaintable;
  }

  function verifySolvability(levelData) {
    const grid = JSON.parse(JSON.stringify(levelData.grid));
    const startRow = levelData.startRow;
    const startCol = levelData.startCol;
    
    let totalPaintable = 0;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] && grid[r][c].type !== 'wall') totalPaintable++;
      }
    }

    // Optimization 1: Instantly reject boards with isolated, trapped cells
    if (!isContiguous(grid, startRow, startCol, totalPaintable)) {
      return false; 
    }

    const visitedStates = new Set();
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    // Optimization 2: Time Limit to prevent infinite recursive freezing
    const startTime = performance.now();
    const TIME_LIMIT_MS = 50; // Max 50ms allowed for verification per board

    function dfs(r, c, currentGrid, paintedCount) {
      if (paintedCount === totalPaintable) return true;
      if (performance.now() - startTime > TIME_LIMIT_MS) return false; // Time limit hit
      
      const stateHash = getGameStateHash(r, c, currentGrid);
      if (visitedStates.has(stateHash)) return false;
      visitedStates.add(stateHash);

      for (let [dr, dc] of dirs) {
        let nr = r;
        let nc = c;
        let paintedThisMove = [];
        let newPaintedCount = paintedCount;

        while (
          nr + dr >= 0 && nr + dr < currentGrid.length &&
          nc + dc >= 0 && nc + dc < currentGrid[0].length &&
          currentGrid[nr + dr][nc + dc] !== null &&
          currentGrid[nr + dr][nc + dc].type !== 'wall'
        ) {
          nr += dr;
          nc += dc;
          
          if (!currentGrid[nr][nc].painted) {
            currentGrid[nr][nc].painted = true;
            paintedThisMove.push({row: nr, col: nc});
            newPaintedCount++;
          }
        }

        if (nr !== r || nc !== c) {
          if (dfs(nr, nc, currentGrid, newPaintedCount)) return true; 
        }

        // Backtrack
        for (let cell of paintedThisMove) {
          currentGrid[cell.row][cell.col].painted = false;
        }
      }
      return false;
    }

    return dfs(startRow, startCol, grid, 1); 
  }

  return {
    verifySolvability: verifySolvability
  };

})();
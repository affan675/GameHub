// js/hint_system.js

/**
 * HintSystem calculates the nearest reachable unpainted cell.
 */
const HintSystem = (function() {

  /**
   * Finds the first unpainted cell in a specific direction.
   */
  function scanDirection(r, c, dx, dy) {
    const grid = GameState.getGrid();
    const rows = GameState.getRows();
    const cols = GameState.getCols();
    
    let currR = r + dx;
    let currC = c + dy;
    let distance = 1;
    
    while (currR >= 0 && currR < rows && currC >= 0 && currC < cols) {
      const cell = grid[currR][currC];
      
      // Stop if hitting a wall or missing cell
      if (cell === null || cell.type === 'wall') {
        break;
      }
      
      // If unpainted, this is a valid hint target
      if (!cell.painted) {
        return { r: currR, c: currC, dist: distance };
      }
      
      currR += dx;
      currC += dy;
      distance++;
    }
    
    return null;
  }

  /**
   * Analyzes all 4 directions and returns the closest unpainted reachable cell.
   */
  function findHint() {
    if (GameState.isComplete()) return null;

    const pos = GameState.getBallPos();
    const directions = [
      { dx: -1, dy: 0 }, // Up
      { dx: 1, dy: 0 },  // Down
      { dx: 0, dy: -1 }, // Left
      { dx: 0, dy: 1 }   // Right
    ];

    let bestTarget = null;
    let minDistance = Infinity;

    for (const dir of directions) {
      const target = scanDirection(pos.r, pos.c, dir.dx, dir.dy);
      if (target && target.dist < minDistance) {
        minDistance = target.dist;
        bestTarget = target;
      }
    }

    return bestTarget;
  }

  /**
   * Applies the hint by finding target and telling renderer.
   * Returns true if hint found, false otherwise.
   */
  function applyHint() {
    const target = findHint();
    if (target) {
      Renderer.setHint(target.r, target.c);
      return true;
    }
    return false;
  }

  return {
    applyHint: applyHint
  };

})();
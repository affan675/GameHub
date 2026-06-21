// js/movement.js

/**
 * Movement logic handling arrow keys and mouse click sliding.
 * Modifies GameState and triggers Win checks via UI controller.
 */
const Movement = (function() {

  /**
   * Validates if a coordinate is within grid boundaries.
   */
  function inBounds(r, c) {
    return r >= 0 && r < GameState.getRows() && c >= 0 && c < GameState.getCols();
  }

  /**
   * Checks if a cell is traversable (not null and not a wall).
   */
  function isValidCell(r, c) {
    const grid = GameState.getGrid();
    if (!inBounds(r, c)) return false;
    const cell = grid[r][c];
    return cell !== null && cell.type !== 'wall';
  }

  /**
   * Slides the ball in a given direction until hitting an obstacle.
   * dx: row delta, dy: col delta.
   */
  function move(dx, dy) {
    if (GameState.isComplete() || GameState.getMoving()) return false;
    
    const pos = GameState.getBallPos();
    let r = pos.r;
    let c = pos.c;
    let moved = false;

    // Loop until the next cell in the direction is invalid
    while (isValidCell(r + dx, c + dy)) {
      r += dx;
      c += dy;
      GameState.paint(r, c);
      moved = true;
    }

    if (moved) {
      GameState.setBallPos(r, c);
      return true;
    }
    
    return false;
  }

  /**
   * Slides the ball to a specific target clicked by the mouse.
   * Ensures the target is in the same row/col and path is unblocked.
   */
  function moveToTarget(targetRow, targetCol) {
    if (GameState.isComplete() || GameState.getMoving()) return false;
    
    const pos = GameState.getBallPos();
    
    // Determine direction
    let dx = 0;
    let dy = 0;
    
    if (targetRow === pos.r && targetCol !== pos.c) {
      dy = targetCol > pos.c ? 1 : -1;
    } else if (targetCol === pos.c && targetRow !== pos.r) {
      dx = targetRow > pos.r ? 1 : -1;
    } else {
      // Not in same row or column
      return false;
    }

    // Check if straight line path is clear of walls/nulls
    let r = pos.r;
    let c = pos.c;
    let pathClear = true;
    
    while (r !== targetRow || c !== targetCol) {
      r += dx;
      c += dy;
      if (!isValidCell(r, c)) {
        pathClear = false;
        break;
      }
    }

    if (!pathClear) return false;

    // Execute the slide and paint
    r = pos.r;
    c = pos.c;
    while (r !== targetRow || c !== targetCol) {
      r += dx;
      c += dy;
      GameState.paint(r, c);
    }
    
    GameState.setBallPos(targetRow, targetCol);
    return true;
  }

  // Expose movement functions
  return {
    moveUp: () => move(-1, 0),
    moveDown: () => move(1, 0),
    moveLeft: () => move(0, -1),
    moveRight: () => move(0, 1),
    moveToTarget: moveToTarget
  };

})();
// js/renderer.js

/**
 * Renderer manages the HTML5 Canvas drawing loop.
 * Renders grid, cells, walls, ball, and hints based on GameState.
 */
const Renderer = (function() {
  
  let canvas, ctx;
  const CELL_SIZE = 50;
  let animationId = null;
  
  // Colors defined in requirements
  const COLOR_UNPAINTED = '#e0e0e0';
  const COLOR_PAINTED = '#4caf50';
  const COLOR_WALL = '#2c3e50';
  const COLOR_BALL = '#ffc107';
  
  // Hint state
  let hintGlow = null;

  /**
   * Initializes the canvas context and sizes it based on grid.
   */
  function init(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    resizeCanvas();
    startRenderLoop();
  }

  /**
   * Sizes canvas to fit the grid perfectly.
   */
  function resizeCanvas() {
    const rows = GameState.getRows();
    const cols = GameState.getCols();
    if (rows === 0 || cols === 0) return;
    
    canvas.width = cols * CELL_SIZE;
    canvas.height = rows * CELL_SIZE;
  }

  /**
   * Draws a cross-hatch pattern for wall cells to make them distinct.
   */
  function drawWallPattern(x, y) {
    ctx.fillStyle = COLOR_WALL;
    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
    
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Diagonal lines
    for (let i = -CELL_SIZE; i < CELL_SIZE; i += 10) {
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i + CELL_SIZE, y + CELL_SIZE);
    }
    ctx.stroke();
  }

  /**
   * Main draw function called every frame.
   */
  function draw() {
    if (!ctx) return;
    
    const grid = GameState.getGrid();
    const rows = grid.length;
    const cols = rows > 0 ? grid[0].length : 0;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Grid Cells
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = grid[r][c];
        const x = c * CELL_SIZE;
        const y = r * CELL_SIZE;

        if (cell === null) {
          // Leave null cells transparent
          continue;
        }

        if (cell.type === 'wall') {
          drawWallPattern(x, y);
        } else {
          // Draw floor (painted or unpainted)
          ctx.fillStyle = cell.painted ? COLOR_PAINTED : COLOR_UNPAINTED;
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
          
          // Subtle inner border for grid distinction
          ctx.strokeStyle = 'rgba(0,0,0,0.05)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw Hint Glow if active
    if (hintGlow && hintGlow.active) {
      drawHintGlow(hintGlow.r, hintGlow.c);
    }

    // Draw Ball
    const pos = GameState.getBallPos();
    const centerX = pos.c * CELL_SIZE + (CELL_SIZE / 2);
    const centerY = pos.r * CELL_SIZE + (CELL_SIZE / 2);
    const radius = (CELL_SIZE / 2) - 6;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = COLOR_BALL;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#333'; // Dark border
    ctx.stroke();
  }

  /**
   * Renders a glowing ring around a specific cell.
   */
  function drawHintGlow(r, c) {
    const x = c * CELL_SIZE;
    const y = r * CELL_SIZE;
    const offset = 4;
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#f1c40f';
    ctx.strokeStyle = 'rgba(241, 196, 15, 0.8)';
    ctx.lineWidth = 4;
    
    ctx.strokeRect(x + offset, y + offset, CELL_SIZE - offset*2, CELL_SIZE - offset*2);
    
    // Reset shadow
    ctx.shadowBlur = 0;
  }

  /**
   * Sets the hint coordinates to be drawn.
   */
  function setHint(r, c) {
    hintGlow = { r, c, active: true };
    // Auto-remove hint after 2 seconds
    setTimeout(() => {
      if (hintGlow) hintGlow.active = false;
    }, 2000);
  }

  function startRenderLoop() {
    function loop() {
      draw();
      animationId = requestAnimationFrame(loop);
    }
    if (!animationId) {
      loop();
    }
  }

  // Public API
  return {
    init: init,
    resize: resizeCanvas,
    setHint: setHint,
    getCellSize: () => CELL_SIZE
  };

})();
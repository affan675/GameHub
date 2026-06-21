// js/ui_controller.js

/**
 * UIController acts as the bridge connecting DOM events, 
 * Game logic (Movement), and Visuals (Modals/Toasts).
 */
window.UIController = (function() {
  
  // DOM Elements
  let canvas, guideModal, btnGuide, btnCloseGuide, btnHint;
  let nextLevelContainer, btnNextLevel;
  let toastMsg, toastText, levelDisplay;

  // Toast messages array
  const winMessages = ["On Fire!", "Impressive Skills", "Great Moves!", "Level Complete!"];

  /**
   * Binds all DOM elements and attaches event listeners.
   */
  function initDOM() {
    canvas = document.getElementById('game-canvas');
    guideModal = document.getElementById('guide-modal');
    btnGuide = document.getElementById('btn-guide');
    btnCloseGuide = document.getElementById('btn-close-guide');
    btnHint = document.getElementById('btn-hint');
    nextLevelContainer = document.getElementById('next-level-container');
    btnNextLevel = document.getElementById('btn-next-level');
    toastMsg = document.getElementById('toast-message');
    toastText = document.getElementById('toast-text');
    levelDisplay = document.getElementById('level-display');

    // Initialize Canvas Renderer
    Renderer.init(canvas);

    attachEventListeners();
  }

  function attachEventListeners() {
    // Keyboard Controls
    window.addEventListener('keydown', handleKeyDown);

    // Mouse Controls
    canvas.addEventListener('click', handleCanvasClick);

    // Top Bar Buttons
    btnGuide.addEventListener('click', () => guideModal.classList.remove('hidden'));
    btnCloseGuide.addEventListener('click', () => guideModal.classList.add('hidden'));
    
    btnHint.addEventListener('click', () => {
      const success = HintSystem.applyHint();
      if (!success && !GameState.isComplete()) {
        showToast("No direct slide possible");
      }
    });

    // Next Level Button
    btnNextLevel.addEventListener('click', () => {
      nextLevelContainer.classList.add('hidden');
      LevelManager.nextLevel();
    });
  }

  function handleKeyDown(e) {
    if (GameState.isComplete()) return;
    
    const key = e.key;
    let moved = false;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
      e.preventDefault(); // Prevent page scrolling
    }

    switch(key) {
      case 'ArrowUp': moved = Movement.moveUp(); break;
      case 'ArrowDown': moved = Movement.moveDown(); break;
      case 'ArrowLeft': moved = Movement.moveLeft(); break;
      case 'ArrowRight': moved = Movement.moveRight(); break;
    }

    if (moved) checkWin();
  }

  function handleCanvasClick(e) {
    if (GameState.isComplete()) return;

    const rect = canvas.getBoundingClientRect();
    const cellSize = Renderer.getCellSize();
    
    // Calculate click coordinates relative to canvas internal scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const targetCol = Math.floor(x / cellSize);
    const targetRow = Math.floor(y / cellSize);

    const moved = Movement.moveToTarget(targetRow, targetCol);
    if (moved) checkWin();
  }

  function checkWin() {
    if (GameState.isWin()) {
      LevelManager.completeLevel();
      const randomMsg = winMessages[Math.floor(Math.random() * winMessages.length)];
      showToast(randomMsg);
      
      // Delay showing next level button slightly for effect
      setTimeout(() => {
        nextLevelContainer.classList.remove('hidden');
      }, 1000);
    }
  }

  function showToast(message) {
    toastText.textContent = message;
    toastMsg.classList.remove('hidden');
    toastMsg.classList.remove('fade-out');
    
    setTimeout(() => {
      toastMsg.classList.add('fade-out');
      setTimeout(() => {
        toastMsg.classList.add('hidden');
      }, 500); // Wait for transition
    }, 2000);
  }

  function onLevelLoaded() {
    Renderer.resize();
    levelDisplay.textContent = `${GameState.getLevelId()} (${GameState.getDifficulty()})`;
    nextLevelContainer.classList.add('hidden');
  }

  // Bootstrap the application when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    initDOM();
    LevelManager.init(); // This will trigger loadLevel and onLevelLoaded
  });

  return {
    onLevelLoaded: onLevelLoaded
  };

})();
// js/level_manager.js

/**
 * LevelManager handles loading, saving progress, and transitioning levels.
 * Interacts with localStorage.
 */
const LevelManager = (function() {
  
  const STORAGE_KEY = 'mazePaintUnlocked';
  let currentLevelId = 1;
  let maxUnlockedLevel = 1;

  /**
   * Loads progress from localStorage on boot.
   */
  function loadProgress() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      maxUnlockedLevel = parseInt(saved, 10);
    }
  }

  /**
   * Saves progress to localStorage.
   */
  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, maxUnlockedLevel.toString());
  }

  /**
   * Initializes the game at a specific level.
   */
  function loadLevel(id) {
    if (id > maxUnlockedLevel && id <= LevelGenerator.getTotalLevels()) {
      console.warn("Attempting to load locked level. Defaulting to max unlocked.");
      id = maxUnlockedLevel;
    }
    
    currentLevelId = id;
    const levelData = LevelGenerator.getLevel(id);
    
    // Initialize Game State
    GameState.init(levelData);
    
    // Tell UI to update canvas sizing and text
    if (window.UIController) {
      window.UIController.onLevelLoaded();
    }
  }

  /**
   * Unlocks the next level upon completion.
   */
  function completeCurrentLevel() {
    if (currentLevelId === maxUnlockedLevel) {
      maxUnlockedLevel++;
      saveProgress();
    }
  }

  /**
   * Transitions to the next level.
   */
  function nextLevel() {
    loadLevel(currentLevelId + 1);
  }

  return {
    init: function() {
      loadProgress();
      loadLevel(maxUnlockedLevel); // Auto load furthest progress
    },
    loadLevel: loadLevel,
    completeLevel: completeCurrentLevel,
    nextLevel: nextLevel,
    getCurrentId: () => currentLevelId,
    getMaxUnlocked: () => maxUnlockedLevel
  };

})();
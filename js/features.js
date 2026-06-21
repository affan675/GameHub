// ========== PRELOADER: CONTROLLER BUTTON MASH (MIN 3 SECONDS) ==========
(function() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    let progress = 0;
    const percentSpan = document.getElementById('preloader-percent');
    const tipEl = document.getElementById('preloader-tip');
    
    const tips = [
        "🎮 Press A to jump into action!",
        "⚡ Did you know? This site has 20+ games!",
        "🧠 Ready to train your brain?",
        "🎨 Custom cursor created just for you.",
        "🚀 Made by a 14-year-old prodigy!",
        "🕹️ Controller buttons flash every 25%",
        "✨ D-pad fills up as you wait",
        "💡 Tip: You can use custom right-click menu!"
    ];
    
    let interval;
    const MIN_DURATION = 3000; // 3 seconds
    const startTime = Date.now();
    
    function updateProgress(value) {
        progress = Math.min(100, value);
        if (percentSpan) percentSpan.innerText = progress;
        
        const arms = document.querySelectorAll('.dpad-arm');
        arms.forEach((arm, index) => {
            const threshold = (index + 1) * 25;
            if (progress >= threshold) {
                arm.classList.add('fill');
            } else {
                arm.classList.remove('fill');
            }
        });
        
        // Flash a random button every 20% progress (but not on every small update)
        if (progress % 20 === 0 && progress > 0 && progress < 100) {
            const buttons = document.querySelectorAll('.action-btn');
            const randomBtn = buttons[Math.floor(Math.random() * buttons.length)];
            randomBtn.classList.add('flash');
            setTimeout(() => randomBtn.classList.remove('flash'), 200);
        }
        
        // Change tip every 25%
        if (progress % 25 === 0 && progress > 0 && tipEl) {
            const randomTip = tips[Math.floor(Math.random() * tips.length)];
            tipEl.textContent = randomTip;
        }
    }
    
    // Calculate required duration and increments to reach 100% in ~3 seconds
    function startProgress() {
        const endTime = startTime + MIN_DURATION;
        const totalSteps = MIN_DURATION / 30; // update every 30ms for smoothness
        let step = 0;
        
        interval = setInterval(() => {
            step++;
            const now = Date.now();
            const elapsed = now - startTime;
            let targetProgress = Math.min(100, Math.floor((elapsed / MIN_DURATION) * 100));
            
            // Ensure progress never jumps too fast; cap at target
            if (targetProgress > progress) {
                updateProgress(targetProgress);
            }
            
            // If time is up and we're at 100%, finish
            if (elapsed >= MIN_DURATION && progress >= 100) {
                clearInterval(interval);
                finishLoading();
            } else if (elapsed >= MIN_DURATION + 200 && progress < 100) {
                // safety: force complete
                updateProgress(100);
                clearInterval(interval);
                finishLoading();
            }
        }, 30);
    }
    
    function finishLoading() {
        // Ensure we're at 100%
        if (progress < 100) updateProgress(100);
        
        // Extra delay to see 100% for a moment
        setTimeout(() => {
            preloader.classList.add('hide');
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 800);
        }, 400);
    }
    
    // Start the progress
    startProgress();
    
    // Fallback: when window fully loads, ensure minimum duration is respected
    window.addEventListener('load', () => {
        const elapsed = Date.now() - startTime;
        if (elapsed < MIN_DURATION) {
            // Wait remaining time then finish
            const remaining = MIN_DURATION - elapsed;
            setTimeout(() => {
                if (progress < 100) updateProgress(100);
                finishLoading();
            }, remaining);
        } else {
            if (progress < 100) updateProgress(100);
            finishLoading();
        }
    });
})();

// ========== GAMING CROSSHAIR + PULSE CURSOR – FIXED ==========
(function() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // Create crosshair elements
        const crosshair = document.createElement('div');
        crosshair.className = 'custom-crosshair';
        crosshair.innerHTML = `
            <div class="crosshair-dot"></div>
            <div class="crosshair-line crosshair-horizontal"></div>
            <div class="crosshair-line crosshair-vertical"></div>
            <div class="crosshair-pulse"></div>
        `;
        document.body.appendChild(crosshair);

        // Move crosshair with mouse
        document.addEventListener('mousemove', function(e) {
            crosshair.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
        });

        // Add hover effect
        function addHover() { crosshair.classList.add('hover'); }
        function removeHover() { crosshair.classList.remove('hover'); }

        const elements = document.querySelectorAll('a, button, .game-card, .cta-button, .play-btn, .nav-links a, .menu-item');
        elements.forEach(function(el) {
            el.addEventListener('mouseenter', addHover);
            el.addEventListener('mouseleave', removeHover);
        });

        // Hide default cursor
        document.body.style.cursor = 'none';
    }
})();

// ========== CUSTOM RIGHT-CLICK MENU ==========
const customMenu = document.getElementById('custom-menu');
if (customMenu) {
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const x = e.clientX;
        const y = e.clientY;
        customMenu.style.left = x + 'px';
        customMenu.style.top = y + 'px';
        customMenu.classList.add('active');

        // Close menu on click outside
        const closeMenu = (e) => {
            if (!customMenu.contains(e.target)) {
                customMenu.classList.remove('active');
                document.removeEventListener('click', closeMenu);
            }
        };
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 10);
    });

    // Menu actions
    customMenu.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const action = item.dataset.action;
            switch(action) {
                case 'back': history.back(); break;
                case 'reload': location.reload(); break;
                case 'copy': navigator.clipboard.writeText(location.href); alert('Link copied!'); break;
                case 'inspect': alert('Inspect element (Ctrl+Shift+I)'); break;
                case 'games': window.location.href = 'games.html'; break;
            }
            customMenu.classList.remove('active');
        });
    });
}
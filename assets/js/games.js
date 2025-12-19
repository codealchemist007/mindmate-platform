// --- ZEN ZONE: BREATHING GAME LOGIC ---
let isBreathing = false;
let breathInterval;

window.toggleBreathing = function() {
    const btn = document.getElementById('breathBtn');
    const text = document.getElementById('breathText');
    const instruction = document.getElementById('breathInstruction');
    const circle = document.getElementById('breathCircle');
    const outer = document.getElementById('breathCircleOuter');

    if (isBreathing) {
        // STOP
        clearInterval(breathInterval);
        isBreathing = false;
        btn.innerText = "Start Session";
        text.innerText = "Ready";
        instruction.innerText = "Session paused.";
        
        // Reset Scales
        circle.className = "w-48 h-48 bg-gradient-to-br from-blue-500 to-brand rounded-full shadow-2xl flex items-center justify-center transition-all duration-[1000ms] ease-out transform scale-100 z-10 relative";
        outer.className = "absolute w-64 h-64 bg-brand/20 rounded-full blur-xl transition-all duration-[1000ms] ease-out transform scale-75";
    
    } else {
        // START
        isBreathing = true;
        btn.innerText = "Stop Session";
        runBreathCycle(); // Run immediately
        breathInterval = setInterval(runBreathCycle, 19000); // Full 4-7-8 cycle is ~19s
    }

    function runBreathCycle() {
        if (!isBreathing) return;

        // 1. INHALE (4 Seconds) - Expand & Float Up
        text.innerText = "Inhale";
        instruction.innerText = "Breathe in deeply through your nose...";
        
        // Add classes for Big Scale
        circle.classList.remove('scale-100', 'scale-75');
        circle.classList.add('scale-150'); // Grow big
        outer.classList.remove('scale-75');
        outer.classList.add('scale-150');

        setTimeout(() => {
            if (!isBreathing) return;

            // 2. HOLD (7 Seconds) - Stay Big
            text.innerText = "Hold";
            instruction.innerText = "Hold your breath...";
            
            setTimeout(() => {
                if (!isBreathing) return;

                // 3. EXHALE (8 Seconds) - Contract & Float Down
                text.innerText = "Exhale";
                instruction.innerText = "Release slowly through your mouth...";
                
                // Shrink back
                circle.classList.remove('scale-150');
                circle.classList.add('scale-75'); // Go small
                outer.classList.remove('scale-150');
                outer.classList.add('scale-75');

            }, 7000); // after Hold
        }, 4000); // after Inhale
    }
}
/* global JitsiMeetExternalAPI */

// --- 1. GLOBAL STATE & ANONYMOUS LOGIC ---
const urlParams = new URLSearchParams(window.location.search);
const isAnonymous = urlParams.get('anon') === 'true';
const loggedInUser = urlParams.get('user'); 

// Helper to generate random aliases
const aliases = ["Hidden Gem", "Silent Star", "Quiet Storm", "Mystery Guest"];
const randomAlias = aliases[Math.floor(Math.random() * aliases.length)] + "-" + Math.floor(Math.random() * 100);

let currentUser = {
    name: loggedInUser || "Guest User", 
    email: "student@college.edu",
    isAnon: false
};

if (isAnonymous) {
    currentUser = {
        name: randomAlias,
        email: "anonymous@mindmate.privacy",
        isAnon: true
    };
}

let moodChartInstance = null; // Graph Instance

// --- 2. INITIALIZATION (On Page Load) ---
document.addEventListener('DOMContentLoaded', () => {
    
    // A. Load Initial Data
    switchTab('overview');
    loadAppointments();
    loadCounselors();
    loadJournalHistory(); 
    updateMoodChart();
    
    // B. Set User Profile UI
    const inpName = document.getElementById('inpName');
    const displayFullname = document.getElementById('displayFullname');
    const userAliasDisplay = document.getElementById('userAliasDisplay');
    const inpEmail = document.getElementById('inpEmail');

    if(inpName) inpName.value = currentUser.name;
    if(displayFullname) displayFullname.innerText = currentUser.name;
    if(userAliasDisplay) userAliasDisplay.innerText = currentUser.name;
    if(inpEmail) inpEmail.value = currentUser.email;

    // Handle Anonymous UI
    if (isAnonymous) {
        const anonAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.name}`;
        if(document.getElementById('profileAvatar')) document.getElementById('profileAvatar').src = anonAvatar;
        
        const badge = document.createElement('span');
        badge.className = "bg-gray-800 text-white text-xs px-2 py-1 rounded ml-2";
        badge.innerHTML = '<i class="fas fa-user-secret"></i> Incognito';
        if(displayFullname) displayFullname.appendChild(badge);

        if(document.getElementById('editBtn')) document.getElementById('editBtn').style.display = 'none';
        if(inpName) inpName.classList.add('opacity-50', 'cursor-not-allowed');
    }

    // C. Dark Mode Toggle
    const themeToggle = document.getElementById('themeToggle');
    if(themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
        });
    }

    // D. Mobile Sidebar Logic
    const toggleBtn = document.getElementById('toggleSidebar');
    const closeBtn = document.getElementById('closeSidebarMobile');
    const sidebar = document.getElementById('sidebar');

    function toggleMenu() {
        if (!sidebar) return;
        if (window.innerWidth >= 768) {
            sidebar.classList.toggle('hidden');
        } else {
            sidebar.classList.toggle('-translate-x-full');
        }
    }

    if (toggleBtn) toggleBtn.addEventListener('click', toggleMenu);
    if (closeBtn) closeBtn.addEventListener('click', toggleMenu);
    
    // E. AI Chat Enter Key Support
    const chatInput = document.getElementById('chatInput');
    if(chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
});


// --- 3. TAB SWITCHING LOGIC ---
window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.add('hidden');
        el.classList.remove('fade-in');
    });
    
    const selectedTab = document.getElementById('tab-' + tabId);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
        setTimeout(() => selectedTab.classList.add('fade-in'), 10);
    }

    const titles = {
        'overview': 'Dashboard',
        'tracker': 'Daily Tracker',
        'chat': 'AI Chat',
        'counselor': 'Counselor Support',
        'games': 'Stress Relief',
        'profile': 'My Profile'
    };
    const pageTitle = document.getElementById('pageTitle');
    if(pageTitle) pageTitle.innerText = titles[tabId] || 'Dashboard';

    // Reload specific data when tab opens
    if (tabId === 'tracker') loadJournalHistory();
    if (tabId === 'counselor') loadAppointments();
    if (tabId === 'overview') updateMoodChart();
    
    // Close mobile menu if open
    const sidebar = document.getElementById('sidebar');
    if(sidebar && !sidebar.classList.contains('-translate-x-full') && window.innerWidth < 768) {
        sidebar.classList.add('-translate-x-full');
    }
}


// --- 4. BREATHING GAME LOGIC (NEW) ---
let breathingInterval;
let isBreathing = false;

window.toggleBreathing = function() {
    const btn = document.getElementById('breathBtn');
    const instruction = document.getElementById('breathInstruction');
    const circle = document.getElementById('breathCircle');
    const text = document.getElementById('breathText');
    const outerCircle = document.getElementById('breathCircleOuter');

    if (!isBreathing) {
        // START SESSION
        isBreathing = true;
        btn.innerText = "Stop Session";
        btn.classList.replace('bg-gray-900', 'bg-red-600'); 
        btn.classList.replace('dark:bg-white', 'dark:bg-red-500'); 
        
        runBreathCycle();
        breathingInterval = setInterval(runBreathCycle, 19000); // 4+7+8 = 19s
    } else {
        // STOP SESSION
        isBreathing = false;
        clearInterval(breathingInterval);
        
        btn.innerText = "Start Session";
        btn.classList.replace('bg-red-600', 'bg-gray-900');
        btn.classList.replace('dark:bg-red-500', 'dark:bg-white');

        instruction.innerText = "Press Start to begin...";
        text.innerText = "Ready";
        
        // Reset Styles
        circle.className = "w-64 h-64 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center z-10 transition-all duration-1000 transform scale-100 breath-transition";
        outerCircle.className = "absolute w-80 h-80 bg-blue-500/20 rounded-full blur-3xl transition-all duration-1000 scale-75 breath-transition";
    }

    function runBreathCycle() {
        if(!isBreathing) return;

        // 1. Inhale (4s)
        instruction.innerText = "Breathe In... (4s)";
        text.innerText = "Inhale";
        circle.className = "w-64 h-64 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center z-10 transition-all duration-[4000ms] transform scale-125 breath-transition";
        outerCircle.className = "absolute w-80 h-80 bg-blue-500/20 rounded-full blur-3xl transition-all duration-[4000ms] scale-125 breath-transition";

        // 2. Hold (7s)
        setTimeout(() => {
            if(!isBreathing) return;
            instruction.innerText = "Hold... (7s)";
            text.innerText = "Hold";
        }, 4000);

        // 3. Exhale (8s)
        setTimeout(() => {
            if(!isBreathing) return;
            instruction.innerText = "Breathe Out... (8s)";
            text.innerText = "Exhale";
            circle.className = "w-64 h-64 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-2xl flex items-center justify-center z-10 transition-all duration-[8000ms] transform scale-100 breath-transition";
            outerCircle.className = "absolute w-80 h-80 bg-blue-500/20 rounded-full blur-3xl transition-all duration-[8000ms] scale-75 breath-transition";
        }, 11000);
    }
}


// --- 5. BOOKING & APPOINTMENTS ---
window.bookSession = async function() {
    const topicInput = document.getElementById('apptTopic');
    const counselorSelect = document.getElementById('counselorSelect');
    
    const topic = topicInput.value;
    const counselorName = counselorSelect.value;
    const studentName = currentUser.name; 

    if (!topic || !counselorName) {
        alert("⚠️ Please enter a topic and select a counselor.");
        return;
    }

    const btn = document.querySelector('button[onclick="bookSession()"]');
    const originalText = btn.innerText;
    btn.innerText = "Sending...";
    btn.disabled = true;

    try {
        const res = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, counselorName, studentName })
        });
        const data = await res.json();
        if (data.success) {
            alert(`✅ Request Sent Successfully!`);
            topicInput.value = ''; 
            loadAppointments(); 
        } else {
            alert("❌ Error: " + data.error);
        }
    } catch (err) {
        console.error(err);
        alert("❌ Failed to connect to server.");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}

window.loadAppointments = async function() {
    const container = document.getElementById('studentApptList');
    if (!container) return;
    try {
        const response = await fetch('/api/appointments');
        const allAppointments = await response.json();
        const myAppointments = allAppointments.filter(a => a.studentName === currentUser.name);

        container.innerHTML = '';
        if (myAppointments.length === 0) {
            container.innerHTML = `<div class="text-center py-4 text-gray-400"><p class="text-sm">No appointments yet.</p></div>`;
            return;
        }

        myAppointments.slice(0, 5).forEach(appt => {
            let statusColor = 'bg-yellow-100 text-yellow-700'; 
            let icon = 'fa-clock';
            let actionArea = `<span class="${statusColor} text-[10px] px-2 py-1 rounded-full font-bold">${appt.status}</span>`;
            
            if (appt.status === 'Accepted') {
                statusColor = 'bg-green-100 text-green-700';
                icon = 'fa-check';
                const roomName = `MindMate_Session_${appt.studentName.replace(/\s/g, '')}`;
                actionArea = `<button onclick="startVideoCall('${roomName}', '${currentUser.name}')" class="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full font-bold shadow-sm animate-pulse flex items-center"><i class="fas fa-video mr-1"></i> Join Call</button>`;
            } else if (appt.status === 'Declined') {
                statusColor = 'bg-red-100 text-red-700';
                icon = 'fa-times';
                actionArea = `<span class="${statusColor} text-[10px] px-2 py-1 rounded-full font-bold">Declined</span>`;
            }

            const card = document.createElement('div');
            card.className = "flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-100 dark:border-gray-700 mb-2";
            card.innerHTML = `
                <div class="flex items-center min-w-0">
                    <div class="${statusColor} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mr-3"><i class="fas ${icon}"></i></div>
                    <div class="truncate mr-2">
                        <p class="text-sm font-bold text-gray-800 dark:text-white truncate">${appt.topic}</p>
                        <p class="text-xs text-gray-500">${appt.counselorName}</p>
                    </div>
                </div>
                <div>${actionArea}</div>
            `;
            container.appendChild(card);
        });
    } catch (error) { console.error("Error loading appointments:", error); }
}

// --- 6. AI CHAT ---
window.sendMessage = async function() {
    const input = document.getElementById('chatInput');
    const history = document.getElementById('chatHistory');
    const text = input.value.trim();
    if(!text) return;

    const userDiv = document.createElement('div');
    userDiv.className = "flex items-end justify-end mb-4";
    userDiv.innerHTML = `<div class="bg-brand text-white p-4 rounded-2xl rounded-tr-none max-w-[80%] shadow-md">${text}</div>`;
    history.appendChild(userDiv);
    input.value = "";
    history.scrollTop = history.scrollHeight;

    const loadingDiv = document.createElement('div');
    loadingDiv.id = "aiLoadingIndicator";
    loadingDiv.className = "flex items-start mb-4";
    loadingDiv.innerHTML = `<div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl rounded-tl-none text-gray-400 text-sm italic">MindMate is thinking...</div>`;
    history.appendChild(loadingDiv);
    history.scrollTop = history.scrollHeight;

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text, userName: currentUser.name })
        });
        const data = await res.json();
        loadingDiv.remove();
        
        const aiDiv = document.createElement('div');
        aiDiv.className = "flex items-start mb-4";
        aiDiv.innerHTML = `<div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl rounded-tl-none max-w-[80%] text-gray-700 dark:text-gray-200 shadow-sm">${data.reply}</div>`;
        history.appendChild(aiDiv);
        history.scrollTop = history.scrollHeight;
    } catch (err) {
        if(document.getElementById('aiLoadingIndicator')) document.getElementById('aiLoadingIndicator').remove();
        alert("AI Connection Error.");
    }
}

// --- 7. LOAD COUNSELORS ---
async function loadCounselors() {
    const container = document.getElementById('counselorList');
    const dropdown = document.getElementById('counselorSelect');
    if (!container) return; 

    try {
        const res = await fetch('/api/counselors');
        const counselors = await res.json();
        container.innerHTML = ''; 
        if (dropdown) dropdown.innerHTML = '<option value="" disabled selected>Select a Counselor</option>';

        if (counselors.length === 0) {
            container.innerHTML = `<div class="col-span-full text-center text-gray-500">No counselors available.</div>`;
            return;
        }

        counselors.forEach(doc => {
            const card = document.createElement('div');
            card.className = "bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center transition hover:shadow-md";
            card.innerHTML = `
                <div class="relative mb-4">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.name}" class="w-20 h-20 rounded-full bg-gray-100">
                    <div class="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                </div>
                <h4 class="text-lg font-bold text-gray-800 dark:text-white">${doc.name}</h4>
                <p class="text-brand text-sm font-semibold mb-1">Licensed Counselor</p>
                <button onclick="selectCounselor('${doc.name}')" class="w-full bg-brand/10 text-brand hover:bg-brand hover:text-white font-bold py-2 rounded-lg transition text-sm mt-4">Book Session</button>
            `;
            container.appendChild(card);
            if (dropdown) {
                const option = document.createElement('option');
                option.value = doc.name;
                option.innerText = doc.name;
                dropdown.appendChild(option);
            }
        });
    } catch (err) { console.error("Error loading counselors:", err); }
}

window.selectCounselor = function(name) {
    const dropdown = document.getElementById('counselorSelect');
    if(dropdown) {
        dropdown.value = name;
        dropdown.scrollIntoView({ behavior: 'smooth', block: 'center' });
        dropdown.classList.add('ring-2', 'ring-brand');
        setTimeout(() => dropdown.classList.remove('ring-2', 'ring-brand'), 1000);
    }
}

// --- 8. DAILY TRACKER ---
window.handleJournalSubmit = async function(event) {
    event.preventDefault(); 
    const textInput = document.getElementById('journalInput');
    const text = textInput.value.trim();
    if (!text) return alert("Please write something first!");

    try {
        const response = await fetch('/api/journal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, userName: currentUser.name })
        });
        const data = await response.json();
        if (data.success) {
            alert(`✅ Saved! Mood Score: ${data.score}/10`);
            textInput.value = ''; 
            loadJournalHistory(); 
            updateMoodChart();
        } else { alert("Error saving journal."); }
    } catch (error) { alert("Failed to connect to server."); }
}

window.loadJournalHistory = async function() {
    const listContainer = document.getElementById('journalList');
    if (!listContainer) return;
    try {
        const res = await fetch(`/api/journal?userName=${encodeURIComponent(currentUser.name)}`);
        const entries = await res.json();
        listContainer.innerHTML = ''; 

        if (entries.length === 0) {
            listContainer.innerHTML = '<div class="text-gray-400 text-center py-4">No entries yet. Write your first thought!</div>';
            return;
        }

        entries.forEach(entry => {
            const date = new Date(entry.createdAt).toLocaleDateString();
            let moodColor = "bg-gray-100 text-gray-600";
            if (entry.moodScore >= 7) moodColor = "bg-green-100 text-green-700";
            else if (entry.moodScore <= 3) moodColor = "bg-red-100 text-red-700";

            const card = document.createElement('div');
            card.className = "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-3";
            card.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <span class="text-xs text-gray-400">${date}</span>
                    <span class="${moodColor} px-2 py-1 rounded-full text-xs font-bold">Mood: ${entry.moodScore}/10</span>
                </div>
                <p class="text-gray-700 dark:text-gray-300 text-sm">${entry.text}</p>
            `;
            listContainer.appendChild(card);
        });
    } catch (error) { console.error("Failed to load history", error); }
}

window.clearJournalInput = function() {
    const input = document.getElementById('journalInput');
    if (input && confirm("Are you sure you want to clear your text?")) {
        input.value = "";
        input.focus(); 
    }
}

window.clearJournalHistory = async function() {
    if (!confirm("⚠️ Are you sure you want to delete ALL your mood history?")) return;
    try {
        const res = await fetch(`/api/journal?userName=${encodeURIComponent(currentUser.name)}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
            alert("✅ History deleted successfully.");
            loadJournalHistory(); 
            updateMoodChart();
        } else { alert("❌ Failed to delete history."); }
    } catch (err) { alert("Server error."); }
}

// --- 9. MOOD GRAPH ---
window.updateMoodChart = async function() {
    const ctx = document.getElementById('moodChart');
    if (!ctx) return;

    try {
        const res = await fetch(`/api/journal?userName=${encodeURIComponent(currentUser.name)}`);
        const entries = await res.json();
        const dataForGraph = entries.reverse().slice(-7); 
        const labels = dataForGraph.map(e => new Date(e.createdAt).toLocaleDateString('en-US', { weekday: 'short' }));
        const scores = dataForGraph.map(e => e.moodScore);

        if (moodChartInstance) { moodChartInstance.destroy(); }

        moodChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mood Score',
                    data: scores,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#4F46E5',
                    pointRadius: 6,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { min: 0, max: 10, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } },
                plugins: { legend: { display: false } }
            }
        });
    } catch (err) { console.error("Failed to load graph:", err); }
}


// --- 10. PROFILE & UTILS ---
window.randomizeAvatar = function() {
    if (isAnonymous) return alert("🔒 Avatar cannot be changed in Incognito mode.");
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
    const avatarImg = document.getElementById('profileAvatar');
    if (avatarImg) {
        avatarImg.src = newAvatarUrl;
        avatarImg.classList.add('animate-spin');
        setTimeout(() => avatarImg.classList.remove('animate-spin'), 500);
    }
}

window.saveProfile = function() {
    const nameInput = document.getElementById('inpName');
    const emailInput = document.getElementById('inpEmail');
    if(!nameInput.value || !emailInput.value) return alert("⚠️ Name and Email are required!");

    currentUser.name = nameInput.value;
    currentUser.email = emailInput.value;
    document.getElementById('displayFullname').innerText = currentUser.name;
    
    alert("✅ Profile updated successfully!");
}

window.logout = function() {
    if(confirm("Are you sure you want to logout?")) window.location.href = 'index.html';
}

// --- 11. VIDEO ---
let api = null;
window.startVideoCall = function(roomName, userName) {
    const domain = 'meet.jit.si';
    const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: document.querySelector('#meet'),
        userInfo: { displayName: userName },
        configOverwrite: { startWithAudioMuted: true },
        interfaceConfigOverwrite: { TOOLBAR_BUTTONS: ['microphone', 'camera', 'chat', 'tileview', 'fullscreen', 'hangup'] }
    };
    document.getElementById('videoModal').classList.remove('hidden');
    try {
        api = new JitsiMeetExternalAPI(domain, options);
        api.addEventListeners({ videoConferenceLeft: function () { endVideoCall(); } });
    } catch (e) { alert("Video call failed to start."); }
}

window.endVideoCall = function() {
    if(api) { api.dispose(); api = null; }
    document.getElementById('videoModal').classList.add('hidden');
    const container = document.querySelector('#meet');
    if(container) container.innerHTML = "";
}
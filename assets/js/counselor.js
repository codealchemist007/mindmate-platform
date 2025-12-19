/* global JitsiMeetExternalAPI */

// --- 1. GLOBAL STATE & INIT ---
const urlParams = new URLSearchParams(window.location.search);
let counselorName = urlParams.get('user') || "Dr. Strange"; 

document.addEventListener('DOMContentLoaded', () => {
    // A. Initialize Dark Mode
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    if (localStorage.getItem('theme') === 'dark') {
        html.classList.add('dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            html.classList.toggle('dark');
            localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
        });
    }

    // B. Set Profile Name in Header
    const headerName = document.getElementById('headerName');
    const welcomeName = document.getElementById('welcomeName');
    
    if(headerName) headerName.innerText = counselorName;
    if(welcomeName) welcomeName.innerText = counselorName;

    // C. Set Current Date in Banner
    const dateDisplay = document.getElementById('currentDateDisplay');
    if(dateDisplay) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.innerText = new Date().toLocaleDateString('en-US', options);
    }

    // D. Initialize Sidebar Mobile Toggle
    const toggleBtn = document.getElementById('toggleSidebar');
    const closeBtn = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    function toggleMenu() {
        if(sidebar) sidebar.classList.toggle('-translate-x-full');
        if(overlay) overlay.classList.toggle('hidden');
    }

    if(toggleBtn) toggleBtn.addEventListener('click', toggleMenu);
    if(closeBtn) closeBtn.addEventListener('click', toggleMenu);
    if(overlay) overlay.addEventListener('click', toggleMenu);

    // E. Load Initial Data
    switchTab('overview');
});


// --- 2. SWITCH TABS ---
window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));

    const activeTab = document.getElementById(`tab-${tabId}`);
    if (activeTab) activeTab.classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-emerald-50', 'text-medical', 'border-r-4', 'dark:bg-gray-700');
    });

    const activeBtn = document.getElementById(`btn-${tabId}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-emerald-50', 'text-medical', 'border-r-4', 'dark:bg-gray-700');
    }

    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        pageTitle.innerText = tabId.charAt(0).toUpperCase() + tabId.slice(1);
    }

    if(window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if(sidebar) sidebar.classList.add('-translate-x-full');
        if(overlay) overlay.classList.add('hidden');
    }

    if (tabId === 'overview' || tabId === 'requests') fetchDashboardData();
    if (tabId === 'patients') fetchPatients();
    if (tabId === 'schedule') fetchDashboardData();
};


// --- 3. MASTER DATA FETCHER (Requests, Schedule & Stats) ---
async function fetchDashboardData() {
    const requestContainer = document.getElementById('requestsContainer');
    const scheduleContainer = document.getElementById('scheduleContainer');
    const todayScheduleContainer = document.getElementById('todayScheduleContainer');
    
    try {
        const response = await fetch(`/api/appointments?counselor=${encodeURIComponent(counselorName)}`);
        
        if (!response.ok) throw new Error("Server Error");

        const allAppointments = await response.json();
        
        // --- LOGIC: Filter Data ---
        const pendingRequests = allAppointments.filter(a => a.status === 'Pending');
        const acceptedSchedule = allAppointments.filter(a => a.status === 'Accepted');
        const uniquePatients = [...new Set(acceptedSchedule.map(item => item.studentName))];

        // --- NEW: Filter for TODAY ONLY ---
        const todayStr = new Date().toLocaleDateString();
        const todaysAppointments = acceptedSchedule.filter(app => {
            // Assuming the API returns a 'date' field in local format or ISO
            // We'll try to match it broadly
            const appDate = new Date(app.date).toLocaleDateString(); 
            return appDate === todayStr; 
        });

        // --- A. UPDATE DASHBOARD STATS ---
        const statRequests = document.getElementById('statRequests');
        const statPatients = document.getElementById('statPatients');
        const statSessions = document.getElementById('statSessions');

        if (statRequests) statRequests.innerText = pendingRequests.length;
        if (statPatients) statPatients.innerText = uniquePatients.length; 
        if (statSessions) statSessions.innerText = acceptedSchedule.length;

        // --- B. UPDATE SIDEBAR BADGE ---
        const sidebarBadge = document.getElementById('sidebarRequestBadge');
        if (sidebarBadge) {
            sidebarBadge.innerText = pendingRequests.length;
            if (pendingRequests.length > 0) {
                sidebarBadge.classList.remove('hidden');
                sidebarBadge.style.display = 'inline-flex'; 
            } else {
                sidebarBadge.classList.add('hidden');
                sidebarBadge.style.display = 'none';
            }
        }

        // --- C. RENDER REQUESTS LIST ---
        if (requestContainer) {
            requestContainer.innerHTML = '';
            if (pendingRequests.length === 0) {
                requestContainer.innerHTML = `<div class="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">No new requests.</div>`;
            } else {
                pendingRequests.forEach(req => {
                    const card = document.createElement('div');
                    card.className = "bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4 flex flex-col md:flex-row items-center justify-between animate-fade-in";
                    card.innerHTML = `
                        <div class="flex items-center mb-4 md:mb-0 w-full md:w-auto">
                            <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold mr-4 text-xl shadow-sm shrink-0">
                                ${req.studentName.charAt(0)}
                            </div>
                            <div class="min-w-0">
                                <h4 class="font-bold text-gray-800 dark:text-white truncate">${req.studentName}</h4>
                                <p class="text-sm text-gray-500 dark:text-gray-400 truncate">${req.topic}</p>
                                <span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full mt-1 inline-block">Pending Review</span>
                            </div>
                        </div>
                        <div class="flex gap-2 w-full md:w-auto justify-end">
                            <button onclick="updateStatus('${req._id}', 'Accepted')" class="bg-medical hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition transform hover:scale-105 flex-1 md:flex-none">
                                Accept
                            </button>
                            <button onclick="updateStatus('${req._id}', 'Declined')" class="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-bold transition flex-1 md:flex-none">
                                Decline
                            </button>
                        </div>
                    `;
                    requestContainer.appendChild(card);
                });
            }
        }

        // --- D. RENDER SCHEDULE LIST (Full List) ---
        if (scheduleContainer) {
            scheduleContainer.innerHTML = '';
            if (acceptedSchedule.length === 0) {
                scheduleContainer.innerHTML = `<div class="text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-lg">No upcoming sessions.</div>`;
            } else {
                acceptedSchedule.forEach(appt => {
                    const roomName = `MindMate_Session_${appt.studentName.replace(/\s/g, '')}`;
                    const item = document.createElement('div');
                    item.className = "flex flex-col md:flex-row items-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-l-4 border-medical mb-4 shadow-sm transition hover:shadow-md";
                    item.innerHTML = `
                        <div class="flex-1 text-center md:text-left mb-3 md:mb-0 w-full">
                            <h4 class="font-bold text-gray-800 dark:text-white text-lg">${appt.studentName}</h4>
                            <p class="text-sm text-gray-500 dark:text-gray-400">${appt.topic}</p>
                            <p class="text-xs text-gray-400 mt-1"><i class="far fa-clock mr-1"></i> ${appt.date} at ${appt.time}</p>
                        </div>
                        <button onclick="startVideoCall('${roomName}', '${counselorName}')" class="bg-brand hover:bg-indigo-700 text-white px-6 py-2 rounded-full text-sm font-bold shadow-md transition transform hover:scale-105 flex items-center w-full md:w-auto justify-center">
                            <i class="fas fa-video mr-2"></i> Join Call
                        </button>
                    `;
                    scheduleContainer.appendChild(item);
                });
            }
        }

        // --- E. RENDER TODAY'S SCHEDULE (Overview Widget) ---
        if (todayScheduleContainer) {
            todayScheduleContainer.innerHTML = '';
            if (todaysAppointments.length === 0) {
                todayScheduleContainer.innerHTML = `
                    <div class="text-center py-10 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                        <i class="fas fa-coffee text-2xl mb-2 text-gray-300"></i>
                        <p>No sessions scheduled for today.</p>
                    </div>
                `;
            } else {
                todaysAppointments.forEach(appt => {
                    const roomName = `MindMate_Session_${appt.studentName.replace(/\s/g, '')}`;
                    const item = document.createElement('div');
                    item.className = "bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center";
                    item.innerHTML = `
                        <div>
                            <h4 class="font-bold text-gray-800 dark:text-white">${appt.studentName}</h4>
                            <p class="text-xs text-gray-500">${appt.time} • ${appt.topic}</p>
                        </div>
                        <button onclick="startVideoCall('${roomName}', '${counselorName}')" class="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-2 rounded-full hover:bg-indigo-200 transition">
                            <i class="fas fa-video"></i>
                        </button>
                    `;
                    todayScheduleContainer.appendChild(item);
                });
            }
        }

    } catch (error) {
        console.error("Error loading dashboard:", error);
        if(requestContainer) requestContainer.innerHTML = `<div class="text-red-500 text-center py-4">⚠️ Connection Error.</div>`;
    }
}


// --- 4. FETCH PATIENTS DIRECTORY ---
async function fetchPatients() {
    const patientContainer = document.getElementById('patientsContainer'); 
    if (!patientContainer) return;

    try {
        patientContainer.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">Loading patients...</div>';
        
        const response = await fetch(`/api/appointments?counselor=${encodeURIComponent(counselorName)}`);
        if (!response.ok) throw new Error("Server Error");

        const allAppointments = await response.json();

        // Only include appointments that are 'Accepted'
        const acceptedAppointments = allAppointments.filter(a => a.status === 'Accepted');
        const uniqueStudents = [...new Set(acceptedAppointments.map(item => item.studentName))];

        patientContainer.innerHTML = ''; 

        if (uniqueStudents.length === 0) {
            patientContainer.innerHTML = `<div class="col-span-full text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-lg">No active patients found. Accept a request to see them here.</div>`;
            return;
        }

        uniqueStudents.forEach(studentName => {
            const card = document.createElement('div');
            card.className = "bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl border border-gray-100 dark:border-gray-600 flex flex-col items-center text-center hover:shadow-md transition group";
            card.innerHTML = `
                <div class="relative mb-4">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${studentName}" class="w-20 h-20 rounded-full bg-white shadow-sm border-2 border-white dark:border-gray-600 group-hover:scale-110 transition">
                    <div class="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white dark:border-gray-700"></div>
                </div>
                
                <h4 class="text-lg font-bold text-gray-800 dark:text-white mb-1">${studentName}</h4>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">MindMate Student</p>
                
                <button class="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold py-2 rounded-lg hover:bg-brand hover:text-white hover:border-brand transition text-sm">
                    View History
                </button>
            `;
            patientContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Error loading patients:", error);
        patientContainer.innerHTML = `<div class="col-span-full text-red-500 text-center">Failed to load patient directory.</div>`;
    }
}


// --- 5. UPDATE STATUS (Accept/Decline) ---
window.updateStatus = async function(id, status) {
    try {
        const res = await fetch(`/api/appointments/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        if (!res.ok) throw new Error('Update failed');

        await fetchDashboardData();
        if (!document.getElementById('tab-patients')?.classList.contains('hidden')) {
            fetchPatients();
        }

    } catch (err) {
        console.error(err);
        alert('Failed to update request');
    }
};


// --- 6. VIDEO CALL LOGIC ---
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

    const modal = document.getElementById('videoModal');
    if(modal) modal.classList.remove('hidden');

    api = new JitsiMeetExternalAPI(domain, options);
    
    api.addEventListeners({
        videoConferenceLeft: function () { endVideoCall(); }
    });
}

window.endVideoCall = function() {
    if(api) {
        api.dispose();
        api = null;
    }
    const modal = document.getElementById('videoModal');
    if(modal) modal.classList.add('hidden');
    const meetContainer = document.querySelector('#meet');
    if(meetContainer) meetContainer.innerHTML = '';
}


// --- 7. UTILS ---
window.logout = function() {
    if(confirm("Sign out?")) window.location.href = 'index.html';
}

window.randomizeAvatar = function() {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
    const avatarImg = document.getElementById('profileAvatar');
    if (avatarImg) avatarImg.src = newAvatarUrl;
}

window.saveProfile = function() {
    const nameInput = document.getElementById('profileNameInput');
    const displayFullname = document.getElementById('profileNameDisplay');
    const headerName = document.getElementById('headerName');

    if (nameInput && nameInput.value) {
        if (displayFullname) displayFullname.innerText = nameInput.value;
        if (headerName) headerName.innerText = nameInput.value;
        counselorName = nameInput.value; 
    }
    alert("✅ Professional Profile Updated!");
}
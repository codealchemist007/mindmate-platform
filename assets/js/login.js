// ==========================================
// LOGIN PAGE LOGIC (Validation & Animation)
// ==========================================

function switchRole(role) {
    const userForm = document.getElementById('userForm');
    const counselorForm = document.getElementById('counselorForm');
    const btnUser = document.getElementById('btnUser');
    const btnCounselor = document.getElementById('btnCounselor');
    const slider = document.getElementById('slider');
    
    // Header Elements
    const logoBg = document.getElementById('logoBg');
    const title = document.getElementById('loginTitle');
    const sub = document.getElementById('loginSubtitle');

    if (role === 'user') {
        counselorForm.classList.add('hidden');
        counselorForm.classList.remove('fade-in');
        
        userForm.classList.remove('hidden');
        userForm.classList.add('fade-in');

        slider.style.transform = 'translateX(0%)';
        
        btnUser.classList.add('text-brand', 'dark:text-white');
        btnUser.classList.remove('text-gray-500');
        
        btnCounselor.classList.remove('text-gray-800', 'dark:text-white');
        btnCounselor.classList.add('text-gray-500');

        logoBg.className = "inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand/10 text-brand mb-4 transition-colors duration-300";
        title.innerText = "Welcome Back";
        sub.innerText = "Your personal wellness space.";

    } else {
        userForm.classList.add('hidden');
        userForm.classList.remove('fade-in');

        counselorForm.classList.remove('hidden');
        counselorForm.classList.add('fade-in');

        slider.style.transform = 'translateX(100%)';

        btnCounselor.classList.add('text-gray-800', 'dark:text-white');
        btnCounselor.classList.remove('text-gray-500');

        btnUser.classList.remove('text-brand', 'dark:text-white');
        btnUser.classList.add('text-gray-500');

        logoBg.className = "inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 mb-4 transition-colors duration-300";
        title.innerText = "Counselor Portal";
        sub.innerText = "Secure login for verified professionals.";
    }
}

function toggleAnonymous() {
    const isAnon = document.getElementById('anonToggle').checked;
    const stdFields = document.getElementById('stdLoginFields');
    const anonFields = document.getElementById('anonLoginFields');

    if (isAnon) {
        stdFields.classList.add('hidden');
        anonFields.classList.remove('hidden');
    } else {
        stdFields.classList.remove('hidden');
        anonFields.classList.add('hidden');
    }
}

function handleLogin(role) {
    // 1. VALIDATION CHECK
    if (!validateInputs(role)) return;

    // 2. PROCEED IF VALID
    localStorage.setItem('userRole', role);

    const btn = event.currentTarget;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Authenticating...';
    btn.disabled = true;
    btn.classList.add('opacity-75', 'cursor-not-allowed');

    setTimeout(() => {
        if (role === 'user') {
            const isAnon = document.getElementById('anonToggle').checked;
            
            if (isAnon) {
                const alias = document.getElementById('anonAlias').value;
                localStorage.setItem('mindMateUser', alias);
            } else {
                // In a real app, this comes from backend
                localStorage.setItem('mindMateUser', 'Himanshu'); 
            }
            window.location.href = 'dashboard.html';
            
        } else {
            localStorage.setItem('mindMateUser', 'Dr. Smith');
            window.location.href = 'counselor.html';
        }
    }, 1500);
}

// Validation Helper
function validateInputs(role) {
    if (role === 'user') {
        const isAnon = document.getElementById('anonToggle').checked;
        if (isAnon) {
            const alias = document.getElementById('anonAlias').value.trim();
            if (!alias) {
                alert("Please enter an Alias.");
                return false;
            }
        } else {
            const email = document.getElementById('userEmail').value.trim();
            const pass = document.getElementById('userPass').value.trim();
            if (!email || !pass) {
                alert("Please enter both Email and Password.");
                return false;
            }
        }
    } else {
        // Counselor Validation
        const id = document.getElementById('docId').value.trim();
        const email = document.getElementById('docEmail').value.trim();
        const pass = document.getElementById('docPass').value.trim();
        
        if (!id || !email || !pass) {
            alert("Please fill in all professional credentials.");
            return false;
        }
    }
    return true;
}
// 1. INITIALIZE SUPABASE CONNECTION
const SUPABASE_URL = 'https://vtyowngyqwqfuxjflyzf.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eW93bmd5cXdxZnV4amZseXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTIxNTYsImV4cCI6MjA4NzQyODE1Nn0.2iTY_sSLO4N6GEW6hWVXJ9KqEzRRjAIPr2gMqKCiFmQ';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * AUTH LOGIC: Manage Login, Signup, and Logout
 */

// Handle User Signup
async function handleSignUp() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    if (!email || !password) return alert("Please enter both email and password.");

    const { error } = await _supabase.auth.signUp({ email, password });
    if (error) alert("Signup Error: " + error.message);
    else alert("Signup successful! You can now log in.");
}

// Handle User Signin
async function handleSignIn() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    
    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Login Error: " + error.message);
    else checkUser(); 
}

// Handle Logout
async function handleSignOut() {
    await _supabase.auth.signOut();
    location.reload(); 
}

// Check if a user is logged in on page load
async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();
    
    const authContainer = document.getElementById('auth-container');
    const appContent = document.getElementById('app-content');
    const userDisplay = document.getElementById('user-display');

    if (user) {
        authContainer.style.display = 'none';
        appContent.style.display = 'flex';
        userDisplay.innerText = "Logged in as: " + user.email;
        fetchMessages(); 
    } else {
        authContainer.style.display = 'flex';
        appContent.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', checkUser);

/**
 * MESSAGE LOGIC: Send, Fetch, and Resolve Drama
 */

async function sendMessage() {
    const recipientInput = document.getElementById('recipient');
    const messageInput = document.getElementById('message');
    const { data: { user } } = await _supabase.auth.getUser();
    
    const recipient = recipientInput.value.trim();
    const message = messageInput.value.trim();

    if (recipient === "" || message === "") {
        alert("Wait! Both fields are required.");
        return;
    }

    const { error } = await _supabase
        .from('drama_reports')
        .insert([
            { 
                recipient: recipient, 
                message: message, 
                sender_name: user.email, // Now linked to the real user!
                is_resolved: false 
            }
        ]);

    if (error) {
        alert("Failed to send: " + error.message);
    } else {
        recipientInput.value = "";
        messageInput.value = "";
        fetchMessages(); 
    }
}

async function fetchMessages() {
    const messagesList = document.getElementById('messages-list');
    const emptyMsg = document.getElementById('empty-inbox-msg');

    const { data: reports, error } = await _supabase
        .from('drama_reports')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching data:", error.message);
        return;
    }

    if (reports.length > 0) {
        emptyMsg.style.display = "none";
        messagesList.innerHTML = ""; 

        reports.forEach(report => {
            const resolvedClass = report.is_resolved ? 'resolved' : '';
            
            const messageHtml = `
                <div class="message-item ${resolvedClass}">
                    <p><strong>To: ${report.recipient}</strong></p>
                    <p>"${report.message}"</p>
                    <div class="reveal-section">
                        ${report.is_resolved 
                            ? `<p class="resolution-text">✅ Drama Resolved</p>` 
                            : `<button class="see-mad-btn" onclick="revealIdentity(this, '${report.sender_name}', '${report.id}')">See who's mad</button>`
                        }
                        <div class="post-reveal-actions" style="display:none;">
                            <p>Sent by: <strong>${report.sender_name}</strong> 💩</p>
                            <button class="sorry-btn" onclick="resolveDrama(this, '${report.id}', 'apology')">Say Sorry & Close</button>
                            <button class="talk-btn" onclick="resolveDrama(this, '${report.id}', 'talk')">Let's Talk</button>
                        </div>
                    </div>
                </div>
            `;
            messagesList.insertAdjacentHTML('beforeend', messageHtml);
        });
    } else {
        emptyMsg.style.display = "block";
        messagesList.innerHTML = "";
    }
}

function revealIdentity(button, senderName, reportId) {
    const actionsDiv = button.nextElementSibling;
    button.style.display = "none";
    actionsDiv.style.display = "block";
}

async function resolveDrama(button, reportId, type) {
    if (type === 'apology') {
        const { error } = await _supabase
            .from('drama_reports')
            .update({ is_resolved: true })
            .eq('id', reportId);

        if (error) {
            console.error("Update error:", error.message);
        } else {
            fetchMessages(); 
        }
    } else {
        alert("Talk request simulated!");
    }
}
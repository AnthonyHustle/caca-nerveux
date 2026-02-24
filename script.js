// 1. INITIALIZE SUPABASE CONNECTION
// We use the keys you found in Project Settings > API
const SUPABASE_URL = 'https://vtyowngyqwqfuxjflyzf.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0eW93bmd5cXdxZnV4amZseXpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTIxNTYsImV4cCI6MjA4NzQyODE1Nn0.2iTY_sSLO4N6GEW6hWVXJ9KqEzRRjAIPr2gMqKCiFmQ';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * STARTUP: This runs as soon as the page loads
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log("Caca Nerveux App is online!");
    fetchMessages(); // We immediately download existing drama
});

/**
 * SEND: Function to save a "Caca Nerveux" to the cloud
 */
async function sendMessage() {
    const recipientInput = document.getElementById('recipient');
    const messageInput = document.getElementById('message');
    
    const recipient = recipientInput.value.trim();
    const message = messageInput.value.trim();

    if (recipient === "" || message === "") {
        alert("Wait! Both fields are required.");
        return;
    }

    // Sending data to Supabase table 'drama_reports'
    const { data, error } = await _supabase
        .from('drama_reports')
        .insert([
            { 
                recipient: recipient, 
                message: message, 
                sender_name: "Anonymous Colleague", // This is our secret
                is_resolved: false 
            }
        ]);

    if (error) {
        console.error("Error sending to Supabase:", error.message);
        alert("Failed to send: " + error.message);
    } else {
        // Clear inputs and refresh the list
        recipientInput.value = "";
        messageInput.value = "";
        fetchMessages(); 
    }
}

/**
 * FETCH: Downloads all drama reports from the database
 */
async function fetchMessages() {
    const messagesList = document.getElementById('messages-list');
    const emptyMsg = document.getElementById('empty-inbox-msg');

    // Get all rows from 'drama_reports', newest first
    const { data: reports, error } = await _supabase
        .from('drama_reports')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching data:", error.message);
        return;
    }

    // If there are reports, hide the empty message
    if (reports.length > 0) {
        emptyMsg.style.display = "none";
        messagesList.innerHTML = ""; // Clear current list before redrawing

        // Draw each report on the screen
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
    }
}

/**
 * REVEAL: Shows the identity section
 */
function revealIdentity(button, senderName, reportId) {
    const actionsDiv = button.nextElementSibling;
    button.style.display = "none";
    actionsDiv.style.display = "block";
}

/**
 * RESOLVE: Updates the database when someone says sorry
 */
async function resolveDrama(button, reportId, type) {
    const messageItem = button.closest('.message-item');

    if (type === 'apology') {
        // UPDATE the row in Supabase
        const { error } = await _supabase
            .from('drama_reports')
            .update({ is_resolved: true })
            .eq('id', reportId);

        if (error) {
            console.error("Update error:", error.message);
        } else {
            fetchMessages(); // Refresh UI to show it's resolved
        }
    } else {
        alert("Talk request simulated!");
    }
}
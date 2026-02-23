/**
 * Sends the drama report to the inbox
 */
function sendMessage() {
    const recipientInput = document.getElementById('recipient');
    const messageInput = document.getElementById('message');
    const messagesList = document.getElementById('messages-list');
    const emptyMsg = document.getElementById('empty-inbox-msg');

    const name = recipientInput.value.trim();
    const text = messageInput.value.trim();

    if (name === "" || text === "") {
        alert("Please fill in both fields!");
        return;
    }

    // Hide placeholder
    emptyMsg.style.display = "none";

    // Create message with identity trapped in the function call
    const messageHtml = `
        <div class="message-item">
            <p><strong>Anonymous Drama Alert:</strong></p>
            <p>"${text}"</p>
            <div class="reveal-section">
                <button class="see-mad-btn" onclick="revealIdentity(this, '${name}')">See who's mad</button>
                
                <div class="post-reveal-actions" style="display:none;">
                    <p>Sent by: <strong>${name}</strong> 💩</p>
                    <button class="sorry-btn" onclick="resolveDrama(this, 'apology')">Say Sorry & Close</button>
                    <button class="talk-btn" onclick="resolveDrama(this, 'talk')">Let's Talk</button>
                </div>
            </div>
        </div>
    `;

    messagesList.insertAdjacentHTML('afterbegin', messageHtml);
    recipientInput.value = "";
    messageInput.value = "";
}

/**
 * Reveals the hidden identity section
 */
function revealIdentity(button, name) {
    const actionsDiv = button.nextElementSibling;
    button.style.display = "none";
    actionsDiv.style.display = "block";
}

/**
 * Closes the conflict
 */
function resolveDrama(button, type) {
    const messageItem = button.closest('.message-item');
    const actionsDiv = button.parentElement;

    if (type === 'apology') {
        actionsDiv.innerHTML = `<p class="resolution-text">✅ Apology sent. Case closed.</p>`;
        messageItem.classList.add('resolved');
    } else {
        actionsDiv.innerHTML = `<p class="resolution-text">💬 Meeting request sent to the reporter.</p>`;
        messageItem.style.borderLeftColor = "var(--slack-blue)";
    }
}
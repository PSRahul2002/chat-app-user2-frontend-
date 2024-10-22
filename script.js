document.addEventListener("DOMContentLoaded", function() {
    // Declare WebSocket and currentUserId in the global scope
    let currentUserId = 1;  // Change to 2 for User2
    let ws = new WebSocket(`wss://chat-app-backend-2-9wz8.onrender.com/ws/${currentUserId}`);

    // Show the delete button for User1
    if (currentUserId === 1) {
        document.getElementById("deleteUser2Messages").style.display = "block";
    }

    // Function to append messages to the message list
    function appendMessage(userId, messageText, currentUserId) {
        let messages = document.getElementById('messages');
        let message = document.createElement('div');
        message.className = 'message';

        // Determine if the message is from the current user or another user
        if (userId === currentUserId) {
            message.classList.add('you');  // Apply 'you' class for the current user
            message.textContent = `You: ${messageText}`;  // Show 'You' for current user's messages
        } else {
            message.classList.add('other');  // Apply 'other' class for other users
            let username = userId === 1 ? 'User1' : 'User2';  // Map user_id to "User1" or "User2"
            message.textContent = `${username}: ${messageText}`;  // Show 'User1' or 'User2' for others
        }

        // Append the message to the messages container
        messages.appendChild(message);
        
        // Scroll to the latest message
        messages.scrollTop = messages.scrollHeight;
    }

    // Handle sending messages
    function sendMessage() {
        let input = document.getElementById("messageText");
        let message = input.value;

        if (message) {
            // Display the message on the page before sending it
            appendMessage(currentUserId, message, currentUserId);  // Show 'You' for the current user's message

            // Send the message via WebSocket
            ws.send(JSON.stringify({ user_id: currentUserId, message }));

            // Clear the input field
            input.value = '';
        }
    }

    // WebSocket message handler to receive messages from the server
    ws.onmessage = function(event) {
        try {
            let messageData = JSON.parse(event.data);  // Parse the incoming message
            console.log("Received WebSocket message:", messageData);  // Debug log

            // If the action is "refresh", clear the chat and reload the page
            if (messageData.action === "refresh") {
                console.log("Received 'refresh' action, clearing chat and reloading page...");
                
                // Clear the chat messages from the frontend
                document.getElementById('messages').innerHTML = '';  // Clear message container
                
                // Optionally reload the page to reflect the cleared state
                location.reload();  // Reload the page
            } else {
                // Otherwise, treat it as a normal chat message
                appendMessage(messageData.user_id, messageData.message, currentUserId);
            }
        } catch (e) {
            console.error("Error parsing WebSocket message:", e);
        }
    };

    // Add event listener for 'Enter' key press on the input field
    document.getElementById('messageText').addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();  // Prevent form submission
            sendMessage();  // Calls sendMessage, which should be inside DOMContentLoaded
        }
    });

    // Add event listener for the Send button
    document.getElementById("sendButton").addEventListener("click", function() {
        sendMessage();  // Calls sendMessage, which should be inside DOMContentLoaded
    });

    // Delete User2's messages
    function deleteUser2Messages() {
        fetch('https://chat-app-backend-2-9wz8.onrender.com/delete_user2_messages?user_id=1', {  // Ensure the correct URL
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();  // Parse the JSON response
        })
        .then(data => {
            console.log("Delete request successful:", data);  // Log success
        })
        .catch(error => {
            console.error("Error deleting messages:", error);
        });
    }
});

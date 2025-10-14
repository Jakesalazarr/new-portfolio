// ==========================================
// CHATAI - INTELLIGENT CHAT INTERFACE
// ==========================================

// State Management
let currentChatId = null;
let chats = [];
let messages = [];

// Mock AI Responses
const mockResponses = [
    "That's a great question! Let me help you with that...",
    "I understand what you're asking. Here's my take on this...",
    "Based on my understanding, I can provide you with the following insights...",
    "That's an interesting topic! Let me break this down for you...",
    "I'd be happy to help you with that. Here's what I think...",
    "Great question! From my perspective...",
    "Let me analyze that for you...",
    "That's a fascinating subject! Here's my understanding...",
];

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadChatsFromStorage();
    autoResizeTextarea();
});

function initializeApp() {
    showWelcomeScreen();
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function setupEventListeners() {
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const newChatBtn = document.getElementById('newChatBtn');
    const menuToggle = document.getElementById('menuToggle');

    // Message input
    messageInput.addEventListener('input', () => {
        sendBtn.disabled = !messageInput.value.trim();
        autoResizeTextarea();
    });

    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Send button
    sendBtn.addEventListener('click', sendMessage);

    // New chat button
    newChatBtn.addEventListener('click', createNewChat);

    // Mobile menu toggle
    menuToggle?.addEventListener('click', toggleSidebar);
}

function autoResizeTextarea() {
    const textarea = document.getElementById('messageInput');
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');

    // Create/remove overlay
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.addEventListener('click', toggleSidebar);
        document.body.appendChild(overlay);
    }
    overlay.classList.toggle('show');
}

// ==========================================
// CHAT MANAGEMENT
// ==========================================

function createNewChat() {
    currentChatId = generateId();
    messages = [];
    showWelcomeScreen();
    updateChatHistory();
}

function generateId() {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function showWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const messagesContainer = document.getElementById('messagesContainer');

    welcomeScreen.classList.remove('hidden');
    messagesContainer.classList.add('hidden');
    messagesContainer.innerHTML = '';
}

function hideWelcomeScreen() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const messagesContainer = document.getElementById('messagesContainer');

    welcomeScreen.classList.add('hidden');
    messagesContainer.classList.remove('hidden');
}

// ==========================================
// MESSAGE HANDLING
// ==========================================

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();

    if (!messageText) return;

    // Create new chat if needed
    if (!currentChatId) {
        currentChatId = generateId();
    }

    // Hide welcome screen
    hideWelcomeScreen();

    // Add user message
    addMessage('user', messageText);

    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    document.getElementById('sendBtn').disabled = true;

    // Show typing indicator
    showTypingIndicator();

    // Simulate AI response
    setTimeout(() => {
        hideTypingIndicator();
        const aiResponse = generateAIResponse(messageText);
        addMessage('ai', aiResponse);
        saveChatsToStorage();
    }, 1500 + Math.random() * 1000);
}

function addMessage(role, text) {
    const message = { role, text, timestamp: Date.now() };
    messages.push(message);

    renderMessage(message);
    scrollToBottom();

    // Update chat history
    updateChatHistory();
}

function renderMessage(message) {
    const messagesContainer = document.getElementById('messagesContainer');

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.role}`;

    const avatarSvg = message.role === 'user'
        ? `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
             <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-width="2"/>
             <circle cx="12" cy="7" r="4" stroke-width="2"/>
           </svg>`
        : `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
             <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" stroke-width="2"/>
             <path d="M9 12l2 2 4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
           </svg>`;

    messageDiv.innerHTML = `
        <div class="message-avatar">${avatarSvg}</div>
        <div class="message-content">
            <div class="message-role">${message.role === 'user' ? 'You' : 'ChatAI'}</div>
            <div class="message-text">${formatMessageText(message.text)}</div>
        </div>
    `;

    messagesContainer.appendChild(messageDiv);
}

function formatMessageText(text) {
    // Basic markdown-like formatting
    let formatted = text
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');

    // Handle code blocks
    formatted = formatted.replace(/```(\w+)?\n([\s\S]+?)```/g, (match, lang, code) => {
        return `<pre><code>${code.trim()}</code></pre>`;
    });

    return `<p>${formatted}</p>`;
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('messagesContainer');

    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" stroke-width="2"/>
                <path d="M9 12l2 2 4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <div class="message-content">
            <div class="message-role">ChatAI</div>
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;

    messagesContainer.appendChild(typingDiv);
    scrollToBottom();
}

function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function scrollToBottom() {
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// ==========================================
// AI RESPONSE GENERATION
// ==========================================

function generateAIResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    // Context-aware responses
    if (lowerMessage.includes('code') || lowerMessage.includes('function') || lowerMessage.includes('python')) {
        return generateCodeResponse(userMessage);
    }

    if (lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('how')) {
        return generateExplanationResponse(userMessage);
    }

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi ') || lowerMessage.includes('hey')) {
        return "Hello! I'm ChatAI, your AI assistant. How can I help you today?";
    }

    // Default response with context
    const baseResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    return `${baseResponse}\n\nYou asked: "${userMessage}"\n\nThis is a demo response. In a production environment, I would provide a detailed, contextual answer using advanced AI models. For now, I'm showcasing the interface and user experience of an AI chat application.`;
}

function generateCodeResponse(userMessage) {
    return `I'd be happy to help you with code! Here's an example response:\n\n\`\`\`python\ndef example_function(param):\n    \\"\\"\\"Example function\\"\\"\\""\n    result = param * 2\n    return result\n\n# Usage\noutput = example_function(5)\nprint(output)  # Output: 10\n\`\`\`\n\nThis is a mock response to demonstrate code formatting. In a real implementation, I would provide specific, contextual code based on your exact requirements.`;
}

function generateExplanationResponse(userMessage) {
    return `Great question! Let me explain:\n\n**Key Points:**\n- This is a demonstration of an AI chat interface\n- The UI mimics modern chat applications like ChatGPT\n- Real AI integration would provide detailed, accurate responses\n- This showcases clean design and user experience\n\nIn a production environment, I would provide comprehensive explanations with examples, diagrams, and follow-up suggestions tailored to your specific question.`;
}

// ==========================================
// CHAT HISTORY
// ==========================================

function updateChatHistory() {
    if (!currentChatId || messages.length === 0) return;

    // Find or create chat in history
    let chat = chats.find(c => c.id === currentChatId);

    if (!chat) {
        chat = {
            id: currentChatId,
            title: generateChatTitle(messages[0].text),
            timestamp: Date.now(),
            messages: []
        };
        chats.unshift(chat);
    }

    chat.messages = [...messages];
    chat.timestamp = Date.now();

    renderChatHistory();
    saveChatsToStorage();
}

function generateChatTitle(firstMessage) {
    const maxLength = 30;
    if (firstMessage.length <= maxLength) {
        return firstMessage;
    }
    return firstMessage.substring(0, maxLength) + '...';
}

function renderChatHistory() {
    const todayChats = document.getElementById('todayChats');
    const weekChats = document.getElementById('weekChats');

    todayChats.innerHTML = '';
    weekChats.innerHTML = '';

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;

    chats.forEach(chat => {
        const age = now - chat.timestamp;
        const chatItem = createChatHistoryItem(chat);

        if (age < oneDay) {
            todayChats.appendChild(chatItem);
        } else if (age < oneWeek) {
            weekChats.appendChild(chatItem);
        }
    });
}

function createChatHistoryItem(chat) {
    const item = document.createElement('div');
    item.className = 'history-item';
    if (chat.id === currentChatId) {
        item.classList.add('active');
    }

    item.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke-width="2"/>
        </svg>
        <span>${chat.title}</span>
    `;

    item.addEventListener('click', () => loadChat(chat.id));

    return item;
}

function loadChat(chatId) {
    const chat = chats.find(c => c.id === chatId);
    if (!chat) return;

    currentChatId = chatId;
    messages = [...chat.messages];

    hideWelcomeScreen();

    const messagesContainer = document.getElementById('messagesContainer');
    messagesContainer.innerHTML = '';

    messages.forEach(message => renderMessage(message));

    renderChatHistory();
    scrollToBottom();

    // Close sidebar on mobile
    if (window.innerWidth <= 1024) {
        toggleSidebar();
    }
}

// ==========================================
// SUGGESTIONS
// ==========================================

function selectSuggestion(suggestionText) {
    const messageInput = document.getElementById('messageInput');
    messageInput.value = suggestionText;
    document.getElementById('sendBtn').disabled = false;
    messageInput.focus();
}

// Make function available globally
window.selectSuggestion = selectSuggestion;

// ==========================================
// STORAGE
// ==========================================

function saveChatsToStorage() {
    try {
        localStorage.setItem('chatai_chats', JSON.stringify(chats));
        localStorage.setItem('chatai_current_chat', currentChatId);
    } catch (error) {
        console.error('Error saving to storage:', error);
    }
}

function loadChatsFromStorage() {
    try {
        const savedChats = localStorage.getItem('chatai_chats');
        const savedCurrentChat = localStorage.getItem('chatai_current_chat');

        if (savedChats) {
            chats = JSON.parse(savedChats);
            renderChatHistory();
        }

        if (savedCurrentChat && chats.find(c => c.id === savedCurrentChat)) {
            loadChat(savedCurrentChat);
        }
    } catch (error) {
        console.error('Error loading from storage:', error);
    }
}

// ==========================================
// RESPONSIVE HANDLING
// ==========================================

window.addEventListener('resize', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (window.innerWidth > 1024) {
        sidebar.classList.remove('open');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }
});

// ==========================================
// CONSOLE MESSAGE
// ==========================================

console.log('%c💬 Welcome to ChatAI!', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%cThis is a demo AI chat interface - Part of Fullstack Portfolio', 'font-size: 12px; color: #94a3b8;');
console.log('%cIn production, this would connect to real AI APIs (OpenAI, Anthropic, etc.)', 'font-size: 12px; color: #94a3b8;');

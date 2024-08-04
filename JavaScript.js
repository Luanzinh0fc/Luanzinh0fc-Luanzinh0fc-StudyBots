const responses = {
    greetings: [
        'Olá! Eu sou o StudyBot, criado pela Equipe StudyTask.',
        'Oi! Eu sou o StudyBot, desenvolvido pela Equipe StudyTask.',
        'Oi, tudo bem? Eu sou o StudyBot, da Equipe StudyTask.',
        'Olá! Sou o StudyBot e estou aqui para te ajudar, desenvolvido pela Equipe StudyTask.'
    ],
    askForSubject: 'Por favor, digite o nome da matéria que você deseja.',
    listSubjects: 'Aqui estão algumas matérias que você pode escolher: Português, Redações de Português, Inglês, Matemática, Ciências da Natureza, Ciências Humanas, Educação Física, Qualificação Profissional',
    forwardingMessages: [
        'Estou encaminhando você direto para lá agora. Bons estudos!',
        'Ok. Encaminhando você para a matéria agora. Bons estudos!',
        'Estou te levando para a matéria. Bons estudos!',
        'Encaminhando você para a matéria. Boa sorte!',
        'Levando você para a página da matéria. Aproveite!'
    ],
    subjects: {
        'português': 'https://sites.google.com/view/studytask-gov/portugu%C3%AAs-3bimestre?authuser=0',
        'redações de português': 'https://sites.google.com/view/studytask-gov/todas-as-reda%C3%A7%C3%B5es-3bimestre?authuser=0',
        'inglês': 'https://sites.google.com/view/studytask-gov/ingl%C3%AAs-3-bimestre?authuser=0',
        'matemática': 'https://sites.google.com/view/studytask-gov/matem%C3%A1tica-3bimestre?authuser=0',
        'ciências da natureza': 'https://sites.google.com/view/studytask-gov/ci%C3%AAncias-da-natureza-3bimestre?authuser=0',
        'ciências humanas': 'https://sites.google.com/view/studytask-gov/ci%C3%AAncias-humanas-3bimestre?authuser=0',
        'educação física': 'https://sites.google.com/view/studytask-gov/educa%C3%A7%C3%A3o-f%C3%ADsica-3bimestre?authuser=0',
        'educação e empreendedorismo': 'https://sites.google.com/view/studytask-gov/educa%C3%A7%C3%A3o-empreendedorismo-3bimestre?authuser=0'
    }
};

const greetingVariations = [
    'oi', 'olá', 'ola', 'oii', 'oiii', 'oi!', 'olá!', 'ola!', 'oii!', 'oiii!',
    'bom dia', 'boa tarde', 'boa noite', 'e aí', 'eaí', 'eai', 'eae',
    'salve', 'alô', 'alo', 'olá, bot', 'oi, bot', 'bom dia, bot', 'boa tarde, bot', 'boa noite, bot'
];

const deleteVariations = [
    'excluir conversas', 'apagar conversas', 'deletar conversas', 'remover conversas',
    'limpar conversas', 'excluir mensagens', 'apagar mensagens', 'deletar mensagens',
    'remover mensagens', 'limpar mensagens', 'excluir histórico', 'apagar histórico',
    'deletar histórico', 'remover histórico', 'limpar histórico', 'excluir chat',
    'apagar chat', 'deletar chat', 'remover chat', 'limpar chat'
];

let hasGreeted = false;
const userInputElement = document.getElementById('user-input');
const messagesContainer = document.getElementById('messages');

// Event Listeners
window.onload = loadMessages;
userInputElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') sendMessage();
});
document.getElementById('microphone-icon').addEventListener('click', startRecognition);

// Main Function to Send Message
function sendMessage() {
    const userInput = userInputElement.value.toLowerCase().trim();
    if (userInput === '') return;

    addMessage(userInput, 'user');
    userInputElement.value = '';

    if (isDeleteCommand(userInput)) {
        handleDeleteCommand();
        return;
    }

    if (!hasGreeted && greetingVariations.includes(userInput)) {
        handleGreeting();
    } else {
        handleSubjectRequest(userInput);
    }

    saveMessages();
}

// Handle Delete Command
function handleDeleteCommand() {
    addMessage('Ok, irei excluir as nossas conversas.', 'bot', true);
    setTimeout(() => {
        clearMessages();
    }, 2000);
}

// Handle Greeting
function handleGreeting() {
    hasGreeted = true;
    const response = getRandomItem(responses.greetings);
    showBotMessages([response, responses.askForSubject], typeSubjects);
}

// Handle Subject Request
function handleSubjectRequest(userInput) {
    const subjectKeys = Object.keys(responses.subjects);
    const subject = findClosestSubject(userInput, subjectKeys);

    if (subject) {
        const forwardingMessage = getRandomItem(responses.forwardingMessages);
        showBotMessages([forwardingMessage], () => {
            setTimeout(() => {
                window.location.href = responses.subjects[subject];
            }, 3000);
        });
    } else {
        showBotMessages([responses.askForSubject], typeSubjects);
    }
}

// Utility Functions
function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function showBotMessages(messages, callback) {
    addTypingAnimation();
    let index = 0;

    function showNextMessage() {
        removeTypingAnimation();
        if (index < messages.length) {
            addMessage(messages[index], 'bot', true);
            index++;
            setTimeout(() => {
                addTypingAnimation();
                setTimeout(showNextMessage, 1000);
            }, 1000);
        } else if (callback) {
            callback();
        }
    }

    setTimeout(showNextMessage, 1000);
}

function isDeleteCommand(input) {
    return deleteVariations.some(variation => calculateSimilarity(input, variation) > 0.7);
}

function typeSubjects() {
    const subjects = responses.listSubjects.split(': ')[1].split(', ');
    let index = 0;

    function showNextSubject() {
        if (index < subjects.length) {
            typeMessage(subjects[index], 'bot', () => {
                setTimeout(() => {
                    deleteLastMessage();
                    index++;
                    setTimeout(showNextSubject, 1000);
                }, 2000);
            });
        }
    }

    showNextSubject();
}

function typeMessage(text, sender, callback) {
    const messageElement = createMessageElement(sender);
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    let index = 0;

    function typeNextChar() {
        if (index < text.length) {
            messageElement.querySelector('.message-content').textContent += text.charAt(index);
            index++;
            requestAnimationFrame(typeNextChar);
        } else if (callback) {
            callback();
        }
    }

    requestAnimationFrame(typeNextChar);
}

function addMessage(text, sender, animated = false) {
    const messageElement = createMessageElement(sender, text, animated);
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function createMessageElement(sender, text = '', animated = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    if (animated) {
        messageContent.classList.add('animated-message');
    }
    messageContent.textContent = text;
    messageElement.appendChild(messageContent);
    return messageElement;
}

function addTypingAnimation() {
    const typingElement = createMessageElement('bot');
    const typingContent = document.createElement('div');
    typingContent.classList.add('typing-animation');
    typingElement.appendChild(typingContent);
    typingElement.id = 'typing-animation';
    messagesContainer.appendChild(typingElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingAnimation() {
    const typingElement = document.getElementById('typing-animation');
    if (typingElement) {
        typingElement.remove();
    }
}

function deleteLastMessage() {
    const lastMessage = messagesContainer.lastElementChild;
    if (lastMessage) {
        lastMessage.classList.add('fading-out');
        setTimeout(() => {
            messagesContainer.removeChild(lastMessage);
        }, 1000);
    }
}

function findClosestSubject(input, subjects) {
    let closestMatch = null;
    let highestSimilarity = 0;

    subjects.forEach(subject => {
        const similarity = calculateSimilarity(input, subject);
        if (similarity > highestSimilarity) {
            highestSimilarity = similarity;
            closestMatch = subject;
        }
    });

    return highestSimilarity > 0.5 ? closestMatch : null;
}

function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(str1, str2) {
    const costs = [];
    for (let i = 0; i <= str1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= str2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (str1.charAt(i - 1) !== str2.charAt(j - 1)) {
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    }
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) {
            costs[str2.length] = lastValue;
        }
    }
    return costs[str2.length];
}

function saveMessages() {
    localStorage.setItem('chatMessages', messagesContainer.innerHTML);
}

function loadMessages() {
    messagesContainer.innerHTML = localStorage.getItem('chatMessages') || '';
}

function clearMessages() {
    messagesContainer.innerHTML = '';
    localStorage.removeItem('chatMessages');
}

function startRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInputElement.value = transcript;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
    };

    recognition.onend = () => {
        console.log('Speech recognition service disconnected');
    };

    recognition.start();
}
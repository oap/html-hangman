// app.js

// Variables to store game state
let wordList = [];
let selectedWord = '';
let guessedLetters = [];
let wrongGuesses = 0;
const maxWrongGuesses = 6;
let gameOver = false;
let won = false;

// Word lists for different languages
const wordLists = {
  english: ['apple', 'banana', 'cherry', 'orange', 'grape', 'strawberry', 'watermelon', 'pineapple', 'mango', 'blueberry'],
  german: ['apfel', 'banane', 'kirsche', 'orange', 'traube', 'erdbeere', 'wassermelone', 'ananas', 'mango', 'blaubeere'],
  greek: ['μήλο', 'μπανάνα', 'κεράσι', 'πορτοκάλι', 'σταφύλι', 'φράουλα', 'καρπούζι', 'ανανάς', 'μάνγκο', 'μύρτιλο'],
  french: ['pomme', 'banane', 'cerise', 'orange', 'raisin', 'fraise', 'pastèque', 'ananas', 'mangue', 'myrtille'],
};

// Keyboard layouts for different languages
const keyboardLayouts = {
  english: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  german: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß',
  greek: 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ',
  french: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÂÇÉÈÊËÎÏÔÙÛÜŸ',
};

// Stages array includes only the parts added after wrong guesses
const stages = [
  // Head
  `<circle cx="140" cy="70" r="20" stroke="black" stroke-width="4" fill="none"/>`,
  // Body
  `<line x1="140" y1="90" x2="140" y2="150" stroke="black" stroke-width="4"/>`,
  // Left Arm
  `<line x1="140" y1="110" x2="120" y2="130" stroke="black" stroke-width="4"/>`,
  // Right Arm
  `<line x1="140" y1="110" x2="160" y2="130" stroke="black" stroke-width="4"/>`,
  // Left Leg
  `<line x1="140" y1="150" x2="120" y2="190" stroke="black" stroke-width="4"/>`,
  // Right Leg
  `<line x1="140" y1="150" x2="160" y2="190" stroke="black" stroke-width="4"/>`,
];

// Base elements drawn at game start
const baseElements = `
  <!-- Base, Pole, Beam, Rope -->
  <line x1="20" y1="230" x2="180" y2="230" stroke="black" stroke-width="4"/>
  <line x1="60" y1="230" x2="60" y2="20" stroke="black" stroke-width="4"/>
  <line x1="60" y1="20" x2="140" y2="20" stroke="black" stroke-width="4"/>
  <line x1="140" y1="20" x2="140" y2="50" stroke="black" stroke-width="4"/>
`;

// DOM Elements
const languageSelect = document.getElementById('language-select');
const screens = {
  home: document.getElementById('home-screen'),
  game: document.getElementById('game-screen'),
  wordList: document.getElementById('word-list-screen'),
  instructions: document.getElementById('instructions-screen'),
};

const startGameBtn = document.getElementById('start-game-btn');
const editWordListBtn = document.getElementById('edit-word-list-btn');
const instructionsBtn = document.getElementById('instructions-btn');
const saveWordListBtn = document.getElementById('save-word-list-btn');
const resetWordListBtn = document.getElementById('reset-word-list-btn');
const backBtn = document.getElementById('back-btn');
const backFromInstructionsBtn = document.getElementById('back-from-instructions-btn');
const homeBtn = document.getElementById('home-btn');
const playAgainBtn = document.getElementById('play-again-btn');

const wordListInput = document.getElementById('word-list-input');
const wordContainer = document.getElementById('word-container');
const keyboardContainer = document.getElementById('keyboard-container');
const hangmanDrawing = document.getElementById('hangman-drawing');
const resultMessage = document.getElementById('result-message');
const messageContainer = document.getElementById('message-container'); // For non-intrusive messages

// Event Listeners
startGameBtn.addEventListener('click', startGame);
editWordListBtn.addEventListener('click', () => showScreen('wordList'));
instructionsBtn.addEventListener('click', () => showScreen('instructions'));
saveWordListBtn.addEventListener('click', saveWordList);
resetWordListBtn.addEventListener('click', resetWordList);
backBtn.addEventListener('click', () => showScreen('home'));
backFromInstructionsBtn.addEventListener('click', () => showScreen('home'));
homeBtn.addEventListener('click', () => showScreen('home'));
playAgainBtn.addEventListener('click', startGame);
languageSelect.addEventListener('change', (e) => {
  selectedLanguage = e.target.value;
  loadWordList();
  wordListInput.value = wordList.join('\n');
});

// Initialize the game
init();

function init() {
  selectedLanguage = languageSelect.value;
  loadWordList();
  showScreen('home');
}

function showScreen(screenName) {
  Object.values(screens).forEach((screen) => screen.classList.remove('active'));
  screens[screenName].classList.add('active');

  if (screenName === 'wordList') {
    languageSelect.value = selectedLanguage;
    wordListInput.value = wordList.join('\n');
  }

  // Remove the result message when navigating away from the game screen
  if (screenName !== 'game') {
    resultMessage.textContent = '';
    resultMessage.classList.remove('win', 'lose');
  }
}

function loadWordList() {
  // Attempt to load the word list from localStorage for the selected language
  const storedWordList = localStorage.getItem(`wordList_${selectedLanguage}`);
  // If the word list has one or more words, parse the JSON string
  if (storedWordList && JSON.parse(storedWordList).length > 0) {
    wordList = JSON.parse(storedWordList);
  } else {
    // Use the default word list for the selected language
    wordList = wordLists[selectedLanguage] || [];
    wordListInput.value = wordList.join('\n');
    saveWordList(); // Save to localStorage
  }
}

function saveWordList() {
  const words = wordListInput.value.split('\n').map((word) => word.trim()).filter((word) => word);
  wordList = words;
  localStorage.setItem(`wordList_${selectedLanguage}`, JSON.stringify(wordList));
  // Provide user feedback without using alert
  displayMessage('Word list saved.', 'success');
}

function resetWordList() {
  if (confirm('Are you sure you want to reset the word list?')) {
    wordList = wordLists[selectedLanguage] || [];
    saveWordList();
    wordListInput.value = wordList.join('\n');
    displayMessage('Word list reset to default.', 'success');
  }
}

function startGame() {
  loadWordList(); // Load word list for the selected language

  if (wordList.length === 0) {
    // Use default word list for the selected language
    wordList = wordLists[selectedLanguage] || [];
    saveWordList();
    displayMessage('The word list was empty. Using default words for the selected language.', 'info');
  }

  if (wordList.length === 0) {
    displayMessage('The word list is empty. Please add some words first.', 'error');
    showScreen('wordList');
    return;
  }

  guessedLetters = [];
  wrongGuesses = 0;
  selectedWord = wordList[Math.floor(Math.random() * wordList.length)];
  localStorage.setItem('selectedWord', selectedWord);
  localStorage.setItem('guessedLetters', JSON.stringify(guessedLetters));
  localStorage.setItem('wrongGuesses', wrongGuesses);
  localStorage.setItem('selectedLanguage', selectedLanguage);

  // Reset the game state flags
  gameOver = false;
  won = false;

  // Reset the result message
  resultMessage.textContent = '';
  resultMessage.classList.remove('win', 'lose');

  showScreen('game');
  drawHangman(); // Draw base elements at game start
  displayWord();
  createKeyboard();
}

function getUniqueLettersFromWordList() {
  const lettersSet = new Set();
  wordList.forEach((word) => {
    word.split('').forEach((char) => {
      if (char.trim() !== '') {
        lettersSet.add(char.toLowerCase());
      }
    });
  });
  return Array.from(lettersSet).sort((a, b) => a.localeCompare(b));
}

function createKeyboard() {
  keyboardContainer.innerHTML = '';
  const keyboardLayout = keyboardLayouts[selectedLanguage] || 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const uniqueLetters = keyboardLayout.split('');

  uniqueLetters.forEach((letter) => {
    const keyButton = document.createElement('button');
    keyButton.textContent = letter;
    keyButton.classList.add('key');
    keyButton.disabled = guessedLetters.includes(letter.toLowerCase());
    keyButton.addEventListener('click', () => handleGuess(letter.toLowerCase(), keyButton));
    keyboardContainer.appendChild(keyButton);
  });
}

function handleGuess(letter, keyButton) {
  guessedLetters.push(letter);
  keyButton.disabled = true;

  if (selectedWord.toLowerCase().includes(letter)) {
    displayWord();
  } else {
    wrongGuesses++;
    drawHangman();
  }

  localStorage.setItem('guessedLetters', JSON.stringify(guessedLetters));
  localStorage.setItem('wrongGuesses', wrongGuesses);
}

function displayWord() {
  wordContainer.innerHTML = '';
  const wordArray = selectedWord.split('');
  wordArray.forEach((letter) => {
    const letterElement = document.createElement('span');
    letterElement.classList.add('letter');
    if (guessedLetters.includes(letter.toLowerCase())) {
      letterElement.textContent = letter;
    } else if (letter.trim() === '') {
      letterElement.textContent = ' ';
    } else {
      letterElement.textContent = '_';
    }
    wordContainer.appendChild(letterElement);
  });

  checkWin();
}

function drawHangman() {
  let drawingContent = baseElements; // Always include base elements

  if (gameOver && !won) {
    // Player lost, draw full hangman
    stages.forEach((stage) => {
      drawingContent += stage;
    });
  } else {
    // Draw up to current wrong guesses
    for (let i = 0; i < wrongGuesses && i < stages.length; i++) {
      drawingContent += stages[i];
    }
  }

  hangmanDrawing.innerHTML = drawingContent;

  if (wrongGuesses >= maxWrongGuesses && !gameOver) {
    hangmanDrawing.classList.add('lose');
    endGame(false);
  }
}

function checkWin() {
  const wordArray = selectedWord.split('');
  const allGuessed = wordArray.every((letter) => {
    return guessedLetters.includes(letter.toLowerCase()) || letter.trim() === '';
  });

  if (allGuessed) {
    endGame(true);
  }
}

function endGame(playerWon) {
  gameOver = true;
  won = playerWon;
  if (playerWon) {
    resultMessage.textContent = 'Congratulations! You Won!';
    resultMessage.classList.add('win');
    resultMessage.classList.remove('lose');
    // Draw the free man
    drawFreeMan();
  } else {
    resultMessage.textContent = `Game Over! The word was: ${selectedWord}`;
    resultMessage.classList.add('lose');
    resultMessage.classList.remove('win');
    // Draw the full hangman
    drawHangman();
  }

  // Disable all remaining keys
  const keys = document.querySelectorAll('.key');
  keys.forEach((key) => (key.disabled = true));

  // Clear saved progress
  localStorage.removeItem('selectedWord');
  localStorage.removeItem('guessedLetters');
  localStorage.removeItem('wrongGuesses');
  localStorage.removeItem('selectedLanguage');
}

function drawFreeMan() {
  // Clear the hangman drawing
  hangmanDrawing.innerHTML = '';

  // Draw the ground
  let drawingContent = '';
  drawingContent += `<line x1="20" y1="230" x2="180" y2="230" stroke="black" stroke-width="4"/>`;

  // Draw the free man
  drawingContent += `
    <!-- Free Man -->
    <circle cx="100" cy="70" r="20" stroke="green" stroke-width="4" fill="none"/>
    <line x1="100" y1="90" x2="100" y2="150" stroke="green" stroke-width="4"/>
    <line x1="100" y1="110" x2="80" y2="90" stroke="green" stroke-width="4"/>
    <line x1="100" y1="110" x2="120" y2="90" stroke="green" stroke-width="4"/>
    <line x1="100" y1="150" x2="80" y2="190" stroke="green" stroke-width="4"/>
    <line x1="100" y1="150" x2="120" y2="190" stroke="green" stroke-width="4"/>
    <!-- Hooray Text -->
    <text x="50" y="220" fill="green" font-size="16">Hooray! You won!</text>
  `;

  hangmanDrawing.innerHTML = drawingContent;
}

// Function to display messages to the user without using alert
function displayMessage(message, type) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', type); // 'type' can be 'success', 'error', or 'info'
  messageElement.textContent = message;
  messageContainer.appendChild(messageElement);

  // Remove the message after a few seconds
  setTimeout(() => {
    messageElement.remove();
  }, 3000);
}

// Load progress from localStorage
function loadProgress() {
  const savedWord = localStorage.getItem('selectedWord');
  const savedGuessedLetters = JSON.parse(localStorage.getItem('guessedLetters'));
  const savedWrongGuesses = parseInt(localStorage.getItem('wrongGuesses'));
  const savedLanguage = localStorage.getItem('selectedLanguage');

  if (savedWord && savedGuessedLetters && !isNaN(savedWrongGuesses) && savedLanguage) {
    selectedWord = savedWord;
    guessedLetters = savedGuessedLetters;
    wrongGuesses = savedWrongGuesses;
    selectedLanguage = savedLanguage;
    loadWordList(); // Ensure word list is loaded for the saved language
    showScreen('game');
    drawHangman();
    displayWord();
    createKeyboard();
  }
}

window.addEventListener('load', loadProgress);

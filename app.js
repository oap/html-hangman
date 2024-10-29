// app.js

// Variables to store game state
let wordList = [];
let selectedWord = '';
let guessedLetters = [];
let wrongGuesses = 0;
const maxWrongGuesses = 6; // Adjusted to 6
let gameOver = false;
let won = false;

// Stages array now includes only the parts added after wrong guesses
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
  `<line x1="140" y1="150" x2="160" y2="190" stroke="black" stroke-width="4"/>`
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

// Initialize the game
init();

function init() {
  loadWordList();
  showScreen('home');
}

function showScreen(screenName) {
  Object.values(screens).forEach(screen => screen.classList.remove('active'));
  screens[screenName].classList.add('active');

  if (screenName === 'wordList') {
    wordListInput.value = wordList.join('\n');
  }

  // Remove the result message when navigating away from the game screen
  if (screenName !== 'game') {
    resultMessage.textContent = '';
    resultMessage.classList.remove('win', 'lose');
  }
}

function loadWordList() {
  const storedWordList = localStorage.getItem('wordList');
  if (storedWordList) {
    wordList = JSON.parse(storedWordList);
  } else {
    wordList = ['example', 'hangman', 'javascript'];
    saveWordList();
  }
}

function saveWordList() {
  const words = wordListInput.value.split('\n').map(word => word.trim()).filter(word => word);
  wordList = words;
  localStorage.setItem('wordList', JSON.stringify(wordList));
  alert('Word list saved.');
}

function resetWordList() {
  if (confirm('Are you sure you want to reset the word list?')) {
    wordList = ['example', 'hangman', 'javascript'];
    saveWordList();
    wordListInput.value = wordList.join('\n');
  }
}

function startGame() {
  if (wordList.length === 0) {
    alert('The word list is empty. Please add some words first.');
    showScreen('wordList');
    return;
  }

  guessedLetters = [];
  wrongGuesses = 0;
  selectedWord = wordList[Math.floor(Math.random() * wordList.length)].toLowerCase();
  localStorage.setItem('selectedWord', selectedWord);
  localStorage.setItem('guessedLetters', JSON.stringify(guessedLetters));
  localStorage.setItem('wrongGuesses', wrongGuesses);

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

function displayWord() {
  wordContainer.innerHTML = '';
  const wordArray = selectedWord.split('');
  wordArray.forEach(letter => {
    const letterElement = document.createElement('span');
    letterElement.classList.add('letter');
    if (guessedLetters.includes(letter)) {
      letterElement.textContent = letter;
    } else {
      letterElement.textContent = '_';
    }
    wordContainer.appendChild(letterElement);
  });

  checkWin();
}

function createKeyboard() {
  keyboardContainer.innerHTML = '';
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';

  alphabet.split('').forEach(letter => {
    const keyButton = document.createElement('button');
    keyButton.textContent = letter;
    keyButton.classList.add('key');
    keyButton.disabled = guessedLetters.includes(letter);
    keyButton.addEventListener('click', () => handleGuess(letter, keyButton));
    keyboardContainer.appendChild(keyButton);
  });
}

function handleGuess(letter, keyButton) {
  guessedLetters.push(letter);
  keyButton.disabled = true;

  if (selectedWord.includes(letter)) {
    displayWord();
  } else {
    wrongGuesses++;
    drawHangman();
  }

  localStorage.setItem('guessedLetters', JSON.stringify(guessedLetters));
  localStorage.setItem('wrongGuesses', wrongGuesses);
}

function drawHangman() {
  let drawingContent = baseElements; // Always include base elements

  if (gameOver && !won) {
    // Player lost, draw full hangman
    stages.forEach(stage => {
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
  const allGuessed = wordArray.every(letter => guessedLetters.includes(letter));

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
  keys.forEach(key => key.disabled = true);

  // Clear saved progress
  localStorage.removeItem('selectedWord');
  localStorage.removeItem('guessedLetters');
  localStorage.removeItem('wrongGuesses');
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

// Load progress from localStorage
function loadProgress() {
  const savedWord = localStorage.getItem('selectedWord');
  const savedGuessedLetters = JSON.parse(localStorage.getItem('guessedLetters'));
  const savedWrongGuesses = parseInt(localStorage.getItem('wrongGuesses'));

  if (savedWord && savedGuessedLetters && !isNaN(savedWrongGuesses)) {
    selectedWord = savedWord;
    guessedLetters = savedGuessedLetters;
    wrongGuesses = savedWrongGuesses;
    showScreen('game');
    drawHangman();
    displayWord();
    createKeyboard();
  }
}

window.addEventListener('load', loadProgress);

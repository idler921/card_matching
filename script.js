console.log('Script start');

let AIRTABLE_API_KEY;  // Will be loaded dynamically
const AIRTABLE_BASE_ID = 'appc3j9gdtQsGKbNR';
const AIRTABLE_TABLE_ID = 'tblfoPLeTul6HacCf';
const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

const allCards = [
    '飯盒', '盒飯',
    '睇波', '看球',
    '魚蛋', '魚丸子',
    '起樓', '蓋房子',
    '飲茶', '喝茶',
    '食飯', '吃飯',
    '睇戲', '看電影',
    '行街', '逛街',
    '啫喱', '果凍',
    '雞翼', '雞翅',
    '雞髀', '雞腿',
    '多士', '烤麵包片',
    '吹BB', '吹哨子',
    '羅宋湯', '俄國紅菜湯',
    '睇燈飾', '看燈飾',
    '燒火雞', '烤火雞',
    '忌廉湯', '奶油湯',
    '布甸', '布丁',
    '沙律', '沙拉',
];

console.log('allCards loaded, length: ' + allCards.length);

let cards = [];
let flippedCards = [];
let matchedCards = [];
let failedCount = 0;
let startTime = null;
let timerInterval = null;
let isHard = false;
let hasPeeked = false;
const matchPhrases = ["耶！", "做得好", "加油", "棒極了", "太好了"];
const wrongPhrases = ["唔緊要", "下次努力", "再試下", "加油", "別灰心", "不要氣餒"];

console.log('Variables initialized');

function shuffle(array) {
    console.log('Shuffle called with array length: ' + array.length);
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    console.log('Shuffle done');
}

function setDifficulty(numPairs) {
    console.log('setDifficulty called with ' + numPairs);
    isHard = (numPairs === 8);
    const totalPairs = allCards.length / 2;
    numPairs = Math.min(numPairs, totalPairs);
    let pairIndices = Array.from({length: totalPairs}, (_, i) => i);
    shuffle(pairIndices);
    let selectedPairs = pairIndices.slice(0, numPairs);
    cards = [];
    selectedPairs.forEach(pairIndex => {
        cards.push(allCards[pairIndex * 2], allCards[pairIndex * 2 + 1]);
    });
    shuffle(cards);
    console.log('cards set to ' + cards.length + ' items');
    restartGame();
}

function restartGame() {
    console.log('restartGame called');
    flippedCards = [];
    matchedCards = [];
    failedCount = 0;
    startTime = null;
    hasPeeked = false;
    if (timerInterval) clearInterval(timerInterval);
    document.getElementById('pairs-list').innerHTML = '';
    updateCounts();
    updateTimer();
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    console.log('Board cleared');
    createBoard();
}

function createBoard() {
    const board = document.getElementById('game-board');
    const cols = 4;
    const rows = cards.length / cols;
    board.style.gridTemplateColumns = `repeat(${cols}, 120px)`;
    board.style.gridTemplateRows = `repeat(${rows}, 120px)`;
    console.log('Creating board with ' + cards.length + ' cards, ' + rows + ' rows');
    cards.forEach(word => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.word = word;
        card.addEventListener('click', flipCard);
        board.appendChild(card);
    });
    console.log('Board created');
}

function flipCard() {
    console.log('flipCard called on card with word: ' + this.dataset.word);
    if (flippedCards.length < 2 && !this.classList.contains('flipped') && !matchedCards.includes(this)) {
        console.log('Flipping card');
        if (!startTime) {
            startTime = Date.now();
            timerInterval = setInterval(updateTimer, 1000);
        }
        this.classList.add('flipped');
        this.textContent = this.dataset.word;
        flippedCards.push(this);
        if (flippedCards.length === 2) {
            setTimeout(checkMatch, 500);
        }
    } else {
        console.log('Card not flipped, condition failed');
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;
    const word1 = card1.dataset.word;
    const word2 = card2.dataset.word;
    if (isMatch(word1, word2)) {
        matchedCards.push(card1, card2);
        addMatchedPair(word1, word2);
        updateCounts();
        flippedCards = [];
        showFeedback(matchPhrases[Math.floor(Math.random() * matchPhrases.length)]);
        if (matchedCards.length === cards.length) {
            clearInterval(timerInterval);
            setTimeout(() => {
                alert('Congratulations! You matched all cards.');
                const name = prompt('Enter your name for the leaderboard:');
                if (name) {
                    const time = Math.floor((Date.now() - startTime) / 1000);
                    const difficulty = cards.length / 2;  // Number of pairs
                    saveRecord(name, time, difficulty, failedCount);
                }
            }, 1000);
        }
    } else {
        failedCount++;
        updateCounts();
        showFeedback(wrongPhrases[Math.floor(Math.random() * wrongPhrases.length)], () => {
            card1.classList.remove('flipped');
            card1.textContent = '';
            card2.classList.remove('flipped');
            card2.textContent = '';
            flippedCards = [];
        });
    }
}

function isMatch(word1, word2) {
    for (let i = 0; i < allCards.length; i += 2) {
        const a = allCards[i];
        const b = allCards[i + 1];
        if ((a === word1 && b === word2) || (a === word2 && b === word1)) {
            return true;
        }
    }
    return false;
}

function addMatchedPair(word1, word2) {
    const list = document.getElementById('pairs-list');
    const li = document.createElement('li');
    li.textContent = `${word1} = ${word2}`;
    list.appendChild(li);
}

function updateCounts() {
    document.getElementById('matched-count').textContent = matchedCards.length / 2;
    document.getElementById('failed-count').textContent = failedCount;
}

function updateTimer() {
    if (!startTime) {
        document.getElementById('timer').textContent = '00:00';
        return;
    }
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    document.getElementById('timer').textContent = `${minutes}:${seconds}`;
}

function showFeedback(message, callback) {
    const bubble = document.getElementById('speech-bubble');
    bubble.textContent = message;
    bubble.style.display = 'block';
    setTimeout(() => {
        bubble.style.display = 'none';
        if (callback) callback();
    }, 500);
}

// Airtable API functions
async function loadApiKey() {
    try {
        const response = await fetch('http://idler.hk/airtable.txt');
        if (response.ok) {
            AIRTABLE_API_KEY = await response.text();
            console.log('API key loaded successfully');
        } else {
            console.error('Failed to load API key:', response.statusText);
        }
    } catch (error) {
        console.error('Error loading API key:', error);
    }
}
async function saveRecord(name, time, difficulty, failedCount) {
    const record = {
        fields: {
            Name: name,
            Datetime: new Date().toISOString(),
            Difficulty: difficulty,
            'Play Second': time,
            'Failed Attempt': failedCount
        }
    };
    try {
        const response = await fetch(AIRTABLE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(record)
        });
        if (response.ok) {
            console.log('Record saved successfully');
        } else {
            console.error('Failed to save record:', response.statusText);
        }
    } catch (error) {
        console.error('Error saving record:', error);
    }
}

async function loadRecords() {
    try {
        const response = await fetch(`${AIRTABLE_URL}?sort[0][field]=Play Second&sort[0][direction]=asc`, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            return data.records.map(record => record.fields);
        } else {
            console.error('Failed to load records:', response.statusText);
            return [];
        }
    } catch (error) {
        console.error('Error loading records:', error);
        return [];
    }
}

function peek() {
    const allCardsElements = document.querySelectorAll('.card');
    allCardsElements.forEach(card => {
        if (!card.classList.contains('flipped')) {
            card.classList.add('flipped');
            card.textContent = card.dataset.word;
        }
    });
    setTimeout(() => {
        allCardsElements.forEach(card => {
            if (!matchedCards.includes(card)) {
                card.classList.remove('flipped');
                card.textContent = '';
            }
        });
    }, 3000);
}

document.getElementById('doll-body').addEventListener('click', () => {
    if (!isHard && !hasPeeked && !startTime) {
        peek();
        hasPeeked = true;
    }
});

console.log('Slider element:', document.getElementById('difficulty-slider'));
document.getElementById('difficulty-slider').addEventListener('input', (e) => {
    console.log('Slider input event');
    const numPairs = parseInt(e.target.value);
    let label = 'Easy';
    if (numPairs === 6) label = 'Intermediate';
    else if (numPairs === 8) label = 'Hard';
    console.log('Setting label to ' + label);
    document.getElementById('difficulty-label').textContent = label;
    setDifficulty(numPairs);
});

console.log('Calling setDifficulty(4)');
setDifficulty(4);

console.log('Script end');

// Load leaderboard on page load
window.addEventListener('load', async () => {
    await loadApiKey();  // Load API key first
    testAirtable();  // Test connection
    const records = await loadRecords();
    updateLeaderboard(records);
});

// Leaderboard functions
function updateLeaderboard(records) {
    const list = document.getElementById('records-list');
    list.innerHTML = records.slice(0, 10).map(r => `<li>${r.Name}: ${r['Play Second']}s (${r.Difficulty} pairs, ${r['Failed Attempt']} fails) - ${new Date(r.Datetime).toLocaleString()}</li>`).join('');
}

document.getElementById('leaderboard-link').addEventListener('click', async (e) => {
    e.preventDefault();
    const records = await loadRecords();
    updateLeaderboard(records);
    document.getElementById('leaderboard-modal').style.display = 'flex';
});

document.getElementById('close-leaderboard').addEventListener('click', () => {
    document.getElementById('leaderboard-modal').style.display = 'none';
});
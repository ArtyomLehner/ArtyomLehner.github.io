let gameStarted = false;
let currentPlayer = 'O';
let timer;
let boardSize;
let winCondition;
let scoreX = 0;
let scoreO = 0;
let matchCount = 0;
let constantMatch = false;
let timeLeft;
let isUnlimited = false;
let isTurnAllowed = true;
let friendlyMatch = false;
let isGameEnded = false;
let isProcessingClick = false;
let playerNickname = 'Игрок';
let player1Nickname = 'Игрок 1';
let player2Nickname = 'Игрок 2';

const menu = document.getElementById('menu');
const gameOptions = document.getElementById('gameOptions');
const settings = document.getElementById('settings');
const records = document.getElementById('records');
const gameField = document.getElementById('gameField');
const timerDisplay = document.getElementById('timer');
const board = document.getElementById('board');
const scoreDisplay = document.getElementById('score');
const winnerMessage = document.getElementById('winnerMessage');
const endMatchButton = document.getElementById('endMatch');
const playerInfo = document.getElementById('playerInfo');
const nicknameInput = document.getElementById('nicknameInput');
const nicknamesInput = document.getElementById('nicknamesInput');
const playerNicknameInput = document.getElementById('playerNickname');
const player1NicknameInput = document.getElementById('player1Nickname');
const player2NicknameInput = document.getElementById('player2Nickname');
const saveNickname = document.getElementById('saveNickname');
const saveNicknames = document.getElementById('saveNicknames');
const ratedGameButton = document.getElementById('ratedGame');

document.getElementById('startButton').addEventListener('click', () => {
    menu.classList.add('hidden');
    if (friendlyMatch) {
        nicknamesInput.classList.remove('hidden');
    } else {
        nicknameInput.classList.remove('hidden');
    }
});

saveNickname.addEventListener('click', () => {
    playerNickname = playerNicknameInput.value || 'Игрок';
    localStorage.setItem('ticTacToeNickname', playerNickname);
    gameOptions.classList.remove('hidden');
    nicknameInput.classList.add('hidden');
});

saveNicknames.addEventListener('click', () => {
    player1Nickname = player1NicknameInput.value || 'Игрок 1';
    player2Nickname = player2NicknameInput.value || 'Игрок 2';
    localStorage.setItem('ticTacToePlayer1Nickname', player1Nickname);
    localStorage.setItem('ticTacToePlayer2Nickname', player2Nickname);
    gameOptions.classList.remove('hidden');
    nicknamesInput.classList.add('hidden');
});

document.getElementById('settingsButton').addEventListener('click', () => {
    menu.classList.add('hidden');
    settings.classList.remove('hidden');
});

document.getElementById('recordsButton').addEventListener('click', () => {
    menu.classList.add('hidden');
    records.classList.remove('hidden');
    loadRecords();
});

document.getElementById('backToMenu').addEventListener('click', () => {
    saveSettings();
    settings.classList.add('hidden');
    menu.classList.remove('hidden');
});

document.getElementById('backToMenuFromRecords').addEventListener('click', () => {
    records.classList.add('hidden');
    menu.classList.remove('hidden');
});

document.getElementById('backToMenuFromGameOptions').addEventListener('click', () => {
    saveSettings();
    gameOptions.classList.add('hidden');
    nicknameInput.classList.add('hidden');
    nicknamesInput.classList.add('hidden');
    menu.classList.remove('hidden');
});

document.getElementById('nonRatedGame').addEventListener('click', startGame);
document.getElementById('ratedGame').addEventListener('click', function() {
    if (friendlyMatch) {
        alert('Рейтинговый матч недоступен в дружеском режиме');
    } else {
        startGame();
    }
});

document.getElementById('constantMatch').addEventListener('change', function() {
    constantMatch = this.checked;
    saveSettings();
});

document.getElementById('friendlyMatch').addEventListener('change', function() {
    friendlyMatch = this.checked;
    saveSettings();
    ratedGameButton.style.display = friendlyMatch ? 'none' : 'block';
});

function loadSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('ticTacToeSettings')) || {};
    
    if (savedSettings.timeOption) {
        document.getElementById('timeSelect').value = savedSettings.timeOption;
    }
    if (savedSettings.fieldSize) {
        document.getElementById('fieldSize').value = savedSettings.fieldSize;
    }
    if (savedSettings.constantMatch) {
        document.getElementById('constantMatch').checked = savedSettings.constantMatch;
        constantMatch = savedSettings.constantMatch;
    }
    if (savedSettings.friendlyMatch) {
        document.getElementById('friendlyMatch').checked = savedSettings.friendlyMatch;
        friendlyMatch = savedSettings.friendlyMatch;
        ratedGameButton.style.display = friendlyMatch ? 'none' : 'block';
    }

    const savedNickname = localStorage.getItem('ticTacToeNickname');
    if (savedNickname) playerNickname = savedNickname;
    playerNicknameInput.value = playerNickname;

    const savedPlayer1Nickname = localStorage.getItem('ticTacToePlayer1Nickname');
    if (savedPlayer1Nickname) player1Nickname = savedPlayer1Nickname;
    player1NicknameInput.value = player1Nickname;

    const savedPlayer2Nickname = localStorage.getItem('ticTacToePlayer2Nickname');
    if (savedPlayer2Nickname) player2Nickname = savedPlayer2Nickname;
    player2NicknameInput.value = player2Nickname;
}

function saveSettings() {
    const timeOption = document.getElementById('timeSelect').value;
    const fieldSize = document.getElementById('fieldSize').value;
    const constantMatch = document.getElementById('constantMatch').checked;
    const friendlyMatch = document.getElementById('friendlyMatch').checked;

    const settings = {
        timeOption,
        fieldSize,
        constantMatch,
        friendlyMatch
    };

    localStorage.setItem('ticTacToeSettings', JSON.stringify(settings));
}

function startGame() {
    const timeOption = document.getElementById('timeSelect').value;
    boardSize = parseInt(document.getElementById('fieldSize').value);
    winCondition = (boardSize <= 5) ? 3 : 5;
    isGameEnded = false;

    gameOptions.classList.add('hidden');
    nicknameInput.classList.add('hidden');
    nicknamesInput.classList.add('hidden');
    gameField.classList.remove('hidden');
    createBoard(boardSize);

    if (timeOption !== 'infinity') {
        timerDisplay.classList.remove('hidden');
        startTimer(timeOption);
    } else {
        timerDisplay.classList.add('hidden');
        isUnlimited = true;
    }
}

window.onload = loadSettings;

function createBoard(size) {
    board.innerHTML = '';
    boardSize = size;
    board.style.setProperty('--board-size', boardSize);

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', () => {
            if (!isProcessingClick) {
                handleCellClick(cell);
            }
        });
        board.appendChild(cell);
    }

    currentPlayer = friendlyMatch ? 'X' : 'O';
    gameStarted = true;
    isTurnAllowed = true;
    isProcessingClick = false;

    if (!friendlyMatch) {
        playerInfo.textContent = `"X" - Бот | "O" - ${playerNickname}`;
        playerInfo.classList.remove('hidden');
    } else {
        playerInfo.textContent = `"X" - ${player1Nickname} (Ход) | "O" - ${player2Nickname}`;
        playerInfo.classList.remove('hidden');
    }
}

function endGame(winner) {
    isGameEnded = true;
    clearInterval(timer);
    timer = null;
    gameStarted = false;

    if (winner === 'player') {
        winnerMessage.textContent = "Победа!";
        winnerMessage.className = 'winner-message green';
        updateScore('O');
    } else if (winner === 'bot') {
        winnerMessage.textContent = "Поражение =(";
        winnerMessage.className = 'winner-message red';
        updateScore('X');
    } else if (winner === 'timeout') {
        if (friendlyMatch) {
            if (scoreO > scoreX) {
                winnerMessage.textContent = `Победитель: ${player2Nickname}`;
                winnerMessage.className = 'winner-message green';
            } else if (scoreX > scoreO) {
                winnerMessage.textContent = `Победитель: ${player1Nickname}`;
                winnerMessage.className = 'winner-message green';
            } else {
                winnerMessage.textContent = "Ничья!";
                winnerMessage.className = 'winner-message';
            }
        } else {
            if (scoreO > scoreX) {
                winnerMessage.textContent = "Победа!";
                winnerMessage.className = 'winner-message green';
            } else if (scoreX > scoreO) {
                winnerMessage.textContent = "Поражение =(";
                winnerMessage.className = 'winner-message red';
            } else {
                winnerMessage.textContent = "Ничья!";
                winnerMessage.className = 'winner-message';
            }
        }
    } else {
        winnerMessage.textContent = "Ничья!";
        winnerMessage.className = 'winner-message';
    }
    winnerMessage.style.display = 'flex';

    setTimeout(() => {
        if (constantMatch && winner !== 'timeout') {
            resetOrContinueGame();
        } else {
            resetGame();
        }
        winnerMessage.style.display = 'none';
    }, 3000);
}

async function handleCellClick(cell) {
    if (!gameStarted || cell.textContent || !isTurnAllowed || isGameEnded || isProcessingClick) return;

    isProcessingClick = true;

    const symbol = currentPlayer;
    const color = currentPlayer === 'O' ? 'rgba(0, 0, 192, 0.5)' : 'rgba(194, 0, 0, 0.5)';
    const finalColor = currentPlayer === 'O' ? 'rgb(0, 0, 192)' : 'rgb(194, 0, 0)';

    for (let i = 0; i < 3; i++) {
        cell.style.backgroundColor = color;
        await new Promise(resolve => setTimeout(resolve, 100));
        cell.style.backgroundColor = '';
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const playerSymbol = document.createElement('span');
    playerSymbol.textContent = symbol;
    cell.appendChild(playerSymbol);
    cell.classList.add(symbol === 'O' ? 'player' : 'bot');
    cell.style.color = 'white';
    cell.style.backgroundColor = finalColor;

    if (checkWin(symbol)) {
        endGame(symbol === 'O' ? 'player' : friendlyMatch ? 'player1' : 'bot');
        isProcessingClick = false;
        return;
    }

    if (isBoardFull()) {
        endGame();
        isProcessingClick = false;
        return;
    }

    if (friendlyMatch) {
        currentPlayer = currentPlayer === 'O' ? 'X' : 'O';
        playerInfo.textContent = currentPlayer === 'O' 
            ? `"X" - ${player1Nickname} | "O" - ${player2Nickname} (Ход)` 
            : `"X" - ${player1Nickname} (Ход) | "O" - ${player2Nickname}`;
        isProcessingClick = false;
    } else {
        isTurnAllowed = false;
        currentPlayer = 'X';
        setTimeout(() => {
            if (!isGameEnded) {
                botMove();
            }
            isProcessingClick = false;
        }, 1000);
    }
}

async function botMove() {
    if (isGameEnded) return;

    const cells = document.querySelectorAll('.cell');
    let emptyCells = Array.from(cells).filter(cell => !cell.textContent);

    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];

        for (let i = 0; i < 3; i++) {
            randomCell.style.backgroundColor = 'rgba(194, 0, 0, 0.5)';
            await new Promise(resolve => setTimeout(resolve, 100));
            randomCell.style.backgroundColor = '';
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        const botSymbol = document.createElement('span');
        botSymbol.textContent = 'X';
        randomCell.appendChild(botSymbol);
        randomCell.classList.add('bot');
        randomCell.style.color = 'white';
        randomCell.style.backgroundColor = 'rgb(194, 0, 0)';

        if (checkWin('X')) {
            endGame('bot');
            return;
        }

        if (isBoardFull()) {
            endGame();
            return;
        }

        currentPlayer = 'O';
    }

    isTurnAllowed = true;
}

function checkWin(player) {
    const cells = document.querySelectorAll('.cell');
    const size = boardSize;
    const winLength = winCondition;

    for (let i = 0; i < size; i++) {
        for (let j = 0; j <= size - winLength; j++) {
            let rowWin = true;
            let colWin = true;
            for (let k = 0; k < winLength; k++) {
                if (cells[i * size + j + k].textContent !== player) rowWin = false;
                if (cells[(j + k) * size + i].textContent !== player) colWin = false;
            }
            if (rowWin || colWin) return true;
        }
    }

    for (let i = 0; i <= size - winLength; i++) {
        for (let j = 0; j <= size - winLength; j++) {
            let diag1Win = true;
            let diag2Win = true;
            for (let k = 0; k < winLength; k++) {
                if (cells[(i + k) * size + j + k].textContent !== player) diag1Win = false;
                if (cells[(i + k) * size + (j + winLength - 1 - k)].textContent !== player) diag2Win = false;
            }
            if (diag1Win || diag2Win) return true;
        }
    }

    return false;
}

function isBoardFull() {
    const cells = document.querySelectorAll('.cell');
    return Array.from(cells).every(cell => cell.textContent);
}

function startTimer(selectedTime) {
    if (timer) {
        clearInterval(timer);
    }

    if (selectedTime === 'infinity') {
        isUnlimited = true;
        timeLeft = Infinity;
        return;
    } else {
        isUnlimited = false;
        timeLeft = parseInt(selectedTime);
    }

    updateTimerDisplay(timeLeft);

    timer = setInterval(() => {
        if (!isUnlimited && timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay(timeLeft);
        } else if (!isUnlimited && timeLeft === 0) {
            clearInterval(timer);
            endGame('timeout');
        }
    }, 1000);
}

function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateScore(winner) {
    if (winner === 'X' || winner === 'player1') {
        scoreX++;
    } else if (winner === 'O' || winner === 'player') {
        scoreO++;
    }
    if (constantMatch) {
        if (friendlyMatch) {
            scoreDisplay.textContent = `Счет: ${player1Nickname} - ${scoreX} | ${player2Nickname} - ${scoreO}`;
        } else {
            scoreDisplay.textContent = `Счет: ${playerNickname} - ${scoreO} | Бот - ${scoreX}`;
        }
        scoreDisplay.classList.remove('hidden');
        endMatchButton.classList.remove('hidden');
    }
}

function resetOrContinueGame() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.textContent = '';
        cell.className = 'cell';
        cell.style = '';
        cell.addEventListener('click', () => {
            if (!isProcessingClick) {
                handleCellClick(cell);
            }
        });
    });
    gameStarted = true;
    currentPlayer = 'O';
    isTurnAllowed = true;
    isGameEnded = false;
    isProcessingClick = false;

    if (!isUnlimited) {
        startTimer(timeLeft);
    }
}

function resetGame() {
    clearInterval(timer);
    timer = null;
    gameField.classList.add('hidden');
    menu.classList.remove('hidden');
    board.innerHTML = '';
    timerDisplay.textContent = '';
    scoreDisplay.classList.add('hidden');
    winnerMessage.style.display = 'none';
    gameStarted = false;
    isGameEnded = false;
    isProcessingClick = false;
    matchCount++;
    scoreX = 0;
    scoreO = 0;
}

function loadRecords() {
    const recordsList = document.getElementById('recordsList');
    recordsList.innerHTML = '';
    let records = JSON.parse(localStorage.getItem('ticTacToeRecords')) || [];
    records = records.slice(-5).reverse();
    records.forEach(record => {
        const recordItem = document.createElement('div');
        recordItem.textContent = record;
        recordsList.appendChild(recordItem);
    });
}

function saveRecord() {
    const timeOption = document.getElementById('timeSelect').value;
    let timeMultiplier = 1;
    
    if (timeOption === '15') timeMultiplier = 2;
    else if (timeOption === '30') timeMultiplier = 1.5;
    else if (timeOption === '45') timeMultiplier = 1;
    else if (timeOption === '60') timeMultiplier = 0.7;
    else if (timeOption === 'infinity') timeMultiplier = 1;

    let record;
    if (friendlyMatch) {
        record = `${player1Nickname} vs ${player2Nickname} - ${boardSize}x${boardSize} - Счет: ${player1Nickname} ${scoreX}:${scoreO} ${player2Nickname}`;
    } else {
        const coefficient = (scoreX + scoreO) ? (scoreO / (scoreX + scoreO)) * timeMultiplier : 0;
        record = `${playerNickname} - ${boardSize}x${boardSize} - Счет: ${scoreO} - Коэффициент: ${coefficient.toFixed(2)}`;
    }
    
    let records = JSON.parse(localStorage.getItem('ticTacToeRecords')) || [];
    records.push(record);
    if (records.length > 5) records = records.slice(-5);
    localStorage.setItem('ticTacToeRecords', JSON.stringify(records));
    loadRecords();
}

endMatchButton.addEventListener('click', () => {
    saveRecord();
    resetGame();
});
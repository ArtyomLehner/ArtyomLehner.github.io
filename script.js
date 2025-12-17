// Основные переменные состояния игры
let gameState = {
    currentPlayer: 'O',
    gameStarted: false,
    isProcessing: false,
    isGameEnded: false,
    isPaused: false,
    isRated: false,
    boardSize: 3,
    winCondition: 3,
    timeLeft: 60,
    isUnlimited: false,
    constantMatch: false,
    friendlyMatch: false,
    botDifficulty: 'medium',
    score: { X: 0, O: 0 },
    timer: null,
    playerNames: {
        player: 'Игрок',
        player1: 'Игрок 1',
        player2: 'Игрок 2'
    }
};

// DOM элементы
const elements = {
    menu: document.getElementById('menu'),
    gameOptions: document.getElementById('gameOptions'),
    settings: document.getElementById('settings'),
    records: document.getElementById('records'),
    gameField: document.getElementById('gameField'),
    nicknameInput: document.getElementById('nicknameInput'),
    nicknamesInput: document.getElementById('nicknamesInput'),
    board: document.getElementById('board'),
    timer: document.getElementById('timer'),
    score: document.getElementById('score'),
    playerInfo: document.getElementById('playerInfo'),
    winnerMessage: document.getElementById('winnerMessage'),
    winnerTitle: document.getElementById('winnerTitle'),
    winnerScore: document.getElementById('winnerScore'),
    recordsList: document.getElementById('recordsList')
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadNicknames();
    initEventListeners();
});

// Загрузка настроек
function loadSettings() {
    const saved = JSON.parse(localStorage.getItem('ticTacToeSettings')) || {};
    
    if (saved.timeOption) {
        document.getElementById('timeSelect').value = saved.timeOption;
    }
    if (saved.fieldSize) {
        document.getElementById('fieldSize').value = saved.fieldSize;
    }
    if (saved.botDifficulty) {
        document.getElementById('botDifficulty').value = saved.botDifficulty;
        gameState.botDifficulty = saved.botDifficulty;
    }
    if (saved.constantMatch !== undefined) {
        document.getElementById('constantMatch').checked = saved.constantMatch;
        gameState.constantMatch = saved.constantMatch;
    }
    if (saved.friendlyMatch !== undefined) {
        document.getElementById('friendlyMatch').checked = saved.friendlyMatch;
        gameState.friendlyMatch = saved.friendlyMatch;
        updateRatedGameButton();
    }
}

// Загрузка никнеймов
function loadNicknames() {
    const playerNickname = localStorage.getItem('ticTacToeNickname');
    const player1Nickname = localStorage.getItem('ticTacToePlayer1Nickname');
    const player2Nickname = localStorage.getItem('ticTacToePlayer2Nickname');
    
    if (playerNickname) {
        gameState.playerNames.player = playerNickname;
        document.getElementById('playerNickname').value = playerNickname;
    }
    if (player1Nickname) {
        gameState.playerNames.player1 = player1Nickname;
        document.getElementById('player1Nickname').value = player1Nickname;
    }
    if (player2Nickname) {
        gameState.playerNames.player2 = player2Nickname;
        document.getElementById('player2Nickname').value = player2Nickname;
    }
}

// Инициализация обработчиков событий
function initEventListeners() {
    // Навигация
    document.getElementById('startButton').addEventListener('click', () => {
        if (gameState.friendlyMatch) {
            showScreen('nicknamesInput');
        } else {
            showScreen('nicknameInput');
        }
    });
    
    document.getElementById('settingsButton').addEventListener('click', () => {
        showScreen('settings');
    });
    
    document.getElementById('recordsButton').addEventListener('click', () => {
        showScreen('records');
        loadRecords();
    });
    
    // Кнопки "Назад"
    document.getElementById('backFromNickname').addEventListener('click', () => showScreen('menu'));
    document.getElementById('backFromNicknames').addEventListener('click', () => showScreen('menu'));
    document.getElementById('backFromGameOptions').addEventListener('click', () => showScreen('menu'));
    document.getElementById('backFromSettings').addEventListener('click', () => {
        saveSettings();
        showScreen('menu');
    });
    document.getElementById('backFromRecords').addEventListener('click', () => showScreen('menu'));
    
    // Сохранение ников
    document.getElementById('saveNickname').addEventListener('click', saveNickname);
    document.getElementById('saveNicknames').addEventListener('click', saveNicknames);
    
    // Выбор типа игры
    document.getElementById('nonRatedGame').addEventListener('click', () => startGame(false));
    document.getElementById('ratedGame').addEventListener('click', () => startGame(true));
    
    // Управление игрой
    document.getElementById('pauseGame').addEventListener('click', togglePause);
    document.getElementById('endMatch').addEventListener('click', endMatch);
    
    // Настройки
    document.getElementById('friendlyMatch').addEventListener('change', updateRatedGameButton);
    document.getElementById('constantMatch').addEventListener('change', () => {
        gameState.constantMatch = document.getElementById('constantMatch').checked;
        saveSettings();
    });
}

// Показать экран
function showScreen(screenName) {
    // Скрыть все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // Показать нужный экран
    const targetScreen = document.getElementById(screenName);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    }
}

// Сохранение никнейма
function saveNickname() {
    const input = document.getElementById('playerNickname');
    if (input.value.trim()) {
        gameState.playerNames.player = input.value.trim();
        localStorage.setItem('ticTacToeNickname', input.value.trim());
    }
    showScreen('gameOptions');
}

// Сохранение никнеймов для двух игроков
function saveNicknames() {
    const player1 = document.getElementById('player1Nickname');
    const player2 = document.getElementById('player2Nickname');
    
    if (player1.value.trim()) {
        gameState.playerNames.player1 = player1.value.trim();
        localStorage.setItem('ticTacToePlayer1Nickname', player1.value.trim());
    }
    if (player2.value.trim()) {
        gameState.playerNames.player2 = player2.value.trim();
        localStorage.setItem('ticTacToePlayer2Nickname', player2.value.trim());
    }
    showScreen('gameOptions');
}

// Обновить видимость кнопки рейтинговой игры
function updateRatedGameButton() {
    const friendlyMatch = document.getElementById('friendlyMatch').checked;
    const ratedGameButton = document.getElementById('ratedGame');
    
    gameState.friendlyMatch = friendlyMatch;
    
    if (friendlyMatch) {
        ratedGameButton.style.display = 'none';
    } else {
        ratedGameButton.style.display = 'block';
    }
    
    saveSettings();
}

// Сохранение настроек
function saveSettings() {
    const settings = {
        timeOption: document.getElementById('timeSelect').value,
        fieldSize: document.getElementById('fieldSize').value,
        botDifficulty: document.getElementById('botDifficulty').value,
        constantMatch: document.getElementById('constantMatch').checked,
        friendlyMatch: document.getElementById('friendlyMatch').checked
    };
    
    localStorage.setItem('ticTacToeSettings', JSON.stringify(settings));
    gameState.botDifficulty = settings.botDifficulty;
    gameState.constantMatch = settings.constantMatch;
    gameState.friendlyMatch = settings.friendlyMatch;
}

// Начать игру
function startGame(isRated) {
    saveSettings();
    
    const timeOption = document.getElementById('timeSelect').value;
    gameState.boardSize = parseInt(document.getElementById('fieldSize').value);
    gameState.winCondition = gameState.boardSize <= 5 ? 3 : 5;
    gameState.isRated = isRated;
    
    // Сброс состояния
    resetGameState();
    gameState.gameStarted = true;
    
    // Создание доски
    createBoard(gameState.boardSize);
    updatePlayerInfo();
    updateScore();
    
    // Настройка таймера
    if (timeOption !== 'infinity') {
        gameState.timeLeft = parseInt(timeOption);
        gameState.isUnlimited = false;
        startTimer();
    } else {
        gameState.isUnlimited = true;
        updateTimer(Infinity);
    }
    
    // Показ игрового поля
    showScreen('gameField');
    
    // Если ходит бот первым (в режиме с ботом)
    if (!gameState.friendlyMatch && gameState.currentPlayer === 'X') {
        setTimeout(() => botMove(), 500);
    }
}

// Сброс состояния игры
function resetGameState() {
    gameState.currentPlayer = 'O';
    gameState.gameStarted = false;
    gameState.isProcessing = false;
    gameState.isGameEnded = false;
    gameState.isPaused = false;
    gameState.score = { X: 0, O: 0 };
    gameState.timeLeft = 60;
    
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
}

// Создание игрового поля
function createBoard(size) {
    elements.board.innerHTML = '';
    
    // Устанавливаем грид с правильным количеством колонок и строк
    elements.board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    elements.board.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    
    // Устанавливаем фиксированный размер поля
    elements.board.style.width = '400px';
    elements.board.style.height = '400px';
    
    // Для мобильных устройств делаем меньше
    if (window.innerWidth <= 768) {
        elements.board.style.width = '350px';
        elements.board.style.height = '350px';
    }
    
    if (window.innerWidth <= 480) {
        elements.board.style.width = '320px';
        elements.board.style.height = '320px';
    }
    
    if (window.innerWidth <= 360) {
        elements.board.style.width = '280px';
        elements.board.style.height = '280px';
    }
    
    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.index = i;
        
        // Добавляем span для символа
        const span = document.createElement('span');
        span.textContent = '';
        cell.appendChild(span);
        
        cell.addEventListener('click', () => handleCellClick(cell));
        elements.board.appendChild(cell);
    }
}

// Обработка клика по клетке
function handleCellClick(cell) {
    if (!gameState.gameStarted || 
        gameState.isProcessing || 
        gameState.isGameEnded || 
        gameState.isPaused ||
        cell.classList.contains('x') ||
        cell.classList.contains('o')) return;
    
    gameState.isProcessing = true;
    const index = parseInt(cell.dataset.index);
    makeMove(cell, index, gameState.currentPlayer);
}

// Сделать ход
function makeMove(cell, index, player) {
    // Анимация перед установкой символа
    animateCell(cell, player, () => {
        // Устанавливаем символ и цвет
        if (player === 'X') {
            cell.classList.add('x');
            cell.classList.remove('o');
        } else {
            cell.classList.add('o');
            cell.classList.remove('x');
        }
        
        // Обновляем текст в span
        const span = cell.querySelector('span');
        span.textContent = player;
        
        // Проверка победы
        if (checkWin(player)) {
            handleWin(player);
            return;
        }
        
        // Проверка ничьей
        if (isBoardFull()) {
            endGame('draw');
            return;
        }
        
        // Смена игрока
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        updatePlayerInfo();
        
        if (!gameState.friendlyMatch && gameState.currentPlayer === 'X') {
            setTimeout(() => botMove(), 500);
        } else {
            gameState.isProcessing = false;
        }
    });
}

// Анимация клетки
function animateCell(cell, player, callback) {
    let opacity = 0;
    const color = player === 'X' ? '#e74c3c' : '#3498db';
    
    const animation = setInterval(() => {
        opacity += 0.2;
        cell.style.backgroundColor = `rgba(${player === 'X' ? '231, 76, 60' : '52, 152, 219'}, ${opacity})`;
        
        if (opacity >= 1) {
            clearInterval(animation);
            if (callback) callback();
        }
    }, 30);
}

// Ход бота
function botMove() {
    if (!gameState.gameStarted || gameState.isGameEnded || gameState.isPaused) return;
    
    const board = getBoardState();
    const moveIndex = getBotMove(board, gameState.botDifficulty);
    
    if (moveIndex !== undefined && moveIndex !== -1) {
        const cell = elements.board.children[moveIndex];
        makeMove(cell, moveIndex, 'X');
    }
}

// Получить ход бота в зависимости от сложности
function getBotMove(board, difficulty) {
    const emptyCells = board.filter(cell => !cell.player);
    if (emptyCells.length === 0) return -1;
    
    switch (difficulty) {
        case 'easy':
            // Случайный ход
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            return randomCell.index;
            
        case 'medium':
            // Средняя сложность: пытается выиграть или заблокировать игрока
            // 1. Проверить, может ли бот выиграть
            for (const cell of emptyCells) {
                const tempBoard = JSON.parse(JSON.stringify(board));
                tempBoard[cell.index].player = 'X';
                if (checkWinOnBoard(tempBoard, 'X')) {
                    return cell.index;
                }
            }
            
            // 2. Проверить, может ли выиграть игрок и заблокировать
            for (const cell of emptyCells) {
                const tempBoard = JSON.parse(JSON.stringify(board));
                tempBoard[cell.index].player = 'O';
                if (checkWinOnBoard(tempBoard, 'O')) {
                    return cell.index;
                }
            }
            
            // 3. Занять центр, если доступен
            const center = Math.floor(gameState.boardSize * gameState.boardSize / 2);
            if (!board[center].player) return center;
            
            // 4. Занять углы
            const corners = [0, gameState.boardSize - 1, 
                            gameState.boardSize * (gameState.boardSize - 1), 
                            gameState.boardSize * gameState.boardSize - 1];
            const emptyCorners = corners.filter(index => !board[index].player);
            if (emptyCorners.length > 0) {
                return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
            }
            
            // 5. Случайный ход
            return emptyCells[Math.floor(Math.random() * emptyCells.length)].index;
            
        case 'hard':
            // Сложный режим: минимакс алгоритм (упрощенный)
            return getHardBotMove(board);
            
        default:
            return emptyCells[0].index;
    }
}

// Сложный алгоритм для бота (упрощенный минимакс)
function getHardBotMove(board) {
    let bestScore = -Infinity;
    let bestMove = null;
    
    for (let i = 0; i < board.length; i++) {
        if (!board[i].player) {
            board[i].player = 'X';
            let score = minimax(board, 0, false);
            board[i].player = null;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

// Упрощенный минимакс алгоритм
function minimax(board, depth, isMaximizing) {
    // Базовые случаи
    if (checkWinOnBoard(board, 'X')) return 100 - depth;
    if (checkWinOnBoard(board, 'O')) return depth - 100;
    if (board.every(cell => cell.player)) return 0;
    
    // Ограничиваем глубину для больших досок
    if (depth >= 3 && gameState.boardSize > 5) {
        return evaluateBoard(board);
    }
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (!board[i].player) {
                board[i].player = 'X';
                let score = minimax(board, depth + 1, false);
                board[i].player = null;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (!board[i].player) {
                board[i].player = 'O';
                let score = minimax(board, depth + 1, true);
                board[i].player = null;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Оценка доски
function evaluateBoard(board) {
    let score = 0;
    
    // Простая эвристика: считаем количество возможных линий
    const size = gameState.boardSize;
    const winCondition = gameState.winCondition;
    
    for (let i = 0; i < board.length; i++) {
        if (board[i].player === 'X') {
            score += 10;
        } else if (board[i].player === 'O') {
            score -= 10;
        }
    }
    
    return score;
}

// Получить состояние доски
function getBoardState() {
    const cells = elements.board.children;
    return Array.from(cells).map((cell, index) => ({
        index,
        player: cell.classList.contains('x') ? 'X' : 
                cell.classList.contains('o') ? 'O' : null
    }));
}

// Проверка победы на текущей доске
function checkWin(player) {
    const board = getBoardState();
    return checkWinOnBoard(board, player);
}

// Проверка победы на произвольной доске
function checkWinOnBoard(board, player) {
    const size = gameState.boardSize;
    const winCondition = gameState.winCondition;
    
    // Проверка горизонталей
    for (let row = 0; row < size; row++) {
        for (let col = 0; col <= size - winCondition; col++) {
            let win = true;
            for (let k = 0; k < winCondition; k++) {
                const cell = board[row * size + col + k];
                if (cell.player !== player) {
                    win = false;
                    break;
                }
            }
            if (win) return true;
        }
    }
    
    // Проверка вертикалей
    for (let col = 0; col < size; col++) {
        for (let row = 0; row <= size - winCondition; row++) {
            let win = true;
            for (let k = 0; k < winCondition; k++) {
                const cell = board[(row + k) * size + col];
                if (cell.player !== player) {
                    win = false;
                    break;
                }
            }
            if (win) return true;
        }
    }
    
    // Проверка диагоналей (слева направо)
    for (let row = 0; row <= size - winCondition; row++) {
        for (let col = 0; col <= size - winCondition; col++) {
            // Главная диагональ
            let winMain = true;
            let winAnti = true;
            
            for (let k = 0; k < winCondition; k++) {
                // Главная диагональ
                const cellMain = board[(row + k) * size + (col + k)];
                if (cellMain.player !== player) winMain = false;
                
                // Побочная диагональ
                const cellAnti = board[(row + k) * size + (col + winCondition - 1 - k)];
                if (cellAnti.player !== player) winAnti = false;
            }
            
            if (winMain || winAnti) return true;
        }
    }
    
    return false;
}

// Проверка, заполнена ли доска
function isBoardFull() {
    const cells = elements.board.children;
    return Array.from(cells).every(cell => 
        cell.classList.contains('x') || cell.classList.contains('o')
    );
}

// Обработка победы
function handleWin(player) {
    if (player === 'O') {
        gameState.score.O++;
        showWinner(gameState.friendlyMatch ? 
            `Победил ${gameState.playerNames.player2}!` : 
            'Победа!', true);
    } else {
        gameState.score.X++;
        showWinner(gameState.friendlyMatch ? 
            `Победил ${gameState.playerNames.player1}!` : 
            'Бот победил!', false);
    }
    
    updateScore();
    gameState.isGameEnded = true;
    
    setTimeout(() => {
        if (gameState.constantMatch) {
            resetBoard();
        } else {
            endMatch();
        }
    }, 3000);
}

// Показать сообщение о победе
function showWinner(message, isWin) {
    elements.winnerTitle.textContent = message;
    elements.winnerScore.textContent = `Счет: ${gameState.score.O} - ${gameState.score.X}`;
    
    elements.winnerMessage.className = `winner-message ${isWin ? 'win' : 'lose'}`;
    elements.winnerMessage.classList.add('active');
    
    setTimeout(() => {
        elements.winnerMessage.classList.remove('active');
    }, 3000);
}

// Завершение игры
function endGame(reason) {
    clearInterval(gameState.timer);
    gameState.isGameEnded = true;
    
    let message;
    switch (reason) {
        case 'timeout':
            if (gameState.friendlyMatch) {
                if (gameState.score.O > gameState.score.X) {
                    message = `Победил ${gameState.playerNames.player2} по времени!`;
                } else if (gameState.score.X > gameState.score.O) {
                    message = `Победил ${gameState.playerNames.player1} по времени!`;
                } else {
                    message = 'Ничья по времени!';
                }
            } else {
                if (gameState.score.O > gameState.score.X) {
                    message = 'Победа по времени!';
                } else if (gameState.score.X > gameState.score.O) {
                    message = 'Бот победил по времени!';
                } else {
                    message = 'Ничья по времени!';
                }
            }
            break;
            
        case 'draw':
            message = 'Ничья!';
            break;
    }
    
    showWinner(message, gameState.score.O > gameState.score.X);
    
    setTimeout(() => {
        if (gameState.constantMatch) {
            resetBoard();
        } else {
            endMatch();
        }
    }, 3000);
}

// Сброс доски
function resetBoard() {
    const cells = elements.board.children;
    Array.from(cells).forEach(cell => {
        cell.className = 'cell';
        cell.innerHTML = '<span></span>';
        cell.style.backgroundColor = '';
    });
    
    gameState.currentPlayer = 'O';
    gameState.isGameEnded = false;
    gameState.isProcessing = false;
    updatePlayerInfo();
    
    if (!gameState.isUnlimited) {
        const timeOption = document.getElementById('timeSelect').value;
        gameState.timeLeft = parseInt(timeOption);
        startTimer();
    }
    
    if (!gameState.friendlyMatch && gameState.currentPlayer === 'X') {
        setTimeout(() => botMove(), 500);
    }
}

// Запуск таймера
function startTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
    }
    
    updateTimer(gameState.timeLeft);
    
    gameState.timer = setInterval(() => {
        if (!gameState.isPaused && gameState.timeLeft > 0) {
            gameState.timeLeft--;
            updateTimer(gameState.timeLeft);
        } else if (gameState.timeLeft === 0) {
            clearInterval(gameState.timer);
            endGame('timeout');
        }
    }, 1000);
}

// Обновление таймера
function updateTimer(time) {
    if (time === Infinity) {
        elements.timer.textContent = '∞';
        elements.timer.style.color = '#27ae60';
    } else {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        elements.timer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Изменение цвета при малом времени
        if (time <= 10) {
            elements.timer.style.color = '#e74c3c';
        } else if (time <= 30) {
            elements.timer.style.color = '#f39c12';
        } else {
            elements.timer.style.color = '#f39c12';
        }
    }
}

// Обновление информации об игроках
function updatePlayerInfo() {
    if (gameState.friendlyMatch) {
        const current = gameState.currentPlayer === 'X' ? 
            gameState.playerNames.player1 : gameState.playerNames.player2;
        elements.playerInfo.textContent = `Сейчас ходит: ${current} (${gameState.currentPlayer})`;
    } else if (gameState.currentPlayer === 'O') {
        elements.playerInfo.textContent = `Ваш ход (${gameState.playerNames.player})`;
    } else {
        elements.playerInfo.textContent = 'Ход бота...';
    }
}

// Обновление счета
function updateScore() {
    if (gameState.friendlyMatch) {
        elements.score.textContent = 
            `${gameState.playerNames.player1}: ${gameState.score.X} | ${gameState.playerNames.player2}: ${gameState.score.O}`;
    } else {
        elements.score.textContent = 
            `${gameState.playerNames.player}: ${gameState.score.O} | Бот: ${gameState.score.X}`;
    }
}

// Переключение паузы
function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    const pauseBtn = document.getElementById('pauseGame');
    
    if (gameState.isPaused) {
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> Продолжить';
        pauseBtn.classList.remove('btn-secondary');
        pauseBtn.classList.add('btn-primary');
        clearInterval(gameState.timer);
    } else {
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Пауза';
        pauseBtn.classList.remove('btn-primary');
        pauseBtn.classList.add('btn-secondary');
        if (!gameState.isUnlimited) {
            startTimer();
        }
    }
}

// Завершение матча
function endMatch() {
    clearInterval(gameState.timer);
    
    // Сохраняем рекорд для рейтинговой игры
    if (gameState.isRated) {
        saveRecord(gameState.score.X, gameState.score.O);
    }
    
    // Возврат в меню
    showScreen('menu');
    resetGameState();
}

// Сохранение рекорда
function saveRecord(scoreX, scoreO) {
    const timeOption = document.getElementById('timeSelect').value;
    const boardSize = document.getElementById('fieldSize').value;
    
    const record = {
        player: gameState.playerNames.player,
        score: `${scoreO} - ${scoreX}`,
        boardSize: parseInt(boardSize),
        date: new Date().toISOString(),
        rating: calculateRating(scoreO, scoreX, timeOption, boardSize)
    };
    
    let records = JSON.parse(localStorage.getItem('ticTacToeRecords')) || [];
    records.push(record);
    records.sort((a, b) => b.rating - a.rating);
    records = records.slice(0, 10);
    
    localStorage.setItem('ticTacToeRecords', JSON.stringify(records));
}

// Расчет рейтинга
function calculateRating(scoreO, scoreX, timeOption, boardSize) {
    const totalGames = scoreO + scoreX;
    if (totalGames === 0) return 0;
    
    const winRate = scoreO / totalGames;
    const timeMultiplier = getTimeMultiplier(timeOption);
    const sizeMultiplier = 1 + (parseInt(boardSize) - 3) * 0.2;
    
    return winRate * 100 * timeMultiplier * sizeMultiplier;
}

// Множитель времени
function getTimeMultiplier(timeOption) {
    const multipliers = {
        '15': 1.5,
        '30': 1.3,
        '45': 1.1,
        '60': 1.0,
        'infinity': 0.8
    };
    return multipliers[timeOption] || 1.0;
}

// Загрузка рекордов
async function loadRecords() {
    try {
        // Пробуем загрузить из data/records.json
        const response = await fetch('data/records.json');
        
        if (response.ok) {
            const serverRecords = await response.json();
            displayRecords(serverRecords);
            console.log('✅ Загружены общие рекорды');
        } else {
            throw new Error('Файл не найден');
        }
        
    } catch (error) {
        console.log('⚠️ Используем локальные записи:', error.message);
        
        // Запасной вариант - локальные записи
        const localRecords = JSON.parse(localStorage.getItem('ticTacToeRecords')) || [];
        displayRecords(localRecords.slice(0, 10));
    }
}

async function saveRecordToIssues(scoreX, scoreO) {
    const player = gameState.playerNames.player;
    const boardSize = document.getElementById('fieldSize').value;
    const timeOption = document.getElementById('timeSelect').value;
    const rating = calculateRating(scoreO, scoreX, timeOption, boardSize);
    
    const issueData = {
        title: `🎮 ${player}: ${scoreO} - ${scoreX} (${boardSize}×${boardSize})`,
        body: `**Информация о рекорде:**
- Игрок: ${player}
- Счет: ${scoreO} - ${scoreX}
- Размер поля: ${boardSize}×${boardSize}
- Время: ${timeOption === 'infinity' ? '∞' : timeOption + 'сек'}
- Рейтинг: ${rating.toFixed(2)}
- Дата: ${new Date().toLocaleString('ru-RU')}

*Отправлено из игры "Крестики-нолики 2"*`,
        labels: ['tic-tac-toe-record', 'game']
    };
    
    // Открываем форму создания issue
    const issueUrl = `https://github.com/https://github.com/ArtyomLehner/ArtyomLehner.github.io/issues/new?` +
        `title=${encodeURIComponent(issueData.title)}&` +
        `body=${encodeURIComponent(issueData.body)}&` +
        `labels=${encodeURIComponent(issueData.labels.join(','))}`;
    
    // Показываем кнопку для отправки
    const submitDiv = document.createElement('div');
    submitDiv.className = 'record-submit';
    submitDiv.innerHTML = `
        <h3>🎉 Поздравляем с рекордом!</h3>
        <p>Ваш результат: ${scoreO} - ${scoreX}</p>
        <p>Рейтинг: ${rating.toFixed(2)}</p>
        <a href="${issueUrl}" target="_blank" class="btn-primary">
            📤 Отправить в таблицу лидеров
        </a>
        <button onclick="this.parentElement.remove()" class="btn-secondary">
            Пропустить
        </button>
    `;
    
    document.querySelector('#gameField').appendChild(submitDiv);
}

// Отображение рекордов
function displayRecords(records) {
    const container = elements.recordsList;
    container.innerHTML = '';
    
    if (records.length === 0) {
        container.innerHTML = '<div class="record-item">Рекорды не найдены</div>';
        return;
    }
    
    records.forEach((record, index) => {
        const recordEl = document.createElement('div');
        recordEl.className = 'record-item';
        recordEl.innerHTML = `
            <div class="record-rank">${index + 1}</div>
            <div class="record-info">
                <div class="record-score">${record.player}: ${record.score}</div>
                <div class="record-date">${new Date(record.date).toLocaleDateString('ru-RU')}</div>
                <div class="record-details">${record.boardSize}×${record.boardSize}, Рейтинг: ${record.rating.toFixed(2)}</div>
            </div>
        `;
        container.appendChild(recordEl);
    });
}

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    if (gameState.gameStarted && elements.board.children.length > 0) {
        // Пересоздаем доску с новыми размерами
        createBoard(gameState.boardSize);
        
        // Восстанавливаем состояние клеток
        const cells = elements.board.children;
        Array.from(cells).forEach((cell, index) => {
            const span = cell.querySelector('span');
            if (gameState.currentPlayer === 'X' && cell.classList.contains('x')) {
                span.textContent = 'X';
            } else if (gameState.currentPlayer === 'O' && cell.classList.contains('o')) {
                span.textContent = 'O';
            }
        });
    }
});
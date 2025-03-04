const cells = document.querySelectorAll('.cell');
const turnDisplay = document.getElementById('turn');
const scoreDisplay = document.getElementById('score');
const resetButton = document.getElementById('reset');
const resetScoresButton = document.getElementById('reset-scores');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let scores = JSON.parse(localStorage.getItem('scores')) || { X: 0, O: 0 };

const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

resetButton.addEventListener('click', resetGame);
resetScoresButton.addEventListener('click', resetScores);

updateScore();

function handleCellClick(event) {
    const index = event.target.dataset.index;
    if (board[index] !== '' || !gameActive) return;
    board[index] = currentPlayer;
    event.target.textContent = currentPlayer;
    const winCombo = checkWin(currentPlayer);
    if (winCombo) {
        scores[currentPlayer]++;
        updateScore();
        turnDisplay.textContent = `${currentPlayer} wins!`;
        gameActive = false;
        highlightWinningCells(winCombo);
    } else if (board.every(cell => cell !== '')) {
        turnDisplay.textContent = 'Draw!';
        gameActive = false;
    } else {
        currentPlayer = 'O';
        turnDisplay.textContent = `Player ${currentPlayer}'s turn`;
        setTimeout(makeAIMove, 500);
    }
}

function makeAIMove() {
    const emptyCells = board.map((val, index) => val === '' ? index : null).filter(val => val !== null);
    if (emptyCells.length > 0) {
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[randomIndex] = 'O';
        cells[randomIndex].textContent = 'O';
        const winCombo = checkWin('O');
        if (winCombo) {
            scores['O']++;
            updateScore();
            turnDisplay.textContent = 'O wins!';
            gameActive = false;
            highlightWinningCells(winCombo);
        } else if (board.every(cell => cell !== '')) {
            turnDisplay.textContent = 'Draw!';
            gameActive = false;
        } else {
            currentPlayer = 'X';
            turnDisplay.textContent = `Player ${currentPlayer}'s turn`;
        }
    }
}

function checkWin(player) {
    for (let combo of winningCombos) {
        if (combo.every(index => board[index] === player)) {
            return combo;
        }
    }
    return false;
}

function highlightWinningCells(combo) {
    combo.forEach(index => {
        cells[index].classList.add('win');
    });
}

function updateScore() {
    scoreDisplay.textContent = `Score: X - ${scores.X} | O - ${scores.O}`;
    localStorage.setItem('scores', JSON.stringify(scores));
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    turnDisplay.textContent = `Player ${currentPlayer}'s turn`;
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('win');
    });
}

function resetScores() {
    scores = { X: 0, O: 0 };
    updateScore();
}
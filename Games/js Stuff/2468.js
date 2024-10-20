const gridContainer = document.getElementById('grid-container');
const scoreValue = document.getElementById('score-value');
const message = document.getElementById('message');
const dimensionsInput = document.getElementById('dimensions');
const winningValueInput = document.getElementById('winning-value');
const startGameButton = document.getElementById('start-game');

let ROWS, COLS, WINNING_VALUE;
let tiles = {};
let selectedTile = null;
let score = 0;

startGameButton.addEventListener('click', init);

function init() {
    ROWS = parseInt(dimensionsInput.value);
    COLS = ROWS; // Make it a square grid
    WINNING_VALUE = parseInt(winningValueInput.value);

    resetGame();
}

document.getElementById('move-left').addEventListener('click', () => handleMove(-1, 0));
document.getElementById('move-right').addEventListener('click', () => handleMove(1, 0));
document.getElementById('move-up').addEventListener('click', () => handleMove(0, -1));
document.getElementById('move-down').addEventListener('click', () => handleMove(0, 1));


function resetGame() {
    tiles = {};
    score = 0;
    scoreValue.textContent = score;
    message.textContent = '';
    gridContainer.innerHTML = '';
    createGrid();
    generateRandomTile();
    generateRandomTile();
    updateGrid();
    document.addEventListener('keydown', handleKeyPress);
}

function createGrid() {
    gridContainer.style.gridTemplateColumns = `repeat(${COLS}, 100px)`;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.dataset.row = row;
            tile.dataset.col = col;
            tile.addEventListener('click', () => selectTile(row, col));
            gridContainer.appendChild(tile);
            tiles[`${row}-${col}`] = null;
        }
    }
}

function generateRandomTile() {
    let emptyTiles = Object.keys(tiles).filter(key => tiles[key] === null);
    if (emptyTiles.length === 0) return;

    let randomKey = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    tiles[randomKey] = Math.random() < 0.9 ? 2 : 4;
}

function updateGrid() {
    gridContainer.childNodes.forEach(tile => {
        const row = tile.dataset.row;
        const col = tile.dataset.col;
        tile.textContent = tiles[`${row}-${col}`] || '';
        tile.style.backgroundColor = getTileColor(tiles[`${row}-${col}`]);
        selectTile(row, col)
    });
    const prevTile = document.querySelector(`.tile.selected`);
    if (prevTile) prevTile.classList.remove('selected');
}

function getTileColor(value) {
    switch (value) {
        case null: return '#ccc0b3';
        case 2: return '#eee4da';
        case 4: return '#ede0c8';
        case 8: return '#f2b179';
        case 16: return '#f59563';
        case 32: return '#f67c5f';
        case 64: return '#f67c5f';
        case 128: return '#edcf72';
        case 256: return '#edcc61';
        case 512: return '#edc850';
        case 1024: return '#edc53f';
        case 2048: return '#edc22e';
        default: return '#3c3a32';
    }
}

function selectTile(row, col) {
    // Deselect the previously selected tile
    const prevTile = document.querySelector(`.tile.selected`);
    if (prevTile) prevTile.classList.remove('selected');

    // Set the new selected tile
    if (tiles[`${row}-${col}`] !== null) {
        selectedTile = `${row}-${col}`;
        const selectedElement = document.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`);
        selectedElement.classList.add('selected');
    } else {
        selectedTile = null; // Reset if selecting an empty tile
    }
}
function handleKeyPress(event) {
    if (!selectedTile) return;

    const [row, col] = selectedTile.split('-').map(Number);
    let moved = false;

    switch (event.key) {
        case 'ArrowLeft':
            moved = moveTile(row, col, -1, 0);
            break;
        case 'ArrowRight':
            moved = moveTile(row, col, 1, 0);
            break;
        case 'ArrowUp':
            moved = moveTile(row, col, 0, -1);
            break;
        case 'ArrowDown':
            moved = moveTile(row, col, 0, 1);
            break;
    }

    if (moved) {
        generateRandomTile();
        updateGrid();
        if (checkWin() || checkLose()) {
            document.removeEventListener('keydown', handleKeyPress);
        }
        selectedTile = null;
    }
}

function moveTile(startRow, startCol, dx, dy) {
    const currentTile = tiles[`${startRow}-${startCol}`];
    if (!currentTile) return false;

    let targetRow = startRow + dy;
    let targetCol = startCol + dx;

    while (targetRow >= 0 && targetRow < ROWS && targetCol >= 0 && targetCol < COLS) {
        if (tiles[`${targetRow}-${targetCol}`] === null) {
            tiles[`${targetRow}-${targetCol}`] = currentTile;
            tiles[`${startRow}-${startCol}`] = null;
            startRow = targetRow;
            startCol = targetCol;
            targetRow += dy;
            targetCol += dx;
        } else if (tiles[`${targetRow}-${targetCol}`] === currentTile) {
            tiles[`${targetRow}-${targetCol}`] *= 2;
            score += tiles[`${targetRow}-${targetCol}`];
            tiles[`${startRow}-${startCol}`] = null;
            scoreValue.textContent = score;
            break;
        } else {
            break;
        }
    }
    return true; 
}

function checkWin() {
    if (Object.values(tiles).includes(WINNING_VALUE)) {
        message.textContent = 'You Win!';
        return true;
    }
    return false;
}

function checkLose() {
    if (Object.values(tiles).every(tile => tile !== null)) {
        message.textContent = 'Game Over!';
        return true;
    }
    return false;
}

window.onload = init;

function handleKeyPress(event) {
    if (!selectedTile) return;

    switch (event.key) {
        case 'ArrowLeft':
            handleMove(-1, 0);
            break;
        case 'ArrowRight':
            handleMove(1, 0);
            break;
        case 'ArrowUp':
            handleMove(0, -1);
            break;
        case 'ArrowDown':
            handleMove(0, 1);
            break;
    }
}

// Create the handleMove function

function handleMove(dx, dy) {
    if (!selectedTile) return;

    const [row, col] = selectedTile.split('-').map(Number);
    const moved = moveTile(row, col, dx, dy);

    if (moved) {
        generateRandomTile();
        updateGrid();
        if (checkWin() || checkLose()) {
            document.removeEventListener('keydown', handleKeyPress);
        }
        selectedTile = null;
    }
}

document.getElementById('winning-value').addEventListener('input', function() {
    let value = parseInt(this.value);
    
    if (value < 4) {
        this.value = 4; // Ensure minimum value is 2
    } else if (!isPowerOfTwo(value)) {
        this.value = nextPowerOfTwo(value); // Set to the next valid power of two
    }
});

function isPowerOfTwo(num) {
    return (num > 0) && (num & (num - 1)) === 0;
}

function nextPowerOfTwo(num) {
    let power = 1;
    while (power < num) {
        power *= 2;
    }
    return power; // Return the next power of two greater than or equal to the number
}

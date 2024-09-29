const canvas = document.getElementById('mazeCanvas');
const pen = canvas.getContext('2d');
const flashlightRadius = 3; // Adjust this for difficulty

let cellSize = 40;
let cols, rows;
let isThrottled = false;
let isFlashlightOn = true; // Start with flashlight on

const player1 = { x: 0, y: 0, color: 'red' };
const end = { x: 0, y: 0, color: 'blue' };

let cells = [];
let trail = [];
let generatedMaze;
let solutionPath;

document.querySelector('.startbtn').addEventListener('click', function () {
    const difficulty = document.getElementById('difficulty').value;
    setDifficulty(difficulty);
    resetGame();
});

function setDifficulty(difficulty) {
    switch (difficulty) {
        case 'easy':
            cols = 5;
            rows = 5;
            cellSize = 80; // Larger cells
            break;
        case 'medium':
            cols = 8;
            rows = 8;
            cellSize = 50; // Standard cells
            break;            
        case 'hard':
            cols = 10;
            rows = 10;
            cellSize = 40; // Smaller cells
            break;
        case 'insane':
            cols = 16;
            rows = 16;
            cellSize = 25; 
            break;
        case 'extra':
            cols = 20;
            rows = 20;
            cellSize = 20;  
            break; 
        case 'extreme':
            cols = 25;
            rows = 25;
            cellSize = 16; 
            break;
        case 'insert custom difficulty name':
            cols = 40;
            rows = 40;
            cellSize = 10; 
            break; //i think 40 is the limit before the browser gives up           
    }
    canvas.width = cols * cellSize;
    canvas.height = rows * cellSize;
}

function resetGame() {
    player1.x = 0;
    player1.y = 0;
    trail = [];
    cells = Array.from({ length: rows }, (_, y) => 
        Array.from({ length: cols }, (_, x) => new Cell(x, y))
    );
    end.x = cols - 1;
    end.y = rows - 1;
    generateMaze(0, 0);
    draw();
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.walls = { top: true, right: true, bottom: true, left: true };
        this.visited = false;
    }
    
    show() {
        const x = this.x * cellSize;
        const y = this.y * cellSize;
        pen.strokeStyle = 'green';
        pen.lineWidth = 2;
        
        if (this.walls.top) pen.moveTo(x, y), pen.lineTo(x + cellSize, y);
        if (this.walls.right) pen.moveTo(x + cellSize, y), pen.lineTo(x + cellSize, y + cellSize);
        if (this.walls.bottom) pen.moveTo(x + cellSize, y + cellSize), pen.lineTo(x, y + cellSize);
        if (this.walls.left) pen.moveTo(x, y + cellSize), pen.lineTo(x, y);
        pen.stroke();
    }
}

function generateMaze(x, y) {
    const currentCell = cells[y][x];
    currentCell.visited = true;

    const directions = randomize(['top', 'right', 'bottom', 'left']);
    for (const dir of directions) {
        const nx = x + (dir === 'right' ? 1 : dir === 'left' ? -1 : 0);
        const ny = y + (dir === 'bottom' ? 1 : dir === 'top' ? -1 : 0);

        if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            const nextCell = cells[ny][nx];
            if (!nextCell.visited) {
                currentCell.walls[dir] = false;
                nextCell.walls[{'top': 'bottom', 'right': 'left', 'bottom': 'top', 'left': 'right'}[dir]] = false;
                generateMaze(nx, ny);
            }
        }
    }
}

function randomize(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function draw() {
    pen.clearRect(0, 0, canvas.width, canvas.height);

    const canvasElement = document.getElementById('mazeCanvas');


    // Create a circular clipping region for the flashlight effect
    const playerX = player1.x * cellSize + cellSize / 2;
    const playerY = player1.y * cellSize + cellSize / 2;

    if (isFlashlightOn) {
        canvasElement.style.backgroundColor = "black"; // Set background to black
        pen.save(); // Save the current state
        pen.beginPath();
        pen.arc(playerX, playerY, flashlightRadius * cellSize, 0, Math.PI * 2); // Circular area
        pen.clip(); // Clip to the circular area

        // Draw the cells that are visible in the flashlight radius
        cells.forEach(row => row.forEach(cell => {
            const cellX = cell.x * cellSize + cellSize / 2;
            const cellY = cell.y * cellSize + cellSize / 2;

            const distSquared = (cellX - playerX) ** 2 + (cellY - playerY) ** 2;
            const radiusSquared = (flashlightRadius * cellSize) ** 2;

            if (distSquared <= radiusSquared) {
                pen.fillStyle = "green"; // Set visible cells to green
                cell.show(); // Show cells within the flashlight radius
            }
        }));

        pen.restore(); // Restore to original state, removing the clipping
    }
    else {
    // Draw the entire maze first
    canvasElement.style.backgroundColor = "#7FA347"; // Set background to black
    cells.forEach(row => row.forEach(cell => cell.show()));
    }

    drawPlayer(player1);
    drawEnd(end);
}

document.querySelector('.toggleFlashlight').addEventListener('click', function() {
    isFlashlightOn = !isFlashlightOn;
    draw(); // Redraw the maze to update visibility
});

function drawPlayer(player) {
    const x = player.x * cellSize + cellSize / 2;
    const y = player.y * cellSize + cellSize / 2;

    // Draw flashlight effect
    if (isFlashlightOn) {
        const gradient = pen.createRadialGradient(x, y, 0, x, y, flashlightRadius * cellSize);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)"); // Bright center
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)"); // Fading to transparent
        
        pen.beginPath();
        pen.arc(x, y, flashlightRadius * cellSize, 0, 2 * Math.PI);
        pen.fillStyle = gradient;
        pen.fill();
    }

    // Draw the player
    pen.beginPath();
    pen.arc(x, y, cellSize / 4, 0, 2 * Math.PI);
    pen.fillStyle = player.color; // Player color
    pen.fill();
}

function drawEnd(end) {
    const x = end.x * cellSize + cellSize / 2;
    const y = end.y * cellSize + cellSize / 2;
    pen.beginPath();
    pen.arc(x, y, cellSize / 4, 0, 2 * Math.PI);
    pen.fillStyle = end.color;
    pen.fill();
}

document.addEventListener('keydown', (e) => {
    movePlayer(e.key);
});

function movePlayer(key) {
    if (isThrottled) return;
    isThrottled = true;

    const moves = {
        'ArrowUp': { x: 0, y: -1, wall: 'top' },
        'ArrowDown': { x: 0, y: 1, wall: 'bottom' },
        'ArrowLeft': { x: -1, y: 0, wall: 'left' },
        'ArrowRight': { x: 1, y: 0, wall: 'right' }
    };

    if (moves[key]) {
        const newX = player1.x + moves[key].x;
        const newY = player1.y + moves[key].y;

        if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
            const wall = cells[player1.y][player1.x].walls[moves[key].wall];
            if (!wall) {
                player1.x = newX;
                player1.y = newY;
                trail.push({ x: player1.x, y: player1.y });
                draw();

                if (player1.x === end.x && player1.y === end.y) {
                    alert("You won!");
                    resetGame();
                }
            }
        }
    }

    setTimeout(() => {
        isThrottled = false;
    }, 100); // Adjust timeout duration as necessary
}

document.getElementById('btnUp').addEventListener('click', function () {
    movePlayer('ArrowUp');
});

document.getElementById('btnDown').addEventListener('click', function () {
    movePlayer('ArrowDown');
});

document.getElementById('btnLeft').addEventListener('click', function () {
    movePlayer('ArrowLeft');
});

document.getElementById('btnRight').addEventListener('click', function () {
    movePlayer('ArrowRight');
});

// Initial Setup
resetGame();

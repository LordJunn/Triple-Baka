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
    const bgColour = document.querySelector('.background'); // Select the background element
    const bgItems = document.querySelectorAll('.background li');
    
    switch (difficulty) {
        case 'easy':
            cols = 5;
            rows = 5;
            cellSize = 80; // Larger cells
            bgColour.style.background = "#50c9ab"; 
            break;
        case 'medium':
            cols = 8;
            rows = 8;
            cellSize = 50; // Standard cells
            bgColour.style.background = "#4fc968"; 
            break;            
        case 'hard':
            cols = 10;
            rows = 10;
            cellSize = 40; // Smaller cells
            bgColour.style.background = "#cdc44b"; 
            break;
        case 'insane':
            cols = 16;
            rows = 16;
            cellSize = 25; 
            bgColour.style.background = "#cf8f49"; 
            break;
        case 'expert':
            cols = 20;
            rows = 20;
            cellSize = 20;  
            bgColour.style.background = "#d1478c"; 
            break; 
        case 'extreme':
            cols = 25;
            rows = 25;
            cellSize = 16; 
            bgColour.style.background = "#a842bd";
            break;
        case 'gonkanau':
            cols = 40;
            rows = 40;
            cellSize = 10; 
            bgColour.style.background = "#000000"; 
            break;
    }

    if (difficulty === 'gonkanau') {
        gonkanauMusic.play();
        
        // Apply background image to each <li>
        bgItems.forEach(li => {
            li.style.backgroundImage = "url('Elegy.png')";
            li.style.backgroundSize = "cover"; // Ensure the image covers the entire <li>
        });
    } else {
        gonkanauMusic.pause();
        gonkanauMusic.currentTime = 0; // Reset to start

        // Reset background image for all <li> elements
        bgItems.forEach(li => {
            li.style.backgroundImage = ""; // Clear the background image
        });

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
    generatedMaze = null; // Add this line if needed
    solutionPath = []; // Reset the solution path
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
    } else {
        // Draw the entire maze first
        canvasElement.style.backgroundColor = "#7FA347"; // Set background to maze color
        cells.forEach(row => row.forEach(cell => cell.show()));
    }

    // Highlight the path taken during solving
    if (solutionPath) {
        pen.lineWidth = 4;

        // Total length of the path
        const pathLength = solutionPath.length;

        solutionPath.forEach((step, index) => {
            if (index > 0) {
                // Calculate the fraction of the path that has been completed
                const t = index / (pathLength - 1);

                // Calculate RGB values for a smooth transition from red to purple
                // Red decreases from 255 to 0
                const red = Math.round(255 * (1 - t));

                // Green decreases from 255 to 0
                const green = Math.round(255 * Math.max(0, 1 - Math.abs(0.5 - t) * 2));

                // Blue increases from 0 to 255
                const blue = Math.round(255 * Math.min(1, t));

                // Ensure the color stays within the bounds of RGB (0-255)
                pen.strokeStyle = `rgb(${red}, ${green}, ${blue}, 0.727)`; // Set the stroke color

                // Draw the line between the current step and the previous step
                pen.beginPath();
                pen.moveTo(step.x * cellSize + cellSize / 2, step.y * cellSize + cellSize / 2);
                pen.lineTo(solutionPath[index - 1].x * cellSize + cellSize / 2, solutionPath[index - 1].y * cellSize + cellSize / 2);
                pen.stroke();
            }
        });
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

// Assuming you have this script at the end of your body or in a separate JS file
document.addEventListener("DOMContentLoaded", function() {
    const difficultySelect = document.getElementById("difficulty");
    const gonkanauMusic = document.getElementById("gonkanauMusic");

    gonkanauMusic.addEventListener('ended', function() {
        gonkanauMusic.currentTime = 0; // Reset to start
        gonkanauMusic.play(); // Play the music again
    });

    difficultySelect.addEventListener("change", function() {
        if (difficultySelect.value === "gonkanau" || bgColour.style.background === "#000000") {
            gonkanauMusic.play();
        } else {
            gonkanauMusic.pause();
            gonkanauMusic.currentTime = 0; // Reset to start
        }
    });
});

document.querySelector('.solvebtn').addEventListener('click', function() {
    solveMaze(player1.x, player1.y);
});

function solveMaze(startX, startY) {
    // Initialize BFS queue and visited set
    const queue = [{ x: startX, y: startY }];
    const visited = new Set();
    visited.add(`${startX},${startY}`);
    
    const directions = [
        { dx: 0, dy: -1, dir: 'top' },    // up
        { dx: 1, dy: 0, dir: 'right' },   // right
        { dx: 0, dy: 1, dir: 'bottom' },  // down
        { dx: -1, dy: 0, dir: 'left' }    // left
    ];

    const parentMap = {}; // To keep track of the path

    let foundOptimalPath = false;

    // Start BFS
    while (queue.length > 0) {
        const { x, y } = queue.shift();

        // Check if we've reached the end
        if (x === end.x && y === end.y) {
            foundOptimalPath = true;
            break;  // Found the optimal path
        }

        // Explore neighbors in all four directions
        for (const { dx, dy, dir } of directions) {
            const nx = x + dx;
            const ny = y + dy;

            // Check for valid cell: within bounds, not visited, and no wall in that direction
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && !visited.has(`${nx},${ny}`)) {
                const currentCell = cells[y][x];

                // If there's no wall in the direction we're moving, proceed
                if (!currentCell.walls[dir]) {
                    visited.add(`${nx},${ny}`);
                    queue.push({ x: nx, y: ny });

                    // Track the parent to reconstruct the path
                    parentMap[`${nx},${ny}`] = { x, y };
                }
            }
        }
    }

    // If we found the optimal path, reconstruct the path
    if (foundOptimalPath) {
        const path = [];
        let current = { x: end.x, y: end.y };

        while (current.x !== startX || current.y !== startY) {
            path.unshift(current);  // Add to the beginning of the path
            current = parentMap[`${current.x},${current.y}`];
        }

        path.unshift({ x: startX, y: startY }); // Add the start position

        // Animate the solution path
        animatePath(path);
    } else {
        alert("No solution found!");
    }
}

function animatePath(path) {
    let index = 0;
    solutionPath = path; // Save the path for later drawing

    const interval = setInterval(() => {
        if (index < path.length) {
            player1.x = path[index].x;
            player1.y = path[index].y;
            draw();
            index++;
        } else {
            clearInterval(interval);
            alert("Maze solved! Moves made: " + index);
        }
    }, cellSize * 2); // Adjust the speed of the animation as necessary
}

// Initial Setup
resetGame();


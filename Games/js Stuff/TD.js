const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = 900;
canvas.height = 600;

// global variables
const cellSize = 100;
const cellGap = 3;
let numberOfResources = 300;
let enemiesInterval = 500;
let frame = 0;
let gameOver = false;
let score = 0;
const winningScore = 10000;
let chosenDefender = 1;
let speedFactor = 1;
let currencyWin = 100000;
let diffMod = 1;

const opacityGon = 0.03;

const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];
const resources = [];

// mouse
const mouse = {
    x: 10,
    y: 10,
    width: 0.1,
    height: 0.1,
    clicked: false
}

canvas.addEventListener('mousedown', function(){
    mouse.clicked = true;
});
canvas.addEventListener('mouseup', function(){
    mouse.clicked = false;
});

let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener('mousemove', function(e){
    mouse.x = e.x - canvasPosition.left;
    mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener('mouseleave', function(){
    mouse.y = undefined;
    mouse.y = undefined;
});

// Create fast forward button
const fastForwardBtn = document.createElement('button');
fastForwardBtn.id = 'fastForwardBtn';
fastForwardBtn.innerText = 'Fast Forward';
fastForwardBtn.style.position = 'absolute';
fastForwardBtn.style.top = '10px';
fastForwardBtn.style.right = '10px';
fastForwardBtn.style.zIndex = '10';
fastForwardBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
fastForwardBtn.style.border = '1px solid black';
fastForwardBtn.style.borderRadius = '5px';
fastForwardBtn.style.padding = '10px';
fastForwardBtn.style.cursor = 'pointer';

// Append the button to the body
document.body.appendChild(fastForwardBtn);

let isFastForwarding = false;

fastForwardBtn.addEventListener('click', function() {
    isFastForwarding = !isFastForwarding; // Toggle fast forward state
    speedFactor = isFastForwarding ? 1 : 5; // Set speed factor based on state
    fastForwardBtn.innerText = isFastForwarding ? 'Normal Speed' : 'Fast Forward'; // Update button text
});

// Create easy mode button
const easyBtn = document.createElement('button');
easyBtn.id = 'easyBtn';
easyBtn.innerText = 'Easy Mode';
easyBtn.style.position = 'absolute';
easyBtn.style.top = '70px';
easyBtn.style.right = '10px';
easyBtn.style.zIndex = '10';
easyBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
easyBtn.style.border = '1px solid black';
easyBtn.style.borderRadius = '5px';
easyBtn.style.padding = '10px';
easyBtn.style.cursor = 'pointer';

// Append the button to the body
document.body.appendChild(easyBtn);

let isEasy = false;

easyBtn.addEventListener('click', function() {
    isEasy = !isEasy; // Toggle fast forward state
    diffMod = isEasy ? 2 : 1; // Set speed factor based on state
    easyBtn.innerText = isEasy ? 'Easy Mode' : 'Normal Mode'; // Update button text
});

// game board
const controlsBar = {
    width: canvas.width,
    height: cellSize,
}
class Cell {
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.width = cellSize;
        this.height = cellSize;
    }
    draw(){
        if (mouse.x && mouse.y && collision(this, mouse)){
            ctx.strokeStyle = 'black';
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
function createGrid(){
    for (let y = cellSize; y < canvas.height; y += cellSize){
        for (let x = 0; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        }
    }
}
createGrid();
function handleGameGrid(){
    for (let i = 0; i < gameGrid.length; i++){
        gameGrid[i].draw();
    }
}
// projectiles
class Projectile {
    constructor(x, y, damage, color) {
        this.x = x;
        this.y = y;
        this.width = 10;
        this.height = 10;
        this.power = damage;
        this.speed = 5;
        this.color = color; // Add color property
    }
    update() {
        this.x += this.speed * speedFactor;
    }
    draw() {
        ctx.fillStyle = this.color; // Use the projectile's color
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
        ctx.fill();
    }
}

function handleProjectiles(){
    for (let i = 0; i < projectiles.length; i++){
        projectiles[i].update();
        projectiles[i].draw();

        for (let j = 0; j < enemies.length; j++){
            if (enemies[j] && projectiles[i] && collision(projectiles[i], enemies[j])){
                enemies[j].health -= projectiles[i].power;
                projectiles.splice(i, 1);
                i--;
            }
        }

        if (projectiles[i] && projectiles[i].x > canvas.width - cellSize){
            projectiles.splice(i, 1);
            i--;
        }
    }
}

// defenders
const defender1 = new Image();
const defender2 = new Image();
const defender3 = new Image();

class Defender {
    constructor(x, y, health, color, damage, cost) {
        this.x = x;
        this.y = y;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.shooting = false;
        this.health = health;
        this.maxHealth = health;
        this.color = color;
        this.projectiles = [];
        this.timer = 0;
        this.damage = damage;
        this.cost = cost;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Orbitron';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    }

    update() {
        this.shooting = false; // Reset shooting status each frame
    
        // Check for enemies in range
        for (let enemy of enemies) {
            if (enemy.y === this.y) { // Check if the enemy is in the same row
                this.shooting = true;
                this.timer++;
                if (this.timer % Math.floor(100 / speedFactor) === 0) { // Shoot every 100 frames, or however fast speed is
                    projectiles.push(new Projectile(this.x + 70, this.y + 50, this.damage, this.color));
                }
                break; // Exit loop after finding an enemy
            }
        }
    }
}

// Define defenders with different stats and colors
const defendersData = [
    { health: 100, color: 'blue', cost: 100, damage: 30 },  // Defender 1
    { health: 50, color: 'green', cost: 50, damage: 15 }, // Defender 2
    { health: 300, color: 'aquamarine', cost: 300, damage: 100 }, // Defender 3
    { health: 999, color: 'grey', cost: 999, damage: 999 } // Test Defender 4
    // Add more defenders as needed
];

// Dynamic defender card creation
const defenderCards = defendersData.map((defender, index) => ({
    x: 10 + index * 80, // Adjust spacing for four cards
    y: 10,
    width: 70,
    height: 85,
    index: index + 1 // To reference in the array
}));


// When a defender is placed, use the chosen defender's stats
canvas.addEventListener('click', function() {
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;

    if (gridPositionY < cellSize) return;

    for (let defender of defenders) {
        if (defender.x === gridPositionX && defender.y === gridPositionY) return;
    }

    const defenderStats = defendersData[chosenDefender - 1];
    if (numberOfResources >= defenderStats.cost) {
        defenders.push(new Defender(gridPositionX, gridPositionY, defenderStats.health, defenderStats.color, defenderStats.damage, defenderStats.cost));
        numberOfResources -= defenderStats.cost;
    } else {
        floatingMessages.push(new floatingMessage('You need more resources!', mouse.x, mouse.y, 15, 'blue'));
    }
});

canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;

    for (let i = 0; i < defenders.length; i++) {
        if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) {
            // Refund half the cost of the defender
            numberOfResources += defenders[i].cost * 0.5;
            defenders.splice(i, 1); // Remove the defender
            break; // Exit the loop after removal
        }
    }
});

function handleDefenders(){
    for (let i = 0; i < defenders.length; i++){
        defenders[i].draw();
        defenders[i].update();
        if (enemyPositions.indexOf(defenders[i].y) !== -1){
            defenders[i].shooting = true;
        } else {
            defenders[i].shooting = false;
        }
        for (let j = 0; j < enemies.length; j++){
            if (defenders[i] && collision(defenders[i], enemies[j])){
                enemies[j].movement = 0;
                defenders[i].health -= 1;
            }
            if (defenders[i] && defenders[i].health <= 0){
                defenders.splice(i, 1);
                i--;
                enemies[j].movement = enemies[j].speed;
            }
        }
    }
}

function chooseDefender() {

    let cardStrokes = defenderCards.map(() => 'black');
    
    defenderCards.forEach(card => {
        if (collision(mouse, card) && mouse.clicked) {
            chosenDefender = card.index;
        }
        if (chosenDefender === card.index) {
            cardStrokes[card.index - 1] = 'gold';
        }

        // Draw each card
        ctx.lineWidth = 1;
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(card.x, card.y, card.width, card.height);
        ctx.strokeStyle = cardStrokes[card.index - 1];
        ctx.strokeRect(card.x, card.y, card.width, card.height);
        // Assuming you have images for defenders
        // ctx.drawImage(defendersImages[card.index - 1], 0, 0, 194, 194, card.x, card.y + 5, 194 / 2, 194 / 2);

        // Draw the defender cost
        const defenderStats = defendersData[card.index - 1];
        ctx.fillStyle = 'white'; // Set text color
        ctx.font = '15px Orbitron'; // Set font size and style
        ctx.fillText(`${defenderStats.cost}`, card.x + 5, card.y + 20); // Position the cost text

    });

}



// floating msgs
const floatingMessages = [];
class floatingMessage {
    constructor(value, x, y, size, colour) {
        this.value = value;
        this.x = x;
        this.y = y;
        this.size = size;
        this.lifespan = 0;
        this.colour = colour;
        this.opacity = 1;
    }
    update() {
        this.y -= 0.3;
        this.lifespan += 1;
        if (this.opacity > opacityGon) {
            this.opacity -= opacityGon;
        }
    }
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.colour;
        ctx.globalAlpha = this.size + 'px Orbitron';
        ctx.fillText(this.value, this.x, this.y);
        ctx.globalAlpha = 1;
    }
}

function handleFloatingMessages() {

    if (gameOver || (score >= winningScore && enemies.length === 0) || numberOfResources > currencyWin) {
        return; // Stop the animation loop
    }

    for (let i = 0; i < floatingMessages.length; i++) {
        floatingMessages[i].update();
        floatingMessages[i].draw();      
        
        if(floatingMessages[i].lifespan >= 50) {
            floatingMessages.splice(i, 1);
            i--;
        }
        
    }
}

// enemies
class Enemy {
    constructor(verticalPosition, type) {
        this.x = canvas.width;
        this.y = verticalPosition;
        this.width = cellSize - cellGap * 2;
        this.height = cellSize - cellGap * 2;
        this.speed = type.speed;
        this.health = type.health;
        this.color = type.color; // Use the type's color
        this.movement = this.speed;
        this.maxHealth = this.health;
    }

    update() {
        this.x -= this.movement * speedFactor;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#2A0000';
        ctx.font = '30px Orbitron';
        ctx.fillText(Math.floor(this.health), this.x + 15, this.y + 30);
    }
}

const enemyTypes = [
    { health: 100, speed: 0.4, color: '#FF0000' },         // Basic enemy (red)
    { health: 200, speed: 0.5, color: '#FFA500' },         // Stronger enemy (orange)
    { health: 400, speed: 0.6, color: '#800080' },         // Even stronger enemy (purple)
    { health: 800, speed: 0.7, color: '#808080' },         // Boss enemy (grey)
    { health: 150, speed: 2, color: '#FFFF00' },           // New enemy type 1 (yellow)
    { health: 300, speed: 3, color: '#0000FF' },           // New enemy type 2 (blue)
    { health: 800, speed: 4, color: '#00008B' },           // Super enemy (dark blue)
    { health: 2000, speed: 1, color: '#8B0000' },          // Super enemy (dark red) 
    // Add more as needed
];

let enemySpawnCounter = 0;

function handleEnemies() {
    enemySpawnCounter++;

    for (let i = 0; i < enemies.length; i++) {
        enemies[i].update();
        enemies[i].draw();
        
        if (enemies[i].x < 0) {
            gameOver = true;
        }
        if (enemies[i].health <= 0) {
            let gainedResources = enemies[i].maxHealth / 10;

            if (score < 200) {
                gainedResources /= 1;
            } else if (score < 400) {
                gainedResources /= 1.5;
            } else if (score < 800) {
                gainedResources /= 2;
            } else if (score < 1600) {
                gainedResources /= 4;
            } else {
                gainedResources /= 10;
            }
    
            floatingMessages.push(new floatingMessage('+' + gainedResources * diffMod, enemies[i].x, enemies[i].y, 30, 'black'));
            numberOfResources = Math.round(numberOfResources + gainedResources * diffMod);
            score = Math.round(score + gainedResources);
            
            enemies.splice(i, 1);
            i--;
        }
    }

    if (enemySpawnCounter >= enemiesInterval/speedFactor && score < winningScore) {
        enemySpawnCounter = 0;
        let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize + cellGap;

        // Determine enemy type to spawn based on score
        let enemyToSpawn;

        if (score < 200) {
            enemyToSpawn = 0; // Only basic enemy
            enemiesInterval = 500;
        } else if (score < 400 * diffMod) {
            enemyToSpawn = Math.random() < 0.7 ? 0 : 1; // 70% basic, 30% stronger
            enemiesInterval = 250 * diffMod;
        } else if (score < 800 * diffMod) {
            const rand = Math.random();
            if (rand < 0.5) enemyToSpawn = 1; // 50% stronger
            else if (rand < 0.8) enemyToSpawn = 2; // 30% even stronger
            else enemyToSpawn = 4; // 20% new enemy type 1
            enemiesInterval = 125 * diffMod;
        } else if (score < 1600 * diffMod) {
            const rand = Math.random();
            if (rand < 0.4) enemyToSpawn = 2; // 40% even stronger
            else if (rand < 0.7) enemyToSpawn = 3; // 30% boss
            else enemyToSpawn = 5; // 30% new enemy type 2
            enemiesInterval = 60 * diffMod;
        } else {
            enemyToSpawn = Math.random() < 0.7 ? 6 : 7; // 70% basic, 30% stronger
            enemiesInterval = 30 * diffMod;
        }

        // Create a new enemy instance with the chosen type
        enemies.push(new Enemy(verticalPosition, enemyTypes[enemyToSpawn]));
        enemyPositions.push(verticalPosition);

        // Optionally decrease the interval as the game progresses
        // Gradually decrease the enemiesInterval as the score increases

    }
}


// resources
const amounts = [20, 30, 40];
class Resource {
    constructor(){
        this.x = Math.random() * (canvas.width - cellSize);
        this.y = (Math.floor(Math.random() * 5) + 1) * cellSize + 25;
        this.width = cellSize * 0.6;
        this.height = cellSize * 0.6;
        this.amount = amounts[Math.floor(Math.random() * amounts.length)];
    }
    draw(){
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'black';
        ctx.font = '20px Orbitron';
        ctx.fillText(this.amount, this.x + 15, this.y + 25);
    }
}

let resourceSpawnCounter = 0;

function handleResources(){
    resourceSpawnCounter++; // Increment the resource spawn counter

    if (resourceSpawnCounter >= 500/speedFactor && score < winningScore && numberOfResources < 10000){
        resources.push(new Resource());
        resourceSpawnCounter = 0; // Reset the spawn counter
    }
    for (let i = 0; i < resources.length; i++){
        resources[i].draw();
        if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)){
            numberOfResources += resources[i].amount;
            floatingMessages.push(new floatingMessage('+' + resources[i].amount, resources[i].x, resources[i].y, 30, 'black'));
            floatingMessages.push(new floatingMessage('+' + resources[i].amount, 600, 40, 30, 'gold'));
            resources.splice(i, 1);
            i--;
        }
    }
}

// utilities
function handleGameStatus(){
    ctx.fillStyle = 'gold';
    ctx.font = '30px Orbitron';
    ctx.fillText('Score: ' + score, 400, 40); // score board
    ctx.fillText('Resources: ' + numberOfResources, 400, 80);
    if (gameOver){
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // White with some transparency
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = '90px Orbitron';
        ctx.fillText('GAME OVER', 135, 330);
    }
    if ((score >= winningScore/diffMod && enemies.length === 0) || numberOfResources > currencyWin){
        // Draw a semi-transparent overlay
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'; // White with some transparency
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.font = '60px Orbitron';
        ctx.fillText('LEVEL COMPLETE', 130, 300);
        ctx.font = '30px Orbitron';
        ctx.fillText('You win with ' + score + ' points!', 134, 340);
    }
}

canvas.addEventListener('click', function() {
    const gridPositionX = mouse.x - (mouse.x % cellSize) + cellGap;
    const gridPositionY = mouse.y - (mouse.y % cellSize) + cellGap;
    if (gridPositionY < cellSize) return; // Ensure click is below control bar

    // Check if there's already a defender in this cell
    for (let defender of defenders) {
        if (defender.x === gridPositionX && defender.y === gridPositionY) {
            return; // Cell already occupied
        }
    }

    // Check resources and place defender
    const defenderStats = defendersData[chosenDefender - 1];
    if (numberOfResources >= defenderStats.cost) {
        defenders.push(new Defender(gridPositionX, gridPositionY, defenderStats.health, defenderStats.color, defenderStats.damage, defenderStats.cost));
        numberOfResources -= defenderStats.cost;
    } else {
        floatingMessages.push(new floatingMessage('You need more resources!', mouse.x, mouse.y, 15, 'blue'));
    }
});

function animate(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'blue';
    ctx.fillRect(0,0,controlsBar.width, controlsBar.height);
    handleGameGrid();
    handleDefenders();
    handleResources();
    handleProjectiles();
    handleEnemies();
    chooseDefender();
    handleGameStatus();
    handleFloatingMessages();   
    frame += speedFactor;

    if (gameOver || (score >= winningScore/diffMod && enemies.length === 0) || numberOfResources > currencyWin) {
        return; // Stop the animation loop
    }

    requestAnimationFrame(animate); // Continue animating if the game is still active
}
animate();

function collision(first, second){
    if (    !(  first.x > second.x + second.width ||
                first.x + first.width < second.x ||
                first.y > second.y + second.height ||
                first.y + first.height < second.y)
    ) {
        return true;
    };
};

window.addEventListener('resize', function(){
    canvasPosition = canvas.getBoundingClientRect();
})
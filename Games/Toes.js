let players = [];
let turn = 0;
let gameOver = false;
let dimension = parseInt(document.getElementById("dimensions").value);
let board = new Array(dimension).fill("").map(() => new Array(dimension).fill(""));
let moveCount = 0; // Track the number of moves made


const changeDimension = (event) => {
  const newDimension = parseInt(event.target.value);
  
  // Ensure the new dimension is odd and between 3 and 11
  if (newDimension < 3 || newDimension > 11 || newDimension % 2 === 0) {
    if (newDimension < 3) {
      event.target.value = 3;
      dimension = 3; // Reset to the minimum odd value
    } else if (newDimension > 11) {
      event.target.value = 11;
      dimension = 11; // Reset to the maximum odd value
    } else {
      // If it's even, set to the next odd number
      event.target.value = newDimension + 1;
      dimension = newDimension + 1; // This will make it odd
    }
  } else {
    dimension = newDimension; // Accept the new dimension if it's valid
  }

  board = new Array(dimension).fill("").map(() => new Array(dimension).fill(""));
};

const startGameBtn = document.getElementById("start-game");

const updateStartButtonText = () => {
  if (gameOver) {
    startGameBtn.innerHTML = "Restart"; // After a game is over
  } else if (players.length > 0) {
    startGameBtn.innerHTML = "Restart"; // While a game is in progress
  } else {
    startGameBtn.innerHTML = "Start Game"; // No game started
  }
};

document.getElementById("dimensions").addEventListener("change", changeDimension);

const startGame = () => {
  let game = document.getElementById("game-container");
  game.innerHTML = ""; // Clear existing game elements

  let input1 = document.getElementById("p1");
  let input2 = document.getElementById("p2");
  let select = document.getElementById("dimensions");

  let player1 = input1.value;
  let player2 = input2.value;

  if (isEmpty(player1) || isEmpty(player2)) {
    alert("Player name is required");
    return;
  }

  input1.setAttribute("disabled", true);
  input2.setAttribute("disabled", true);
  select.setAttribute("disabled", true);

  players = [player1, player2];
  turn = 0; // Reset turn

  document.getElementById("turn").innerHTML = players[turn % 2] + "'s turn";
  initGame();
  game.classList.remove("hide");
  updateStartButtonText();
};

const restartGame = () => {
  // Reset the board only
  board = new Array(dimension).fill("").map(() => new Array(dimension).fill(""));
  
  // Clear the game display
  const cells = document.querySelectorAll(".cell");
  cells.forEach(cell => cell.innerHTML = ""); // Clear each cell

  // Reset the turn and gameOver state
  turn = 0;
  gameOver = false;

  // Update the turn display
  document.getElementById("turn").innerHTML = players[turn % 2] + "'s turn";

  // Hide the restart button until the next game ends
  document.getElementById("restart-btn").classList.add("hide");
  startGameBtn.innerHTML = "Restart";
  updateStartButtonText();
};

const resetGame = () => {

  // Clear player names
  document.getElementById("p1").value = '';
  document.getElementById("p2").value = '';

  // Reset the dimensions selection
  document.getElementById("dimensions").selectedIndex = 0;

  // Hide the game container and clear its content
  let game = document.getElementById("game-container");
  game.innerHTML = ""; // Clear game content
  game.classList.add("hide"); // Hide the game

  // Reset game state variables
  players = [];
  turn = 0;
  gameOver = false;
  dimension = parseInt(document.getElementById("dimensions").value);
  board = new Array(dimension).fill("").map(() => new Array(dimension).fill(""));

  // Enable input fields
  document.getElementById("p1").removeAttribute("disabled");
  document.getElementById("p2").removeAttribute("disabled");
  document.getElementById("dimensions").removeAttribute("disabled");

  // Reset turn display
  document.getElementById("turn").innerHTML = '';
  updateStartButtonText();

};

// Add event listener for the start game button
startGameBtn.addEventListener("click", () => {
  if (gameOver) {
    restartGame();
  } else if (players.length > 0) {
    restartGame();
  } else {
    startGame();
  }
});

const handleClick = (cell, i, j) => {
  const el = cell;
  if (el.innerHTML !== "" || gameOver) {
    return;
  }

  // Player's move
  board[i][j] = turn % 2 === 0 ? "X" : "O";
  el.innerHTML = board[i][j];

  if (calculateWinner()) {
    alert(players[turn % 2] + " won!!");
    gameOver = true;
    return;
  }
  
  turn++;

  document.getElementById("turn").innerHTML = players[turn % 2] + "'s turn";

  // If AI's turn
  if (players[turn % 2] === "AI") {
    aiMove();
  }
};

const initGame = () => {
  let gameContainer = document.getElementById("game-container");
  gameContainer.innerHTML = ''; // Clear existing game elements

  for (let i = 0; i < dimension; i++) {
    let row = document.createElement("div");
    row.className = "row";
    for (let j = 0; j < dimension; j++) {
      let cell = document.createElement("div");
      cell.addEventListener("click", (event) => handleClick(cell, i, j));
      cell.className = "cell";

      // Calculate new size based on dimension
      let currentSize = 50; // Default size
      let fontSize = 24; // Default font size
      if (dimension > 10) {
        currentSize /= 2; // Divide by 2 if dimension is greater than 10
        fontSize = 12; // Set font size to 12px for larger dimensions
      }

      // Set new size in pixels
      cell.style.height = currentSize + 'px';
      cell.style.width = currentSize + 'px';
      cell.style.fontSize = fontSize + 'px'; // Set the font size

      row.appendChild(cell);
    }
    gameContainer.appendChild(row);
  }
};

const calculateWinner = () => {
  // Check rows, columns, and diagonals for a winner
  let len = board.length;
  if (turn < len) {
    return false;
  }

  for (let i = 0; i < len; i++) {
    if (board[i].every((el) => el === board[i][0] && el !== "")) {
      return true;
    }

    let start_col_val = board[0][i];
    let count = 1;
    for (let j = 1; j < len; j++) {
      if (start_col_val === board[j][i] && start_col_val !== "") {
        count++;
      }
    }

    if (count === len) {
      return true;
    }
  }

  // Check for diagonals
  if (board[0][0] !== "" && board.every((_, idx) => board[idx][idx] === board[0][0])) {
    return true;
  }
  
  if (board[0][len - 1] !== "" && board.every((_, idx) => board[idx][len - 1 - idx] === board[0][len - 1])) {
    return true;
  }

  // Check for tie condition
  const isTie = board.every(row => row.every(cell => cell !== ""));
  if (isTie && gameOver === false) {
    alert("Game is a tie!");
    gameOver = true;
    restartGame()
    return false; // No winner, but game is a tie
  }

  return false; // No winner
};

const isEmpty = (value) => !value || !value.trim();

const aiMove = () => {
  // Block player1 if they have two in a row
  for (let i = 0; i < dimension; i++) {
    for (let j = 0; j < dimension; j++) {
      if (board[i][j] === "") {
        board[i][j] = "X"; // Assume player1 is "X"
        if (calculateWinner()) {
          board[i][j] = "O"; // AI makes the blocking move
          document.querySelectorAll(".cell")[i * dimension + j].innerHTML = "O";
          turn++;
          document.getElementById("turn").innerHTML = players[turn % 2] + "'s turn";
          return;
        }
        board[i][j] = ""; // Reset the cell
      }
    }
  }

  // Otherwise, make a random move
  let emptyCells = [];
  for (let i = 0; i < dimension; i++) {
    for (let j = 0; j < dimension; j++) {
      if (board[i][j] === "") {
        emptyCells.push({ i, j });
      }
    }
  }

  if (emptyCells.length > 0) {
    const { i, j } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[i][j] = "O"; // AI is "O"
    document.querySelectorAll(".cell")[i * dimension + j].innerHTML = "O";

    if (calculateWinner()) {
      alert(players[turn % 2] + " won!!");
      gameOver = true;
      return;
    }

    turn++;
    document.getElementById("turn").innerHTML = players[turn % 2] + "'s turn";
  }
};


let seconds = 0;

function updateTimer() {
  seconds++;
  document.getElementById('timer').innerText = `How long am I here? ${seconds} seconds`;
}


// Update the timer every second
setInterval(updateTimer, 1000); 
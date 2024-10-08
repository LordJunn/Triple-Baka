let players = [];
let turn = 0;
let gameOver = false;
let dimension = parseInt(document.getElementById("dimensions").value);
let board = new Array(dimension).fill("").map(() => new Array(dimension).fill(""));

const changeDimension = (event) => {
  dimension = parseInt(event.target.value);
  board = new Array(dimension).fill("").map(() => new Array(dimension).fill(""));
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
};

const handleClick = (cell, i, j) => {
  const el = cell;
  if (el.innerHTML !== "" || gameOver) {
    return;
  }

  board[i][j] = turn % 2 === 0 ? "X" : "O";
  el.innerHTML = board[i][j];

  if (calculateWinner()) {
    alert(players[turn % 2] + " won!!");
    gameOver = true;
    return;
  }
  turn++;

  document.getElementById("turn").innerHTML = players[turn % 2] + "'s turn";

  if (turn === dimension * dimension) {
    alert("Game is drawn");
    gameOver = true;
    return;
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
  let i = board[0][0];
  let j = 0;
  while (j < len) {
    if (board[0][0] === "") {
      break;
    }
    if (board[j][j] !== i) {
      break;
    } else {
      j++;
    }
  }

  if (j === len) {
    return true;
  }

  let rev_i = 0;
  let rev_j = len - 1;
  let rev_val = board[rev_i][rev_j];

  while (rev_i < len) {
    if (board[rev_i][rev_j] === "") {
      break;
    }
    if (rev_val !== board[rev_i][rev_j]) {
      break;
    } else {
      rev_i++;
      rev_j--;
    }
  }

  if (rev_i === len) {
    return true;
  }

  return false;
};

const isEmpty = (value) => !value || !value.trim();


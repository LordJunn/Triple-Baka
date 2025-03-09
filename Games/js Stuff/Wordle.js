document.addEventListener("DOMContentLoaded", () => {
    let wordLength = 5; // Default word length
    let words = []; // Array to store words loaded from words.txt
    let currentWord = ""; // The current word to guess
    let guessedWords = [[]]; // To store guesses
    let availableSpace = 1; // Keeps track of where the next letter goes
    let guessedWordCount = 0; // Keeps track of the number of guesses

    const settingsButton = document.getElementById("settings-button");
    const settingsPopup = document.getElementById("settings-popup");
    const startGameButton = document.getElementById("start-game");
    const wordLengthSelector = document.getElementById("word-length-selector");
    const keys = document.querySelectorAll('#keyboard-container button'); // Select all buttons in the keyboard container

    settingsButton.onclick = () => {
        settingsPopup.style.display = "flex";  // Show popup
    };

    startGameButton.onclick = () => {
        wordLength = parseInt(wordLengthSelector.value); // Get selected word length
        settingsPopup.style.display = "none"; // Hide the settings popup
        resetGame(wordLength); // Reset the game
        loadWords();
    };

    // Fetch words from words.txt
    async function loadWords() {
        try {
            const response = await fetch("words.txt");
            const text = await response.text();
            console.log("Words loaded from words.txt:", text); // This will show you the full content of the file
            words = text.split("\n").map(word => word.trim());

            // Filter words based on the selected word length
            const validWords = words.filter(word => word.length === wordLength);
            if (validWords.length > 0) {
                // Randomly select a word from valid words
                const randomIndex = Math.floor(Math.random() * validWords.length);
                currentWord = validWords[randomIndex]; // Set the current word
            } else {
                console.error(`No words found with ${wordLength} characters.`);
            }

            //console.log("Selected word:", currentWord); // Log the word that's chosen

            resetGame(wordLength); // Reset the game once the words are loaded
        } catch (error) {
            console.error("Failed to load words.txt:", error);
        }
    }

    // Update `resetGame` function to use predefined words
    function resetGame(wordLength) {
        const gameBoard = document.getElementById("board");
        gameBoard.innerHTML = "";  // Clear the board
        gameBoard.style.gridTemplateColumns = `repeat(${wordLength}, 1fr)`;  // Set grid based on word length
        createSquares(wordLength);
        guessedWords = [[]];
        availableSpace = 1;
        guessedWordCount = 0;
    }

    // Function to create squares for the game board
    function createSquares(wordLength) {
        const gameBoard = document.getElementById("board");
        const totalSquares = 6 * wordLength;  // 6 guesses, each of `wordLength` squares
  
        for (let index = 0; index < totalSquares; index++) {
            let square = document.createElement("div");
            square.classList.add("square");
            square.classList.add("animate__animated");
            square.setAttribute("id", index + 1);
            gameBoard.appendChild(square);
        }
    }

    function getCurrentWordArr() {
        const numberOfGuessedWords = guessedWords.length;
        return guessedWords[numberOfGuessedWords - 1];
    }

    function updateGuessedWords(letter) {
        const currentWordArr = getCurrentWordArr();
  
        if (currentWordArr && currentWordArr.length < wordLength) {
            currentWordArr.push(letter);
  
            const availableSpaceEl = document.getElementById(String(availableSpace));
            availableSpace = availableSpace + 1;
            availableSpaceEl.textContent = letter;
        }
    }

    function getTileColor(letter, index) {
        const isCorrectLetter = currentWord.includes(letter);
  
        if (!isCorrectLetter) {
            return "rgb(58, 58, 60)";
        }
  
        const letterInThatPosition = currentWord.charAt(index);
        const isCorrectPosition = letter === letterInThatPosition;
  
        if (isCorrectPosition) {
            return "rgb(83, 141, 78)";
        }
  
        return "rgb(181, 159, 59)";
    }

    function handleSubmitWord() {
        const currentWordArr = getCurrentWordArr();
        if (currentWordArr.length !== wordLength) {
            window.alert(`Word must be ${wordLength} letters`);
            return;
        }
  
        const currentWordStr = currentWordArr.join("");

        const firstLetterId = guessedWordCount * wordLength + 1;
        const interval = 200;
        currentWordArr.forEach((letter, index) => {
            setTimeout(() => {
                const tileColor = getTileColor(letter, index);
  
                const letterId = firstLetterId + index;
                const letterEl = document.getElementById(letterId);
                letterEl.classList.add("animate__flipInX");
                letterEl.style = `background-color:${tileColor};border-color:${tileColor}`;
            }, interval * index);
        });
  
        guessedWordCount += 1;
  
        if (currentWordStr === currentWord) {
            window.alert("Congratulations!");
        }
  
        if (guessedWords.length === 6) {
            window.alert(`Sorry, you have no more guesses! The word is ${currentWord}.`);
        }
  
        guessedWords.push([]);
    }

    function handleDeleteLetter() {
        const currentWordArr = getCurrentWordArr();
        // Only allow deletion if the current word array is not empty and hasn't been submitted yet
        if (currentWordArr.length > 0) {
            const removedLetter = currentWordArr.pop();
        
            guessedWords[guessedWords.length - 1] = currentWordArr;
        
            const lastLetterEl = document.getElementById(String(availableSpace - 1));
        
            lastLetterEl.textContent = "";
            availableSpace = availableSpace - 1;
        }
    }
    
    // Listen for keyboard input
    document.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();
        if (["Tab", "Shift", "Control", "Alt", "CapsLock", "Escape", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Meta"].includes(event.key)) {
            event.preventDefault();
            return;
        }  

        if (key === "enter") {
            handleSubmitWord();
            return;
        }

        if (key === "backspace" || key === "delete") {
            handleDeleteLetter();
            return;
        }

        if (key >= "a" && key <= "z") {
            updateGuessedWords(key);
        }
    });

    for (let i = 0; i < keys.length; i++) {
        keys[i].onclick = ({ target }) => {
            const letter = target.getAttribute("data-key");

            if (letter === "enter") {
                handleSubmitWord();
                return;
            }

            if (letter === "del") {
                handleDeleteLetter();
                return;
            }

            updateGuessedWords(letter);
        };
    }

    // Load words from words.txt
    loadWords();
});

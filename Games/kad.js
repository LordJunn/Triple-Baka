const cardsContainer = document.getElementById("cardContainer");
const gridSize = 4; // Change this value to 2, 4, 6 etc
const totalCards = gridSize * gridSize; // Total number of cards
const totalPairs = totalCards / 2; // Number of pairs (must be an even number)

let matched = 0;
let cardOne, cardTwo;
let disableDeck = false;

// Create the card elements dynamically
function createCards() {
    const cardValues = [];
    for (let i = 1; i <= totalPairs; i++) {
        cardValues.push(i, i); // Add pairs
    }

    // Shuffle the card values with a structured approach
    let shuffled = false;
    while (!shuffled) {
        // Shuffle the card values
        cardValues.sort(() => Math.random() - 0.5);

        // Check for adjacent duplicates
        shuffled = true;
        for (let i = 0; i < cardValues.length - 1; i++) {
            if (cardValues[i] === cardValues[i + 1]) {
                shuffled = false; // Found adjacent duplicates
                break;
            }
        }
    }

    // Create cards
    cardValues.forEach(value => {
        const card = document.createElement("li");
        card.classList.add("card");
        card.innerHTML = `
            <div class="view front-view">
                <img src="images/que_icon.svg" alt="icon">
            </div>
            <div class="view back-view">
                <img src="images/img-${value}.png" alt="card-img">
            </div>`;
        card.addEventListener("click", flipCard);
        cardsContainer.appendChild(card);
    });
}
function flipCard({target: clickedCard}) {
    if (cardOne !== clickedCard && !disableDeck) {
        clickedCard.classList.add("flip");
        if (!cardOne) {
            return cardOne = clickedCard;
        }
        cardTwo = clickedCard;
        disableDeck = true;
        let cardOneImg = cardOne.querySelector(".back-view img").src,
            cardTwoImg = cardTwo.querySelector(".back-view img").src;
        matchCards(cardOneImg, cardTwoImg);
    }
}

function matchCards(img1, img2) {
    if (img1 === img2) {
        matched++;
        if (matched == totalPairs) {
            setTimeout(() => {
                alert("You won!");
                resetGame();
            }, 1000);
        }
        cardOne.removeEventListener("click", flipCard);
        cardTwo.removeEventListener("click", flipCard);
        resetCards();
        return;
    }
    setTimeout(() => {
        cardOne.classList.add("shake");
        cardTwo.classList.add("shake");
    }, 400);
    setTimeout(() => {
        cardOne.classList.remove("shake", "flip");
        cardTwo.classList.remove("shake", "flip");
        resetCards();
    }, 1200);
}

function resetCards() {
    cardOne = cardTwo = "";
    disableDeck = false;
}

function resetGame() {
    matched = 0;
    disableDeck = false;
    cardOne = cardTwo = "";
    cardsContainer.innerHTML = ''; // Clear previous cards
    createCards(); // Create new cards
}

// Initialize the game
createCards();

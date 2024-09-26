// helper.js
function sumArray(array) {
    return array.reduce((sum, value) => sum + value, 0);
}

function isInArray(element, array) {
    return array.includes(element);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function intRandom(min, max) {
    return Math.floor(min + Math.random() * (max + 1 - min));
}

export { sumArray, isInArray, shuffleArray, intRandom };

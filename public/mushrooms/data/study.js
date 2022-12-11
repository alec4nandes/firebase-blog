import makeDeck, { ailments, getInfoRowHTML } from "./display-flashcard.js";
import { medicinalMushrooms } from "./mushrooms-data.js";

const getElem = (id) => document.getElementById(id),
    makeDeckButton = getElem("make-deck-button"),
    cardElem = getElem("card"),
    flipCardButton = getElem("flip-card-button"),
    previousCardButton = getElem("previous-card-button"),
    nextCardButton = getElem("next-card-button"),
    cardCountElem = document.getElementById("card-count"),
    studyGuide = document.getElementById("study-guide");

function toggleView({ showCard }) {
    if (showCard) {
        cardElem.style.display = "flex";
    } else {
        studyGuide.style.display = "block";
    }
    [flipCardButton, previousCardButton, nextCardButton].forEach(
        (elem) => (elem.style.display = showCard ? "inline-block" : "none")
    );
    cardCountElem.style.display = showCard ? "block" : "none";
    (showCard ? studyGuide : cardElem).style.display = "none";
    (showCard ? cardElem : studyGuide).scrollIntoView({
        behavior: "smooth",
    });
    (showCard ? studyGuide : cardElem).style.display = "none";
    cardCountElem.style.display = showCard ? "block" : "none";
}

let index, deck, side;

makeDeckButton.onclick = handleMakeDeck;
flipCardButton.onclick = handleFlipCard;
previousCardButton.onclick = handlePreviousCard;
nextCardButton.onclick = handleNextCard;

function handleMakeDeck() {
    index = 0;
    deck = makeDeck();
    side = "front";
    displayCard();
    toggleView({ showCard: true });
}

function handleFlipCard() {
    side = side === "front" ? "back" : "front";
    displayCard();
}

function handlePreviousCard() {
    index--;
    if (index < 0) {
        index = deck.length - 1;
    }
    side = "front";
    displayCard();
}

function handleNextCard() {
    index++;
    if (index === deck.length) {
        index = 0;
    }
    side = "front";
    displayCard();
}

function displayCard() {
    cardElem.innerHTML = deck[index][side];
    updateCount();
}

function updateCount() {
    cardCountElem.innerHTML = `(${index + 1}/${deck.length})`;
}

// STUDY GUIDE
function handleViewStudyGuide(e) {
    e.preventDefault();
    const checked = e.target.querySelector(
        'input[name="sort_by"]:checked'
    )?.value;
    switch (checked) {
        case "ailment":
            studyGuide.innerHTML = Object.entries(ailments)
                .map(
                    ([ailment, names]) => `
                    <h3>${ailment}</h3>
                    ${names
                        .map((name) => getMushroomFromName(name))
                        .map((mush) => getInfoRowHTML(mush))
                        .join("<hr/>")}`
                )
                .join("");
            toggleView({ showCard: false });
            return;
        case "mushroom":
            studyGuide.innerHTML = medicinalMushrooms
                .map((mush) => getInfoRowHTML(mush))
                .join("<hr/>");
            toggleView({ showCard: false });
            return;
    }
}

function getMushroomFromName(name) {
    return medicinalMushrooms.find((data) => data.scientific_name === name);
}

document.getElementById("view-study-guide").onsubmit = handleViewStudyGuide;

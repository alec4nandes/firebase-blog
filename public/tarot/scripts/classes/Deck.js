import Card from "./Card.js";
import Spread from "./Spread.js";
import { cardsInfo } from "../data.js";
import { getComparisonHelper, getOppositeWordsHelper } from "../compare.js";

export default class Deck {
    constructor() {
        this.cardsObject = cardsInfo.reduce((acc, { name, words }) => {
            const revName = `${name} reversed`;
            return {
                ...acc,
                [name]: new Card(name, words),
                [revName]: new Card(revName, getReversedWords(words)),
            };
        }, {});
        this.cardsArray = Object.values(this.cardsObject);

        function getReversedWords(words) {
            return [
                ...new Set(
                    words.map((w) => getOppositeWordsHelper(w)).flat(Infinity)
                ),
            ];
        }
    }

    // returns: [Card]
    getAllCards() {
        return this.cardsArray;
    }

    // returns: Card
    getCard(cardName) {
        return this.cardsObject[cardName];
    }

    // returns: [Card]
    getCards(cardNames) {
        return cardNames.map((cardName) => this.getCard(cardName));
    }

    // returns: Card
    getFlippedCard(cardName) {
        const rev = " reversed",
            revName = cardName.includes(rev)
                ? cardName.replace(rev, "")
                : cardName + rev;
        return this.cardsObject[revName];
    }

    // returns: Card
    getRandomCard() {
        const cards = this.cardsArray;
        return cards[~~(Math.random() * cards.length)];
    }

    // returns: Spread
    getRandomSpread(size) {
        const randomCards = [],
            canAddCard = (randomCard, randomCards) =>
                !randomCards
                    .map((card) => card.getUprightName())
                    .includes(randomCard.getUprightName());
        while (randomCards.length < size) {
            const randomCard = this.getRandomCard();
            canAddCard(randomCard, randomCards) && randomCards.push(randomCard);
        }
        return new Spread(randomCards);
    }

    // returns: Spread
    getSpread(cardNames) {
        return new Spread(this.getCards(cardNames));
    }

    // returns: object
    getDeckComparison(cardName) {
        const card = this.getCard(cardName);
        return getComparisonHelper(this.cardsArray, card);
    }
}

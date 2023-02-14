import { getComparisonHelper } from "../compare.js";

export default class Spread {
    constructor(cards) {
        this.cards = cards;
    }

    // returns: [Card]
    getCards() {
        return this.cards;
    }

    // returns: object
    getSpreadComparison() {
        const result = getComparisonHelper(this.cards);
        Object.entries(result).forEach(
            ([words, info]) =>
                !info.opposites &&
                info.matching.length < 2 &&
                delete result[words]
        );
        return result;
    }

    getSpreadStats() {
        const courts = ["Page", "Knight", "Queen", "King"],
            ranks = new Array(14)
                .fill(0)
                .map((_, i) => (i ? (i < 10 ? i + 1 : courts[i - 10]) : "Ace")),
            suits = ["Pentacles", "Swords", "Cups", "Wands"],
            getEmptyDataSet = (arr) =>
                arr.reduce((acc, curr) => ({ ...acc, [curr]: 0 }), {}),
            result = {
                ranks: getEmptyDataSet(ranks),
                suits: getEmptyDataSet(suits),
                arcana: { major: 0, minor: 0 },
                positions: { upright: 0, reversed: 0 },
            };
        this.cards.forEach((card) => {
            const name = card.getName(),
                rank = ranks.find((r) => name.includes(r)),
                suit = suits.find((s) => name.includes(s)),
                isMajor = !rank && !suit,
                isReversed = card.getIsReversed();
            rank && result.ranks[rank]++;
            suit && result.suits[suit]++;
            result.arcana[isMajor ? "major" : "minor"]++;
            result.positions[isReversed ? "reversed" : "upright"]++;
        });
        removeEmptyEntries(result.ranks);
        removeEmptyEntries(result.suits);
        return result;

        function removeEmptyEntries(obj) {
            Object.entries(obj)
                .filter(([_, val]) => !val)
                .map(([key]) => delete obj[key]);
        }
    }
}

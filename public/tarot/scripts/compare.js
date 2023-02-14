import { oppositeWords } from "./data.js";
import { joinSameValues, joinSameValuesOpposites } from "./combine.js";

function getComparisonHelper(cards, singleCard) {
    const matching = getMatchingWords(cards, singleCard),
        opposites = getOppositeWords(cards, singleCard);
    Object.entries(opposites).forEach(([words, info]) => {
        delete matching[words];
        Object.keys(info.opposites).forEach(
            (oppoWords) => delete matching[oppoWords]
        );
    });
    return {
        ...opposites,
        ...Object.fromEntries(
            Object.entries(matching).map(([words, cardNames]) => [
                words,
                { matching: cardNames },
            ])
        ),
    };
}

function getMatchingWords(cards, singleCard) {
    const result = {};
    (singleCard ? [singleCard] : cards).forEach((outerCard) => {
        const outerWords = outerCard.getWords();
        outerWords.forEach((word) => {
            !result[word] &&
                cards.forEach((innerCard) => {
                    const innerWords = innerCard.getWords();
                    if (innerWords.includes(word)) {
                        result[word] = [
                            ...new Set([
                                ...(result[word] || []),
                                outerCard.getName(),
                                innerCard.getName(),
                            ]),
                        ].sort();
                    }
                });
        });
    });
    return joinSameValues(result);
}

function getOppositeWords(cards, singleCard) {
    const result = {};
    (singleCard ? [singleCard] : cards)
        .map((card) => card.getWords())
        .flat(Infinity)
        .map((word) => [word, getOppositeWordsHelper(word)])
        .forEach(([word, opposites]) =>
            addOpposites(word, opposites, result, cards)
        );
    return joinSameValuesOpposites(result);

    function addOpposites(word, opposites, result, cards) {
        // if word or opposite word is already a result key, don't update object
        if (!result[word] && !opposites.find((oppo) => result[oppo])) {
            opposites.forEach((oppo) => {
                const oppoCards = getNamesWithSameWord(cards, oppo);
                if (oppoCards.length) {
                    const matchingCards = getNamesWithSameWord(cards, word);
                    result[word] = result[word] || {
                        matching: matchingCards,
                    };
                    result[word]["opposites"] = {
                        ...(result[word]["opposites"] || {}),
                        [oppo]: oppoCards,
                    };
                }
            });
        }
    }

    function getNamesWithSameWord(cards, wordsInclude) {
        return cards
            .filter((card) => card.getWords().includes(wordsInclude))
            .map((card) => card.getName())
            .sort();
    }
}

function getOppositeWordsHelper(w) {
    return Object.entries(oppositeWords)
        .map(([word, opposites]) =>
            word === w ? opposites : opposites.includes(w) && word
        )
        .flat(Infinity)
        .filter(Boolean);
}

export { getComparisonHelper, getOppositeWordsHelper };

/*
    models.js formats data for the functions in
    views.js to parse into HTML for DOM injection.
*/

import { words, oppositeWords } from "./words.js";

const suits = {
        Pentacles: {
            represents: "health and career",
            meaning:
                "Focus on long-term goals that will bring security and stability to your life. Make an effort to eat well, exercise, and network.",
        },
        Swords: {
            represents: "learning and logic",
            meaning:
                "Focus on expanding your worldview and skillset. Find a new resource for an old interest, or set out to discover something new. Approach problems with your head instead of your heart. Do not let emotion cloud reason — think before you act.",
        },
        Cups: {
            represents: "human connection and emotion",
            meaning:
                "Focus on strengthening relationships without any ulterior motive. Listen deeply before mentally drafting a response. Approach today's problems with your heart instead of your head. Now is not the time to overanalyze — trust your instinct.",
        },
        Wands: {
            represents: "creativity and passion",
            meaning:
                "Focus on building something new or expanding an old project. Synthesize your passions, even if the first draft is messy. Put it down on paper, then create a plan to get it done.",
        },
    },
    ranks = {
        Ace: { represents: "beginning" },
        2: { represents: "balance" },
        3: { represents: "communication" },
        4: { represents: "rest" },
        5: { represents: "struggle" },
        6: { represents: "growth" },
        7: { represents: "strategy" },
        8: { represents: "effort" },
        9: { represents: "outcome" },
        10: { represents: "ending" },
    },
    people = {
        Page: { represents: "child" },
        Knight: { represents: "adolescent" },
        Queen: { represents: "adult" },
        King: { represents: "elder" },
    },
    deck = createDeck();

function createDeck() {
    const minorArcana = Object.keys(suits)
            .map((suit) =>
                [...Object.keys(ranks), ...Object.keys(people)].map(
                    (rank) => `${rank} of ${suit}`
                )
            )
            .flat(),
        majorArcana = [
            "Fool",
            "Magician",
            "High Priestess",
            "Empress",
            "Emperor",
            "Hierophant",
            "Lovers",
            "Chariot",
            "Strength",
            "Hermit",
            "Wheel of Fortune",
            "Justice",
            "Hanged Man",
            "Death",
            "Temperance",
            "Devil",
            "Tower",
            "Star",
            "Moon",
            "Sun",
            "Judgement",
            "World",
        ],
        deck = [...majorArcana, ...minorArcana].reduce((acc, card, i) => {
            const isMajor = i < majorArcana.length,
                [rank, suit] = isMajor ? [null, null] : card.split(" of ");
            return {
                ...acc,
                [card]: {
                    ...(isMajor ? { isMajor, majorNumber: i } : {}),
                    ...(rank ? { rank } : {}),
                    ...(suit ? { suit } : {}),
                    words: words[card].sort(),
                    opposites: getOppositeWords(card),
                },
            };
        }, {});
    return deck;
}

function getOppositeWords(card) {
    return [
        ...new Set(
            words[card]
                .map((word) => oppositeWords[word])
                .filter(Boolean)
                .flat()
        ),
    ].sort();
}

function draw(size, testCards = []) {
    const getRandom = (arr) => arr[~~(Math.random() * arr.length)],
        cards = Object.keys(deck);
    let drawn = new Set([
        ...testCards.filter((card) =>
            cards.includes(card.replace(" reversed", ""))
        ),
    ]);
    const predrawnSize = drawn.size;
    if (predrawnSize > size) {
        return [...drawn].slice(0, size);
    }
    while (drawn.size < size) {
        drawn.add(getRandom(cards));
    }
    drawn = [...drawn].reduce((acc, card, i) => {
        const isPredrawn = i < predrawnSize,
            isReversed = isPredrawn
                ? card.includes(" reversed")
                : !!~~(Math.random() * 2),
            cardInfo = deck[card.replace(" reversed", "")],
            { words, opposites } = cardInfo,
            cardName = isPredrawn
                ? card
                : `${card}${isReversed ? " reversed" : ""}`;
        return {
            ...acc,
            [cardName]: {
                ...cardInfo,
                ...(isReversed
                    ? { words: opposites || [], opposites: words || [] }
                    : {}),
            },
        };
    }, {});
    return drawn;
}

function getStats(drawn) {
    const statsObj = (obj) =>
            Object.keys(obj).reduce(
                (acc, key) => ({ ...acc, [key + ""]: [] }),
                {}
            ),
        rankStats = statsObj(ranks),
        peopleStats = statsObj(people),
        suitStats = statsObj(suits),
        arcanaStats = { major: [], minor: [] },
        { matching, otherWords, opposites } = compare(drawn);
    Object.entries(drawn).forEach(([card, info]) => {
        const { isMajor, rank, suit } = info;
        if (isMajor) {
            arcanaStats.major.push(card);
        } else {
            arcanaStats.minor.push(card);
            (rankStats[rank] || peopleStats[rank]).push(card);
            suitStats[suit].push(card);
        }
    });
    return {
        rankStats: sortStats(rankStats),
        peopleStats: sortStats(peopleStats),
        suitStats: sortStats(suitStats),
        arcanaStats,
        matching,
        otherWords,
        opposites,
    };
}

/* COMPARE */

function compare(drawn) {
    const data = getCompareData(drawn),
        matchingFunc = (cards) => cards.length > 1,
        otherWordsFunc = (cards) => cards.length === 1,
        filterer = (func, allWordsInOpposites) =>
            Object.entries(data).filter(
                ([word, { cards }]) =>
                    func(cards) && !allWordsInOpposites?.includes(word)
            ),
        reducer = (entries) =>
            entries.reduce(
                (acc, [word, { cards }]) => ({
                    ...acc,
                    [cards.join(", ")]: [
                        ...(acc[cards.join(", ")] || []),
                        word,
                    ].sort(),
                }),
                {}
            ),
        opposites = getOpposites(data),
        otherWords = reducer(
            filterer(otherWordsFunc, getAllWordsInOpposites(opposites))
        ),
        matching = reducer(filterer(matchingFunc));
    return { matching, otherWords, opposites };
}

function getCompareData(drawn) {
    const filterer = (word) =>
            // returns array of names of drawn cards with
            // a specific word in their words array
            Object.entries(drawn)
                .filter(([card, { words }]) => words.includes(word))
                .map(([card]) => card),
        allWords = [
            // all the words for the drawn cards
            ...new Set(
                Object.values(drawn)
                    .map(({ words }) => words)
                    .flat()
            ),
        ].sort();
    return Object.entries(drawn).reduce((acc, [card, { words }]) => {
        /* Object model:
        {
            chaos:
                {
                    cards: ["Tower"],
                    opposites:
                        {
                            peace: {cards: ["Star"]},
                            serenity: {cards: ["Star"]}
                        }
                }
        }
        */
        words.forEach((word) => {
            if (!acc[word]) {
                const opposites = oppositeWords[word]?.filter((oppo) =>
                    allWords.includes(oppo)
                );
                acc[word] = {
                    cards: filterer(word),
                    opposites:
                        opposites?.length &&
                        opposites.reduce(
                            (acc, oppo) => ({
                                ...acc,
                                [oppo]: { cards: filterer(oppo) },
                            }),
                            {}
                        ),
                };
            }
        });
        return acc;
    }, {});
}

function getOpposites(compareData) {
    let result = Object.fromEntries(
        Object.entries(compareData)
            .filter(([_, { opposites }]) => opposites)
            .sort(([aWords, aInfo], [bWords, bInfo]) => {
                // sort by most opposites descending,
                // then alphabetically by word
                const getLength = ({ opposites }) =>
                        Object.entries(opposites).length,
                    diff = getLength(bInfo) - getLength(aInfo);
                return diff || aWords.localeCompare(bWords);
            })
    );
    // delete words from lower lists of opposites
    Object.entries(result).forEach(([word, { opposites }]) =>
        Object.keys(opposites).forEach(
            (opposite) => delete result[opposite].opposites[word]
        )
    );
    // filter out the entries that have no opposites left
    result = Object.fromEntries(
        Object.entries(result).filter(
            ([_, { opposites }]) => Object.entries(opposites).length
        )
    );
    // combine opposites in opposites list that have the same cards
    Object.entries(result).forEach(([words, { opposites }]) => {
        result[words].opposites = combineOppositesList(opposites);
    });
    return result;
}

function combineOppositesList(opposites) {
    return Object.fromEntries(
        Object.entries(
            // reduce opposites lists, combining
            // words with the same cards
            Object.entries(opposites).reduce(
                (acc, [word, { cards }]) => ({
                    ...acc,
                    [cards.join(", ")]: [
                        ...(acc[cards.join(", ")] || []),
                        word,
                    ].sort(),
                }),
                {}
            )
        ).map(([cards, words]) =>
            // flip keys and values
            [words.join(", "), { cards: cards.split(", ") }]
        )
    );
}

function getAllWordsInOpposites(opposites) {
    return [
        ...new Set(
            Object.entries(opposites)
                .map(([key, value]) => [
                    ...key.split(", "),
                    ...Object.keys(value.opposites)
                        .map((oppos) => oppos.split(", "))
                        .flat(),
                ])
                .flat()
        ),
    ];
}

/* END COMPARE */

function sortStats(stats) {
    const filterer = (min, max) =>
            Object.fromEntries(
                Object.entries(stats).filter(
                    ([_, cards]) => min <= cards.length && cards.length <= max
                )
            ),
        dominant = filterer(2, Infinity),
        present = filterer(1, 1),
        absent = filterer(0, 0);
    return { dominant, present, absent };
}

function prepareData(stats) {
    return [
        {
            info: suits,
            isBigPicture: true, // sets .more-text class
            statsSection: stats.suitStats,
            title: "Big Picture",
            description: `
                <p>
                    Alongside the Major Arcana is the Minor Arcana,
                    which is grouped into four different suits.
                    And just like the four cardinal directions,
                    each suit points to a different quadrant of the human experience.
                    Our career paths (Pentacles), intellectual interests (Swords),
                    hidden emotions (Cups), and physical passions (Wands) are
                    the driving forces that make us who we are.
                <p>
                <p>
                    Sometimes one direction pulls us much stronger than the others.
                    Below are your Tarot cards, sorted by how often each suit appears in your reading.
                    What is today's grand theme, and what's missing?
                </p>
                <small>
                    If all are present, pay attention to the order they show up in the cards.
                    The first one is the most important.
                </small>
            `,
        },
        {
            info: ranks,
            statsSection: stats.rankStats,
            title: "Small Picture",
            description: `
                <p>
                    The lower cards of the Minor Arcana number Ace through 10,
                    just like a standard playing deck. Each rank has a special meaning and,
                    like the suits, they are sorted by their overall presence in today's drawing.
                    The absent meanings represent less important areas of your life today.
                </p>
                <p>
                    *** For each present word, include an adjective under that card based on the suit
                </p>
            `,
        },
        {
            info: people,
            statsSection: stats.peopleStats,
            title: "People",
            description: `
                <p>
                    The face cards of each suit represent people of different ages,
                    and the suits themselves determine their personalities.
                    People of all walks of life come and go as time passes on,
                    leaving us with memories both good and bad.
                </p>
                <p>
                    Review the kind of people who showed up in the cards. Do you recognize anyone?
                    How do they fit into the Big and Small Pictures of today's reading?
                    Also take note of who isn't in attendance.
                </p>
                <p>
                    *** ChatGPT: what are personal qualities you would associate with cups… wands… etc.
                    list these adjectives under the cards like the ranks
                </p>
                <small>
                    If all are present, pay attention to the order they show up in the cards.
                    The first one is the most important.
                </small>
            `,
        },
    ];
}

export { draw, getStats, prepareData, compare };

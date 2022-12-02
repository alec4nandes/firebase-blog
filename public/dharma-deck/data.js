const data = {
    spirit: {
        polarity: "neutral",
        courts: {
            fire: { action: "connect", description: "a static shock" },
            water: { action: "listen", description: "a babbling brook" },
            earth: { action: "be still", description: "a quiet graveyard" },
            air: { action: "know", description: "a passing storm" },
        },
    },
    fire: {
        represents: "pain",
        aspect: "body",
        polarity: "yang",
        courts: {
            fire: { action: "burn", description: "a raging wildfire" },
            water: { action: "let go", description: "a drowned flame" },
            air: { action: "inspire", description: "a spark to fan" },
            earth: { action: "tame", description: "a blazing campfire" },
        },
    },
    water: {
        represents: "emotion",
        aspect: "mind",
        polarity: "yin",
        courts: {
            fire: { action: "cry", description: "droplets of steam" },
            water: { action: "cleanse", description: "bubbles in a bath" },
            air: { action: "flow", description: "wind on a river" },
            earth: { action: "adapt", description: "sand absorbing the waves" },
        },
    },
    air: {
        represents: "intellect",
        aspect: "mind",
        polarity: "yang",
        courts: {
            fire: { action: "observe", description: "stars in the heavens" },
            water: {
                action: "focus",
                description: "clear seas and skies",
            },
            air: { action: "breathe", description: "sails full of wind" },
            earth: { action: "decide", description: "paths down a mountain" },
        },
    },
    earth: {
        represents: "health",
        aspect: "body",
        polarity: "yin",
        courts: {
            fire: { action: "build", description: "bricks in a kiln" },
            water: { action: "heal", description: "rain after a drought" },
            air: { action: "give", description: "seeds dropped from above" },
            earth: { action: "ground", description: "roots in the soil" },
        },
    },
};

const suits = ["earth", "air", "water", "fire"];

const ranks = [
    "origin",
    "force",
    "concept",
    "expansion",
    "restriction",
    "illumination",
    "creativity",
    "logic",
    "potential",
    "manifestation",
];

const rankPolarities = {
    [ranks[0]]: "neutral",
    2: "yang",
    3: "yin",
    4: "yang",
    5: "yin",
    6: "neutral",
    7: "yang",
    8: "yin",
    9: "neutral",
    10: "neutral",
};

function makeCards() {
    return suits
        .map((suit) =>
            // Buddha-10 + 4 courts (cross-suits) + 1 spirit card
            new Array(10 + suits.length + 1)
                .fill(0)
                .map((_, i, a) =>
                    i < a.length - 1
                        ? makeCardObject(getRank(i), suit, i)
                        : makeCardObject(suit, "spirit")
                )
        )
        .flat();
}

function makeCardObject(rank, suit, i) {
    const cardName = getCardName(rank, suit),
        represents = getRepresents(rank, suit, i),
        description = getDescription(rank, suit),
        polarity = getPolarity(rank, suit);
    return {
        cardName,
        rank: suit === "spirit" ? suit : rank,
        suit: suit === "spirit" ? rank : suit,
        represents,
        ...(description ? { description } : {}),
        polarity,
    };
}

function capitalize(str) {
    return str[0].toUpperCase() + str.slice(1);
}

function getRank(i) {
    return i ? (ranks[i] ? i + 1 : suits[i % 10]) : ranks[0];
}

function getCardName(rank, suit) {
    return suit === "spirit"
        ? `${capitalize(rank)} ${capitalize(suit)}`
        : rank === ranks[0]
        ? `${capitalize(suit)} Buddha`
        : rank === suit
        ? `Double ${capitalize(suit)}`
        : `${capitalize("" + rank)} of ${capitalize(suit)}`;
}

function getRepresents(rank, suit, i) {
    return ranks[i]
        ? `${ranks[i]} of ${data[suit].represents}`
        : data[suit].courts[rank].action;
}

function getDescription(rank, suit) {
    return data[suit].courts[rank]?.description;
}

function getPolarity(rank, suit) {
    const rankPolarity = getRankPolarity(rank),
        suitPolarity = data[suit].polarity,
        result = [...new Set([rankPolarity, suitPolarity].filter(Boolean))];
    return result.length === 1
        ? result
        : result.includes("neutral")
        ? result.sort().reverse().join("/")
        : "neutral";
}

function getRankPolarity(rank) {
    return rankPolarities[rank] || data[rank].polarity;
}

// const symbols = { fire: "🜂", water: "🜄", air: "🜁", earth: "🜃" };

const sefirot = {
    [ranks[0]]: "Kether",
    2: "Chokmah",
    3: "Binah",
    4: "Chesed",
    5: "Geburah",
    6: "Tiphareth",
    7: "Netzach",
    8: "Hod",
    9: "Yesod",
    10: "Malkuth",
};

function getCardHTML(card) {
    const isSpirit = card.rank === "spirit",
        isNumbered = !isNaN(card.rank);

    return `<div class="card ${card.suit}"
        style="${
            card.rank === ranks[0] || isSpirit
                ? `background-image: url('images/buddha-${
                      card[isSpirit ? "rank" : "suit"]
                  }.png')`
                : ""
        }">
        <div class="suit-symbols ${
            isSpirit
                ? "spirit-symbol"
                : !isNumbered
                ? "double"
                : `rank-${card.rank}`
        }">
        ${
            card.rank === ranks[0]
                ? ""
                : new Array(isNumbered ? card.rank : 1)
                      .fill(0)
                      .map(
                          () =>
                              `<div class="suit-symbol ${card.suit} ${
                                  ranks.includes(card.rank)
                                      ? ""
                                      : `border-${card.rank}`
                              }">
                              <img src="images/element-${card.suit}.png" />
                        </div>`
                      )
                      .join("")
        }
        </div>
        <div class="card-info">
            <p><strong>${card.cardName}</strong></p>
            <p><u>${card.represents}</u></p>
            ${card.description ? `<p>${card.description}</p>` : ""}
            <p><strong>${card.polarity}</strong></p>
            <p><em>rank (${card.rank === ranks[0] ? 1 : card.rank}${
        sefirot[card.rank] ? `. ${sefirot[card.rank]}` : ""
    }): ${getRankPolarity(card.rank)}</em></p>
            <p><em>suit (${card.suit}): ${data[card.suit].polarity}</em></p>
        </div>
    </div>`;
}

const allCards = makeCards(),
    count = {};

function showAllCards() {
    showCards(allCards);
    scrollToCards();
}

function showRandomCards(size) {
    showCards(getSpread(size));
    scrollToCards();
}

function scrollToCards() {
    const cardsElem = document.getElementById("cards");
    cardsElem.style.paddingBottom = "60px";
    cardsElem.scrollIntoView({ behavior: "smooth" });
}

function showCards(cards) {
    document.getElementById("cards").innerHTML = cards
        .map((card) => {
            count[card.polarity] = (count[card.polarity] || 0) + 1;
            return getCardHTML(card);
        })
        .join("");

    console.log(count);
}

function getSpread(size) {
    const result = new Set();
    while (result.size < size) {
        result.add(allCards[~~(Math.random() * allCards.length)]);
    }
    return [...result];
}

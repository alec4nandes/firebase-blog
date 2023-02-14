import { cardNames } from "./data.js";

function sortCards(cards) {
    cards.sort(
        (a, b) =>
            cardNames.indexOf(a.getName()) - cardNames.indexOf(b.getName())
    );
    return cards;
}

function sortEntries(obj) {
    const arr = Object.entries(obj);
    if (arr.length) {
        arr.sort((a, b) => a[0].localeCompare(b[0]));
        return arr;
    } else {
        return [];
    }
}

function getClassName(card) {
    return `card-${card.getName().replaceAll(" ", "-")}`;
}

function makeCardButtonsFromNames(cardNames, deck) {
    const cards = deck.getCards(cardNames);
    return makeCardButtonsFromCards(cards);
}

function makeCardButtonsFromCards(cards, isNotSorted) {
    return (isNotSorted ? cards : sortCards(cards))
        .map(
            (card, i, a) => `
                <button class="${getClassName(card)}">
                    ${
                        isNotSorted
                            ? `<img src="./assets/cards/${card.getUprightName()}.jpg"
                                class="${
                                    card.getIsReversed()
                                        ? "reversed"
                                        : "upright"
                                }" />`
                            : ""
                    }
                    ${card.getName()}${
                // no last comma
                !isNotSorted && i < a.length - 1 ? ", " : ""
            }                        
                </button>`
        )
        .join("");
}

function addSingleCardHandlers(cards, deck) {
    cards.forEach((card) =>
        document
            .querySelectorAll(`.${getClassName(card)}`)
            .forEach(
                (button) =>
                    (button.onclick = () => handleShowSingleCard(card, deck))
            )
    );
}

function showDisplay(elem) {
    document.querySelector("#display").style.minHeight = "100vh";
    elem.scrollIntoView({ behavior: "smooth" });
}

// PICK CARD DROPDOWN MENU

function buildSelects() {
    document.querySelectorAll(".pick-card").forEach((elem) => {
        elem.innerHTML = `<option value="---" selected ${
            elem.id === "pick-single-card" ? "disabled" : ""
        }>---</option>
        ${cardNames
            .map((name) => `<option value="${name}">${name}</option>`)
            .join("")}`;
    });
}

// SINGLE CARD

function handleShowSingleCard(card, deck) {
    document.querySelector("#pick-single-card").value = card.getName();
    document.querySelector("#display").innerHTML = getSingleCardHTML(
        card,
        deck
    );
    addSingleCardHandlers(deck.getAllCards(), deck);
    showDisplay(document.querySelector("#single-card"));
}

function getSingleCardHTML(card, deck) {
    const name = card.getName(),
        words = card.getWords(),
        flippedCard = deck.getFlippedCard(name),
        comparison = deck.getDeckComparison(name);
    return `
        <button class="${getClassName(flippedCard)}">flip</button>
        <div id="card-words">
            <img src="./assets/cards/${card.getUprightName()}.jpg"
                id="single-card-image"
                class="${card.getIsReversed() ? "reversed" : "upright"}" />
            ${
                words.length
                    ? `
                    <ul>
                        ${words.map((word) => `<li>${word}</li>`).join("")}
                    </ul>`
                    : ""
            }
        </div>
        ${getCompareTablesHTML(comparison, deck)}`;
}

// SPREAD

function handleShowSpread(spread, deck) {
    const display = document.querySelector("#display");
    document.querySelector("#pick-single-card").value = "---";
    display.innerHTML = getSpreadHTML(spread, deck);
    const spreadCards = spread.getCards(),
        customSelects =
            document.forms["custom-spread"].querySelectorAll("select");
    customSelects.forEach(
        (elem, i) => (elem.value = spreadCards[i]?.getName() || "---")
    );
    addSingleCardHandlers(spreadCards, deck);
    showDisplay(display);
}

function getSpreadHTML(spread, deck) {
    const cards = spread.getCards(),
        stats = spread.getSpreadStats(),
        comparison = spread.getSpreadComparison();
    return `
        <div style="width: 100%;">
            <hr />
            <h2>Spread</h2>
        </div>
        <div id="spread-card-buttons">
            ${makeCardButtonsFromCards(cards, true)}
        </div>
        ${getSpreadStatsTablesHTML(stats)}
        ${getCompareTablesHTML(comparison, deck)}`;
}

function getSpreadStatsTablesHTML(stats) {
    console.log(stats);
    return `
        <div id="spread-stats">
            ${Object.entries(stats)
                .map(([header, data]) => {
                    const ents =
                        header === "ranks"
                            ? Object.entries(data).sort((a, _) =>
                                  a[0] === "Ace" ? -1 : 0
                              )
                            : Object.entries(data);
                    return `
                        <table>
                            <thead>
                                <tr>
                                    <th colspan="2">${header}</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${ents
                                    .map(
                                        ([key, val]) => `
                                        <tr>
                                            <td>${key}</td>
                                            <td>${val}</td>
                                        </tr>`
                                    )
                                    .join("")}
                            </tbody>
                        </table>`;
                })
                .join("")}
        </div>`;
}

function getCompareTablesHTML(comparison, deck) {
    return (
        sortEntries(comparison)
            ?.map(
                ([words, val]) => `
                <table>
                    <tbody>
                        <tr>
                            <th>${words}</th>
                            <th>${makeCardButtonsFromNames(
                                val.matching,
                                deck
                            )}</th>
                        </tr>
                        ${
                            val.opposites
                                ? sortEntries(val.opposites)
                                      .map(
                                          ([oppoWords, cardNames]) => `
                                            <tr>
                                                <td><em>unlike</em> ${oppoWords}</td>
                                                <td>${makeCardButtonsFromNames(
                                                    cardNames,
                                                    deck
                                                )}</td>
                                            </tr>`
                                      )
                                      .join("")
                                : ""
                        }
                    </tbody>
                </table>`
            )
            .join("") || "<p><em>No comparisons.</em></p>"
    );
}

export { buildSelects, handleShowSingleCard, handleShowSpread };

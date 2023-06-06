/*
    views.js takes formatted data from models.js
    and parses it into HTML for DOM injection.
*/

import { getStats, prepareData } from "./models.js";

function displayStats(elem, drawn) {
    const cardNames = Object.keys(drawn),
        stats = getStats(drawn),
        { matching, opposites, otherWords } = stats,
        majorArcana = stats.arcanaStats.major,
        isPluralArcana = majorArcana.length > 1,
        seriouses = ["somewhat serious", "moderately serious", "very serious"],
        seriousIndex =
            Math.ceil(
                (majorArcana.length / cardNames.length) * seriouses.length
            ) - 1,
        serious = seriouses[seriousIndex];
    elem.innerHTML = `
        <section>
            <p>${getImagesFromCardNames(cardNames, "drawn")}</p>
        </section>
        <section>
            <h2>Major Arcana</h2>
            <p>
                Major Arcana cards are the most powerful in the deck, blah blah blah....
            </p>
            <div class="stats-section">
                <div class="subsection">
                    <strong>
                        ${
                            majorArcana.length
                                ? `There ${isPluralArcana ? "are" : "is"} ${
                                      majorArcana.length
                                  } major arcana card${
                                      isPluralArcana ? "s" : ""
                                  } in this reading. The tone of this reading is ${serious}.`
                                : "There are no major arcana cards in this drawing. The tone of this reading is not too serious."
                        }
                    </strong>
                    <p style="margin-bottom: 0">
                        ${getImagesFromCardNames(majorArcana, "small")}
                    </p>
                </div>
            </div>
        </section>
        ${prepareData(stats)
            .map((data) => formatSection({ drawn, ...data }))
            .join("")}
        <section>
            <h2>Words</h2>
            <p>...</p>
            <div class="stats-section">
                <div class="subsection">
                    <h3 class="subsection-header">Matching</h3>
                    ${getMatchingTables(matching)}
                </div>
                <div class="subsection opposites">
                    <h3 class="subsection-header">Opposites</h3>
                    ${getOppositesTables(opposites)}
                </div>
                <div class="subsection">
                    <h3 class="subsection-header">Other Words</h3>
                    ${getOtherWordsTables(otherWords)}
                </div>
            </div>
        </section>
    `;

    function getMatchingTables(matching) {
        const entries = Object.entries(matching);
        return entries.length
            ? `
                <ul class="tiled">
                    ${entries
                        .map(
                            ([cards, words]) => `
                                <li>
                                    <h4>${words.join(", ")}</h4>
                                    ${getImagesFromCardNames(
                                        cards.split(", "),
                                        "x-small"
                                    )}
                                </li>
                            `
                        )
                        .join("")}
                </ul>
            `
            : "<p>No matches!</p>";
    }

    function getOppositesTables(opposites) {
        const entries = Object.entries(opposites);
        return entries.length
            ? `
                <div class="opposites-tables-container">
                    ${entries
                        .map(
                            ([words, { cards, opposites }]) => `
                                <table>
                                    <tr>
                                        <th rowspan="${
                                            Object.entries(opposites).length
                                        }">
                                            ${words}
                                            <br/>
                                            ${getImagesFromCardNames(
                                                cards,
                                                "x-small"
                                            )}
                                        </th>
                                        ${Object.entries(opposites)
                                            .slice(0, 1)
                                            .map(
                                                ([words, { cards }]) => `
                                                    <td>
                                                        ${words}
                                                        <br/>
                                                        ${getImagesFromCardNames(
                                                            cards,
                                                            "x-small"
                                                        )}
                                                    </td>
                                                `
                                            )
                                            .join("")}
                                    </tr>
                                    ${Object.entries(opposites)
                                        .slice(1)
                                        .map(
                                            ([words, { cards }]) => `
                                                <tr>
                                                    <td>
                                                        ${words}
                                                        <br/>
                                                        ${getImagesFromCardNames(
                                                            cards,
                                                            "x-small"
                                                        )}
                                                    </td>
                                                </tr>
                                            `
                                        )
                                        .join("")} 
                                </table>
                            `
                        )
                        .join("")}
                </div>
            `
            : "No opposites!";
    }

    function getOtherWordsTables(otherWords) {
        const entries = Object.entries(otherWords);
        return entries.length
            ? `
                <ul class="tiled full-width">
                    ${Object.entries(otherWords)
                        .map(
                            ([card, words]) => `
                                <li>
                                    <table>
                                        <tr>
                                            <td>
                                                ${getImagesFromCardNames(
                                                    [card],
                                                    "x-small"
                                                )}
                                            </td>
                                            <th>${words.join(", ")}</th>
                                        </tr>
                                    </table>
                                </li>
                            `
                        )
                        .join("")}
                </ul>
            `
            : "No other words!";
    }
}

function getImagesFromCardNames(cards, classes) {
    const imgHTML = (card) => {
        const reverse = () => (card.includes(" reversed") ? " reversed" : ""),
            upright = card.replace(" reversed", "");
        return `<img src="./assets/cards/${upright}.jpg" class="${classes}${reverse()}"
            alt="${upright}${reverse()} tarot card" />`;
    };
    return cards.map(imgHTML).join("");
}

function formatSection({
    drawn,
    info,
    isBigPicture,
    statsSection,
    title,
    description,
}) {
    const passing = { drawn, info, isBigPicture },
        { dominant, present, absent } = statsSection;
    return `
        <section>
            <h2>${title}</h2>
            <p>${description}</p>
            <div class="stats-section">
                ${formatHelper({
                    ...passing,
                    subsection: dominant,
                    header: "Dominant",
                    description:
                        "These messages have appeared among more than one card. They have strong energy.",
                })}
                ${formatHelper({
                    ...passing,
                    subsection: present,
                    header: "Present",
                    description: "These are other energies in the spread.",
                })}
                ${formatHelper({
                    ...passing,
                    subsection: absent,
                    header: "Absent",
                    description:
                        "Sometimes what's absent is just as important as what's present. Make note of what's missing from this reading.",
                    isAbsent: true,
                })}
            </div>
        </section>
    `;
}

function formatHelper({
    drawn,
    info,
    isBigPicture,
    subsection,
    header,
    description,
    isAbsent,
}) {
    const entries = Object.entries(subsection),
        ulClass = isAbsent ? "" : isBigPicture ? "more-text" : "tiled";
    return entries.length
        ? `
            <div class="subsection">
                <h3 class="subsection-header">
                    ${header}
                    <span class="tooltip">ⓘ
                        <span class="tooltiptext">${description}</span>
                    </span>
                </h3>
                <ul class="${ulClass}">
                    ${entries.sort(sortEntries).map(listItemHTML).join("")}
                </ul>
            </div>
        `
        : "";

    function sortEntries(a, b) {
        if (isAbsent) {
            // sort numbered ranks for absent cards
            return a[0] === "Ace" ? -1 : +a[0] - +b[0];
        } else {
            // sort entries by their occurence in the drawn cards
            const getIndex = (key) =>
                Object.keys(drawn).findIndex((name) => name.includes(key));
            return getIndex(a[0]) - getIndex(b[0]);
        }
    }

    function listItemHTML([key, cards]) {
        const { represents, meaning } = info[key + ""],
            showMeaning = meaning && !isAbsent;
        return `
            <li>
                <h4>
                    <em>
                        <span class="key"><strong>${key}</strong>:</span>
                        ${represents}
                    </em>
                </h4>
                ${
                    cards.length
                        ? `
                            <div class="small-cards">
                                ${getImagesFromCardNames(cards, "small")}
                            </div>
                          `
                        : ""
                }
                ${showMeaning ? `<p>${meaning}</p>` : ""}
            </li>
        `;
    }
}

export { displayStats };

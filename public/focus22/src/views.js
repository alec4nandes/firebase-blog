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
            <h2>These are your six cards:</h2>
            <p>${getImagesFromCardNames(cardNames, "drawn")}</p>
            <p>Swipe right to start learning more, or navigate using the menu above.</p>
        </section>
        <section>
            <h2>Major Arcana</h2>
            <p>
                Not all Tarot cards hold equal importance.
                Some are steeped in deep symbolic meaning and reflect the most fundamental forces of nature.
                These are the Major Arcana cards.
            </p>
            <p>
                More of these cards in a reading indicates more urgency.
                Take seriously the messages these cards give you in proportion to how many there are.
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
                    <ul>
                        ${majorArcana
                            .map(
                                (card) =>
                                    `<li><strong>${card}</strong>: [MEANING]</li>`
                            )
                            .join("")}
                    </ul>
                </div>
            </div>
        </section>
        ${prepareData(stats)
            .map((data) => formatSection({ drawn, ...data }))
            .join("")}
        <section>
            <h2>Words</h2>
            <p>
                Each card holds an array of words that best represent it,
                and not all the words of the deck are distinct.
                There is a lot of overlap and sometimes even contradiction between cards in a spread.
            </p>
            <p>
                If multiple cards share the same word, there is a stronger meaning behind it.
                If one card's words cancel out another card, consider the opposing forces at work.
                Think about the conflict at hand and which side you belong to.
            </p>
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
            ${description}
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
                    <span class="tooltip">
                        <span class="tooltip-icon">ⓘ</span>
                        <span class="tooltiptext">
                            ${description}
                            <br/>
                            <button class="close-tooltip">close</button>
                        </span>
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

/* PRELOADING */

function preloadImages(drawn, elem) {
    const loader = document.querySelector("#loader");
    loader.style.display = "block";
    // let the loading gif play for a bit
    setTimeout(() => {
        const urls = Object.keys(drawn)
            .map((cardName) => cardName.replace(" reversed", ""))
            .map((upright) => `./assets/cards/${upright}.jpg`);
        let loaded = 0;
        for (const url of urls) {
            const img = new Image();
            img.onload = () =>
                ++loaded === urls.length && readyToLoad(elem, drawn);
            img.src = url;
        }
    }, 2000);
}

function readyToLoad(elem, drawn) {
    displayStats(elem, drawn);
    const slides = [
        ...document.querySelector("main").querySelectorAll("section"),
    ];
    let slideIndex = 0;
    displayNavigation();
    enableMobileTooltips();
    // small time buffer for injecting images into DOM
    setTimeout(() => {
        loader.style.display = "none";
    }, 150);

    function displayNavigation() {
        const navElem = document.querySelector("header");
        navElem.innerHTML = `
            <button id="previous"><</button>
            ${slides
                .map(
                    (_, i) =>
                        `<span class="nav-dot${
                            i ? "" : " current-nav-dot"
                        }">&bull;</span>`
                )
                .join("")}
            <button id="next">></button>
            <button id="home">home</button>
        `;
        const navDots = document.querySelectorAll(".nav-dot"),
            prev = document.querySelector("#previous"),
            next = document.querySelector("#next"),
            home = document.querySelector("#home");
        elem.onscroll = () => handleMove(navDots);
        elem.ontouchmove = () => handleMove(navDots);
        navDots.forEach((dot, i) => (dot.onclick = () => scroller(i)));
        prev.onclick = () => slides[slideIndex - 1] && scroller(--slideIndex);
        next.onclick = () => slides[slideIndex + 1] && scroller(++slideIndex);
        home.onclick = () => location.reload();
    }

    function handleMove(navDots) {
        const showing = slides.findLastIndex(
            (slide) =>
                slide.getBoundingClientRect().left < window.innerWidth / 2
        );
        navDots.forEach((dot, i) =>
            dot.classList[i === showing ? "add" : "remove"]("current-nav-dot")
        );
        slideIndex = showing;
    }

    function scroller(index = slideIndex) {
        slides[index].scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start",
        });
        slideIndex = index;
    }
}

function enableMobileTooltips() {
    document.querySelectorAll(".tooltip").forEach((elem) => {
        const icon = elem.querySelector(".tooltip-icon"),
            text = elem.querySelector(".tooltiptext"),
            closeButton = text.querySelector(".close-tooltip");
        icon.onclick = () => (text.style.visibility = "visible");
        closeButton.onclick = () => (text.style.visibility = "hidden");
    });
}

export { preloadImages };

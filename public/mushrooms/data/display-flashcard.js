import { medicinalMushrooms } from "./mushrooms-data.js";

function shuffle(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

function makeDeck() {
    const sides = getSides(),
        singleAilSide = Object.entries(sides).find(([side, arr]) =>
            arr.includes("single_ailment")
        )?.[0];
    if (singleAilSide) {
        const keys = sides[singleAilSide === "front" ? "back" : "front"],
            ailEntries = shuffle(getAilEntries(keys));
        return ailEntries.map(([ail, names]) =>
            getSingleAilFrontAndBack(singleAilSide, ail, names, keys)
        );
    } else {
        const keys = Object.values(sides).flat(),
            validChoices = shuffle(findValidChoices(keys));
        return validChoices.map((mush) => getFrontAndBack(sides, mush));
    }
}

function getSides() {
    return getForms().reduce((acc, form) => {
        const data = new FormData(form),
            keys = [...data.keys()];
        return {
            ...acc,
            [form.id]: keys
                .filter((key) => form[key].checked)
                .map((key) =>
                    key === "all_ails" ? ["cancers", "illnesses"] : key
                )
                .flat(),
        };
    }, {});
}

function findValidChoices(keys) {
    return medicinalMushrooms.filter(
        (mush) =>
            // only use mushrooms where no selected key is undefined
            !keys.find((key) => !mush[key])
    );
}

// DISPLAY: NOT SINGLE AILMENT

function getFrontAndBack(sides, mush) {
    const reducer = (side) =>
            sides[side].reduce(
                (acc, key) => ({ ...acc, [key]: mush[key] }),
                {}
            ),
        front = getInfoRowHTML(reducer("front")),
        back = getInfoRowHTML(reducer("back"));
    return { front, back };
}

// DISPLAY: SINGLE AILMENT

function getAilEntries(keys) {
    const ailments = getAllAilments(),
        validSciNames = findValidChoices(keys).map(
            (mush) => mush.scientific_name
        );
    return Object.entries(ailments).filter(
        ([_, val]) => !val.find((v) => !validSciNames.includes(v))
    );
}

function getAllAilments() {
    return medicinalMushrooms.reduce((acc, mush) => {
        const ails = [...mush.cancers, ...mush.illnesses];
        ails.forEach(
            (ail) =>
                (acc[ail] = acc[ail]
                    ? [...acc[ail], mush.scientific_name]
                    : [mush.scientific_name])
        );
        return acc;
    }, {});
}

function getSingleAilFrontAndBack(ailSide, ail, names, keys) {
    const mushrooms = names.map((name) =>
            medicinalMushrooms.find((mush) => mush.scientific_name === name)
        ),
        reducer = (mush) =>
            keys.reduce(
                (acc, key) => ({
                    ...acc,
                    [key]: mush[key],
                }),
                {}
            );
    return {
        [ailSide]: ail,
        [ailSide === "front" ? "back" : "front"]: mushrooms
            .map((mush) => getInfoRowHTML(reducer(mush)))
            .join("<hr/>"),
    };
}

function getInfoRowHTML(data) {
    const notImages = Object.keys(data).filter((key) => key !== "images");
    return `
        <div class="info-row">
            ${
                data.images
                    ? `
                        <div class="images">
                            ${data.images
                                .map(
                                    (url) => `
                                        <a href="${url}" target="_blank" rel="noreferrer">
                                            <img style="display: none;"
                                                onload="event.target.style.display = 'inline-block';"
                                                src="${url}" />
                                        </a>`
                                )
                                .join("")}
                        </div>`
                    : ""
            }
            ${
                notImages.length
                    ? `
                        <div>
                                ${notImages
                                    .map(
                                        (key) =>
                                            `<p>
                                                <strong><u>${key.replaceAll(
                                                    "_",
                                                    " "
                                                )}</u></strong>
                                                <br/>${
                                                    Array.isArray(data[key])
                                                        ? data[key].join(", ")
                                                        : data[key]
                                                }
                                            </p>`
                                    )
                                    .join("")}
                        </div>`
                    : ""
            }
        </div>`;
}

export default makeDeck;

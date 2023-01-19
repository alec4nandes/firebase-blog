import baguaInfo from "./iching-bagua-info.mjs";
import definitions from "./iching-definitions.mjs";

function renderIChingCast(res, lines) {
    res.render("iching-cast", {
        lines,
        meta: {
            title: `I-Ching: ${lines ? "Custom Reading" : "Get a Reading"}`,
            description: lines
                ? "View this specific reading of the ancient Chinese oracle, the I-Ching!"
                : "Get a reading from the ancient Chinese oracle, the I-Ching!",
            url: `https://fern.haus/iching/cast${
                lines ? "/?lines=$lines_param" : ""
            }`,
            image: "https://fern.haus/images/fern-haus-site-logo.png",
        },
    });
}

function renderIChingBagua(res, bagua) {
    res.render("iching-bagua", {
        bagua,
        all_bagua_info: baguaInfo,
        bagua_info: baguaInfo[bagua],
        meta: {
            title: `I-Ching: Bagua${bagua ? ` — ${bagua}` : ""}`,
            description: bagua
                ? `Learn all about the bagua ${bagua} and its trigram!`
                : "Learn all about the 8 bagua and their trigrams!",
            url: `https://fern.haus/iching/bagua${
                bagua ? "/?bagua=$bagua" : ""
            }`,
            image: "https://fern.haus/images/fern-haus-site-logo.png",
        },
    });
}

function renderIChingText(res) {
    res.render("iching-text", {
        definitions: convertKeysToLinks(definitions),
        table_data: getHexagramTableData(),
    });
}

function convertKeysToLinks(definitions) {
    return Object.fromEntries(
        Object.entries(definitions).map(([key, def]) => [
            key
                .split("/")
                .map(
                    (bagua) =>
                        `<a href="/iching/bagua/?bagua=${bagua}">${bagua}</a>`
                )
                .join(" / "),
            def,
        ])
    );
}

function getHexagramTableData() {
    const baguaNames = [
        "heaven",
        "earth",
        "fire",
        "water",
        "lake",
        "mountain",
        "thunder",
        "wind",
        "",
    ];
    let result = [];
    for (let i = 0; i < baguaNames.length; i++) {
        result.push(new Array(baguaNames.length).fill(""));
    }
    Object.entries(definitions).forEach(([key, value]) => {
        const names = key.split("/"),
            [i1, i2] = names
                // the columns should be the top trigrams
                // because the headings are on top:
                .reverse()
                .map((name, i) => baguaNames.indexOf(name)),
            heading = `<a href="/iching/bagua/?bagua=${
                names[1]
            }">${names[1].slice(0, 4)}</a>`;
        result[i1 + 1][
            i2 + 1
        ] = `<a href="/iching/text#${value.number}">${value.number}</a>`;
        result[0][i2 + 1] = heading;
        result[i2 + 1][0] = heading;
    });
    return result;
}

export { renderIChingCast, renderIChingBagua, renderIChingText };

const lineSymbols = (baguaClass) => ({
    // yin
    0: `<div class="${baguaClass} line-symbol yin"></div>`,
    // yang
    1: `<div class="${baguaClass} line-symbol yang"></div>`,
    // yin-changing (into yang)
    2: `<div class="${baguaClass} line-symbol yin changing"></div>`,
    // yang-changing (into yin)
    3: `<div class="${baguaClass} line-symbol yang changing"></div>`,
});

function hexagramHtml(name, lines) {
    const { number, title } = definitions[name];

    return `
        <div class="hexagram">
            <div class="title">
                <p>
                    <a href="/iching/text.html#${number}">${number}. ${title}</a>
                </p>
                <p>
                    ${name
                        .split("/")
                        .map(
                            (bagua) =>
                                `<a href="/iching/bagua/?bagua=${bagua}">${bagua}</a>`
                        )
                        .join(" / ")}
                </p>
            </div>
            <div class="lines">
                ${lines
                    .map(
                        (line, i, a) =>
                            `<div class="line">
                                ${makeLineInnerHTML(
                                    getLineNumber(a, i),
                                    line,
                                    name
                                )}
                            </div>`
                    )
                    .join("")}
            </div>
        </div>`;
}

function makeLineInnerHTML(lineNumber, line, hexagramName) {
    const baguaClass = hexagramName?.split("/")[lineNumber > 3 ? 0 : 1] || "";
    return `<div class="line-number">${lineNumber}</div> ${
        lineSymbols(baguaClass)[line]
    }`;
}

function displayHexagrams(hexagramInfo) {
    document.querySelector("#reading").innerHTML = `<div class="hexagrams">
        ${hexagramInfo.hexNames
            .map((name, i) =>
                hexagramHtml(name, hexagramInfo[i ? "changingLines" : "lines"])
            )
            .join("")}
        </div>`;
}

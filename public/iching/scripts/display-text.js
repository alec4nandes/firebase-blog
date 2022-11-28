const situation1 = {
        message: "Consider the hexagram text (judgment) of the hexagram.",
        getReading: ({ def1 }) => [
            { definition: def1, reading: def1.definition },
        ],
    },
    situation2 = {
        message: "Consider the line text of the changing line.",
        getReading: ({ def1, lineNumbers }) => [
            {
                definition: def1,
                lines: { [lineNumbers[0]]: def1[lineNumbers[0]] },
            },
        ],
    },
    situation3 = {
        message:
            "Consider the line texts and also the hexagram text (judgment) of the resulting hexagram.",
        getReading: ({ def1, def2, lineNumbers }) => [
            {
                definition: def1,
                lines: lineNumbers.reduce(
                    (acc, num) => ({ ...acc, [num]: def1[num] }),
                    {}
                ),
            },
            { definition: def2, reading: def2.definition },
        ],
    },
    situation4 = {
        message:
            "Consider the hexagram texts (judgments) of the base and resulting hexagrams. (You could check out the line texts, however they will often be conflicting, and may not clearly relate to the situation.)",
        getReading: ({ def1, def2 }) => [
            { definition: def1, reading: def1.definition },
            { definition: def2, reading: def2.definition },
        ],
    },
    changingLineRules = {
        0: situation1,
        1: situation2,
        2: situation3,
        3: situation3,
        4: situation4,
        5: situation4,
        6: situation4,
    };

function textHtml(hexagramInfo) {
    const { changingLineNumbers, hexNames, lines } = hexagramInfo,
        def1 = definitions[hexNames[0]],
        def2 = definitions[hexNames[1]],
        changingLineRule = changingLineRules[changingLineNumbers.length],
        readingInfo = changingLineRule.getReading({
            def1,
            def2,
            lineNumbers: changingLineNumbers,
        });

    return `<div class="reading-type">
            <p>Number of changing lines: ${changingLineNumbers.length}</p>
            <p>${changingLineRule.message}</p>
        </div>
        <div class="texts">
            ${readingInfo
                .map((hexInfo, i) =>
                    hexInfoTableHtml(hexInfo, hexagramInfo.hexNames[i], lines)
                )
                .join("")}
        </div>`;
}

function hexInfoTableHtml(hexInfo, hexName, lines) {
    const { number, title } = hexInfo.definition;

    return `<table>
        <thead>
            <tr>
                <th colSpan="2">
                    <a href="/iching/text/#${number}">${number}. ${title}</a>
                    (${hexName
                        .split("/")
                        .map(
                            (name) =>
                                `<a href="/iching/bagua/?bagua=${name}">${name}</a>`
                        )
                        .join(" / ")})
                </th>
            </tr>
        </thead>
        <tbody>
            ${
                hexInfo.lines
                    ? Object.entries(hexInfo.lines)
                          .map(
                              ([changingLineNum, line]) => `<tr>
                        <td>
                            ${changingLineNum}
                            <br />
                            ${getChangingYinOrYang(lines, changingLineNum)}
                        </td>
                        <td>${line}</td>
                    </tr>`
                          )
                          .join("")
                    : ""
            }
            ${
                hexInfo.reading
                    ? `<tr>
                    <td colSpan="2">${hexInfo.reading}</td>
                </tr>`
                    : ""
            }
        </tbody>
    </table>`;
}

function getChangingYinOrYang(lines, changingLineNum) {
    return [...lines].reverse()[changingLineNum - 1] % 2 ? "yang" : "yin";
}

function displayText(hexagramInfo) {
    document.querySelector("#reading").innerHTML += textHtml(hexagramInfo);
}

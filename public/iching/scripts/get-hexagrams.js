function getHexagramTitlesAndNumbers(hexKeys) {
    return hexKeys.map((key) => {
        const { title, number } = definitions[key];
        return { title, number };
    });
}

function insertHexagramsRow(definitions) {
    const urlParams = new URLSearchParams(window.location.search),
        baguaName = urlParams?.get("bagua"),
        hexKeys = baguaName
            ? Object.keys(definitions).filter((key) =>
                  key.split("/").includes(baguaName)
              )
            : [];
    if (hexKeys.length) {
        const targetRow = document
                .querySelector("tbody")
                .querySelector("tr:first-child"),
            hexRow = document.createElement("tr"),
            hexCell1 = document.createElement("td"),
            hexCell2 = document.createElement("td");
        hexCell1.innerHTML = "hexagrams";
        hexCell2.innerHTML = `
            <ul>
            ${getHexagramTitlesAndNumbers(hexKeys)
                .map(
                    (hex) => `<li><a href="/iching/text/#${hex.number}">
                        ${hex.number}. ${hex.title}
                    </a></li>`
                )
                .join("")}
            </ul>`;
        hexRow.appendChild(hexCell1);
        hexRow.appendChild(hexCell2);
        targetRow.after(hexRow);
    }
}

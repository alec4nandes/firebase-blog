makeTable(definitions);

function makeTable(definitions) {
    const baguaNames = [
        "heaven",
        "earth",
        "fire",
        "water",
        "lake",
        "mountain",
        "thunder",
        "wind",
    ];

    function make2DimArray() {
        let result = [];
        for (let i = 0; i < baguaNames.length; i++) {
            result.push(new Array(baguaNames.length).fill(0));
        }
        Object.entries(definitions).forEach(([key, value]) => {
            const [i1, i2] = key
                .split("/")
                // the columns should be the top trigrams
                // because the headings are on top:
                .reverse()
                .map((name) => baguaNames.indexOf(name));
            result[i1][i2] = value.number;
        });
        return result;
    }

    const grid = make2DimArray(),
        table = document.createElement("table"),
        abbr = baguaNames.map((bn) => bn.slice(0, 4));

    table.className = "bagua-index-table";

    let index = 0;

    for (const row of [["", ...abbr], ...grid]) {
        const tr = document.createElement("tr");
        if (index > 0) {
            const bgtd = document.createElement("td");
            bgtd.innerHTML = getBaguaLink(abbr[index - 1]);
            tr.appendChild(bgtd);
        }
        for (const col of row) {
            const td = document.createElement("td");
            td.innerHTML =
                index > 0 ? `<a href="#${col}">${col}</a>` : getBaguaLink(col);
            tr.appendChild(td);
        }
        table.appendChild(tr);
        index++;
    }

    document.querySelector("header").appendChild(table);

    function getBaguaLink(col) {
        return `<a href="/iching/bagua/?bagua=${
            baguaNames[abbr.indexOf(col)]
        }">${col}</a>`;
    }
}

function hexagramInfoHtml(definitions) {
    return Object.entries(definitions)
        .map(
            ([baguaName, info]) => `<div class="hexagram-info" id="${
                info.number
            }">
            <h3>${info.number}. ${baguaName
                .split("/")
                .map(
                    (name) =>
                        `<a href="/iching/bagua/?bagua=${name}">${name}</a>`
                )
                .join(" / ")}</h3>
            <h4>${info.title}</h4>
            <p>${info.definition}</p>
            <ol>
            ${new Array(6)
                .fill("")
                .map((_, i) => `<li>${info[i + 1]}</li>`)
                .join("")}
            </ol>
        </div>`
        )
        .join("");
}

document.querySelector(".text").innerHTML = hexagramInfoHtml(definitions);

document.querySelector(".text-nav").innerHTML = Object.values(definitions)
    .map((info) => `<a href="#${info.number}">${info.number}</a>`)
    .join(" &mdash; ");

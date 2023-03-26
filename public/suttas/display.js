import { suttapitaka } from "./sutta.js";

export default function displaySutta(sutta) {
    displayNavLinks();
    displayText();

    function displayNavLinks() {
        const { prev_id, next_id } = sutta,
            isValidSection = (suttaId) =>
                suttaId
                    ? !!Object.keys(suttapitaka).find((section) =>
                          suttaId.includes(section)
                      )
                    : false,
            prevIsValid = isValidSection(prev_id),
            nextIsValid = isValidSection(next_id);
        document.querySelector("header").innerHTML = `
            ${prevIsValid ? `<a href="?sutta=${prev_id}">previous</a>` : ""}
            ${prevIsValid && nextIsValid ? "|" : ""}
            ${nextIsValid ? `<a href="?sutta=${next_id}">next</a>` : ""}
        `;
    }

    function displayText() {
        const {
            sutta_title,
            section_pali,
            chapter,
            sutta_description,
            section_title,
            section_description,
            lines,
        } = sutta;
        document.querySelector("main").innerHTML = `
            <hr/>
            <details>
                <summary>${section_pali}: ${section_title}</summary>
                <p>${section_description}</p>
            </details>
            <h1>${sutta_title}</h1>
            <h2>(${section_pali} ${chapter})</h2>
            ${sutta_description ? `<p>${sutta_description}</p>` : ""}
            <hr/>
            <p>${lines.join("<br/>")}</p>
        `;
    }
}

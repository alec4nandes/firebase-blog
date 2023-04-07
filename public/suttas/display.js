import crawled, { sections } from "./crawl.js";

export default function displaySutta(sutta) {
    displayNavLinks();
    displayText();

    function displayNavLinks() {
        const { sutta_id, prev_id, next_id } = sutta,
            isValidSection = (suttaId) =>
                suttaId
                    ? !!Object.keys(sections).find((section) =>
                          suttaId.includes(section)
                      )
                    : false,
            prevIsValid = isValidSection(prev_id),
            nextIsValid = isValidSection(next_id);
        document.querySelector("header").innerHTML = `
            <p><em>All translations are by Bhikkhu Sujato.</em>
            <form id="pick-sutta">
                <select name="pick">
                    ${crawled.map(
                        (c) => `
                            <option value="${c}"
                                ${c === sutta_id ? "selected" : ""}>
                                ${c}
                            </option>
                        `
                    )}
                </select>
                <button>go</button>
            </form>
            <br/>
            ${prevIsValid ? `<a href="?sutta=${prev_id}">previous</a>` : ""}
            ${prevIsValid && nextIsValid ? "|" : ""}
            ${nextIsValid ? `<a href="?sutta=${next_id}">next</a>` : ""}
            ${prevIsValid || nextIsValid ? "|" : ""}
            <a href="./">random</a>
        `;
        document.querySelector("#pick-sutta").onsubmit = (e) => {
            e.preventDefault();
            window.open("?sutta=" + e.target.pick.value, "_blank");
        };
    }

    function displayText() {
        const {
            sutta_title,
            section_pali,
            chapter,
            chapter_title,
            chapter_description,
            sutta_description,
            section_title,
            section_description,
            lines,
        } = sutta;
        document.querySelector("main").innerHTML = `
            <hr/>
            <details>
                <summary>
                    ${[...new Set([section_pali, section_title])].join(": ")}
                </summary>
                <p>${section_description}</p>
                ${
                    chapter_title && chapter_description
                        ? `
                            <p><u>${chapter_title.trim()}</u>:</p>
                            <p>${chapter_description}</p>
                        `
                        : ""
                }
            </details>
            <h1>${sutta_title}</h1>
            <h2>(${section_pali}${chapter ? " " + chapter : ""})</h2>
            ${sutta_description ? `<p>${sutta_description}</p>` : ""}
            <hr/>
            <p>${lines.join("<br/>")}</p>
        `;
    }
}

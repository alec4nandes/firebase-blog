import crawled, { sections } from "./crawl.js";

async function getSutta(suttaId) {
    const sutta = await fetch(`/sutta/?sutta=${suttaId}`);
    return await sutta.json();
}

async function getRandomSutta() {
    return await getSutta(getRandomSuttaId());

    function getRandomSuttaId() {
        // randomly select a section first to give all sections,
        // even the small ones, an equal chance
        const section = getRandomItem(Object.keys(sections)),
            validSuttas = crawled.filter((sutta) => sutta.includes(section));
        return getRandomItem(validSuttas);

        function getRandomItem(arr) {
            return arr[~~(Math.random() * arr.length)];
        }
    }
}

export { getSutta, getRandomSutta };

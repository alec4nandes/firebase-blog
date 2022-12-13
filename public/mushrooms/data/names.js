import { medicinalMushrooms, mushroomNames } from "./mushrooms-data.js";

const allGenusAndSpecies = getAllGenusAndSpecies();

function getAllGenusAndSpecies() {
    const allGenus = new Set(),
        allSpecies = new Set();
    getAllMushroomNames().forEach((name) => {
        const { genus, species } = getGenusAndSpecies(name);
        allGenus.add(genus);
        allSpecies.add(species);
    });
    return {
        all_genus: [...allGenus].sort(),
        all_species: [...allSpecies].sort(),
    };
}

function getAllMushroomNames() {
    const medicinalNames = medicinalMushrooms.map(
            (mush) => mush.scientific_name
        ),
        allNames = [...medicinalNames, ...mushroomNames]
            .map((name) =>
                name.includes("(")
                    ? name
                          .replaceAll("*", "")
                          .replaceAll(")", "")
                          .split("(")
                          .map((name) => name.trim())
                    : name
            )
            .flat();
    return [...new Set(allNames)].sort();
}

function getGenusAndSpecies(scientificName) {
    const firstSpace = scientificName.indexOf(" "),
        genus = scientificName.slice(0, firstSpace),
        species = scientificName.slice(firstSpace + 1);
    return { genus, species };
}

function filterNames({ genus, species }) {
    const result = getAllMushroomNames()
            .filter((name) => name.includes(genus || species))
            .map((name) => getGenusAndSpecies(name))
            .map(({ genus: g, species: s }) => (genus ? s : g)),
        sorted = [...new Set(result)].sort();
    return { genus: genus || sorted, species: species || sorted };
}

export { allGenusAndSpecies, filterNames };

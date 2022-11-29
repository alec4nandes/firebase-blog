import definitions from "./iching-definitions.mjs";

const baguaInfo = {
    heaven: {
        trigram: "\u2630",
        hexagrams: getHexagramLinks("heaven"),
        images: ["heaven"],
        qualities: [
            "creative",
            "strong",
            "light of day",
            "firmness",
            "inspiring",
            "power",
            "aggression",
            "completion",
        ],
        direction: "northwest",
        "family member": "father",
        "body part": "head",
        season: "early winter",
        "time of day": "daytime",
        animal: "horse",
        color: "purple",
        element: "metal",
        "other words": [
            "round",
            "prince",
            "jade",
            "cold",
            "ice",
            "tree fruit",
            "upper garment",
            "word",
            "prehistoric",
            "flesheater",
        ],
    },
    earth: {
        trigram: "\u2637",
        hexagrams: getHexagramLinks("earth"),
        images: ["earth"],
        qualities: [
            "weak",
            "yielding",
            "dark",
            "nurturing",
            "responsive",
            "receptive",
            "adaptable",
            "submissive",
            "charitable",
            "protective",
            "even-tempered",
            "frugal",
            "fertile",
        ],
        direction: "southwest",
        "family member": "mother",
        "body part": "belly",
        season: "early autumn",
        "time of day": "night",
        animal: "cow",
        color: "black",
        element: "soil",
        "other words": [
            "cloth",
            "kettle",
            "pregnancy",
            "level",
            "balanced",
            "impartial",
            "large wagon",
            "form",
            "ornament",
            "multitude",
            "shaft",
            "tree trunk",
        ],
    },
    fire: {
        trigram: "\u2632",
        hexagrams: getHexagramLinks("fire"),
        images: ["fire", "sun", "lightning"],
        qualities: [
            "clear",
            "conscious",
            "intelligent",
            "dependent",
            "clinging",
            "illuminating",
            "warming",
            "searing",
        ],
        direction: "south",
        "family member": "middle daughter",
        "body part": "eye",
        season: "midsummer",
        "time of day": "noon",
        animal: "pheasant",
        color: "yellow",
        element: "fire",
        "other words": [
            "clarity",
            "coat of mail",
            "helmet",
            "armor",
            "lance",
            "weapons",
            "big-bellied",
            "dryness",
            "tortoise",
            "crab",
            "snail",
            "mussel",
            "sheild-bearing creatures",
            "tree dead at the top",
            "firm without",
            "hollow within",
        ],
    },
    water: {
        trigram: "\u2635",
        hexagrams: getHexagramLinks("water"),
        images: ["water", "clouds", "rain", "spring", "pit", "chasm"],
        qualities: [
            "dangerous",
            "difficult",
            "profound",
            "anxious",
            "deep",
            "mysterious",
            "damned",
            "persistent",
            "persevering",
            "flexible",
            "melancholy",
            "pervasive",
            "protean",
            "mobile",
            "fluid",
            "driving",
        ],
        direction: "north",
        "family member": "middle son",
        "body part": "ear",
        season: "midwinter",
        "time of day": "midnight",
        animal: "pig",
        color: "scarlet",
        element: "wood",
        "other words": [
            "ditches",
            "ambush",
            "bent then straightened",
            "bow",
            "wheel",
            "sick heart",
            "earache",
            "blood",
            "stumbling horse",
            "wrecked chariot",
            "moon",
            "thieves",
            "hardwood",
            "toil",
        ],
    },
    lake: {
        trigram: "\u2631",
        hexagrams: getHexagramLinks("lake"),
        images: ["lake", "marsh"],
        qualities: [
            "satisfied",
            "fulfilled",
            "excessive",
            "open",
            "pleasing",
            "joyous",
            "magical",
            "elfin",
            "mischievous",
        ],
        direction: "west",
        "family member": "youngest daughter",
        "body part": "mouth",
        season: "late autumn",
        "time of day": "dusk",
        animal: "sheep",
        color: "blue",
        element: "flesh",
        "other words": [
            "sorceress",
            "tongue",
            "smashing",
            "breaking apart",
            "dropping off",
            "bursting open",
            "hard salty soil",
            "concubine",
            "ripe fruit",
            "goat",
            "gypsy",
        ],
    },
    mountain: {
        trigram: "\u2636",
        hexagrams: getHexagramLinks("mountain"),
        images: ["mountain"],
        qualities: [
            "tranquil",
            "immobile",
            "still",
            "perverse",
            "waiting",
            "patient",
            "calm",
            "stubborn",
            "inert",
            "methodical",
            "eternal",
        ],
        direction: "northeast",
        "family member": "youngest son",
        "body part": "hand",
        season: "late winter",
        "time of day": "dawn",
        animal: "dog",
        color: "emerald green",
        element: "stone",
        "other words": [
            "byway",
            "mountain path",
            "pebbles",
            "doorway",
            "opening",
            "gateway",
            "seed of fruit",
            "eunuch",
            "watchman",
            "doorkeeper",
            "fingers",
            "rat",
            "black-billed bird",
            "gnarled tree",
        ],
    },
    thunder: {
        trigram: "\u2633",
        hexagrams: getHexagramLinks("thunder"),
        images: ["thunder"],
        qualities: [
            "arousing",
            "activity",
            "excitement",
            "growth",
            "expanding",
            "impulsive",
            "provocative",
            "adventurous",
            "experimental",
            "vehement",
            "influential",
            "persuasive",
            "seductive",
            "decisive",
        ],
        direction: "east",
        "family member": "eldest son",
        "body part": "foot",
        season: "spring",
        "time of day": "early morning",
        animal: "dragon",
        color: "amber",
        element: "grass",
        "other words": [
            "spreading out",
            "blossoming",
            "great road",
            "green bamboo",
            "reed",
            "rush",
            "pod-bearing plants",
        ],
    },
    wind: {
        trigram: "\u2634",
        hexagrams: getHexagramLinks("wind"),
        images: ["wind", "wood"],
        qualities: [
            "gentle",
            "penetrating",
            "gradual",
            "honest",
            "simple",
            "subtle",
            "transitory",
            "shifting",
            "elusive",
            "whispering",
            "caressing",
            "indecisive",
        ],
        direction: "southeast",
        "family member": "eldest daughter",
        "body part": "thigh",
        season: "early summer",
        "time of day": "midmorning",
        animal: "rooster",
        color: "white",
        element: "air",
        "other words": [
            "guideline",
            "work",
            "long",
            "high",
            "advance then retreat",
            "odor",
            "gray-haired",
            "broad forehead",
            "white of the eye",
            "close to the grain",
            "threefold return",
        ],
    },
};

function getHexagramLinks(bagua) {
    return Object.entries(definitions)
        .filter(([key]) => key.split("/").includes(bagua))
        .map(
            ([_, value]) =>
                `<a href="/iching/text/#${value.number}">${value.number}. ${value.title}</a>`
        );
}

export default baguaInfo;
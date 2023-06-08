const words = {
    Fool: [
        "beginning",
        "carelessness",
        "ignorance",
        "inexperience",
        "innocence",
        "new choice",
        "potential",
        "spontaneity",
    ],
    Magician: [
        "ability",
        "action",
        "active",
        "concentration",
        "confidence",
        "conscious mind",
        "control",
        "power",
        "skill",
        "talent",
        "yang",
    ],
    "High Priestess": [
        "intuition",
        "meditation",
        "mystery",
        "passive",
        "potential",
        "secret",
        "spiritual connection",
        "unconscious mind",
        "yin",
    ],
    Empress: [
        "abundance",
        "beauty",
        "creativity",
        "desire",
        "femininity",
        "material world",
        "maternal",
        "nature",
        "pleasure",
        "protection",
    ],
    Emperor: [
        "authority",
        "experience",
        "hierarchy",
        "masculinity",
        "paternal",
        "power",
        "rationality",
        "regulation",
        "responsibility",
        "rule",
        "structure",
    ],
    Hierophant: [
        "belief",
        "conformity",
        "education",
        "faith",
        "group",
        "guidance",
        "hierarchy",
        "initiation",
        "institution",
        "ritual",
        "spiritual connection",
        "tradition",
    ],
    Lovers: [
        "choice",
        "desire",
        "harmony",
        "intimacy",
        "love",
        "passion",
        "pleasure",
        "relationship",
        "self-confidence",
        "sex",
        "union",
    ],
    Chariot: [
        "assertion",
        "bravery",
        "control",
        "determination",
        "emotional discipline",
        "movement",
        "physical conquest",
        "traveling",
        "victory",
        "willpower",
    ],
    Strength: [
        "bravery",
        "composure",
        "confidence",
        "courage",
        "determination",
        "endurance",
        "energy",
        "fortitude of character",
        "health",
        "nonphysical conquest",
        "patience",
        "strength",
    ],
    Hermit: [
        "contemplation",
        "enlightenment",
        "guidance",
        "introspection",
        "meditation",
        "searching",
        "self-sufficiency",
        "solitude",
    ],
    "Wheel of Fortune": [
        "cycle",
        "destiny",
        "luck",
        "movement",
        "potential",
        "turning point",
        "unstoppable change",
        "vision",
    ],
    Justice: [
        "balance",
        "cause-and-effect",
        "decision",
        "fairness",
        "justice",
        "rationality",
        "responsibility",
        "rule",
        "truth",
    ],
    "Hanged Man": [
        "acceptance",
        "altered perspective",
        "meditation",
        "punishment",
        "release",
        "restriction",
        "sacrifice",
        "suspense",
        "upside-down",
        "wait",
    ],
    Death: [
        "dramatic transformation",
        "elimination",
        "ending",
        "lifestyle change",
        "loss",
        "release",
        "transition",
        "turning point",
        "unstoppable change",
    ],
    Temperance: [
        "adaptation",
        "balance",
        "combination",
        "compromise",
        "cooperation",
        "health",
        "moderation",
        "patience",
    ],
    Devil: [
        "bondage",
        "deception",
        "hedonism",
        "hopelessness",
        "ignorance",
        "loss of control",
        "loss of faith",
        "materialism",
        "selfishness",
        "temptation",
        "weakness",
    ],
    Tower: [
        "chaos",
        "disaster",
        "humbling experience",
        "punishment",
        "release",
        "revelation",
        "separation",
        "sudden change",
        "upheaval",
    ],
    Star: [
        "beauty",
        "faith",
        "generosity",
        "guidance",
        "hope",
        "illumination",
        "inspiration",
        "peace",
        "renewal",
        "serenity",
    ],
    Moon: [
        "confusion",
        "deception",
        "dream",
        "fear",
        "illusion",
        "imagination",
        "magnetism",
        "strangeness",
        "unconscious mind",
    ],
    Sun: [
        "assurance",
        "bliss",
        "brightness",
        "energy",
        "enlightenment",
        "generosity",
        "greatness",
        "growth",
        "happiness",
        "illumination",
        "joy",
        "success",
        "vitality",
        "warmth",
    ],
    Judgement: [
        "absolution",
        "cause-and-effect",
        "release",
        "revelation",
        "sense of purpose",
        "spiritual rebirth",
        "transformation",
    ],
    World: [
        "accomplishment",
        "achievement",
        "completion",
        "ending",
        "enlightenment",
        "freedom",
        "fulfillment",
        "integration",
        "promotion",
    ],
    "Ace of Pentacles": [
        "abundance",
        "beginning",
        "creative urge",
        "fortune",
        "gain",
        "gift",
        "inspiration",
        "manifestation",
        "materialism",
        "opportunity",
        "physical world",
        "potential",
        "presence",
        "success",
    ],
    "2 of Pentacles": [
        "balance",
        "choice",
        "dance",
        "decision",
        "dexterity",
        "division",
        "duality",
        "flexibility",
        "force",
        "joy",
    ],
    "3 of Pentacles": [
        "art",
        "collaboration",
        "community",
        "concept",
        "consulting",
        "craft",
        "creativity",
        "flux",
        "inspiration",
        "installation",
        "outcome",
        "project",
        "skill",
        "talent",
        "teamwork",
        "trade",
        "work",
    ],
    "4 of Pentacles": [
        "concentration",
        "control",
        "determination",
        "expansion",
        "gain",
        "greed",
        "hardy",
        "inheritance",
        "investment",
        "outcome",
        "possession",
        "possessive",
        "possessiveness",
        "realization",
        "savings",
        "selfishness",
        "stability",
        "stagnant",
        "thrift",
    ],
    "5 of Pentacles": [
        "adversity",
        "challenge",
        "change",
        "cold",
        "dark",
        "despair",
        "hardship",
        "insecurity",
        "lack",
        "loss",
        "need",
        "obstacle",
        "poverty",
        "rejection",
        "restriction",
        "sadness",
        "struggle",
        "victim",
        "waste",
        "yearning",
    ],
    "6 of Pentacles": [
        "altruism",
        "balance",
        "comfort",
        "distribution",
        "fairness",
        "gain",
        "generosity",
        "gift",
        "growth",
        "help",
        "illumination",
        "journey",
        "justice",
        "mercy",
        "offer",
        "success",
        "sympathy",
        "wealth",
    ],
    "7 of Pentacles": [
        "accomplishment",
        "business",
        "challenge",
        "charity",
        "checking",
        "contemplation",
        "counting",
        "creativity",
        "deal",
        "development",
        "exchange",
        "expansion",
        "faith",
        "flowering",
        "investment",
        "planning",
        "ripening",
        "willpower",
    ],
    "8 of Pentacles": [
        "autonomy",
        "change",
        "commitment",
        "craft",
        "dedication",
        "dexterity",
        "diligence",
        "finesse",
        "habit",
        "learning",
        "logic",
        "proficiency",
        "progress",
        "refinement",
        "repetitive",
        "routine",
        "skill",
        "strength",
        "technique",
    ],
    "9 of Pentacles": [
        "accomplishment",
        "discernment",
        "elegance",
        "fruition",
        "fulfillment",
        "gratitude",
        "independence",
        "investment",
        "joy",
        "potential",
        "project",
        "prudence",
        "refinement",
        "safety",
        "self-reliance",
        "transformation",
    ],
    "10 of Pentacles": [
        "completion",
        "culmination",
        "ending",
        "family",
        "home",
        "legacy",
        "manifestation",
        "materialism",
        "safety",
        "treasure",
        "wealth",
    ],
    "Page of Pentacles": [
        "apprenticeship",
        "certainty",
        "dependable",
        "health",
        "inspiration",
        "potential",
        "practicality",
        "presence",
        "stability",
    ],
    "Knight of Pentacles": [
        "action",
        "delusion",
        "determination",
        "efficiency",
        "formation",
        "irrationality",
        "irresponsibility",
        "materialism",
        "opportunity",
        "wealth",
    ],
    "Queen of Pentacles": [
        "capability",
        "care",
        "comfort",
        "concept",
        "conservation",
        "generosity",
        "influence",
        "maternal",
        "organization",
        "protection",
        "rationality",
        "satisfaction",
        "sensuality",
        "warmth",
        "wealth",
    ],
    "King of Pentacles": [
        "ambition",
        "authority",
        "business",
        "creative urge",
        "dependable",
        "discipline",
        "enterprising",
        "entrepreneur",
        "materialism",
        "rationality",
        "security",
        "stability",
        "success",
        "wealth",
    ],
    "Ace of Swords": [
        "accomplishment",
        "accountability",
        "anger",
        "beginning",
        "clarity",
        "creative urge",
        "determination",
        "potential",
        "responsibility",
        "retribution",
    ],
    "2 of Swords": [
        "adaptation",
        "adjustment",
        "balance",
        "blindness",
        "blockage",
        "choice",
        "compromise",
        "contemplation",
        "decision",
        "denial",
        "duality",
        "duel",
        "force",
        "grace",
        "meditation",
        "stalemate",
        "subtlety",
        "tension",
    ],
    "3 of Swords": [
        "betrayal",
        "community",
        "concept",
        "flux",
        "grief",
        "guilt",
        "heartbreak",
        "injury",
        "loneliness",
        "meditation",
        "outcome",
        "pain",
        "regret",
        "rejection",
        "sadness",
        "separation",
        "suffering",
        "treason",
    ],
    "4 of Swords": [
        "expansion",
        "outcome",
        "peace",
        "possession",
        "protection",
        "recuperation",
        "reflection",
        "rest",
        "retirement",
        "retreat",
        "sleep",
        "solitude",
        "stability",
        "truce",
        "wait",
    ],
    "5 of Swords": [
        "adversity",
        "challenge",
        "change",
        "conflict",
        "cowardice",
        "cruelty",
        "defeat",
        "degradation",
        "difficulty",
        "disgrace",
        "domination",
        "drama",
        "exile",
        "failure",
        "power",
        "restriction",
        "retribution",
        "sadness",
        "slander",
        "tension",
        "uncertainty",
        "unfairness",
        "weakness",
    ],
    "6 of Swords": [
        "balance",
        "curiosity",
        "exploration",
        "flux",
        "growth",
        "illumination",
        "journey",
        "movement",
        "obstacle",
        "reasoning",
        "recovery",
        "speed",
        "transfer",
        "transition",
        "traveling",
    ],
    "7 of Swords": [
        "attempt",
        "betrayal",
        "challenge",
        "confidentiality",
        "creativity",
        "deception",
        "defeat",
        "faith",
        "gossip",
        "hidden",
        "loss",
        "plan",
        "secret",
        "stealth",
        "willpower",
    ],
    "8 of Swords": [
        "betrayal",
        "bondage",
        "censorship",
        "change",
        "entrapment",
        "isolation",
        "laziness",
        "logic",
        "obstacle",
        "progress",
        "restriction",
        "strength",
        "stunned",
    ],
    "9 of Swords": [
        "concern",
        "crisis",
        "deceit",
        "despair",
        "difficulty",
        "disappointment",
        "doubt",
        "fruition",
        "fulfillment",
        "guilt",
        "loss",
        "nightmare",
        "overwhelming",
        "potential",
        "regret",
        "sadness",
        "sleeplessness",
        "suffering",
        "transformation",
        "uncertainty",
        "worry",
    ],
    "10 of Swords": [
        "blockage",
        "completion",
        "crisis",
        "culmination",
        "defeat",
        "disaster",
        "ending",
        "failure",
        "fear",
        "manifestation",
        "obsession",
        "pain",
        "sacrifice",
        "sadness",
    ],
    "Page of Swords": [
        "aggression",
        "anger",
        "attention",
        "calculation",
        "dexterity",
        "energy",
        "vigilant",
    ],
    "Knight of Swords": [
        "action",
        "anger",
        "determination",
        "extreme",
        "formation",
        "haste",
        "hostility",
        "impatience",
        "impetuous",
        "movement",
        "opportunity",
        "power",
        "rebel",
        "temperamental",
        "violence",
        "warrior",
    ],
    "Queen of Swords": [
        "concept",
        "decision",
        "directness",
        "discriminating",
        "honesty",
        "influence",
        "logic",
        "organization",
        "perception",
        "power",
        "pretentious",
        "rigorous",
        "satisfaction",
        "strength",
    ],
    "King of Swords": [
        "analysis",
        "articulation",
        "authority",
        "calm",
        "creative urge",
        "diplomacy",
        "focus",
        "guidance",
        "impartiality",
        "intellect",
        "judgment",
        "justice",
        "logic",
        "order",
        "power",
        "precision",
        "rationality",
        "stability",
        "tact",
    ],
    "Ace of Cups": [
        "abundance",
        "adaptation",
        "beginning",
        "care",
        "compassion",
        "creative urge",
        "deluge",
        "emotion",
        "fertility",
        "intuition",
        "joy",
        "love",
        "memory",
        "openness",
        "opportunity",
        "potential",
        "purification",
        "romance",
        "unconscious mind",
    ],
    "2 of Cups": [
        "agreement",
        "attraction",
        "balance",
        "decision",
        "duality",
        "force",
        "friendship",
        "harmony",
        "joy",
        "love",
        "marriage",
        "partnership",
        "passion",
        "relationship",
        "sympathy",
        "understanding",
        "union",
    ],
    "3 of Cups": [
        "birth",
        "collaboration",
        "comfort",
        "communion",
        "community",
        "concept",
        "dance",
        "excitement",
        "feast",
        "flux",
        "friendship",
        "health",
        "intoxication",
        "joy",
        "outcome",
        "relief",
        "sharing",
        "teamwork",
        "victory",
        "work",
    ],
    "4 of Cups": [
        "boredom",
        "complacency",
        "contemplation",
        "disappointment",
        "discontent",
        "discouragement",
        "disdain",
        "dissatisfaction",
        "distraction",
        "expansion",
        "expectation",
        "habit",
        "nausea",
        "outcome",
        "possession",
        "refusal",
        "stability",
    ],
    "5 of Cups": [
        "addiction",
        "adversity",
        "bereavement",
        "change",
        "despair",
        "difficulty",
        "disappointment",
        "fear",
        "guilt",
        "pessimism",
        "refusal",
        "regret",
        "restriction",
        "sacrifice",
        "sadness",
        "shortage",
        "sorrow",
        "vanity",
    ],
    "6 of Cups": [
        "balance",
        "endowment",
        "exchange",
        "friendship",
        "gift",
        "growth",
        "hearth",
        "home",
        "illumination",
        "journey",
        "joy",
        "message",
        "nostalgia",
        "offer",
        "passion",
        "peace",
        "remembrance",
        "romance",
        "safety",
        "sentiment",
        "sharing",
        "yearning",
    ],
    "7 of Cups": [
        "challenge",
        "choice",
        "creativity",
        "deception",
        "desire",
        "dream",
        "faith",
        "fantasy",
        "illusion",
        "imagination",
        "indecision",
        "option",
        "selection",
        "temptation",
        "variety",
        "vision",
        "willpower",
    ],
    "8 of Cups": [
        "adventure",
        "change",
        "escapism",
        "freedom",
        "journey",
        "logic",
        "loneliness",
        "movement",
        "progress",
        "rejection",
        "renunciation",
        "restart",
        "shyness",
        "strength",
        "transition",
        "travel",
    ],
    "9 of Cups": [
        "admiration",
        "affection",
        "contentment",
        "fruition",
        "fulfillment",
        "pleasure",
        "potential",
        "satisfaction",
        "sensuality",
        "success",
        "transformation",
        "virtue",
        "yes",
    ],
    "10 of Cups": [
        "commitment",
        "community",
        "completion",
        "contentment",
        "culmination",
        "ending",
        "family",
        "friendship",
        "fulfillment",
        "happiness",
        "harmony",
        "joy",
        "manifestation",
        "peace",
        "rest",
        "success",
    ],
    "Page of Cups": [
        "contemplation",
        "devotion",
        "emotion",
        "enthusiasm",
        "friendship",
        "gentle",
        "grace",
        "idea",
        "insight",
        "inspiration",
        "instinct",
        "intuition",
        "joy",
        "openness",
        "perception",
        "potential",
        "presence",
        "receptivity",
        "romance",
        "sweetness",
        "synchronicity",
    ],
    "Knight of Cups": [
        "action",
        "charm",
        "compassion",
        "determination",
        "emotion",
        "encouragement",
        "flattery",
        "formation",
        "ideal",
        "imagination",
        "insight",
        "introspection",
        "opportunity",
        "pleasure",
        "reflection",
        "seduction",
        "sensitivity",
        "temperamental",
        "warmth",
    ],
    "Queen of Cups": [
        "affection",
        "attraction",
        "charm",
        "compassion",
        "concept",
        "emotion",
        "empathy",
        "friend",
        "influence",
        "intuition",
        "kindness",
        "listening",
        "love",
        "mystery",
        "reflection",
        "responsive",
        "satisfaction",
        "sensitivity",
        "support",
        "sweetness",
        "sympathy",
        "tranquility",
        "understanding",
        "warmth",
    ],
    "King of Cups": [
        "affection",
        "attraction",
        "authority",
        "charm",
        "chivalry",
        "compassion",
        "composure",
        "cooperation",
        "creative urge",
        "culture",
        "grace",
        "intuition",
        "joy",
        "love",
        "loyalty",
        "protection",
        "stability",
        "subtlety",
        "sympathy",
        "wisdom",
    ],
    "Ace of Wands": [
        "adventure",
        "beginning",
        "creative urge",
        "creativity",
        "energy",
        "enterprise",
        "inspiration",
        "intellect",
        "originality",
        "phallic",
        "potency",
        "potential",
        "strength",
        "vision",
    ],
    "2 of Wands": [
        "ambition",
        "appetite",
        "arrogance",
        "balance",
        "curiosity",
        "decision",
        "design",
        "desire",
        "drive",
        "duality",
        "energy",
        "enthusiasm",
        "expectation",
        "force",
        "lust",
        "plan",
        "progress",
        "project",
        "restlessness",
        "risk",
        "search",
        "thirst",
        "yearning",
    ],
    "3 of Wands": [
        "action",
        "anticipation",
        "assistance",
        "attention",
        "business",
        "care",
        "community",
        "concept",
        "contemplation",
        "creativity",
        "effort",
        "expansion",
        "exploration",
        "flux",
        "foresight",
        "help",
        "hope",
        "motion",
        "observation",
        "outcome",
        "patience",
        "preparation",
        "trade",
        "wait",
    ],
    "4 of Wands": [
        "achievement",
        "blessing",
        "celebration",
        "domestic bliss",
        "expansion",
        "freedom",
        "harmony",
        "joy",
        "outcome",
        "peace",
        "possession",
        "prosperity",
        "serenity",
        "stability",
    ],
    "5 of Wands": [
        "action",
        "adversity",
        "challenge",
        "change",
        "chaos",
        "competition",
        "energy",
        "game",
        "imitation",
        "restriction",
        "rivalry",
        "strife",
        "struggle",
        "training",
    ],
    "6 of Wands": [
        "accomplishment",
        "announcement",
        "arrival",
        "award",
        "balance",
        "fame",
        "growth",
        "harmony",
        "illumination",
        "journey",
        "message",
        "parade",
        "publicity",
        "success",
        "triumph",
    ],
    "7 of Wands": [
        "challenge",
        "competition",
        "creativity",
        "defense",
        "faith",
        "inspiration",
        "negotiation",
        "nonconformity",
        "opinion",
        "opposition",
        "perseverance",
        "self-confidence",
        "struggle",
        "willpower",
    ],
    "8 of Wands": [
        "alliance",
        "announcement",
        "change",
        "climax",
        "decision",
        "logic",
        "message",
        "movement",
        "option",
        "progress",
        "reaction",
        "speed",
        "strength",
        "traveling",
    ],
    "9 of Wands": [
        "adventure",
        "arrival",
        "defense",
        "experience",
        "fruition",
        "fulfillment",
        "guard",
        "integration",
        "obstacle",
        "opposition",
        "potential",
        "rationality",
        "resilience",
        "risk",
        "strength",
        "threshold",
        "transformation",
        "vigilance",
        "work",
    ],
    "10 of Wands": [
        "burden",
        "completion",
        "culmination",
        "ending",
        "exhaustion",
        "manifestation",
        "overwhelming",
        "strength",
        "work",
    ],
    "Page of Wands": [
        "candid",
        "commitment",
        "creativity",
        "enthusiasm",
        "friendship",
        "impetuous",
        "insight",
        "love",
        "loyalty",
        "playful",
        "support",
        "travel",
        "vitality",
    ],
    "Knight of Wands": [
        "action",
        "adventure",
        "capability",
        "chivalry",
        "courage",
        "determination",
        "enterprising",
        "exploration",
        "foresight",
        "formation",
        "idealism",
        "impatience",
        "impetuous",
        "intellect",
        "opportunity",
        "optimism",
        "passion",
        "travel",
    ],
    "Queen of Wands": [
        "autonomy",
        "concept",
        "dignity",
        "dominance",
        "exuberance",
        "influence",
        "passion",
        "power",
        "satisfaction",
        "self-confidence",
    ],
    "King of Wands": [
        "authority",
        "bold",
        "boss",
        "courageous",
        "creative urge",
        "dominance",
        "entrepreneur",
        "experience",
        "explosive",
        "initiative",
        "inspiring",
        "motivator",
        "persuasive",
        "respect",
        "security",
        "stability",
        "vision",
    ],
};

const oppositeWords = {
    yin: ["yang", "active"],
    active: ["passive"],
    passive: ["yang"],
    balance: ["chaos"],
    beginning: ["ending"],
    bravery: ["fear"],
    chaos: ["serenity", "peace"],
    cold: ["warmth"],
    "conscious mind": ["unconscious mind"],
    control: ["loss of control"],
    decision: ["indecision"],
    drama: ["peace"],
    dream: ["nightmare"],
    enlightenment: ["ignorance"],
    expansion: ["restriction"],
    experience: ["inexperience"],
    failure: ["success", "accomplishment"],
    faith: ["loss of faith"],
    gain: ["loss"],
    generosity: ["selfishness"],
    hope: ["hopelessness"],
    irrationality: ["rationality"],
    irresponsibility: ["responsibility"],
    joy: ["dissatisfaction"],
    justice: ["unfairness"],
    fairness: ["unfairness"],
    laziness: ["work"],
    masculinity: ["femininity"],
    maternal: ["paternal"],
    negative: ["positive"],
    "physical conquest": ["nonphysical conquest"],
    optimism: ["pessimism"],
    pain: ["pleasure"],
    sleep: ["sleeplessness"],
    solitude: ["relationship"],
    strength: ["weakness"],
    struggle: ["serenity", "peace"],
    thrift: ["waste"],
    victory: ["defeat"],
    belief: ["loss of faith"],
    happiness: ["sadness"],
    action: ["complacent"],
    healthy: ["weak"],
};

// mirror oppositeWords:

Object.entries(oppositeWords).forEach(([word, opposites]) =>
    opposites.forEach((oppo) => {
        oppositeWords[oppo]?.push(word) || (oppositeWords[oppo] = [word]);
        oppositeWords[oppo].sort();
    })
);

export { words, oppositeWords };
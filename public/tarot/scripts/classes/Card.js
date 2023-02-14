export default class Card {
    constructor(name, words) {
        this.name = name;
        this.words = words.sort();
    }

    // returns: String
    getName() {
        return this.name;
    }

    // returns: Boolean
    getIsReversed() {
        return this.name.includes(" reversed");
    }

    // returns: String
    getUprightName() {
        return this.name.replace(" reversed", "");
    }

    // returns: [String]
    getWords() {
        return this.words;
    }
}

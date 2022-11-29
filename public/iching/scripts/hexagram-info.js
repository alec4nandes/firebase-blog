const getLineNumber = (array, index) => array.length - index;

const baguaBinary = {
    111: "heaven",
    "000": "earth",
    101: "fire",
    "010": "water",
    100: "mountain",
    "001": "thunder",
    110: "wind",
    "011": "lake",
};

const getBaguaName = (lines) =>
    baguaBinary[lines.map((line) => line % 2).join("")];

const getHexagramName = (lines) => {
    const top = lines.slice(0, 3),
        bottom = lines.slice(3);
    return `${getBaguaName(top)}/${getBaguaName(bottom)}`;
};

function getHexagramInfo(linesParam) {
    const hexagramInfo = getHexagramInfoHelper(linesParam);
    if (hexagramInfo) {
        const { lines, changingLines, changingLineNumbers } = hexagramInfo,
            hex1Name = getHexagramName(lines),
            hex2Name =
                changingLineNumbers.length && getHexagramName(changingLines);
        return {
            ...hexagramInfo,
            hexNames: [hex1Name, hex2Name].filter(Boolean),
        };
    }
    return null;
}

function getHexagramInfoHelper(linesParam) {
    if (linesParam) {
        const lines = linesParam.split("");
        if (!checkLines(lines)) {
            return null;
        }
        const changingLineNumbers = [],
            changingLines = changeLines(lines, changingLineNumbers);
        return {
            lines,
            changingLineNumbers,
            changingLines,
        };
    }
    return null;
}

function checkLines(lines) {
    if (lines.length !== 6) {
        return false;
    }
    for (const line of lines) {
        const ln = +line;
        if (isNaN(ln) || ln < 0 || ln > 3) {
            return false;
        }
    }
    return true;
}

function changeLines(lines, changingLineNumbers) {
    return lines.map((line, i, a) => {
        if (line > 1) {
            changingLineNumbers.push(getLineNumber(a, i));
            return Math.abs((line % 2) - 1);
        } else {
            return line;
        }
    });
}

export default getHexagramInfo;
export { getLineNumber };

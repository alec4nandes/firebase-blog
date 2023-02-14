function joinSameValues(result) {
    result = { ...result }; // make copy
    const outerLoop = Object.entries(result),
        innerLoop = outerLoop;
    outerLoop.forEach(([_, outer]) => {
        const matchingValKeys = innerLoop
            .filter(
                ([_, inner]) => JSON.stringify(outer) === JSON.stringify(inner)
            )
            .map(([key]) => key);
        matchingValKeys.forEach((key) => delete result[key]);
        result[matchingValKeys.sort().join(", ")] = outer;
    });
    return result;
}

function joinSameValuesOpposites(result) {
    result = { ...result }; // make copy
    // combine oppo words under main words if the oppo words have the same cards
    Object.entries(result).forEach(
        ([key, val]) =>
            (result[key]["opposites"] = joinSameValues(val.opposites))
    );
    // then combine main words under new keys if they share the same oppos,
    // then delete those same oppos from the old words
    combineOpposites(result);
    // finally, comb the result and remove any empty entries
    removeEmptyEntries(result);
    return result;

    function combineOpposites(result) {
        const entries = Object.entries(result);
        for (const [outerWords, outerInfo] of entries) {
            const { matching: outerMatching, opposites: outerOpposites } =
                    outerInfo,
                outOppoEntries = Object.entries(outerOpposites);
            for (const [outerOppos, outCardNames] of outOppoEntries) {
                for (const [innerWords, innerInfo] of entries) {
                    const {
                            matching: innerMatching,
                            opposites: innerOpposites,
                        } = innerInfo,
                        inOppoEntries = Object.entries(innerOpposites);
                    for (const [innerOppos, inCardNames] of inOppoEntries) {
                        if (
                            outerWords !== innerWords &&
                            outerOppos === innerOppos &&
                            arraysMatch(outCardNames, inCardNames) &&
                            arraysMatch(outerMatching, innerMatching)
                        ) {
                            delete result[outerWords].opposites[outerOppos];
                            delete result[innerWords].opposites[innerOppos];
                            const key = getNewKey(outerWords, innerWords);
                            result[key] = {
                                matching: outerMatching,
                                opposites: {
                                    ...(result[key]?.opposites || {}),
                                    [outerOppos]: outCardNames,
                                },
                            };
                            // recursively check to see if this match still exists
                            combineOpposites(result);
                        }
                    }
                }
            }
        }
    }

    function arraysMatch(arr1, arr2) {
        return arr1.sort().join(", ") === arr2.sort().join(", ");
    }

    function getNewKey(outerWords, innerWords) {
        return [...outerWords.split(", "), ...innerWords.split(", ")]
            .sort()
            .join(", ");
    }

    function removeEmptyEntries(result) {
        Object.entries(result)
            .filter(([_, info]) => !Object.entries(info.opposites).length)
            .forEach(([words]) => delete result[words]);
    }
}

export { joinSameValues, joinSameValuesOpposites };

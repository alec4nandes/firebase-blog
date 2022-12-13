import displayLocalMushroom from "./display-local.js";

const getRandom = (arr) => arr[~~(Math.random() * arr.length)],
    endpoint = "https://mushroomobserver.org/api2/observations?format=json";

export default function handleFindMushroom(event, displayElem) {
    event.preventDefault();
    const area = event.target.querySelector(
            "input[type='radio']:checked"
        ).value,
        miles = event.target.miles.value;
    // get coordinates, either user's position or from map.
    // this is from user's position w/ miles radius:
    navigator.geolocation.getCurrentPosition(
        async (pos) => {
            if (area === "local") {
                displayElem.innerHTML = `<p>Finding a mushroom nearby...</p>`;
                try {
                    await getRandomMushroom(pos, miles, displayElem);
                } catch (error) {
                    handleError(error, displayElem);
                }
            } else {
                alert("Map coming soon!");
            }
        },
        (error) => handleError(error, displayElem)
    );
}

function handleError(error, displayElem) {
    console.error(error.message);
    displayElem.innerHTML = `
        <p>There was an error with the API:</p>
        <p>${error.message}</p>`;
}

async function getRandomMushroom(position, miles, displayElem) {
    const { coords } = position,
        {
            maxLat: north,
            minLat: south,
            maxLong: east,
            minLong: west,
        } = getRange({ coords, miles }),
        url = `${endpoint}&north=${north}&south=${south}&east=${east}&west=${west}`;
    const resp = await fetch(url),
        data = await resp.json(),
        randomId = getRandom(data.results),
        mushData = await getSpecificMushroom(randomId, coords);
    displayElem.innerHTML = displayLocalMushroom(mushData);
}

function getRange({ coords, miles }) {
    const { latitude, longitude } = coords,
        milesTo1DegLat = 69,
        milesTo1DegLong = 54.6,
        latMiles = miles / milesTo1DegLat,
        longMiles = miles / milesTo1DegLong,
        formatNumber = (num) => num.toFixed(4);
    return {
        maxLat: formatNumber(+latitude + latMiles),
        minLat: formatNumber(+latitude - latMiles),
        maxLong: formatNumber(+longitude + longMiles),
        minLong: formatNumber(+longitude - longMiles),
    };
}

async function getSpecificMushroom(id, coords) {
    const resp = await fetch(`${endpoint}&id=${id}&detail=high`),
        data = await resp.json(),
        mushroom = data.results[0],
        firstImage = mushroom.images?.[0],
        { date: dateTaken, owner } = firstImage || {},
        { login_name: username, id: userID } = owner || {};
    return {
        ...mushroom,
        coords,
        dateTaken,
        owner,
        username,
        userID,
    };
}

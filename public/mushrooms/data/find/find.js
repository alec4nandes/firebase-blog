import displayLocalMushroom from "./display-local.js";

const getRandom = (arr) => arr[~~(Math.random() * arr.length)],
    endpoint = "https://mushroomobserver.org/api2/observations?format=json";

export default function handleFindMushroom(event, displayElem) {
    event.preventDefault();
    displayElem.innerHTML = `<p>Finding a mushroom nearby...</p>`;
    const area = event.target.querySelector(
            "input[type='radio']:checked"
        ).value,
        miles = event.target.miles.value;
    // get coordinates, either user's position or from map.
    // this is from user's position w/ miles radius:
    if (area === "local") {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                attemptMushroomSearch(pos, miles, displayElem);
            },
            (error) => handleError(error, displayElem)
        );
    } else {
        const form = event.target,
            latitude = +form.latitude.value,
            longitude = +form.longitude.value,
            pos = { coords: { latitude, longitude } };
        attemptMushroomSearch(pos, miles, displayElem);
    }
}

async function attemptMushroomSearch(pos, miles, displayElem) {
    try {
        await getRandomMushroom(pos, miles, displayElem);
    } catch (error) {
        handleError(error, displayElem);
    }
}

function handleError(error, displayElem) {
    console.error(error.message);
    displayElem.innerHTML = `
        <p>There was an error with the API:</p>
        <p>${error.message}</p>`;
}

async function getRandomMushroom(position, miles, displayElem) {
    // initial scroll
    displayElem.scrollIntoView({ behavior: "smooth" });
    const { coords } = position,
        {
            maxLat: north,
            minLat: south,
            maxLong: east,
            minLong: west,
        } = getRange({ coords, miles }),
        url = `${endpoint}&north=${north}&south=${south}&east=${east}&west=${west}`,
        resp = await fetch(url),
        data = await resp.json(),
        randomId = getRandom(data.results),
        mushData = await getSpecificMushroom(randomId, coords);
    displayElem.innerHTML = displayLocalMushroom(mushData);
    // scroll again when content has loaded
    displayElem.scrollIntoView({ behavior: "smooth" });
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

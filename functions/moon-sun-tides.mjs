import fetch from "node-fetch";
import { find } from "geo-tz";
import lune from "lune";

// TODO: add moon data from lune package (not local - "universal")
// moon data: next full, next new, current percent, phase name
// TODO: filter station data to get tides (next high && low)

export default async function getMoonSunTidesData(req, res) {
    const { latitude, longitude, date } = req.query,
        sending =
            !isNaN(latitude) && !isNaN(longitude)
                ? await handleLocalData(
                      { latitude: +latitude, longitude: +longitude },
                      date
                  )
                : { error_message: "invalid coordinates" };
    res.send(sending);
}

async function handleLocalData(coords, date) {
    const isCurrent = date.includes("CURRENT");
    date = date.replace("CURRENT", "");
    const moon = getMoonData(isCurrent ? new Date() : date, coords),
        { latitude, longitude } = coords,
        stations = await getNOAAStations(),
        nearestStation = findNearestStation({
            stations,
            latitude,
            longitude,
        });
    return {
        time: isCurrent
            ? new Date()
            : makeUTCString(date, getTimezoneOffsetFromCoordinates(coords)),
        coords,
        moon,
        nearest_NOAA_station: {
            name: nearestStation.name,
            id: +nearestStation.id,
            latitude: nearestStation.lat,
            longitude: nearestStation.lng,
        },
        tides: await getTidesData(
            { latitude, longitude },
            nearestStation,
            date
        ),
        solar: await getSolarData({ latitude, longitude }, date),
    };
}

function getMoonData(date, coords) {
    let d;
    if (typeof date === "object") {
        d = date;
    } else {
        const offset = getTimezoneOffsetFromCoordinates(coords),
            dateString = makeUTCString(date, offset);
        d = new Date(dateString);
    }
    console.log(d);
    let phases = lune.phase_hunt(d);
    const phase = lune.phase(d),
        newMoon = new Date(phases.new_date),
        nextNewMoon = new Date(phases.nextnew_date),
        fullMoon = new Date(phases.full_date),
        result = {
            phase,
            nextNewMoon: newMoon > d ? newMoon : nextNewMoon,
        };
    if (fullMoon > d) {
        const data = { ...result, nextFullMoon: fullMoon };
        return processMoonData(data);
    }
    const dayAfterNew = new Date(
        nextNewMoon.getFullYear(),
        nextNewMoon.getMonth(),
        nextNewMoon.getDate() + 1
    );
    phases = lune.phase_hunt(dayAfterNew);
    const data = { ...result, nextFullMoon: phases.full_date };
    return processMoonData(data);
}

function processMoonData(data) {
    const { illuminated } = data.phase,
        { nextFullMoon, nextNewMoon } = data,
        status = data.nextNewMoon < data.nextFullMoon ? "waning" : "waxing";
    return {
        nextFullMoon,
        nextNewMoon,
        percent_illuminated: illuminated * 100,
        status,
    };
}

async function getNOAAStations() {
    const response = await fetch(
            "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json"
        ),
        { stations } = await response.json();
    return stations;
}

function findNearestStation({ stations, latitude, longitude }) {
    let shortestDistance, nearestStation;
    stations
        // only check tidal stations
        .filter((station) => station.tidal)
        .forEach((station) => {
            const { lat, lng } = station,
                // pythag theorem (distance is hypotenuse)
                trigDist = Math.sqrt(
                    Math.abs(latitude - lat) ** 2 +
                        Math.abs(longitude - lng) ** 2
                );
            if (
                // could be set to zero if standing on exact coordinate
                // of NOAA station
                (!shortestDistance && shortestDistance !== 0) ||
                trigDist < shortestDistance
            ) {
                shortestDistance = trigDist;
                nearestStation = station;
            }
        });
    return nearestStation;
}

async function getTidesData({ latitude, longitude }, nearestStation, date) {
    // scanning from yesterday to tomorrow to avoid any timezone issues
    const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=${date.replaceAll(
            "-",
            ""
        )}&range=48&product=predictions&datum=mllw&interval=hilo&format=json&units=metric&time_zone=lst_ldt&station=${
            nearestStation.id
        }`,
        response = await fetch(url),
        tides = await response.json(),
        offset = getTimezoneOffsetFromCoordinates({ latitude, longitude }),
        parseTides = (type) =>
            tides.predictions
                .filter((tide) => tide.type === type)
                .slice(0, 2)
                .map((tide) => makeUTCString(tide.t, offset));
    return {
        high_tides: parseTides("H"),
        low_tides: parseTides("L"),
    };
}

function getTimezoneOffsetFromCoordinates({ latitude, longitude }) {
    const timeZone = find(latitude, longitude),
        local = new Date().toLocaleString("en-US", {
            timeZone,
        }),
        msDifference = new Date(local) - new Date(),
        secondsDifference = msDifference / 1000,
        hoursDifference = secondsDifference / 60 / 60;
    return ~~hoursDifference;
}

function makeUTCString(localTime, offset) {
    return new Date(
        `${localTime} GMT${offset && offset < 0 ? "-" : "+"}${
            offset ? Math.abs(offset) : 0
        }`
    ).toUTCString();
}

async function getSolarData({ latitude, longitude }, date) {
    const response = await fetch(
            `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${date}&formatted=0`
        ),
        { results } = await response.json(),
        { sunrise, sunset, solar_noon, day_length } = results,
        parseResult = (dateTime) => new Date(dateTime).toUTCString();
    return {
        sunrise: parseResult(sunrise),
        sunset: parseResult(sunset),
        solar_noon: parseResult(solar_noon),
        day_length,
    };
}

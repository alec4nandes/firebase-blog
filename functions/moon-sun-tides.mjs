import fetch from "node-fetch";
import { find } from "geo-tz";

// TODO: add moon data from lune package (not local - "universal")
// moon data: next full, next new, current percent, phase name
// TODO: filter station data to get tides (next high && low)

export default async function getMoonSunTidesData() {
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
    const { latitude, longitude } = coords,
        stations = await getNOAAStations(),
        nearestStation = findNearestStation({
            stations,
            latitude,
            longitude,
        });
    res.send({
        coords,
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
    });
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

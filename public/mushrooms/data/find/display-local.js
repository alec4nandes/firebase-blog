export default function displayLocalMushroom(mushroomInfo) {
    const { images, coords } = mushroomInfo,
        { latitude, longitude } = coords;
    if (images) {
        return `
            <p>
                <strong>latitude:</strong> ${latitude || "N/A"}
                <br />
                <strong>longitude:</strong> ${longitude || "N/A"}
            </p>
            ${finderImages(mushroomInfo)}`;
    }
    throw new Error("No image found for this mushroom. Please try again.");
}

function finderImages(mushroomInfo) {
    const { images, consensus } = mushroomInfo;
    return `
        <div class="finder-images">
            ${images
                .map(
                    (image) => `
                <a href=${image.original_url} target="_blank" rel="noopener"><img
                    class="mushroom-image"
                    src=${image.original_url}
                    alt="most likely the fungus ${consensus.name}"
                    style="display: none;"
                    onload="event.target.style.display = 'inline-block';" /></a>`
                )
                .join("")}
            <p>
                <em>
                    (many images are ultra-high resolution and may take a minute to load)
                </em>
            </p>
            ${finderCaption(mushroomInfo)}
        </div>`;
}

function finderCaption(mushroomInfo) {
    const { consensus, id } = mushroomInfo,
        { name } = consensus,
        noGroup = name.replaceAll(" group", ""),
        wikiUrl = `https://en.wikipedia.org/wiki/${noGroup}`,
        pageUrl = `https://mushroomobserver.org/${id}`;
    return `
        <div class="caption">
            <p>
                This is
                <a href=${wikiUrl} target="_blank" rel="noopener"><em>${name}</em></a>,
                according to members of
                <strong>MushroomObserver.org</strong>
                (<a href=${pageUrl} target="_blank" rel="noopener">view page</a>)
            </p>
            ${metaData(mushroomInfo)}
        </div>`;
}

function metaData({ userID, username, dateTaken, location }) {
    const userUrl = `https://mushroomobserver.org/observer/show_user/${userID}`;
    return `
        <div class="finder-meta-data">
            &copy;
            <a href=${userUrl} target="_blank" rel="noopener">${username}</a>
            on ${dateTaken} in ${location.name}
        </div>`;
}

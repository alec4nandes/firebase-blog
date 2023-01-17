formatLocalDates();

function formatLocalDates() {
    const dateElems = [...document.querySelectorAll(".date-posted")];
    dateElems.forEach((elem) => {
        // the server renders each date element's innerHTML
        // as a UTC millisecond timestamp:
        const ms = elem.innerHTML,
            d = new Date(+ms);
        elem.innerHTML = formatDate(d);
    });
}

function formatDate(d) {
    const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ],
        month = months[d.getMonth()],
        day = d.getDate(),
        year = d.getFullYear(),
        hours = d.getHours(),
        hour = hours % 12 || 12,
        minutes = ("" + d.getMinutes()).padStart(2, "0"),
        amPm = hours < 12 ? "am" : "pm";
    return `${month} ${day}, ${year} at ${hour}:${minutes} ${amPm}`;
}

function toggleNavMenu(isOpening) {
    const elem = document.querySelector(".subscribe nav");
    elem.classList.remove("closed", "open");
    elem.classList.add(isOpening ? "open" : "closed");
}

function copyLink(id) {
    const text = `https://fern.haus/post/?id=${id}`;
    navigator.clipboard.writeText(text);
    alert("Link copied!");
}

// remove class that prevents transitions firing on page load
document.body.onload = () => document.body.classList.remove("preload");

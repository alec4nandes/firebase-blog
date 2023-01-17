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

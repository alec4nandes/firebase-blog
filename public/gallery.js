const files = [
    "fern-haus-site-logo.png",
    "hungry-ghost-logo.png",
    "name-landing-page.png",
    "prova-lab-1-desktop.png",
    "prova-lab-1-mobile.png",
    "prova-lab-3-mobile.png",
    "prova-lab-3-desktop.png",
    "prova-lab-2-desktop.png",
    "prova-lab-2-mobile.png",
    "house-of-loud.gif",
    "wunderfruit.gif",
    "tincture.jpg",
    "edibles.jpg",
    "ascend-home-page.png",
    "lifted-logistics-ad.png",
    "daily-specials.png",
    "wax-eyes.jpg",
    "d2d-logo.png",
    "taco-menu.png",
    "logos-1.png",
    "hot-air-balloon.png",
];

console.log(`${files.length} images`);

[...document.getElementsByClassName("container")].forEach((elem, i) => {
    const url = `/assets/gallery/${files[i].split(".").join("-min.")}`;
    elem.innerHTML = `<a href="${url}" target="_blank" rel="noopener">
            <img src="${url}" alt="" /> </a>`;
});

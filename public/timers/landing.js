const toggleSides = document.getElementById("toggle-sides");

function handleOpenSide(e, side) {
    toggleSides.classList.remove("closed", "left", "right");
    toggleSides.classList.add("open", side);
}

function handleCloseSide(e) {
    const toggleSides = e.target.parentElement.parentElement;
    toggleSides.classList.remove("open", "left", "right");
    toggleSides.classList.add("closed");
}

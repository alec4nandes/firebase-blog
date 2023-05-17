// set cursor type for desktop drag
document.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
});

let innerX = 0,
    innerY = 0;

const box = document.querySelector("#box");

// for mobile
box.ontouchmove = handleMove;
box.ontouchstart = handleStart;
box.ontouchend = handleEnd;
// for desktop
box.ondrag = handleMove;
box.onmousedown = handleStart;
box.onmouseup = handleEnd;

function getTouches(e) {
    return e.targetTouches?.[0];
}

function handleMove(e) {
    // grab the location of touch
    const touches = getTouches(e);
    // assign box new coordinates based on the touch.
    if (touches) {
        box.style.left = touches.pageX - innerX + "px";
        box.style.top = touches.pageY - innerY + "px";
    } else {
        // for desktop
        e.clientX && (box.style.left = e.clientX - innerX + "px");
        e.clientY && (box.style.top = e.clientY - innerY + "px");
    }
}

function handleStart(e) {
    setOverscroll("none");
    setInnerCoords(e);
}

function handleEnd() {
    setOverscroll("auto");
}

function setOverscroll(value) {
    const body = document.body,
        htmlElem = document.querySelector("html");
    [body, htmlElem].forEach((elem) => (elem.style.overscrollBehavior = value));
}

function setInnerCoords(e) {
    const touches = getTouches(e),
        rect = e.target.getBoundingClientRect();
    innerX = (touches?.pageX || e.clientX) - rect.left;
    innerY = (touches?.pageY || e.clientY) - rect.top;
}

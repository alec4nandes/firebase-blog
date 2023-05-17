// set cursor type for desktop drag
document.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
});

let innerX = 0,
    innerY = 0;

let animals = [...document.querySelectorAll(".animal")],
    gameIsOver = false;

animals.forEach((animal) => {
    // for mobile
    animal.ontouchmove = handleMove;
    animal.ontouchstart = handleStart;
    animal.ontouchend = handleEnd;
    // for desktop
    animal.ondrag = handleMove;
    animal.onmousedown = handleStart;
    animal.onmouseup = handleEnd;
    // increase speed over time
    let count = 1,
        animalInterval = moveAnimal(animal, 20),
        interval = setInterval(() => {
            clearInterval(animalInterval);
            if (gameIsOver) {
                clearInterval(interval);
            } else {
                animalInterval = moveAnimal(animal, 20 - count * 2);
                count++;
            }
        }, 5000);
});

function getTouches(e) {
    return e.targetTouches?.[0];
}

function handleMove(e) {
    // grab the location of touch
    const touches = getTouches(e),
        animal = e.target;
    // assign animal new coordinates based on the touch.
    if (touches) {
        animal.style.left = touches.pageX - innerX + "px";
        animal.style.top = touches.pageY - innerY + "px";
    } else {
        // for desktop
        e.clientX && (animal.style.left = e.clientX - innerX + "px");
        e.clientY && (animal.style.top = e.clientY - innerY + "px");
    }
}

function handleStart(e) {
    setOverscroll("none");
    setInnerCoords(e);
}

function handleEnd() {
    setOverscroll("auto");
}

// prevents "pull down refresh" while dragging on mobile
function setOverscroll(value) {
    const body = document.body,
        htmlElem = document.querySelector("html");
    [body, htmlElem].forEach((elem) => (elem.style.overscrollBehavior = value));
}

// get the clicked coordinates relative to the animal
// in order to calculate a smooth dragging experience
function setInnerCoords(e) {
    const touches = getTouches(e),
        rect = e.target.getBoundingClientRect();
    innerX = (touches?.pageX || e.clientX) - rect.left;
    innerY = (touches?.pageY || e.clientY) - rect.top;
}

function moveAnimal(elem, ms) {
    const moveUp = Math.random() < 0.5,
        moveLeft = Math.random() < 0.5,
        cage = document.querySelector("#cage");
    let interval = setInterval(() => {
        elem.style.top =
            elem.offsetTop + (moveUp ? -1 : 1) * Math.random() + "px";
        elem.style.left =
            elem.offsetLeft + (moveLeft ? -1 : 1) * Math.random() + "px";
        const hasEscaped =
                !animals.length ||
                animals.find((animal) => {
                    const escapedLeft =
                            animal.offsetLeft + animal.clientWidth <
                            cage.offsetLeft,
                        escapedRight =
                            animal.offsetLeft >
                            cage.offsetLeft + cage.clientWidth,
                        escapedTop =
                            animal.offsetTop + animal.clientHeight <
                            cage.offsetTop,
                        escapedBotom =
                            animal.offsetTop >
                            cage.offsetTop + cage.clientHeight;
                    return (
                        escapedLeft ||
                        escapedRight ||
                        escapedTop ||
                        escapedBotom
                    );
                }),
            isLost =
                elem.offsetTop + elem.clientHeight < 0 ||
                elem.offsetLeft + elem.clientWidth < 0 ||
                elem.offsetTop > window.innerHeight ||
                elem.offsetLeft > window.innerWidth;
        cage.style.backgroundColor = hasEscaped ? "lightsalmon" : "yellow";
        if (isLost) {
            alert("You lost an animal!");
            elem.remove();
            clearInterval(interval);
            animals = animals.filter((animal) => animal !== elem);
        }
        if (!gameIsOver && !animals.length) {
            gameIsOver = true;
            alert("GAME OVER");
        }
    }, ms);
    return interval;
}

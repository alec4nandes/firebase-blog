// * 60 for minutes
const workTime = 25 * 60,
    breakTime = 5 * 60,
    breakStartBeep = new Audio("./audio/break-start-beep.mp3"),
    breakEndBeep = new Audio("./audio/break-end-beep.mp3"),
    timeElem = document.getElementById("time"),
    overallTimeElem = document.getElementById("overall-time");

let time = 0,
    overallTime = 0,
    isBreak = false,
    interval;

const padTime = (section) => ("" + section).padStart(2, "0");

const timeFormatter = (time) =>
    `${padTime(~~(time / 60 ** 2))}:${padTime(~~(time / 60) % 60)}:${padTime(
        time % 60
    )}`;

const displayTime = (time, isBreak) =>
    `${isBreak ? "BREAK" : "WORK"} TIME: ${timeFormatter(time)}`;

const displayOverallTime = (overallTime) =>
    `OVERALL TIME: ${timeFormatter(overallTime)}`;

function startTimerHandler() {
    if (!interval) {
        interval = setInterval(() => {
            time++;
            overallTime++;
            timeElem.innerHTML = displayTime(time, isBreak);
            overallTimeElem.innerHTML = displayOverallTime(overallTime);
            const isBreakStart = time && !(time % workTime),
                isBreakEnd = isBreak && !(time % breakTime);
            if (isBreakStart) {
                breakStartBeep.play();
                alert("BREAK TIME");
                isBreak = true;
                time = 0;
                timeElem.classList.add("break");
            } else if (isBreakEnd) {
                breakEndBeep.play();
                alert("BACK TO WORK");
                isBreak = false;
                time = 0;
                timeElem.classList.remove("break");
            }
        }, 1000);
    }
}

function stopTimerHandler() {
    clearInterval(interval);
    interval = null;
}

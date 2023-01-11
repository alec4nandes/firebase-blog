// * 60 for minutes
const workTime = 25 * 60,
    breakTime = 5 * 60,
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
    /* Mobile workaround:
        Mobile browsers will not play sounds repeatedly with setInterval.
        Create arrays of Audio objects to play separately.
    */
    const breakBeeps = [],
        workBeeps = [];
    for (let i = 0; i < 24; i++) {
        breakBeeps.push(new Audio("./audio/break-start-beep.mp3"));
        workBeeps.push(new Audio("./audio/break-end-beep.mp3"));
    }
    workBeeps.pop();

    if (!interval) {
        let count = -1;
        interval = setInterval(async () => {
            time++;
            overallTime++;
            timeElem.innerHTML = displayTime(time, isBreak);
            overallTimeElem.innerHTML = displayOverallTime(overallTime);
            const isBreakStart = time && !(time % workTime),
                isBreakEnd = isBreak && !(time % breakTime);
            if (isBreakStart) {
                count++;
                await breakBeeps[count].play();
                alert("BREAK TIME");
                isBreak = true;
                time = 0;
                timeElem.classList.add("break");
            } else if (isBreakEnd) {
                if (workBeeps[count]) {
                    await workBeeps[count].play();
                } else {
                    alert("TIMER HAS RUN FOR 12 HOURS. PLEASE REFRESH PAGE.");
                    clearInterval(interval);
                    return;
                }
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

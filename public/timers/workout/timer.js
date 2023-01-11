const padNumStart = (num) => ("" + num).padStart(2, "0");

function getFormData() {
    const reps = +document.getElementById("reps").value,
        repTime = +document.getElementById("rep-time").value,
        breakTime = +document.getElementById("break-time").value;
    return {
        reps,
        repTime,
        breakTime,
    };
}

function totalSeconds(reps, repTime, breakTime) {
    return (repTime + breakTime) * reps - breakTime;
}

function formHandler(event) {
    event.preventDefault();
    const { reps, repTime, breakTime } = getFormData();
    document.getElementById("start-timer").disabled = true;

    /* Mobile workaround:
        Mobile browsers will not play sounds repeatedly with setInterval.
        Create arrays of Audio objects to play separately.
    */
    const audioNums = [],
        breakBeeps = [],
        finalBeep = new Audio("https://www.soundjay.com/buttons/beep-01a.mp3");
    for (let i = 1; i <= reps; i++) {
        audioNums.push(new Audio(`./audio/en_num_${padNumStart(i)}.mp3`));
        breakBeeps.push(
            new Audio("https://www.soundjay.com/buttons/beep-08b.mp3")
        );
    }

    let seconds = 0,
        rep = 1;
    nextRep(rep, audioNums);
    const secondsInterval = setInterval(() => {
            seconds++;
            nextSecond(seconds, breakBeeps[rep - 1]);
        }, 1000),
        repsInterval = setInterval(() => {
            rep++;
            nextRep(rep, audioNums);
        }, (repTime + breakTime) * 1000);
    setTimeout(() => {
        finalBeep.play();
        clearInterval(secondsInterval);
        clearInterval(repsInterval);
        // final second
        nextSecond(seconds, breakBeeps);
        document.getElementById("start-timer").disabled = false;
    }, totalSeconds(reps, repTime, breakTime) * 1000 + 100);
}

function nextSecond(seconds, breakBeep) {
    const { reps, repTime, breakTime } = getFormData(),
        elapsedTime = document.getElementById("elapsed-time");
    elapsedTime.innerText = `${padNumStart(~~(seconds / 60))}:${padNumStart(
        seconds % 60
    )}`;
    const calculate = Math.abs(
            (seconds % (repTime + breakTime)) - (repTime + breakTime)
        ),
        isBreakTime = calculate <= breakTime,
        isBreakBeat = calculate === breakTime,
        totalSec = totalSeconds(reps, repTime, breakTime);
    isBreakBeat && seconds < totalSec && breakBeep?.play();
    elapsedTime.className =
        seconds === totalSec
            ? "end-time"
            : isBreakTime
            ? "break-time"
            : "workout-time";
}

function nextRep(rep, audioNums) {
    document.getElementById("elapsed-reps").innerHTML = rep;
    const audioNum = new Audio(`./audio/en_num_${padNumStart(rep)}.mp3`);
    audioNums[rep - 1].play();
}

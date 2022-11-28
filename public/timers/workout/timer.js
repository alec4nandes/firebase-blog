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

function formHandler() {
    event.preventDefault();
    const {
        reps,
        repTime,
        breakTime
    } = getFormData(),
        elapsedReps = document.getElementById("elapsed-reps");
    document.getElementById("start-timer").disabled = true;
    /* Mobile workaround:
        Mobile browsers will not play the sound after loading the page
        without some user interaction. Triggering DOM clicks (.click())
        doesn't work, but premptively playing and pausing each *unique*
        audio object does the trick. */
    const audioNums = [],
        breakBeeps = [],
        finalBeep = new Audio("https://www.soundjay.com/buttons/beep-01a.mp3");
    for (let i = 1; i <= reps; i++) {
        audioNums.push(
            new Audio(
                `https://fern.haus/projects/workout/audio/en_num_${padNumStart(i)}.mp3`
            )
        );
        breakBeeps.push(new Audio("https://www.soundjay.com/buttons/beep-08b.mp3"));
    }
    [...audioNums, ...breakBeeps, finalBeep].map((audio) => {
        audio.play();
        audio.pause();
    });
    let seconds = 0,
        rep = 1;
    nextRep(audioNums, rep);
    const secondsInterval = setInterval(() => {
            seconds++;
            nextSecond(seconds, breakBeeps[rep - 1]);
        }, 1000),
        repsInterval = setInterval(() => {
            rep++;
            nextRep(audioNums, rep);
        }, (repTime + breakTime) * 1000);
    setTimeout(() => {
        finalBeep.play();
        clearInterval(secondsInterval);
        clearInterval(repsInterval);
        // final second
        nextSecond(seconds + 1);
        document.getElementById("start-timer").disabled = false;
    }, (repTime + breakTime) * reps * 1000);
}

function nextSecond(seconds, breakBeep) {
    const {
        reps,
        repTime,
        breakTime
    } = getFormData(),
        elapsedTime = document.getElementById("elapsed-time");
    elapsedTime.innerText = `${padNumStart(~~(seconds / 60))}:${padNumStart(
    seconds % 60
  )}`;
    const calculate = Math.abs(
            (seconds % (repTime + breakTime)) - (repTime + breakTime)
        ),
        isBreakTime = calculate <= breakTime,
        isBreakBeat = calculate === breakTime;
    isBreakBeat && breakBeep?.play();
    elapsedTime.className =
        seconds === (repTime + breakTime) * reps ?
        "end-time" :
        isBreakTime ?
        "break-time" :
        "workout-time";
}

function nextRep(audioNums, rep) {
    document.getElementById("elapsed-reps").innerHTML = rep;
    audioNums[rep - 1].play();
}

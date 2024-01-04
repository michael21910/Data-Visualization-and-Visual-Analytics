// constants for svg
const width = 640;
const height = 640;
const mapLink = "./LOLMinimap.jpg"

/* the key is the match ID, and the elements are the positions of the players.
 * for the elements, the order are player1_X[0], player1_Y[1], ..., player10_Y[19], teamfight[20].
 */
const dataDictionary = {};
var minute = 0;
var second = 0;
var animationSpeed = 0;
var isPaused = false;
var role = ['S', 'T', 'J', 'M', 'A'];
var isCalled = false;
var waiting = [];
var step = 20;

const speedSlider = document.getElementById('speedSlider');
const timeSlider = document.getElementById('timeSlider');
const pauseBtn = document.getElementById('pauseBtn');
const forwardBtn = document.getElementById('forwardBtn');
const backwardBtn = document.getElementById('backwardBtn');

speedSlider.addEventListener('input', function() {
    // Update the animation speed when the slider is moved
    animationSpeed = speedSlider.value;
    const formattedSpeed = parseFloat(animationSpeed).toFixed(2);
    document.getElementById('sliderText').innerHTML = `Speed: x${formattedSpeed}`;
});

timeSlider.addEventListener('input', function() {
    setNewTime('0');
    UpdateTimerDisplay();
    waiting.push(timeSlider.value);
});

// pause btn
pauseBtn.addEventListener('click', function() {
    isPaused = !isPaused;
    if (isPaused) {
        pauseBtn.innerHTML = 'Resume';
    }
    else {
        pauseBtn.innerHTML = 'Pause';
    }
});

forwardBtn.addEventListener('click', function(){
    setNewTime(parseInt(step));
    UpdateTimerDisplay();
    waiting.push(timeSlider.value);
})

backwardBtn.addEventListener('click', function(){
    setNewTime(parseInt(step) * -1);
    UpdateTimerDisplay();
    waiting.push(timeSlider.value);
})

// timer add 1 second
function TimerAddOneSecond() {
    second++;
    if (second === 60) {
        second = 0;
        minute++;
    }
    UpdateTimerDisplay();
}

// timer reset
function TimerReset() {
    minute = 0;
    second = 0;
    UpdateTimerDisplay();
}

// get value from time slider
function setNewTime(delta){
    const curFrame = parseInt(timeSlider.value) + parseInt(delta);
    minute = Math.floor(curFrame / 60);
    second = curFrame % 60;
}

// refresh timer display
function UpdateTimerDisplay() {
    const formattedMinute = minute.toString().padStart(2, '0');
    const formattedSecond = second.toString().padStart(2, '0');
    document.getElementById('message').innerHTML = `time: ${formattedMinute}:${formattedSecond}`;
    timeSlider.value = minute * 60 + second;
}

// set image and svg attr
function SetSVG() {
    const svg = d3.select('#animation')
        .attr('width', width)
        .attr('height', height);

    svg.append('image')
        .attr('href', mapLink)
        .attr('width', '100%')
        .attr('height', '100%');
}

// set selection tag after loading data, it is used to let user to choose the match
function SetSelectionTag() {
    const select = document.getElementById('matchSelect');
    for (let key in dataDictionary) {
        const option = document.createElement('option');
        option.value = key;
        option.text = key;
        select.appendChild(option);
    }
    // Add event listener for the change event on the select element
    select.addEventListener('change', function() {
        waiting.push(0);
        if (waiting.length === 1 && isCalled === false) {
            run();
        }
    });
}

// the main animation function
async function DoAmination(startTime) {
    await new Promise(resolve => setTimeout(resolve, 100));
    isCalled = true;
    console.log("call animation");

    if (startTime === 0) {
        TimerReset();
    }
    // reset the speed slider
    document.getElementById('speedSlider').value = 1;
    animationSpeed = 1;
    document.getElementById('sliderText').innerHTML = 'Speed: x1.00';

    // get the data of the match
    const matchData = dataDictionary[document.getElementById('matchSelect').value];

    // set the max value of time slider
    timeSlider.max = matchData.length;

    // get the svg
    const svg = d3.select('#animation');
    
    // remove all the circles when user clicked a new match
    svg.selectAll('circle').remove();
    svg.selectAll('text').remove();

    // set the scale of the svg
    const xScale = d3.scaleLinear().domain([0, 15000]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 15000]).range([height, 0]);

    // draw the circlesTimerReset();
    for (let i = startTime; i < matchData.length; i++) {
        // add 1 second to the timer
        TimerAddOneSecond();
        if (waiting.length !== 0) {
            console.log("ruin start, waiting.length: ", waiting.length);
            svg.selectAll('circle').remove();
            svg.selectAll('text').remove();
            break;
        }
        if (isPaused && i !== 0) {
            console.log('pause step: ', i);
            const lastData = matchData[i - 1];
            const lastFight = lastData[20] === 1;
            for (let j = 0; j < 10; j++) {
                const playerX = lastData[j * 2];
                const playerY = lastData[j * 2 + 1];
                const isBlueTeam = j < 5;
    
                const circle = svg.append('circle')
                    .attr('cx', xScale(playerX))
                    .attr('cy', yScale(playerY))
                    .attr('r', 10)
                    .attr('fill', isBlueTeam ? '#1E90FF' : '#ff9999');
                const label = svg.append('text')
                .attr('x', xScale(playerX))
                .attr('y', yScale(playerY))
                .attr('dy', 4) // adjust vertical position of the label
                .attr('text-anchor', 'middle')
                .text(role[(j + 1) % 5]); // Display player number
            }
        }
        while (isPaused) {
            await new Promise(resolve => setTimeout(resolve, 100)); // wait for 100 milliseconds
        }
        if (isPaused === false) {
            svg.selectAll('circle').remove();
            svg.selectAll('text').remove();
        }

        const playerRowData = matchData[i];
        const isTeamfight = playerRowData[20] === 1;

        // Create a Promise for each player to show their position
        const playerPromises = [];

        for (let j = 0; j < 10; j++) {
            const playerX = playerRowData[j * 2];
            const playerY = playerRowData[j * 2 + 1];
            const isBlueTeam = j < 5;

            const circle = svg.append('circle')
                .attr('cx', xScale(playerX))
                .attr('cy', yScale(playerY))
                .attr('r', 10)
                .attr('fill', isBlueTeam ? '#1E90FF' : '#ff9999');
            
            const label = svg.append('text')
                .attr('x', xScale(playerX))
                .attr('y', yScale(playerY))
                .attr('dy', 4) // adjust vertical position of the label
                .attr('text-anchor', 'middle')
                .text(role[(j + 1) % 5]); // Display player number

            playerPromises.push(new Promise(resolve => {
                // after a fixed time, resolve the Promise
                setTimeout(() => {
                    circle.remove();
                    label.remove();
                    resolve();
                }, 30 / animationSpeed);
            }));
        }
        // Wait for all players to finish showing their positions before moving to the next frame
        await Promise.all(playerPromises);
    }
    run();
}

SetSVG();

d3.csv('./rawData.csv').then(function (rawData) {
    rawData.forEach(function (d) {
        const matchID = d.MatchID;
        // stores the positions of the players, and in teamfight or not, order is described in 'dataDictionary'
        const informationArray = new Array();
        for (let i = 1; i <= 10; i++) {
            let x = Math.round( Number(d[`Player${i}_X`]) * 1000) / 1000;
            let y = Math.round( Number(d[`Player${i}_Y`]) * 1000) / 1000;
            informationArray.push(x);
            informationArray.push(y);
        }
        informationArray.push(Number(d.Teamfight));
        if (!dataDictionary[matchID]) {
            dataDictionary[matchID] = [];
        }
        dataDictionary[matchID].push(informationArray);
    });
    document.getElementById('message').innerHTML = "data loaded.";
    SetSelectionTag();
    waiting.push(0);
    run();
});

function run() {
    if (waiting.length !== 0) {
        console.log(waiting.length);
        while (waiting.length > 1) {
            waiting.shift();
        }
        DoAmination(waiting.shift());
    }
    else {
        isCalled = false;
    }  
}
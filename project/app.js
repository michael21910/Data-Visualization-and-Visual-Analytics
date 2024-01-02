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

// refresh timer display
function UpdateTimerDisplay() {
    const formattedMinute = minute.toString().padStart(2, '0');
    const formattedSecond = second.toString().padStart(2, '0');
    document.getElementById('message').innerHTML = `time: ${formattedMinute}:${formattedSecond}`;
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
        DoAmination();
    });
}

// the main animation function
function DoAmination() {
    // reset the timer
    TimerReset();

    // get the data of the match
    const matchData = dataDictionary[document.getElementById('matchSelect').value];

    // get the svg
    const svg = d3.select('#animation');
    
    // remove all the circles when user clicked a new match
    svg.selectAll('circle').remove();

    // set the scale of the svg
    const xScale = d3.scaleLinear().domain([0, 15000]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 15000]).range([height, 0]);

    // draw the circles
    for (let i = 0; i < matchData.length; i++) {
        // draw a circle for each player under a fixed time
        setTimeout(() => {
            // add 1 second to the timer
            TimerAddOneSecond();

            const playerRowData = matchData[i];
            const isTeamfight = playerRowData[20] === 1;

            for (let j = 0; j < 10; j++) {
                const playerX = playerRowData[j * 2];
                const playerY = playerRowData[j * 2 + 1];
                const isBlueTeam = j < 5;

                const circle = svg.append('circle')
                    .attr('cx', xScale(playerX))
                    .attr('cy', yScale(playerY))
                    .attr('r', 5)
                    .attr('fill', isBlueTeam ? 'blue' : 'red');

                // after a fixed time, remove the circle
                setTimeout(() => {
                    circle.remove();
                }, 20);
            }
        }, i * 20);
    }
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
    DoAmination();
});

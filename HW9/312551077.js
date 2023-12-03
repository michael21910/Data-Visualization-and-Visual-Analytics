// http://vis.lab.djosix.com:2023/data/spotify_tracks.csv

import { DataObj } from "./312551077_DataObj.js";

var dataObj;
var selectedGenre = "All";

// constants for svg
const margin = { top: 60, right: 20, bottom: 120, left: 120 };
const width = 1200 - margin.left - margin.right
const height = 800 - margin.top - margin.bottom;

// setup x and y axis
const attributes = ["popularity", "durationMS", "danceability", "energy", "key", "loudness", "mode", "speechiness", "acousticness", "instrumentalness", "liveness", "valence", "tempo", "timeSignature"];

// the user clicked the show correlation matrix button
document.getElementById('button').addEventListener('click', function() {
    document.getElementById('message').innerHTML = "Loading... Please wait...";
    document.getElementById('message').classList.add('loading');
    selectedGenre = document.getElementById("track-genre").value;
    RenderCorrelationMatrix();
});

// render correlation matrix
async function RenderCorrelationMatrix() {
    // remove previous svg
    d3.select("#spotify").html("");
    // read csv
    const data = await d3.csv('http://vis.lab.djosix.com:2023/data/spotify_tracks.csv');
    // const data = await d3.csv('./spotify_tracks.csv');
    // Create DataObj with filtered data
    dataObj = new DataObj(data);
    // Draw correlation matrix
    DrawCorrelationMatrix(dataObj, "#spotify");
    // set finish loading message
    document.getElementById('message').innerHTML = "This visualization system is for showing the relationship between different attributes.<br>1. Click the rectangles in the correlation matrix to see the scatter plot of the two attributes.<br>2. Click the \"Show Correlation Matrix\" to display the correlation matrix. You can also choose a specific genre.<br>3. In the correlation matrix, the element will be underlined if the absolute value is greater than or equal to 0.5.";
    // remove breathing light
    document.getElementById('message').classList.remove('loading');
}

// render scatter plot
function RenderScatterPlot(attr1, attr2) {
    // remove previous svg
    d3.select("#spotify").html("");
    // Draw scatter plot
    DrawScatterPlot(attr1, attr2);
    // set finish message
    document.getElementById('message').innerHTML = "Scatter plot of " + attr1 + " and " + attr2 + ".";
    // remove breathing light
    document.getElementById('message').classList.remove('loading');
}

// draw correlation matrix
function DrawCorrelationMatrix(dataObj, tagName) {
    // add genre to select tag
    AddGenreToSelect(dataObj.trackGenre, selectedGenre);

    // filter the dataObj by the chosen genre
    if (selectedGenre === "All") {
        dataObj.SetOriginalAttributes();
    }
    else {
        const attributeSize = dataObj.attributes.length;
        dataObj.attributes = [];
        for (let i = 0; i < attributeSize; i++) {
            dataObj.attributes.push([]);
        }
        for (let i = 0; i < dataObj.fullData[20].length; i++) {
            if (dataObj.fullData[20][i] === selectedGenre) {
                dataObj.attributes[0].push(dataObj.fullData[5][i]);
                dataObj.attributes[1].push(dataObj.fullData[6][i]);
                dataObj.attributes[2].push(dataObj.fullData[8][i]);
                dataObj.attributes[3].push(dataObj.fullData[9][i]);
                dataObj.attributes[4].push(dataObj.fullData[10][i]);
                dataObj.attributes[5].push(dataObj.fullData[11][i]);
                dataObj.attributes[6].push(dataObj.fullData[12][i]);
                dataObj.attributes[7].push(dataObj.fullData[13][i]);
                dataObj.attributes[8].push(dataObj.fullData[14][i]);
                dataObj.attributes[9].push(dataObj.fullData[15][i]);
                dataObj.attributes[10].push(dataObj.fullData[16][i]);
                dataObj.attributes[11].push(dataObj.fullData[17][i]);
                dataObj.attributes[12].push(dataObj.fullData[18][i]);
                dataObj.attributes[13].push(dataObj.fullData[19][i]);
            }
        }
    }
    const correlationMatrix = dataObj.CalcCorrelationMatrix();
    

    // create svg
    const svg = d3.select(tagName)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // add a title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .text(tagName.replace("#", "") + " Dataset Correlation Matrix");

    // setup color for correlation matrix
    const colorScale = d3.scaleSequential(d3.interpolate("#ff5733", "#ffe4cc")).domain([-1, 1]);

    // setup x and y scale
    const xScale = d3.scaleBand()
        .domain(attributes)
        .range([0, width])
        .padding(0.05);
        
    const yScale = d3.scaleBand()
        .domain(attributes)
        .range([0, height])
        .padding(0.05);

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // draw x and y axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
        
    // draw x and y axis label
    svg.selectAll(".x.axis text")
        .attr("transform", "translate(0, 20) rotate(-30)")
        .attr("font-weight", "bold")
        .attr("font-size", "10px")
        .style("text-anchor", "middle");

    svg.selectAll(".y.axis text")
        .attr("transform", "translate(-10, 0)  rotate(-30)")
        .attr("font-weight", "bold")
        .attr("font-size", "10px");

    // draw correlation matrix 
    for (let i = 0; i < correlationMatrix.length; i++) {
        for (let j = 0; j < correlationMatrix[i].length; j++) {
            let isHighCorrelation = Math.abs(correlationMatrix[i][j]) >= 0.5 && correlationMatrix[i][j] < 1;

            // rect in the svg
            let rect = svg.append("rect")
                .attr("x", xScale(attributes[j]))
                .attr("y", yScale(attributes[i]))
                .attr("width", xScale.bandwidth())
                .attr("height", yScale.bandwidth())
                .style("fill", colorScale(correlationMatrix[i][j]));
                
            // text in the rect (with button to scatter plot)
            let button = svg.append("foreignObject")
                .attr("x", xScale(attributes[j]))
                .attr("y", yScale(attributes[i]))
                .attr("width", xScale.bandwidth())
                .attr("height", yScale.bandwidth())
                .append("xhtml:button")
                .attr("class", "scatter-button")
                .style("cursor", "pointer")
                .style("background-color", colorScale(correlationMatrix[i][j]))
                .text(correlationMatrix[i][j]);

            // add class to high correlation elements
            button.classed("high-correlation", isHighCorrelation);
        }
    }

    // the user clicked the show scatter plot button
    const scatterButtons = document.getElementsByClassName('scatter-button');
    for (let i = 0; i < scatterButtons.length; i++) {
        scatterButtons[i].addEventListener('click', function() {
            document.getElementById('message').innerHTML = "Loading scatter plot of " + attributes[i % 14] + " and " + attributes[Math.floor(i / 14)] + ". Please wait...";
            document.getElementById('message').classList.add('loading');
            setTimeout(() => {
                RenderScatterPlot(attributes[i % 14], attributes[Math.floor(i / 14)]);
            }, 10);
        });
    }
}

// Draw scatter plot
function DrawScatterPlot(attr1, attr2) {
    // get corresponding data
    const xData = dataObj.GetAttributesDataByName(attr1);
    const yData = dataObj.GetAttributesDataByName(attr2);

    if (selectedGenre !== "All") {
        var deleteIndex = [];
        // filter data according to the filter
        for (let i = 0; i < dataObj.fullData[20].length; i++) {
            if (dataObj.fullData[20][i] !== selectedGenre) {
                deleteIndex.push(i);
            }
        }
        for (let i = deleteIndex.length - 1; i >= 0; i--) {
            xData.splice(deleteIndex[i], 1);
            yData.splice(deleteIndex[i], 1);
        }
    }

    const scatterData = [xData, yData];

    // constants for svg
    const scatterMargin = { top: 20, right: 20, bottom: 40, left: 40 };
    const scatterWidth = 1200;
    const scatterHeight = 800;

    // create the positional scales
    const xScaleScatter = d3.scaleLinear()
        .domain(d3.extent(scatterData[0])).nice()
        .range([0, scatterWidth - scatterMargin.right - scatterMargin.left]);
    const yScaleScatter = d3.scaleLinear()
        .domain(d3.extent(scatterData[1])).nice()
        .range([scatterHeight - scatterMargin.bottom - scatterMargin.top, 0]);

    // create svg
    const scatterSvg = d3.select("#spotify")
        .attr("viewBox", [0, 0, scatterWidth, scatterHeight])
        .attr("width", scatterWidth)
        .attr("height", scatterHeight)
        .attr("style", "max-width: 100%; height: auto;");

    // append the axes
    scatterSvg.append("g")
        .attr("transform", `translate(${scatterMargin.left}, ${scatterHeight - scatterMargin.bottom})`)
        .call(d3.axisBottom(xScaleScatter).ticks(scatterWidth / 80))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", 1140)
            .attr("y", 30)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text(attr1 + " →")
        );

    scatterSvg.append("g")
        .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`)
        .call(d3.axisLeft(yScaleScatter))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", 0)
            .attr("y", -10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("↑ " + attr2)
        );

    // add grid
    scatterSvg.append("g")
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0.1)
        .call(g => g.append("g")
            .selectAll("line")
            .data(xScaleScatter.ticks())
            .join("line")
            .attr("x1", d => scatterMargin.left + xScaleScatter(d))
            .attr("x2", d => scatterMargin.left + xScaleScatter(d))
            .attr("y1", scatterMargin.top)
            .attr("y2", scatterHeight - scatterMargin.bottom))
        .call(g => g.append("g")
            .selectAll("line")
            .data(yScaleScatter.ticks())
            .join("line")
            .attr("y1", d => scatterMargin.top + yScaleScatter(d))
            .attr("y2", d => scatterMargin.top + yScaleScatter(d))
            .attr("x1", scatterMargin.left)
            .attr("x2", scatterWidth - scatterMargin.right)
        );

    scatterSvg.selectAll(".dot")
        .data(d3.zip(scatterData[0], scatterData[1]))
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScaleScatter(d[0]) + scatterMargin.left)
        .attr("cy", d => yScaleScatter(d[1]) + scatterMargin.top)
        .attr("r", 3)
        .style("fill", "steelblue")
        .style("opacity", 0.5);
}

// add genre to select tag
function AddGenreToSelect(trackGenre, selectedGenre) {
    // get all genres, add to html tag
    const genreSet = new Set(trackGenre);
    var trackGenreTag = document.getElementById('track-genre');
    // clear all options
    trackGenreTag.innerHTML = "";
    // add a default option
    var defaultGenre = document.createElement("option");
    defaultGenre.text = "All";
    trackGenreTag.add(defaultGenre);
    // add all genres into select tag
    genreSet.forEach(genre => {
        var option = document.createElement("option");
        option.text = genre;
        if (genre == selectedGenre) {
            option.selected = true;
        }
        trackGenreTag.add(option);
    });
}

// first time rendering, add breathing light
document.getElementById('message').classList.add('loading');
RenderCorrelationMatrix();
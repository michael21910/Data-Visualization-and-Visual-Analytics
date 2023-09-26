import { DataObj } from "./312551077_DataObj.js";

const dataPath = "./abalone.data";
let dataArray = [];

fetch(dataPath)
    .then(response => response.text())
    .then(contents => {
        dataArray = contents.split("\n");
        dataArray = dataArray.map(row => row.split(","));
        dataArray = dataArray.map(row => row.map((value, index) => index === 0 ? value : parseFloat(value)));
        const maleData = new DataObj(dataArray.filter(data => data[0] === "M")).CalcCorrelationMatrix();
        const femaleData = new DataObj(dataArray.filter(data => data[0] === "F")).CalcCorrelationMatrix();
        const infantData = new DataObj(dataArray.filter(data => data[0] === "I")).CalcCorrelationMatrix();
        DrawCorrelationMatrix(maleData, "#male");
        DrawCorrelationMatrix(femaleData, "#female");
        DrawCorrelationMatrix(infantData, "#infant");
    })
    .catch(error => {
        console.error('Error reading the file:', error);
    });

function DrawCorrelationMatrix(data, tagName) {
    // set up for svg size and position
    const marginDistance = 100;
    const svgWidth = 750;
    const svgHeight = 750;
    const margin = { top: marginDistance, right: marginDistance, bottom: marginDistance, left: marginDistance };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

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
        .text(tagName.replace("#", "") + " Abalone Correlation Matrix");

    // setup color for correlation matrix
    const colorScale = d3.scaleSequential(d3.interpolate("pink", "white")).domain([-1, 1]);

    // setup x and y axis
    const attributes = ["length", "diameter", "height", "whole weight", "shucked weight", "viscera weight", "shell weight", "rings"];

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
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            svg.append("rect")
                .attr("x", xScale(attributes[j]))
                .attr("y", yScale(attributes[i]))
                .attr("width", xScale.bandwidth())
                .attr("height", yScale.bandwidth())
                .style("fill", colorScale(data[i][j]));
    
            svg.append("text")
                .attr("x", xScale(attributes[j]) + xScale.bandwidth() / 2)
                .attr("y", yScale(attributes[i]) + yScale.bandwidth() / 2)
                .attr("dy", "0.35em")
                .attr("font-size", "12px")
                .style("text-anchor", "middle")
                .text(data[i][j]);
        }
    }
}
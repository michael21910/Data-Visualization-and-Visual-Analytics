// http://vis.lab.djosix.com:2023/data/ma_lga_12345.csv

// constants for svg
const margin = { top: 20, right: 20, bottom: 40, left: 80 };
const width = 1200 - margin.left - margin.right
const height = 600 - margin.top - margin.bottom;

// create svg
const svg = d3.select('#themeriver')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

function PreprocessData(data) {
    // get the keys of the data
    const keys = GetKeys(data);
    // create object base on keys
    var preprocessedData = [];
    var currentDate = new Date(1970, 1, 1);
    var obj = {};
    for (let i = 0; i < data.length; i++) {
        // if the 'currentDate' is not the same as the current date, create a new object
        if (currentDate.getTime() !== data[i].saledate.getTime()) {
            // refresh the 'currentDate'
            currentDate = data[i].saledate;
            // prevent adding the first empty object
            if (Object.keys(obj).length !== 0) {
                preprocessedData.push(obj);
            }
            // clear the object
            obj = {};
            // set the saledate to the object
            obj['saledate'] = data[i].saledate;
        }
        // add the MA to the object, with the custom key
        obj[data[i].type + '-' + data[i].bedrooms] = data[i].MA;
    }
    // padding 0 to the object with missing key
    for (let i = 0; i < preprocessedData.length; i++) {
        for (let j = 0; j < keys.length; j++) {
            if (preprocessedData[i][keys[j]] === undefined) {
                preprocessedData[i][keys[j]] = 0;
            }
        }
    }
    // change the order of each element in object according to the keys
    for (let i = 0; i < preprocessedData.length; i++) {
        var temp = {};
        for (let j = 0; j < keys.length; j++) {
            temp[keys[j]] = preprocessedData[i][keys[j]];
        }
        preprocessedData[i] = temp;
    }
    return [keys, preprocessedData];
}

function DrawCharts(originalData) {
    // get the return data from the function "PreprocessData"
    const ReturnOfPreprocessData = PreprocessData(originalData);
    const keys = ReturnOfPreprocessData[0];
    const data = ReturnOfPreprocessData[1];

    // X axis
    const x = d3.scaleTime()
        .domain(d3.extent(data, d => d.saledate))
        .range([0, width]);

    // X axis label
    svg.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x))
        .attr('class', 'x-axis');

    // X axis text
    svg.append('text')
        .attr('transform', 'translate(' + (width / 2) + ' ,' + (height + 40) + ')')
        .attr('text-anchor', 'middle')
        .text('Time');

    // Y axis
    const y = d3.scaleLinear()
        .domain([-2500000, 2500000])
        .range([height, 0]);

    // Y axis label
    svg.append('g')
        .attr('transform', 'translate(0, 0)')
        .call(d3.axisLeft(y))
        .attr('class', 'y-axis');

    // Y axis text
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left + 15)
        .attr('x', 0 - (height / 2))
        .attr('text-anchor', 'middle')
        .text('Price');

    // set color
    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeCategory10);

    // stack data
    const stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(keys.filter(function (key) {
            return key !== 'saledate';
        }))(data);

    // draw themeriver
    svg.selectAll('mylayers')
        .data(stackedData)
        .join('path')
        .style('fill', d => color(d.key))
        .attr('d', d3.area()
            .x(d => x(d.data.saledate))
            .y0(d => y(d[0]))
            .y1(d => y(d[1]))
        );

    // add legend to svg
    const legend = svg.append('g')
        .attr('transform', 'translate(' + (width - 100) + ', 20)');

    // legend icon
    legend.selectAll('rect')
        .data(keys.filter(function (key) {
            return key !== 'saledate';
        }).reverse())
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', (d, i) => i * 20)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', d => color(d));

    // legend text
    legend.selectAll('text')
        .data(keys.filter(function (key) {
            return key !== 'saledate';
        }).reverse())
        .enter()
        .append('text')
        .attr('x', 25)
        .attr('y', (d, i) => i * 20 + 9)
        .style('font-size', '14px')
        .text(d => d)
        .attr('alignment-baseline', 'middle');
}

function GetKeys(data) {
    // sort data by saledate in ascending order
    data.sort((a, b) => a.saledate - b.saledate);
    // list to store the keys of the preprocessed data
    var keys = ['saledate'];
    // get all keys of the preprocessed data
    for (let i = 0; i < data.length; i++) {
        const newAttr = data[i].type + '-' + data[i].bedrooms;
        if (keys.indexOf(newAttr) === -1) {
            keys.push(newAttr);
        }
    }
    // return the keys after sorting
    return keys.sort();
}

function DragKeys(data) {
    const keys = GetKeys(data).filter(function (key) {
        return key !== 'saledate';
    }).reverse();
    const drag = document.getElementById('drag');
    for (let i = 0; i < keys.length; i++) {
        const div = document.createElement('div');
        div.setAttribute('class', 'drag-key');
        div.setAttribute('id', keys[i]);
        div.setAttribute('draggable', 'true');
        div.innerHTML = keys[i].split('-')[0] + ', ' + keys[i].split('-')[1] + 'bedrooms(' + keys[i] + ')';
        drag.appendChild(div);
    }
}

// read data
d3.csv('./ma_lga_12345.csv').then((data) => {
    // preprocess data
    data.forEach(d => {
        const dateInformation = d.saledate.split('/');
        const day = parseInt(dateInformation[0], 10);
        const month = parseInt(dateInformation[1], 10) - 1;
        const year = parseInt(dateInformation[2]);
        d.saledate = new Date(year, month, day);
        d.MA = +d.MA;
        d.type = d.type;
        d.bedrooms = +d.bedrooms;
    });
    DrawCharts(data);
    DragKeys(data);
});
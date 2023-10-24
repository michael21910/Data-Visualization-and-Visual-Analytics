// http://vis.lab.djosix.com:2023/data/ma_lga_12345.csv

// constants for svg
const margin = { top: 20, right: 20, bottom: 40, left: 80 };
const width = 1200 - margin.left - margin.right
const height = 600 - margin.top - margin.bottom;

// tooltip
const tooltip = d3.select('#tooltip');

// create svg
const svg = d3.select('#themeriver')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

function PreprocessData(keys, data) {
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
    return preprocessedData;
}

function DrawCharts(keys, originalData) {
    // clear all svg
    svg.selectAll('*').remove();

    // get the return data from the function 'PreprocessData'
    const data = PreprocessData(keys, originalData);

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

    // set color map
    const color = d3.scaleOrdinal()
        .domain(['unit-3', 'unit-2', 'unit-1', 'house-5', 'house-4', 'house-3', 'house-2'])
        .range(['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff']);

    // stack data
    const stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(keys.filter(function (key) {
            return key !== 'saledate';
        }))(data);

    // add background line, representing each saledate
    svg.selectAll('.saledate-line')
    .data(data)
    .enter()
    .append('line')
    .attr('class', 'saledate-line')
    .attr('x1', d => x(d.saledate))
    .attr('x2', d => x(d.saledate))
    .attr('y1', 0)
    .attr('y2', height)
    .style('stroke', '#ddd')
    .style('stroke-dasharray', '3, 3');

    // draw themeriver
    svg.selectAll('mylayers')
        .data(stackedData)
        .join('path')
        .style('fill', d => color(d.key))
        .attr('d', d3.area()
            .x(d => x(d.data.saledate))
            .y0(d => y(d[0]))
            .y1(d => y(d[1]))
        )
        .on('mouseover', function (d) {
            svg.selectAll('path')
                .style('opacity', 0.1);
            d3.select(this)
                .style('opacity', 1);
        })
        .on('mousemove', function (d) {
            // get the key
            const key = d.key;
            const displayKey = key.split('-')[0] + ', ' + key.split('-')[1] + ' bedrooms';
            // get the time index according to the mouse position
            const mouseX = d3.mouse(this)[0];
            const timeIndex = Math.floor(mouseX / (width / data.length));
            // get the data of the time index
            const value = d[timeIndex][1] - d[timeIndex][0];
            // set up display time
            const date = data[timeIndex]['saledate'];
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const displayDate = year + '/' + month + '/' + day + ' (yyyy/mm/dd)';
            // set the tooltip
            tooltip.style('display', 'block')
                .style('left', (d3.event.pageX + 10) + 'px')
                .style('top', (d3.event.pageY + 10) + 'px')
                .html(displayKey + '<br>' + 'date: ' + displayDate + '<br>' + 'MA: ' + value);
        })
        .on('mouseout', function (d) {
            tooltip.style('display', 'none');
            svg.selectAll('path')
                .style('opacity', 1);
        });
    
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
        .style('fill', d => color(d))
        .style('stroke', 'black');        

    // legend text
    legend.selectAll('text')
        .data(keys.filter(function (key) {
            return key !== 'saledate';
        }).reverse())
        .enter()
        .append('text')
        .attr('x', 25)
        .attr('y', (d, i) => i * 20 + 14)
        .style('font-size', '14px')
        .text(d => d);
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
    var keys = GetKeys(data).filter(function (key) {
        return key !== 'saledate';
    }).reverse();
    const drag = document.getElementById('drag');
    for (let i = 0; i < keys.length; i++) {
        const div = document.createElement('div');
        div.setAttribute('class', 'drag-key');
        div.setAttribute('id', keys[i]);
        div.setAttribute('draggable', 'true');
        div.setAttribute('margin-bottom', '12px');
        div.innerHTML = keys[i].split('-')[0] + ', ' + keys[i].split('-')[1] + ' bedrooms(' + keys[i] + ')';
        drag.appendChild(div);
    }
    var mouseDrag = d3.drag()
        .on('start', function () {
            // set the style of the drag key
            d3.select(this)
                .style('opacity', 0.5)
                .style('border', '1px dashed black');
        })
        .on('drag', function () {
            // get all of the drag keys
            const dragKeys = document.getElementsByClassName('drag-key');
            // mouse position Y
            const mouseY = d3.event.y + dragKeys[0].getBoundingClientRect().y;
            let inserted = false;
            // iterate through all of the drag keys
            for (let i = 0; i < dragKeys.length; i++) {
                // get the Y position of the drag key
                const dragKeyY = dragKeys[i].getBoundingClientRect().y + dragKeys[i].getBoundingClientRect().height / 2;
                // if the mouse position Y is smaller than the drag key Y, do the insertion
                if (mouseY < dragKeyY) {
                    drag.insertBefore(d3.select(this).node(), dragKeys[i]);
                    inserted = true;
                    break;
                }
            }
            // inserted is false means that mouse position Y is larger than all of the drag keys, so swap with the last drag key
            if (!inserted) {
                drag.appendChild(d3.select(this).node());
            }
        })
        .on('end', function () {
            d3.select(this)
                .style('opacity', 1)
                .style('border', '1px solid black');
            // get all of the drag keys
            const dragKeys = document.getElementsByClassName('drag-key');
            keys = [];
            for (let i = 0; i < dragKeys.length; i++) {
                keys.push(dragKeys[i].id);
            }
            keys.reverse();
            keys.push('saledate');
            // redraw the themeriver
            DrawCharts(keys, data);
        });

    d3.selectAll('.drag-key').call(mouseDrag);
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
    const keys = GetKeys(data);
    DrawCharts(keys, data);
    DragKeys(data);
});
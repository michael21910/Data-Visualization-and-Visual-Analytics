// http://vis.lab.djosix.com:2023/data/ma_lga_12345.csv

// constants for svg
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = 1200 - margin.left - margin.right
const height = 800 - margin.top - margin.bottom;

// create svg
const svg = d3.select('#themeriver')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

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
    console.log(data);

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
        .attr('transform', 'translate(' + (width / 2) + ' ,' + (height - 5) + ')')
        .attr('text-anchor', 'middle')
        .text('Time');

    // Y axis
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.MA)])
        .range([height, 0]);

    // Y axis label
    svg.append('g')
        .attr('transform', 'translate(0, 0)')
        .call(d3.axisRight(y))
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
        .domain(['house', 'unit'])
        .range(['#e41a1c', '#377eb8']);

    // stack data
    /* TODO */

    // area generator
    /* TODO */

    // draw themeriver
    /* TODO */

    // add legend to svg
    const legend = svg.append('g')
        .attr('transform', 'translate(' + (width - 100) + ', 20)');

    legend.selectAll("rect")
        .data(['house', 'unit'])
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', (d, i) => i * 20)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', d => color(d));

    legend.selectAll("text")
        .data(['house', 'unit'])
        .enter()
        .append('text')
        .attr('x', 25)
        .attr('y', (d, i) => i * 20 + 9)
        .style('font-size', '14px')
        .text(d => d)
        .attr('alignment-baseline', 'middle');
});
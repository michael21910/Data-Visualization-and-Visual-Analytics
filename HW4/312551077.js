// http://vis.lab.djosix.com:2023/data/iris.csv
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = 1000 - margin.left - margin.right;
const height = 1000 - margin.top - margin.bottom;
const subplotSize = 220;
const padding = 20;
const innerPadding = 0.15;

// load iris dataset
d3.csv('http://vis.lab.djosix.com:2023/data/iris.csv').then((data) => {
    // delete useless data
    data = data.slice(0, data.length - 1);
    // convert string to number
    data.forEach((d) => {
        d['sepal length'] = +d['sepal length'];
        d['sepal width'] = +d['sepal width'];
        d['petal length'] = +d['petal length'];
        d['petal width'] = +d['petal width'];
    });
    // create svg
    const svgContainer = d3.select('.svg-container');
    const svg = svgContainer
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .on('mousedown', () => {
            d3.selectAll('.subplot')
                .selectAll('.dot')
                .attr('fill', (d) => {
                    if (d.class === "Iris-setosa") return 'red';
                    else if (d.class === "Iris-versicolor") return 'green';
                    else return 'blue';
                });
            d3.selectAll('.brush').call(brush.move, null);
        })
        .append('g')
        .attr('transform', `translate(${margin.left * 2},${margin.top})`);
    // create brush
    const brush = d3.brush()
        .extent([[0, 0], [subplotSize, subplotSize]])
        .on('start brush end', brushed);
    let activeBrush = false;
    function brushed() {
        if (d3.event.selection) {
            const currentBrush = d3.select(this.parentNode).select('.brush');
            if (activeBrush !== false && activeBrush.node() !== currentBrush.node()) {
                activeBrush.call(brush.move, null);
            }
            activeBrush = currentBrush;
            const xValue = d3.select(this.parentNode).attr('xValue');
            const yValue = d3.select(this.parentNode).attr('yValue');
            const [[x0, y0], [x1, y1]] = d3.event.selection;
            const xExtent = [Math.floor(d3.min(data, (d) => d[xValue])) - innerPadding, Math.ceil(d3.max(data, (d) => d[xValue])) + innerPadding];
            const yExtent = d3.extent(data, (d) => d[yValue]);
            yExtent[0] -= innerPadding;
            yExtent[1] += innerPadding;
            let x0Original = d3.scaleLinear().domain([0, subplotSize]).range([xExtent[0], xExtent[1]])(x0);
            let x1Original = d3.scaleLinear().domain([0, subplotSize]).range([xExtent[0], xExtent[1]])(x1);
            let y0Original = d3.scaleLinear().domain([subplotSize, 0]).range([yExtent[0], yExtent[1]])(y0);
            let y1Original = d3.scaleLinear().domain([subplotSize, 0]).range([yExtent[0], yExtent[1]])(y1);
            if (x0Original > x1Original) {
                let temp = x0Original;
                x0Original = x1Original;
                x1Original = temp;
            }
            if (y0Original > y1Original) {
                let temp = y0Original;
                y0Original = y1Original;
                y1Original = temp;
            }
            const selectedData = data.filter((d) => {
                return x0Original <= d[xValue] && d[xValue] <= x1Original && y0Original <= d[yValue] && d[yValue] <= y1Original;
            });
            d3.selectAll('.subplot')
                .selectAll('.dot')
                .attr('fill', (d) => {
                    if (selectedData.includes(d)) {
                        if (d.class === "Iris-setosa") return 'red';
                        else if (d.class === "Iris-versicolor") return 'green';
                        else return 'blue';
                    } else {
                        return 'gray';
                    }
                });
        }
    }
    // attributes for x and y axis
    const attributes = ['sepal length', 'sepal width', 'petal length', 'petal width'];
    for (let i = 0; i < attributes.length; i++) {
        for (let j = 0; j < attributes.length; j++) {
            const xValue = attributes[j];
            const yValue = attributes[i];
            const subplotGroup = svg
                .append('g')
                .attr('class', 'subplot')
                .attr('xValue', xValue)
                .attr('yValue', yValue)
                .attr('transform', `translate(${j * (subplotSize + padding)}, ${i * (subplotSize + padding)})`);
            // draw scatter plot and histogram
            const xExtent = [Math.floor(d3.min(data, (d) => d[xValue])) - innerPadding, Math.ceil(d3.max(data, (d) => d[xValue])) + innerPadding];
            if (xValue === yValue) {
                // histogram
                const binSize = 0.5;
                // histogram X axis set up
                const xHistogram = d3
                    .histogram()
                    .value((d) => d[xValue])
                    .domain(xExtent)
                    .thresholds(d3.range(Math.floor(xExtent[0]), Math.ceil(xExtent[1]) + binSize, binSize))(data);
                // get maximum Y count
                const maxYCount = d3.max(xHistogram, (d) => d.length);
                // histogram Y axis set up
                const yScaleHistogram = d3.scaleLinear().range([subplotSize, 0]);
                yScaleHistogram.domain([0, maxYCount]);
                // histogram X axis set up
                const xScaleHistogram = d3.scaleLinear().range([0, subplotSize]);
                xScaleHistogram.domain(xExtent);
                // draw histogram X axis
                subplotGroup
                    .append('g')
                    .attr('class', 'x-axis')
                    .attr('transform', `translate(0, ${subplotSize})`)
                    .call(d3.axisBottom(xScaleHistogram).ticks((xExtent[1] - xExtent[0]) / binSize).tickFormat((d) => {
                        if (Number.isInteger(d)) return d;
                        else return d.toFixed(1);
                    }));
                // draw histogram Y axis
                subplotGroup.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScaleHistogram).ticks(5).tickFormat((d) => {
                    if (Number.isInteger(d)) return d;
                    else return d.toFixed(1);
                }));
                // draw histogram bar
                subplotGroup
                    .selectAll('.bar-x')
                    .data(xHistogram)
                    .enter()
                    .append('rect')
                    .attr('class', 'bar-x')
                    .attr('x', (d) => xScaleHistogram(d.x0))
                    .attr('width', (d) => xScaleHistogram(d.x1) - xScaleHistogram(d.x0))
                    .attr('y', (d) => yScaleHistogram(d.length))
                    .attr('height', (d) => subplotSize - yScaleHistogram(d.length))
                    .style('fill', 'lightblue')
                    .style('opacity', 1)
                    .style('stroke', 'white')
                    .style('stroke-width', 0.5);
            }
            else {
                // scatter plot X Y axis
                const yExtent = d3.extent(data, (d) => d[yValue]);
                yExtent[0] -= innerPadding;
                yExtent[1] += innerPadding;
                const x = d3.scaleLinear().domain(xExtent).range([0, subplotSize]);
                const y = d3.scaleLinear().domain(yExtent).range([subplotSize, 0]);
                // draw brush
                subplotGroup.append('g')
                    .attr('class', 'brush')
                    .call(brush);
                // scatter plot
                subplotGroup
                    .selectAll('.dot')
                    .data(data)
                    .enter()
                    .append('circle')
                    .attr('class', 'dot')
                    .attr('r', 2.5)
                    .attr('cx', (d) => x(d[xValue]))
                    .attr('cy', (d) => y(d[yValue]))
                    .attr("fill", d => {
                        if (d.class === "Iris-setosa") return "red";
                        else if (d.class === "Iris-versicolor") return "green";
                        else return "blue";
                    })
                    .style('opacity', 1);
                // draw X axis
                subplotGroup
                    .append('g')
                    .attr('class', 'x-axis')
                    .attr('transform', `translate(0, ${subplotSize})`)
                    .style('font-size', '10px')
                    .call(d3.axisBottom(x).ticks((xExtent[1] - xExtent[0]) / 0.5).tickFormat((d) => {
                        if (Number.isInteger(d)) return d;
                        else return d.toFixed(1);
                    }));
                // draw Y axis
                subplotGroup.append('g').attr('class', 'y-axis').call(d3.axisLeft(y).ticks(6).tickFormat((d) => {
                    if (Number.isInteger(d)) return d;
                    else return d.toFixed(1);
                }));
            }
        }
    }
});
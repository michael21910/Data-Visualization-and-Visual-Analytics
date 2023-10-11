// http://vis.lab.djosix.com:2023/data/iris.csv
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = 1000 - margin.left - margin.right;
const height = 1000 - margin.top - margin.bottom;
const subplotSize = 220;
const padding = 20;

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
    // initialize attributes
    let currentX = 'sepal length';
    let currentY = 'sepal width';
    // create svg
    const svgContainer = d3.select('.svg-container');
    const svg = svgContainer
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left * 2},${margin.top})`);

    // attributes for x and y axis
    const attributes = ['sepal length', 'sepal width', 'petal length', 'petal width'];

    for (let i = 0; i < attributes.length; i++) {
        for (let j = 0; j < attributes.length; j++) {
            const xValue = attributes[j];
            const yValue = attributes[i];
            const subplotGroup = svg
                .append('g')
                .attr('class', 'subplot')
                .attr('transform', `translate(${j * (subplotSize + padding)}, ${i * (subplotSize + padding)})`);
            // add brush
            /*
            const brush = d3
                .brush()
                .extent([
                    [0, 0],
                    [subplotSize, subplotSize],
                ])
                .on('brush', updateBrushed);
            subplotGroup.append('g').attr('class', 'brush').call(brush);
            */
            // draw scatter plot and histogram
            if (xValue === yValue) {
                // histogram
                const binSize = 0.5;
                const xExtent = [Math.floor(d3.min(data, (d) => d[xValue])), Math.ceil(d3.max(data, (d) => d[xValue]))];

                const xHistogram = d3
                    .histogram()
                    .value((d) => d[xValue])
                    .domain(xExtent)
                    .thresholds(d3.range(Math.floor(xExtent[0]), Math.ceil(xExtent[1]) + binSize, binSize))(data);

                const maxYCount = d3.max(xHistogram, (d) => d.length);

                const yScaleHistogram = d3.scaleLinear().range([subplotSize, 0]);
                yScaleHistogram.domain([0, maxYCount]);

                const xScaleHistogram = d3.scaleLinear().range([0, subplotSize]);
                xScaleHistogram.domain(xExtent);

                subplotGroup
                    .append('g')
                    .attr('class', 'x-axis')
                    .attr('transform', `translate(0, ${subplotSize})`)
                    .call(d3.axisBottom(xScaleHistogram).tickFormat(d3.format(".1f")));

                subplotGroup.append('g').attr('class', 'y-axis').call(d3.axisLeft(yScaleHistogram).ticks(5));

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
                    .style('fill', 'black')
                    .style('opacity', 0.7);
            }
            else {
                // scatter plot X Y axis
                const innerPadding = 0.2;
                const xExtent = d3.extent(data, (d) => d[xValue]);
                const yExtent = d3.extent(data, (d) => d[yValue]);
                xExtent[0] -= innerPadding;
                xExtent[1] += innerPadding;
                yExtent[0] -= innerPadding;
                yExtent[1] += innerPadding;
                const x = d3.scaleLinear().domain(xExtent).range([0, subplotSize]);
                const y = d3.scaleLinear().domain(yExtent).range([subplotSize, 0]);

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
                    .style('opacity', 0.7);
                // draw X axis
                subplotGroup
                  .append('g')
                  .attr('class', 'x-axis')
                  .attr('transform', `translate(0, ${subplotSize})`)
                  .style('font-size', '10px')
                  .call(d3.axisBottom(x).ticks(6));
                // draw Y axis
                subplotGroup.append('g').attr('class', 'y-axis').call(d3.axisLeft(y).ticks(6));
            }
        }
    }
    // initialize brush data
    let brushedData = [];
    // update matrix cells
    function updateBrushed() {
        brushedData = [];
        svg.selectAll('.brush .selection').each(function () {
            const extent = d3.select(this).datum();
            brushedData = brushedData.concat(
                data.filter(
                    (d) =>
                        d[currentX] >= extent[0][0] &&
                        d[currentX] <= extent[1][0] &&
                        d[currentY] >= extent[0][1] &&
                        d[currentY] <= extent[1][1]
                )
            );
        });
        svg
            .selectAll('.dot')
            .style('fill', (d) => (brushedData.includes(d) ? color(d.species) : 'gray'));
    }
});
const dataPath = 'http://vis.lab.djosix.com:2023/data/car.data'

const buying = ['vhigh', 'high', 'med', 'low']
const maintain = ['vhigh', 'high', 'med', 'low']
const doors = ['2', '3', '4', '5more']
const persons = ['2', '4', 'more']
const lug_boot = ['small', 'med', 'big']
const safety = ['low', 'med', 'high']
const attributes = ['buying', 'maintain', 'doors', 'persons', 'luggageBoot', 'safety']

function GetSankeyData(data) {
    // seperate data into rows
    const dataRows = data.split('\n')
    // convert each row into array
    const dataArr = dataRows.map(row => row.split(','))
    // create the source - target - value object, sankeyData
    const sankeyData = []
    // iterate through the attributes, count their source target value
    for (let i = 0; i < dataArr.length; i++) {
        let row = dataArr[i];
        // a O(n^2) to fin all pairs
        for (let j = 0; j < row.length - 1; j++) {
            for (let k = j + 1; k < row.length - 1; k++) {
                let source = attributes[j] + '.' + row[j];
                let target = attributes[k] + '.' + row[k];
                // check if pair exists
                let doesPairExist = sankeyData.find(data => data.source === source && data.target === target)
                // if exists, increment value
                if (doesPairExist) {
                    doesPairExist.value += 1
                }
                // if not, create new pair
                else {
                    sankeyData.push({
                        source: source,
                        target: target,
                        value: 1
                    })
                }
            }
        }
    }
    return sankeyData;
}

// constants for svg
const margin = { top: 20, right: 20, bottom: 40, left: 40 };
const width = 1400 - margin.left - margin.right
const height = 800 - margin.top - margin.bottom;

// get tooltip
const tooltip = d3.select('#tooltip')

// set the color scale
const color = d3.scaleOrdinal(d3.schemeCategory10);

// append the svg object to the body of the page
var svg = d3.select("#SankeyDiagram")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(40)
    .size([width, height]);

var path = sankey.link();

fetch(dataPath)
    .then(response => response.text())
    .then(data => {
        const sankeyData = GetSankeyData(data);

        // create sankey
        const sankey = d3.sankey()
            .nodeWidth(20)
            .nodePadding(10)
            .size([width, height]);

        const graph = { 'nodes': [], 'links': [] };

        // loop through each link replacing the text with its index from node
        sankeyData.forEach(function (d) {
            graph.nodes.push({ 'name': d.source });
            graph.nodes.push({ 'name': d.target });
            graph.links.push({
                'source': d.source,
                'target': d.target,
                'value': +d.value
            });
        })

        // return only the distinct / unique nodes
        graph.nodes = d3.keys(d3.nest()
            .key(function (d) { return d.name; })
            .object(graph.nodes));

        // loop through each link replacing the text with its index from node
        graph.links.forEach(function (d, i) {
            graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
            graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
        });

        // now loop through each nodes to make nodes an array of objects
        // rather than an array of strings
        graph.nodes.forEach(function (d, i) {
            graph.nodes[i] = { "name": d };
        });

        sankey.nodes(graph.nodes)
            .links(graph.links)
            .layout(32);

        // add in the links
        var link = svg.append("g")
            .selectAll(".link")
            .data(graph.links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("d", path)
            .style("stroke-width", function(d) { return Math.max(1, d.dy); })
            .sort(function(a, b) { return b.dy - a.dy; })
            .on('mouseover', (d) => {
                d3.selectAll('.link')
                    .style('opacity', 0.2);
                d3.select(d3.event.target)
                    .style('opacity', 1);
            })
            .on('mousemove', (d) => {
                tooltip.style('display', 'block')
                    .style('left', (d3.event.pageX) + 'px')
                    .style('top', (d3.event.pageY - 65) + 'px')
                    .html(`Source: ${d.source.name}<br>Target: ${d.target.name}<br>Value: ${d.value}`);
            })
            .on('mouseout', () => {
                tooltip.style('display', 'none');
                d3.selectAll('.link')
                    .style('opacity', 1);
            });

        // add in the nodes
        var node = svg.append("g")
            .selectAll(".node")
            .data(graph.nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) { 
                return "translate(" + d.x + "," + d.y + ")";
            })
            .call(d3.drag()
            .subject(function(d) {
                return d;
            })
            .on("start", function() {
                this.parentNode.appendChild(this);
            })
            .on("drag", dragmove));

        // add the rectangles for the nodes
        node.append("rect")
            .attr("height", function(d) { return d.dy; })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) { 
                return d.color = color(d.name.replace(/ .*/, ""));
            })
            .style("stroke", function(d) { 
                return d3.rgb(d.color).darker(1);
            });

        // add in the title for the nodes
        node.append("text")
            .attr("x", -6)
            .attr("y", function(d) { return d.dy / 2; })
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
            .attr("transform", null)
            .text(function(d) { return d.name; })
            .filter(function(d) { return d.x < width / 2; })
            .attr("x", 6 + sankey.nodeWidth())
            .attr("text-anchor", "start");

        // the function for moving the nodes
        function dragmove(d) {
            d3.select(this)
                .attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
            sankey.relayout();
            link.attr("d", path);
        }
    });
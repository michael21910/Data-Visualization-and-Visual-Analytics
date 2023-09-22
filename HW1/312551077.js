// constant
const zoomOut = 0.3;

// read iris dataset
d3.csv("http://vis.lab.djosix.com:2023/data/iris.csv").then(function(data) {
    data = data.slice(0, data.length - 1);
    // fetch the attributes of iris
    const xSelect = d3.select("#x-axis");
    const ySelect = d3.select("#y-axis");

    // select the svg element
    const svg = d3.select("#scatterplot");

    // setup the scales for x and y axis
    const xScale = d3.scaleLinear().range([0, 700]);
    const yScale = d3.scaleLinear().range([360, 0]);

    // refresh the options of select elements
    const attributes = Object.keys(data[0]).filter(attr => attr !== "class");
    xSelect.selectAll("option").data(attributes).enter().append("option")
        .text(d => d)
        .attr("value", d => d);
        
    ySelect.selectAll("option").data(attributes).enter().append("option")
        .text(d => d)
        .attr("value", d => d);

    // add x axis and y axis
    const xAxisGroup = svg.select(".x-axis")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, 360)`);

    const yAxisGroup = svg.select(".y-axis")
        .attr("class", "y-axis")
        .attr("transform", `translate(0, 0)`);

    // udpate the scatterplot
    function updateScatterplot() {
        const xAttribute = xSelect.property("value");
        const yAttribute = ySelect.property("value");

        // reminder for the user
        if (xAttribute == yAttribute) {
            document.getElementById("message").innerHTML = "Please select different attributes for x and y axis.<br>The scatter plot now is unuseful.";
        }
        else {
            document.getElementById("message").innerHTML = "";
        }

        xScale.domain([d3.min(data, d => +d[xAttribute]) - zoomOut, d3.max(data, d => +d[xAttribute]) + zoomOut]);
        yScale.domain([d3.min(data, d => +d[yAttribute]) - zoomOut, d3.max(data, d => +d[yAttribute]) + zoomOut]);

        svg.selectAll("circle")
            .data(data)
            .join("circle")
            .attr("cx", d => xScale(+d[xAttribute]) + 50)
            .attr("cy", d => yScale(+d[yAttribute]) + 20)
            .attr("r", 5)
            .attr("fill", d => {
                if (d.class === "Iris-setosa") return "red";
                else if (d.class === "Iris-versicolor") return "green";
                else return "blue";
            });

        // refresh x and y axis
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        xAxisGroup.call(xAxis);
        yAxisGroup.call(yAxis);
    }

    updateScatterplot();

    xSelect.on("change", updateScatterplot);
    ySelect.on("change", updateScatterplot);
});
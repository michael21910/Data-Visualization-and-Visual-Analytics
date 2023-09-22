// constant for svg
const margin = { top: 30, right: 10, bottom: 10, left: 0 };
const width = 500 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// color setup for different classes
const colorScale = d3.scaleOrdinal()
    .domain(["Iris-setosa", "Iris-versicolor", "Iris-virginica"])
    .range(["red", "green", "blue"]);

// svg set up
const svg = d3.select("#iris-parallel-coordinates")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
// read data
d3.csv("http://vis.lab.djosix.com:2023/data/iris.csv").then(function(data) {
    // fetch the attributes of iris
    const attr1 = d3.select("#attr1");
    const attr2 = d3.select("#attr2");
    const attr3 = d3.select("#attr3");
    const attr4 = d3.select("#attr4");

    // refresh the options of select elements
    const attributes = Object.keys(data[0]).filter(attr => attr !== "class");
    attr1.selectAll("option").data(attributes).enter().append("option")
        .text(d => d)
        .attr("value", d => d);
    attr2.selectAll("option").data(attributes).enter().append("option")
        .text(d => d)
        .attr("value", d => d);
    attr3.selectAll("option").data(attributes).enter().append("option")
        .text(d => d)
        .attr("value", d => d);
    attr4.selectAll("option").data(attributes).enter().append("option")
        .text(d => d)
        .attr("value", d => d);

    attr1.property("value", attributes[0]);
    attr2.property("value", attributes[1]);
    attr3.property("value", attributes[2]);
    attr4.property("value", attributes[3]);

    // remove redundant data
    data = data.slice(0, data.length - 1);
   
    function updatePCP() {
        const attr1Name = attr1.property("value");
        const attr2Name = attr2.property("value");
        const attr3Name = attr3.property("value");
        const attr4Name = attr4.property("value");
        let attrArray = [attr1Name, attr2Name, attr3Name, attr4Name];
        
        // setup the domain and the range for y axis
        var y = {};
        for (i in attrArray) {
            let attr = attrArray[i]
            y[attr] = d3.scaleLinear()
                .domain( d3.extent(data, function(d) { return +d[attr]; }) )
                .range([height, 0]);
        }

        // setup the domain and the range for x axis
        x = d3.scalePoint()
          .range([0, width])
          .padding(0.4)
          .domain(attrArray);

        // draw the lines
        function path(d) {
            return d3.line()(attrArray.map(function(p) { return [x(p), y[p](d[p])]; }));
        }

        // draw lines and axis
        svg.selectAll("path").remove();
        svg.selectAll("g").remove();

        svg.selectAll("allPath")
            .data(data)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", "none")
            .style("stroke", function(d) { return colorScale(d["class"]); });

        svg.selectAll("allAxis")
            .data(attrArray)
            .enter()
            .append("g")
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
            .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
            .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) { return d; })
            .style("fill", "black");
    }

    function handleDropdownChange(attrDropdown) {
        const selectedAttr1 = attr1.property("value");
        const selectedAttr2 = attr2.property("value");
        const selectedAttr3 = attr3.property("value");
        const selectedAttr4 = attr4.property("value");
        let selectedAttributes = [selectedAttr1, selectedAttr2, selectedAttr3, selectedAttr4];
        const uniqueAttributes = new Set(selectedAttributes);
        let duplicateAttr;
        for (const attr of uniqueAttributes) {
            if (selectedAttributes.indexOf(attr) !== selectedAttributes.lastIndexOf(attr)) {
                duplicateAttr = attr;
                break;
            }
        }
        let missingAttribute;
        for (const attr of attributes) {
            if (!uniqueAttributes.has(attr)) {
                missingAttribute = attr;
                break;
            }
        }
        if (attrDropdown !== attr1 && selectedAttr1 === duplicateAttr) {
            attr1.property("value", missingAttribute);
        }
        if (attrDropdown !== attr2 && selectedAttr2 === duplicateAttr) {
            attr2.property("value", missingAttribute);
        }
        if (attrDropdown !== attr3 && selectedAttr3 === duplicateAttr) {
            attr3.property("value", missingAttribute);
        }
        if (attrDropdown !== attr4 && selectedAttr4 === duplicateAttr) {
            attr4.property("value", missingAttribute);
        }
    }

    attr1.on("change", () => {
        handleDropdownChange(attr1);
        updatePCP();
    });
    
    attr2.on("change", () => {
        handleDropdownChange(attr2);
        updatePCP();
    });
    
    attr3.on("change", () => {
        handleDropdownChange(attr3);
        updatePCP();
    });
    
    attr4.on("change", () => {
        handleDropdownChange(attr4, selectedAttributes);
        updatePCP();
    });
    updatePCP();
})
.catch(function (error) {
    console.log(error);
});
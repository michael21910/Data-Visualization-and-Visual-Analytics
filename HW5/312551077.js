// http://vis.lab.djosix.com:2023/data/TIMES_WorldUniversityRankings_2024.csv

// load iris dataset
d3.csv('http://vis.lab.djosix.com:2023/data/TIMES_WorldUniversityRankings_2024.csv').then((data) => {
    data = data.map((d) => {
        return {
            citations: +d['scores_citations'],
            industryIncome: +d['scores_industry_income'],
            international: +d['scores_international_outlook'],
            research: +d['scores_research'],
            teaching: +d['scores_teaching'],
            scoreOverall: +d['scores_overall'],
            total: (+d['scores_citations']) + (+d['scores_industry_income']) + (+d['scores_international_outlook']) + (+d['scores_research']) + (+d['scores_teaching']),
            name: d['name']
        };
    });
    const colorDomain = ['citations', 'industryIncome', 'international', 'research', 'teaching']
    
    // sort according to user's choice

    // const for svg
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 1000 - margin.left - margin.right
    const height = data.length * 30 - margin.top - margin.bottom;

    // add element for y axis
    var yAxisData = document.getElementById('y-axis');
    yAxisData.style.width = 'auto';
    yAxisData.style.height = height + 'px';
    for (let i = 0; i < data.length; i++) {
        let addingTag = document.createElement('div');
        addingTag.innerHTML = data[i].name;
        addingTag.style.textAlign = 'right';
        addingTag.style.height = '30px';
        yAxisData.appendChild(addingTag);
    }
    yAxisData.style.display = 'flex';
    yAxisData.style.flexDirection = 'column';
    yAxisData.style.justifyContent = 'start';
    yAxisData.style.alignItems = 'flex-end';
    yAxisData.style.fontSize = '12px';

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.total)])
        .range([0, width]);

    const yScale = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, height])
        .padding(0.1);

    const color = d3.scaleOrdinal()
        .domain(colorDomain)
        .range(['red', 'blue', 'green', 'yellow', 'purple']);

    const svgContainer = d3.select('.svg-container');
    const svg = svgContainer
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    svg.append("g")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .selectAll("rect")
        .data(d => colorDomain.map(key => ({ key, value: d[key] })))
        .enter()
        .append("rect")
        .attr("x", d => xScale(0))
        .attr("y", d => yScale(d.name))
        .attr("width", d => xScale(d.value))
        .attr("height", yScale.bandwidth())
        .attr("fill", d => color(d.key));
    // debug
    console.log(data);
});
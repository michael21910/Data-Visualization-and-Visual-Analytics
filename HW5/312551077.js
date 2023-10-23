// http://vis.lab.djosix.com:2023/data/TIMES_WorldUniversityRankings_2024.csv
d3.csv('http://vis.lab.djosix.com:2023/data/TIMES_WorldUniversityRankings_2024.csv').then((data) => {
    // data preprocessing
    data = data.map((d) => {
        return {
            citations: d['scores_citations'] === 'n/a' ? 0 : +d['scores_citations'],
            industryIncome: d['scores_industry_income'] === 'n/a' ? 0 : +d['scores_industry_income'],
            international: d['scores_international_outlook'] === 'n/a' ? 0 : +d['scores_international_outlook'],
            research: d['scores_research'] === 'n/a' ? 0 : +d['scores_research'],
            teaching: d['scores_teaching'] === 'n/a' ? 0 : +d['scores_teaching'],
            scoreOverall: d['scores_overall'],
            name: d['name']
        };
    });

    // tooptip for displaying the score
    const tooltip = d3.select('#tooltip');

    // if the user clicked the button, sort the data according to the button and update the chart
    const labelButtons = document.querySelectorAll('.label');
    function SortData(data, key, order) {
        // button text content to key
        const keysMap = {
            'Citations': 'citations',
            'Industry Income': 'industryIncome',
            'International': 'international',
            'Research': 'research',
            'Teaching': 'teaching',
            'Overall': 'scoreOverall'
        }
        key = keysMap[key];
        var dataWithBars;
        var dataWithoutBars;
        if (key !== 'scoreOverall') {
            dataWithBars = data.filter(d => d.citations + d.industryIncome + d.international + d.research + d.teaching > 0);
            dataWithoutBars = data.filter(d => d.citations + d.industryIncome + d.international + d.research + d.teaching === 0);
            const sortedData = dataWithBars.sort((a, b) => {
                if (order === 'ascending') {
                    return a[key] - b[key];
                }
                else {
                    return b[key] - a[key];
                }
            });
            return sortedData.concat(dataWithoutBars);
        }
        else {
            // reverse the order of the data
            const sortedData = JSON.parse(JSON.stringify(data));
            dataWithBars = sortedData.filter(d => d.scoreOverall !== 'n/a');
            dataWithoutBars = sortedData.filter(d => d.scoreOverall === 'n/a');
            if (order === 'ascending') {
                dataWithBars.reverse();
            }
            return dataWithBars.concat(dataWithoutBars);
        }
    }

    // event listener for each button
    labelButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const key = button.textContent.split('(')[0].trim();
            const order = button.textContent.endsWith('ascending)') ? 'ascending' : 'descending';
            const sortedData = SortData(data, key, order);
            UpdateStackedBarChart(sortedData);
        })
    });

    // update the chart
    function UpdateStackedBarChart(sortedData) {
        const yScale = d3.scaleBand()
            .domain(sortedData.map(d => d.name))
            .range([0, height + margin.top + margin.bottom])
            .padding(0.1);
        const updatedStackedData = stack(sortedData);
        xScale.domain([0, d3.max(sortedData, d => d.citations + d.industryIncome + d.international + d.research + d.teaching)]);
        const universityGroups = svg.selectAll('.university-group')
            .data(sortedData, d => d.name);
        universityGroups.exit().remove();
        universityGroups.transition()
            .duration(500)
            .attr('transform', d => `translate(0, ${yScale(d.name)})`);
        const newGroups = universityGroups.enter()
            .append('g')
            .attr('class', 'university-group')
            .attr('transform', d => `translate(0, ${yScale(d.name)})`);
        newGroups.selectAll('rect')
            .data(d => updatedStackedData(keys)([d]))
            .enter()
            .selectAll('rect')
            .data(d => d)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d[0]))
            .attr('y', 0)
            .attr('width', d => xScale(d[1]) - xScale(d[0]))
            .attr('height', yScale.bandwidth())
            .attr('fill', (d) => color(d.attribute));
        svg.select('.x-axis')
            .transition()
            .duration(500)
            .call(d3.axisBottom(xScale));

        // add element for y axis
        var yAxisData = document.getElementById('y-axis');
        yAxisData.style.width = 'auto';
        yAxisData.innerHTML = '';
        yAxisData.style.height = height + margin.top + margin.bottom + 'px';
        for (let i = 0; i < sortedData.length; i++) {
            let addingTag = document.createElement('div');
            addingTag.innerHTML = sortedData[i].name + '(Overall score: ' + sortedData[i].scoreOverall + ')';
            addingTag.style.textAlign = 'right';
            addingTag.style.height = '30px';
            addingTag.style.display = 'flex';
            addingTag.style.alignItems = 'center';
            yAxisData.appendChild(addingTag);
        }
    }

    // stack the data
    const stack = d3.stack()
        .keys(['citations', 'industryIncome', 'international', 'research', 'teaching'])
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    const stackedData = stack(data);

    // const for svg
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const width = 1000 - margin.left - margin.right
    const height = data.length * 30 - margin.top - margin.bottom;

    // add element for y axis
    var yAxisData = document.getElementById('y-axis');
    yAxisData.style.width = 'auto';
    yAxisData.style.height = height + margin.top + margin.bottom + 'px';
    for (let i = 0; i < data.length; i++) {
        let addingTag = document.createElement('div');
        addingTag.innerHTML = data[i].name + '(Overall score: ' + data[i].scoreOverall + ')';
        addingTag.style.textAlign = 'right';
        addingTag.style.height = '30px';
        addingTag.style.display = 'flex';
        addingTag.style.alignItems = 'center';
        yAxisData.appendChild(addingTag);
    }
    yAxisData.style.display = 'flex';
    yAxisData.style.flexDirection = 'column';
    yAxisData.style.justifyContent = 'start';
    yAxisData.style.alignItems = 'flex-end';
    yAxisData.style.fontSize = '12px';
    yAxisData.style.marginRight = '10px';

    const yScale = d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([0, height + margin.top + margin.bottom])
        .padding(0.1);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.citations + d.industryIncome + d.international + d.research + d.teaching)])
        .range([0, width]);

    const color = d3.scaleOrdinal()
        .domain(['citations', 'industryIncome', 'international', 'research', 'teaching'])
        .range(['#AB8C83', '#8592A2', '#737C75', '#C5AB89', '#72626C']);

    const svgContainer = d3.select('.svg-container');
    const svg = svgContainer
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);

    // Create a group for each university and draw a stacked bar
    const universityGroups = svg.selectAll('.university-group')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'university-group')
        .attr('transform', d => `translate(0, ${yScale(d.name)})`);

    // Create five rectangles(stacked bar) for each group
    universityGroups.selectAll('rect')
        .data(d => {
            const stackedData = stack.keys(['citations', 'industryIncome', 'international', 'research', 'teaching'])([d]);
            stackedData.forEach((group) => {
                group.forEach((d) => {
                    d.attribute = group.key;
                });
            });
            return stackedData;
        })
        .enter()
        .selectAll('rect')
        .data(d => d)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d[0]))
        .attr('y', 0)
        .attr('width', d => xScale(d[1]) - xScale(d[0]))
        .attr('height', yScale.bandwidth())
        .attr('fill', (d) => color(d.attribute))
        .on('mouseover', (d) => {
            const attribute = d.attribute;
            const value = data.find(item => item.name === d.data.name)[attribute];;
            tooltip.style('left', d3.event.pageX + 'px');
            tooltip.style('top', d3.event.pageY + 'px');
            tooltip.html(`${attribute}: ${value}`);
            tooltip.style('display', 'block');
        })
        .on('mouseout', () => {
            tooltip.style('display', 'none');
        });

    // Add X-axis
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, 0)`)
        .call(d3.axisBottom(xScale));
});
// http://vis.lab.djosix.com:2023/data/iris.csv
// 定义图表的大小和间距
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = 800 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;
const subplotSize = 180; // 每个subplot的大小
const padding = 10; // subplot之间的间距

// load iris dataset
d3.csv('http://vis.lab.djosix.com:2023/data/iris.csv').then((data) => {
    // delete useless data
    data = data.slice(0, data.length - 1);
    // convert string to number
    data.forEach((d) => {
        d.sepalLength = +d.sepalLength;
        d.sepalWidth = +d.sepalWidth;
        d.petalLength = +d.petalLength;
        d.petalWidth = +d.petalWidth;
    });
    // 初始化画布
    let currentX = 'sepal length';
    let currentY = 'sepal width';
    // create svg
    const svgContainer = d3.select('.svg-container');
    const svg = svgContainer
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

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

      // 添加brush
      const brush = d3
        .brush()
        .extent([
          [0, 0],
          [subplotSize, subplotSize],
        ])
        .on('brush', updateBrushed);

      subplotGroup.append('g').attr('class', 'brush').call(brush);

      // 添加scatter plot或直方图
      if (xValue === yValue) {
        // 直方图
        const xHistogram = d3
          .histogram()
          .value((d) => d[xValue])
          .domain(d3.extent(data, (d) => d[xValue]))
          .thresholds(10)(data);

        // X轴比例尺为直方图
        const xScaleHistogram = d3.scaleLinear().range([0, subplotSize]);
        xScaleHistogram.domain([0, d3.max(xHistogram, (d) => d.length)]);

        // 绘制X轴
        subplotGroup
          .append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0, ${subplotSize})`)
          .call(d3.axisBottom(xScaleHistogram));

        // 绘制直方图
        subplotGroup
          .selectAll('.bar-x')
          .data(xHistogram)
          .enter()
          .append('rect')
          .attr('class', 'bar-x')
          .attr('x', (d) => xScaleHistogram(d.x0))
          .attr('width', (d) => xScaleHistogram(d.x1) - xScaleHistogram(d.x0))
          .attr('y', (d) => 0)
          .attr('height', (d) => subplotSize - 0)
          .style('fill', 'steelblue');
      } else {
        // 散点图
        const xExtent = d3.extent(data, (d) => d[xValue]);
        const yExtent = d3.extent(data, (d) => d[yValue]);

        const x = d3.scaleLinear().domain(xExtent).range([0, subplotSize]);
        const y = d3.scaleLinear().domain(yExtent).range([subplotSize, 0]);

        // 添加scatter plot
        subplotGroup
          .selectAll('.dot')
          .data(data)
          .enter()
          .append('circle')
          .attr('class', 'dot')
          .attr('r', 3)
          .attr('cx', (d) => x(d[xValue]))
          .attr('cy', (d) => y(d[yValue]))
          .attr("fill", d => {
              if (d.class === "Iris-setosa") return "red";
              else if (d.class === "Iris-versicolor") return "green";
              else return "blue";
          })
          .style('opacity', 0.7);

        // 绘制X轴
        subplotGroup
          .append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0, ${subplotSize})`)
          .call(d3.axisBottom(x));

        // 绘制Y轴
        subplotGroup.append('g').attr('class', 'y-axis').call(d3.axisLeft(y));
      }
    }
  }

  // 初始化brushedData
  let brushedData = [];

  // 更新scatter plot matrix
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

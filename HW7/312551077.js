// http://vis.lab.djosix.com:2023/data/air-pollution.csv

// constants for svg
const margin = { top: 20, right: 20, bottom: 40, left: 40 };
const width = 1200 - margin.left - margin.right
const height = 150;

// decimal for rounding
const decimal = 100000;

// data translation dictionary
const dataTranslation = {
    'SO2Mean': 'SO2 Mean',
    'NO2Mean': 'NO2 Mean',
    'O3Mean': 'O3 Mean',
    'COMean': 'CO Mean',
    'PM10Mean': 'PM10 Mean',
    'PM25Mean': 'PM2.5 Mean'
}

// preprocess data
function PreprocessData(data) {
    var returnData = [];
    var measurementDate = GetMeasurementDate(data[0]['Measurement date']);
    // data we focus on
    var SO2Mean = 0;
    var NO2Mean = 0;
    var O3Mean = 0;
    var COMean = 0;
    var PM10Mean = 0;
    var PM25Mean = 0;
    var counter = 0;
    for (let i = 0; i < data.length; i++) {
        if (GetMeasurementDate(data[i]['Measurement date']) !== measurementDate) {
            // calaulate mean to 4 decimal places
            SO2Mean = Math.round(decimal * SO2Mean / counter) / decimal;
            NO2Mean = Math.round(decimal * NO2Mean / counter) / decimal;
            O3Mean = Math.round(decimal * O3Mean / counter) / decimal;
            COMean = Math.round(decimal * COMean / counter) / decimal;
            PM10Mean = Math.round(decimal * PM10Mean / counter) / decimal;
            PM25Mean = Math.round(decimal * PM25Mean / counter) / decimal;
            // push data
            returnData.push({
                measurementDate: measurementDate,
                StationCode: data[i - 1]['Station code'],
                Address: data[i - 1]['Address'],
                Latitude: data[i - 1]['Latitude'],
                Longitude: data[i - 1]['Longitude'],
                SO2Mean: SO2Mean,
                NO2Mean: NO2Mean,
                O3Mean: O3Mean,
                COMean: COMean,
                PM10Mean: PM10Mean,
                PM25Mean: PM25Mean
            });
            // reset / refresh data
            SO2Mean = 0;
            NO2Mean = 0;
            O3Mean = 0;
            COMean = 0;
            PM10Mean = 0;
            PM25Mean = 0;
            counter = 0;
            measurementDate = GetMeasurementDate(data[i]['Measurement date']);
        }
        else {
            // add data
            SO2Mean = SO2Mean + (+data[i]['SO2']);
            NO2Mean = NO2Mean + (+data[i]['NO2']);
            O3Mean = O3Mean + (+data[i]['O3']);
            COMean = COMean + (+data[i]['CO']);
            PM10Mean = PM10Mean + (+data[i]['PM10']);
            PM25Mean = PM25Mean + (+data[i]['PM2.5']);
            counter = counter + 1;
        }
    }
    return returnData;
}

function GetMeasurementDate(measurementDate) {
    // original date format: yyyy-mm-dd hh:mm
    // return format: yyyy-mm-dd
    return measurementDate.split(' ')[0];
}

// read csv
d3.csv('http://vis.lab.djosix.com:2023/data/air-pollution.csv').then(function (data) {
    var processedData = PreprocessData(data);

    const attributes = ['SO2Mean', 'NO2Mean', 'O3Mean', 'COMean', 'PM10Mean', 'PM25Mean']
    const colors = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#a65628']
    attributes.reverse();
    colors.reverse();
    
    var stationList = [];
    for (let i = 0; i < processedData.length; i++) {
        if (stationList.indexOf(processedData[i]['StationCode']) === -1) {
            stationList.push(processedData[i]['StationCode']);
        }
    }

    for (let i = 0; i < attributes.length; i++) {
        for (let j = 0; j < stationList.length; j++) {

            const svg = d3.select('#horizonChart')
                .append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.bottom + margin.top);

            // filter data
            var filteredData = processedData.filter(function (d) {
                return d.StationCode === stationList[j];
            }).map(function (d) {
                return {
                    measurementDate: d['measurementDate'],
                    StationCode: d['StationCode'],
                    Address: d['Address'],
                    Latitude: d['Latitude'],
                    Longitude: d['Longitude'],
                    SO2Mean: d['SO2Mean'],
                    NO2Mean: d['NO2Mean'],
                    O3Mean: d['O3Mean'],
                    COMean: d['COMean'],
                    PM10Mean: d['PM10Mean'],
                    PM25Mean: d['PM25Mean'],
                    dataName: attributes[i]
                }
            });
            
            // x axis
            var x = d3.scaleTime()
                .domain(d3.extent(filteredData, function (d) { return new Date(d.measurementDate); }))
                .range([0, width]);

            // y axis
            var yExtent = d3.extent(filteredData, function (d) { return d[attributes[i]]; }).map(function (d) {
                return d * 1.5;
            });
            var y = d3.scaleLinear()
                .domain(yExtent)
                .range([height, 0]);

            // area
            var area = d3.area()
                .curve(d3.curveBasis)
                .x(function (d) { return x(new Date(d.measurementDate)); })
                .y0(height)
                .y1(function (d) { return y(d[attributes[i]]); });

            // draw area
            svg.append('path')
                .datum(filteredData)
                .attr('class', 'area')
                .attr('fill', colors[i])
                .attr('d', area);

            // draw x axis
            svg.append('g')
                .attr('transform', 'translate(0,' + height + ')')
                .call(d3.axisBottom(x));

            // draw y axis
            svg.append('g')
                .call(d3.axisRight(y));

            // draw subtitle
            svg.append('text')
                .attr('x', width / 2)
                .attr('y', height + 40)
                .attr('text-anchor', 'middle')
                .text('[' + dataTranslation[filteredData[0]['dataName']] + '] @ "' + filteredData[0]['Address'] + '" (Station code: ' + filteredData[0]['StationCode'] + ')');
        }
    }
});

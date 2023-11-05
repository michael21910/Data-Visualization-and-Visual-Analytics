// http://vis.lab.djosix.com:2023/data/air-pollution.csv

// constants for svg
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = 1200 - margin.left - margin.right
const height = 800 - margin.top - margin.bottom;

// decimal for rounding
const decimal = 100000;

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

function CreateHorizonChart() {
    
}

// read csv
d3.csv('./AirPollutionSeoul/Measurement_summary.csv').then(function (data) {
    var processedData = PreprocessData(data);
    console.log(processedData[0]);

    const attributes = ['SO2Mean', 'NO2Mean', 'O3Mean', 'COMean', 'PM10Mean', 'PM25Mean']

    for (let i = 0; i < attributes.length; i++) {
        // create svg   
        const svg = d3.select('#horizonChart')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // create x scale
        var xScale = d3.scaleTime()
            .domain(d3.extent(processedData, function (d) { return new Date(d.measurementDate); }))
            .range([0, width]);

        // draw x axis
        svg.append('g')
            .attr('transform', 'translate(0, 0)')
            .call(d3.axisTop(xScale));
    }
});
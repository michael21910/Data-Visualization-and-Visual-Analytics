// http://vis.lab.djosix.com:2023/data/spotify_tracks.csv

// constants for svg
const margin = { top: 20, right: 20, bottom: 40, left: 40 };
const width = 1200 - margin.left - margin.right
const height = 150;

// preprocess data
function PreprocessData(data) {
    
}

// read csv
d3.csv('http://vis.lab.djosix.com:2023/data/spotify_tracks.csv').then(function (data) {
    console.log(data);
});

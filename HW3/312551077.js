const dataPath = "./abalone.data";
let dataArray = [];
let maleData = [];
let femaleData = [];
let infantData = [];

fetch(dataPath)
    .then(response => response.text())
    .then(contents => {
        dataArray = contents.split("\n");
        maleData = dataArray.filter(data => data.split(",")[0] === "M");
        femaleData = dataArray.filter(data => data.split(",")[0] === "F");
        infantData = dataArray.filter(data => data.split(",")[0] === "I");
        console.log(maleData);
        console.log(femaleData);
        console.log(infantData);
        console.log("maleData length: ", maleData.length);
        console.log("femaleData length: ", femaleData.length);
        console.log("infantData length: ", infantData.length);
    })
    .catch(error => {
        console.error('Error reading the file:', error);
    });
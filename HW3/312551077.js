import { DataObj } from "./312551077_DataObj.js";

const dataPath = "./abalone.data";
let dataArray = [];

fetch(dataPath)
    .then(response => response.text())
    .then(contents => {
        dataArray = contents.split("\n");
        dataArray = dataArray.map(row => row.split(","));
        dataArray = dataArray.map(row => row.map((value, index) => index === 0 ? value : parseFloat(value)));
        const maleData = new DataObj(dataArray.filter(data => data[0] === "M")).CalcCorrelationMatrix();
        const femaleData = new DataObj(dataArray.filter(data => data[0] === "F")).CalcCorrelationMatrix();
        const infantData = new DataObj(dataArray.filter(data => data[0] === "I")).CalcCorrelationMatrix();
        DrawCorrelationMatrix(maleData, "male");
        DrawCorrelationMatrix(femaleData, "female");
        DrawCorrelationMatrix(infantData, "infant");
    })
    .catch(error => {
        console.error('Error reading the file:', error);
    });

function DrawCorrelationMatrix(data, tagName) {
    
}
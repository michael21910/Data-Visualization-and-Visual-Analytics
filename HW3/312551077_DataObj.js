export class DataObj {
    constructor(dataArray) {
        this.data = dataArray;
        this.length = this.data.map(row => row[1]);
        this.diameter = this.data.map(row => row[2]);
        this.height = this.data.map(row => row[3]);
        this.wholeWeight = this.data.map(row => row[4]);
        this.shuckedWeight = this.data.map(row => row[5]);
        this.visceraWeight = this.data.map(row => row[6]);
        this.shellWeight = this.data.map(row => row[7]);
        this.rings = this.data.map(row => row[8]);
        this.attributes = [
            this.length, this.diameter, this.height, this.wholeWeight,
            this.shuckedWeight, this.visceraWeight, this.shellWeight, this.rings
        ]
        this.correlationMatrix = [];
    }

    CalcMean(arr) {
        return arr.reduce((acc, val) => acc + val, 0) / arr.length;
    }
    
    CalcCovariance(arrX, arrY) {
        if (arrX.length !== arrY.length) {
            console.log("Error: arrX.length !== arrY.length");
            return;
        }
        const xMean = this.CalcMean(arrX);
        const yMean = this.CalcMean(arrY);
        return arrX.reduce((acc, val, index) => acc + (val - xMean) * (arrY[index] - yMean), 0) / arrX.length;
    }
    
    CalcStandardDeviation(arr) {
        const mean = this.CalcMean(arr);
        return Math.sqrt(arr.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / arr.length);
    }
    
    CalcCorrelationCoefficient(arrX, arrY) {
        return (this.CalcCovariance(arrX, arrY) / (this.CalcStandardDeviation(arrX) * this.CalcStandardDeviation(arrY))).toFixed(4);
    }

    CalcCorrelationMatrix() {
        for (var i = 0; i < this.attributes.length; i++) {
            this.correlationMatrix[i] = [];
            for (var j = 0; j < this.attributes.length; j++) {
                const corr = this.CalcCorrelationCoefficient(this.attributes[i], this.attributes[j]);
                this.correlationMatrix[i][j] = corr;
            }
        }
        return this.correlationMatrix;
    }
}
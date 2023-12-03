export class DataObj {
    constructor(dataArray) {
        this.data = dataArray;
        this.index = this.data.map(row => parseFloat(Object.values(row)[0]));
        this.trackID = this.data.map(row => Object.values(row)[1]);
        this.artists = this.data.map(row => Object.values(row)[2]);
        this.albumName = this.data.map(row => Object.values(row)[3]);
        this.trackName = this.data.map(row => Object.values(row)[4]);
        this.popularity = this.data.map(row => parseFloat(Object.values(row)[5]));
        this.durationMS = this.data.map(row => parseFloat(Object.values(row)[6]));
        this.explicit = this.data.map(row => Object.values(row)[7]);
        this.danceability = this.data.map(row => parseFloat(Object.values(row)[8]));
        this.energy = this.data.map(row => parseFloat(Object.values(row)[9]));
        this.key = this.data.map(row => parseFloat(Object.values(row)[10]));
        this.loudness = this.data.map(row => parseFloat(Object.values(row)[11]));
        this.mode = this.data.map(row => parseFloat(Object.values(row)[12]));
        this.speechiness = this.data.map(row => parseFloat(Object.values(row)[13]));
        this.acousticness = this.data.map(row => parseFloat(Object.values(row)[14]));
        this.instrumentalness = this.data.map(row => parseFloat(Object.values(row)[15]));
        this.liveness = this.data.map(row => parseFloat(Object.values(row)[16]));
        this.valence = this.data.map(row => parseFloat(Object.values(row)[17]));
        this.tempo = this.data.map(row => parseFloat(Object.values(row)[18]));
        this.timeSignature = this.data.map(row => parseFloat(Object.values(row)[19]));
        this.trackGenre = this.data.map(row => Object.values(row)[20]);
        this.attributes = [this.popularity, this.durationMS, this.danceability, this.energy,
            this.key, this.loudness, this.mode, this.speechiness, this.acousticness,
            this.instrumentalness, this.liveness, this.valence, this.tempo, this.timeSignature];
        this.fullData = [this.index, this.trackID, this.artists, this.albumName, this.trackName,
            this.popularity, this.durationMS, this.explicit, this.danceability, this.energy,
            this.key, this.loudness, this.mode, this.speechiness, this.acousticness,
            this.instrumentalness, this.liveness, this.valence, this.tempo, this.timeSignature, this.trackGenre];
        this.correlationMatrix = [];
    }

    SetOriginalAttributes() {
        this.attributes = [this.popularity, this.durationMS, this.danceability, this.energy,
            this.key, this.loudness, this.mode, this.speechiness, this.acousticness,
            this.instrumentalness, this.liveness, this.valence, this.tempo, this.timeSignature];
    }

    GetAttributesDataByName(name) {
        switch (name) {
            case "popularity":
                return this.popularity;
            case "durationMS":
                return this.durationMS;
            case "danceability":
                return this.danceability;
            case "energy":
                return this.energy;
            case "key":
                return this.key;
            case "loudness":
                return this.loudness;
            case "mode":
                return this.mode;
            case "speechiness":
                return this.speechiness;
            case "acousticness":
                return this.acousticness;
            case "instrumentalness":
                return this.instrumentalness;
            case "liveness":
                return this.liveness;
            case "valence":
                return this.valence;
            case "tempo":
                return this.tempo;
            case "timeSignature":
                return this.timeSignature;
            default:
                console.log("Error: wrong attribute name");
                return;
        }
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
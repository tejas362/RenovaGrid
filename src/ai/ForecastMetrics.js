export class ForecastMetrics {
    static calculateMAE(actual, predicted) {
        if (actual.length === 0 || actual.length !== predicted.length) return 0;
        let sum = 0;
        for (let i = 0; i < actual.length; i++) {
            sum += Math.abs(actual[i] - predicted[i]);
        }
        return sum / actual.length;
    }
    
    static calculateRMSE(actual, predicted) {
        if (actual.length === 0 || actual.length !== predicted.length) return 0;
        let sum = 0;
        for (let i = 0; i < actual.length; i++) {
            sum += Math.pow(actual[i] - predicted[i], 2);
        }
        return Math.sqrt(sum / actual.length);
    }
    
    static calculateMAPE(actual, predicted) {
        if (actual.length === 0 || actual.length !== predicted.length) return 0;
        let sum = 0;
        let count = 0;
        for (let i = 0; i < actual.length; i++) {
            if (actual[i] > 0.1) { // avoid division by zero
                sum += Math.abs((actual[i] - predicted[i]) / actual[i]);
                count++;
            }
        }
        return count > 0 ? (sum / count) * 100 : 0;
    }
    
    static evaluate(actual, predicted) {
        return {
            mae: this.calculateMAE(actual, predicted),
            rmse: this.calculateRMSE(actual, predicted),
            mape: this.calculateMAPE(actual, predicted)
        };
    }
}

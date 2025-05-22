import Onyx from 'react-native-onyx';
import type {OnyxKey} from '@src/ONYXKEYS';

const PERCENTILE = 0.95; // 95th percentile
const WINDOW_SIZE = 30; // ~2 mins of data
const DEFAULT_THRESHOLD = 1000;

type MeasurementType = 'layout' | 'effect';

class TimingMonitor {
    private measurements: number[] = [];

    private currentThreshold = DEFAULT_THRESHOLD;

    private layoutKey: string;

    private effectKey: string;

    private onyxKey: OnyxKey;

    constructor(effectKey: string, layoutKey: string, onyxKey: OnyxKey, initialMeasurements: number[] = []) {
        this.layoutKey = layoutKey;
        this.effectKey = effectKey;
        this.onyxKey = onyxKey;
        this.measurements = initialMeasurements;
        this.currentThreshold = this.getThreshold();
    }

    private getThreshold() {
        if (this.measurements.length < 2) {
            return DEFAULT_THRESHOLD;
        }

        const sorted = [...this.measurements].sort((a, b) => a - b);
        const index = Math.ceil(PERCENTILE * sorted.length) - 1;
        return (sorted.at(index) ?? DEFAULT_THRESHOLD) * 2; // Safety buffer
    }

    addMeasurement(value: number) {
        if (value > this.currentThreshold * 2) {
            return;
        }

        // Sliding window update
        this.measurements = [...this.measurements, Math.round(value)];
        if (this.measurements.length > WINDOW_SIZE) {
            this.measurements.shift();
        }

        Onyx.merge(this.onyxKey, this.measurements);
    }

    getLayoutKey() {
        return this.layoutKey;
    }

    getEffectKey() {
        return this.effectKey;
    }

    getValidMeasurement(effectValue: number): MeasurementType {
        if (effectValue > this.currentThreshold * 2) {
            return 'layout';
        }
        return 'effect';
    }
}

export default TimingMonitor;

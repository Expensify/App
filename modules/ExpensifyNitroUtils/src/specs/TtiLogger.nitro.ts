import type {HybridObject} from 'react-native-nitro-modules';

type TtiMeasurementName = 'applicationStartup' | 'bundleExecution' | 'firstDraw';

type TtiMeasurementValue = Record<TtiMeasurementName, number>;

type OnMeasurementsReadyListener = (measurement: TtiMeasurementValue) => void;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface TtiLogger extends HybridObject<{ios: 'swift'; android: 'kotlin'}> {
    mark(name: TtiMeasurementName, timestamp: number): void;

    setOnMeasurementsReadyListener(onMeasurementsReadyListener?: OnMeasurementsReadyListener): void;
}

export default TtiLogger;
export type {TtiMeasurementValue, OnMeasurementsReadyListener};

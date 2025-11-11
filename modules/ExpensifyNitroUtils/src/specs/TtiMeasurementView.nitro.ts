import type {HybridView, HybridViewMethods, HybridViewProps} from 'react-native-nitro-modules';
import {getHostComponent} from 'react-native-nitro-modules';
import TtiMeasurementViewConfig from '../../nitrogen/generated/shared/json/TtiMeasurementViewConfig.json';

type TtiMeasurementValue = {
    timestamp: number;
};

type OnTtiMeasurement = (measurement: TtiMeasurementValue) => void;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface TtiMeasurementViewProps extends HybridViewProps {
    onMeasurement: OnTtiMeasurement;
}

type TtiMeasurementViewMethods = HybridViewMethods;

type TtiMeasurementView = HybridView<TtiMeasurementViewProps, TtiMeasurementViewMethods>;

const TtiMeasurement = getHostComponent<TtiMeasurementViewProps, TtiMeasurementViewMethods>('TtiMeasurementView', () => TtiMeasurementViewConfig);

export default TtiMeasurement;
export type {TtiMeasurementView, TtiMeasurementViewProps, TtiMeasurementViewMethods, TtiMeasurementValue, OnTtiMeasurement};

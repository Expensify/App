import type {HybridView, HybridViewMethods, HybridViewProps} from 'react-native-nitro-modules';
import {getHostComponent} from 'react-native-nitro-modules';
import TTIMeasurementViewConfig from '../../nitrogen/generated/shared/json/TTIMeasurementViewConfig.json';

type TTIMeasurementValue = {
    timestamp: number;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface TTIMeasurementViewProps extends HybridViewProps {
    onMeasurement: (measurement: TTIMeasurementValue) => void;
}

type TTIMeasurementViewMethods = HybridViewMethods;

type TTIMeasurementView = HybridView<TTIMeasurementViewProps, TTIMeasurementViewMethods>;

const TTIMeasurement = getHostComponent<TTIMeasurementViewProps, TTIMeasurementViewMethods>('TTIMeasurementView', () => TTIMeasurementViewConfig);

export default TTIMeasurement;
export type {TTIMeasurementView, TTIMeasurementViewProps, TTIMeasurementViewMethods};

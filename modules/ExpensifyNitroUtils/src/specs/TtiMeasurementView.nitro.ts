import type {HybridView, HybridViewMethods, HybridViewProps} from 'react-native-nitro-modules';

type TTIMeasurement = {
    timestamp: number;
};

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface TTIMeasurementViewProps extends HybridViewProps {
    onMeasurement: (measurement: TTIMeasurement) => void;
}

type TTIMeasurementViewMethods = HybridViewMethods;

type TTIMeasurementView = HybridView<TTIMeasurementViewProps, TTIMeasurementViewMethods>;

export type {TTIMeasurementView, TTIMeasurementViewProps, TTIMeasurementViewMethods};

import type {HybridView, HybridViewMethods, HybridViewProps} from 'react-native-nitro-modules';

type TtiMeasurementValue = {
    startup: number;
    firstDraw: number;
};

type OnTtiMeasurement = (measurement: TtiMeasurementValue) => void;

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface TtiMeasurementViewProps extends HybridViewProps {
    onMeasurement?: OnTtiMeasurement;
}

type TtiMeasurementViewMethods = HybridViewMethods;

type TtiMeasurementView = HybridView<TtiMeasurementViewProps, TtiMeasurementViewMethods>;

export type {TtiMeasurementView, TtiMeasurementViewProps, TtiMeasurementViewMethods, TtiMeasurementValue, OnTtiMeasurement};
export {default as TtiMeasurementViewConfig} from '../../nitrogen/generated/shared/json/TtiMeasurementViewConfig.json';

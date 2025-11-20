import type {HybridView, HybridViewMethods, HybridViewProps} from 'react-native-nitro-modules';
import type TtiLogger from './TtiLogger.nitro';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
interface TtiMeasurementViewProps extends HybridViewProps {
    ttiLogger: TtiLogger;
}

type TtiMeasurementViewMethods = HybridViewMethods;

type TtiMeasurementView = HybridView<TtiMeasurementViewProps, TtiMeasurementViewMethods>;

export type {TtiMeasurementView, TtiMeasurementViewProps, TtiMeasurementViewMethods};
export {default as TtiMeasurementViewConfig} from '../../nitrogen/generated/shared/json/TtiMeasurementViewConfig.json';

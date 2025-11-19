import {getHostComponent, NitroModules} from 'react-native-nitro-modules';
import type * as ContactsModuleSpec from './specs/ContactsModule.nitro';
import {TtiMeasurementViewConfig} from './specs/TtiMeasurementView.nitro';
import type {OnTtiMeasurement, TtiMeasurementValue, TtiMeasurementViewMethods, TtiMeasurementViewProps, TtiMeasurementView as TtiMeasurementViewType} from './specs/TtiMeasurementView.nitro';

const ContactsNitroModule = NitroModules.createHybridObject<ContactsModuleSpec.ContactsModule>('ContactsModule');

const TtiMeasurementView = getHostComponent<TtiMeasurementViewProps, TtiMeasurementViewMethods>('TtiMeasurementView', () => TtiMeasurementViewConfig);

export {ContactsNitroModule, TtiMeasurementView};
export * from './specs/ContactsModule.nitro';

export type {TtiMeasurementViewType, TtiMeasurementViewMethods, TtiMeasurementViewProps, TtiMeasurementValue, OnTtiMeasurement};

import {useEffect} from 'react';
import {getHostComponent, NitroModules} from 'react-native-nitro-modules';
import type * as ContactsModuleSpec from './specs/ContactsModule.nitro';
import type TtiLogger from './specs/TtiLogger.nitro';
import type {OnMeasurementsReadyListener, TtiMeasurementValue} from './specs/TtiLogger.nitro';
import {TtiMeasurementViewConfig} from './specs/TtiMeasurementView.nitro';
import type {TtiMeasurementViewMethods, TtiMeasurementViewProps as TtiMeasurementViewPropsInternal, TtiMeasurementView as TtiMeasurementViewType} from './specs/TtiMeasurementView.nitro';

const ContactsNitroModule = NitroModules.createHybridObject<ContactsModuleSpec.ContactsModule>('ContactsModule');

const TtiLoggerNitroModule = NitroModules.createHybridObject<TtiLogger>('TtiLogger');

const TtiMeasurementViewImplementation = getHostComponent<TtiMeasurementViewPropsInternal, TtiMeasurementViewMethods>('TtiMeasurementView', () => TtiMeasurementViewConfig);

type TtiMeasurementViewProps = Omit<TtiMeasurementViewPropsInternal, 'ttiLogger'> & {
    onMeasurementsReady?: OnMeasurementsReadyListener;
};

function TtiMeasurementView({onMeasurementsReady, ...restProps}: TtiMeasurementViewProps) {
    useEffect(() => {
        TtiLoggerNitroModule.setOnMeasurementsReadyListener(onMeasurementsReady);
    }, [onMeasurementsReady]);

    return (
        <TtiMeasurementViewImplementation
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            ttiLogger={TtiLoggerNitroModule}
        />
    );
}

export {ContactsNitroModule, TtiLoggerNitroModule, TtiMeasurementView};
export * from './specs/ContactsModule.nitro';

export type {TtiMeasurementViewType, TtiMeasurementViewMethods, TtiMeasurementViewProps, TtiMeasurementValue, OnMeasurementsReadyListener as OnMeasuermentsReady};

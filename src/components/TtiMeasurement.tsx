import {TtiMeasurementView} from '@expensify/nitro-utils';
import type {TtiMeasurementValue} from 'modules/ExpensifyNitroUtils/src';
import {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import CONST from '@src/CONST';
import Text from './Text';

const IS_TTI_MEASURMENT_ENABLED = true;

function TtiMeasurement() {
    const [ttiMeasurement, setTtiMeasurement] = useState<TtiMeasurementValue | null>(null);

    const [runJsBundleStart, setRunJsBundleStart] = useState<number | undefined>(undefined);
    const [hermesYoungGcStart, setHermesYoungGcStart] = useState<number | undefined>(undefined);

    const basedOnStartup = useCallback(
        (timestamp: number | undefined) => {
            if (!ttiMeasurement || !timestamp) {
                return;
            }

            return timestamp - ttiMeasurement.applicationStartup;
        },
        [ttiMeasurement],
    );

    useEffect(() => {
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const timestampBasedOnStartup = basedOnStartup(entry.startTime);

                switch (entry.name) {
                    case CONST.PERFORMANCE.HERMES_YOUNG_GC_START_MARKER_NAME:
                        setHermesYoungGcStart(timestampBasedOnStartup);
                        break;
                    case 'runJsBundleStart':
                        setRunJsBundleStart(timestampBasedOnStartup);
                        break;
                    default:
                        break;
                }
            }
        }).observe({type: 'mark', buffered: true});
    }, [basedOnStartup]);

    const firstDrawTime = basedOnStartup(ttiMeasurement?.firstDraw);

    if (!IS_TTI_MEASURMENT_ENABLED) {
        return null;
    }

    return (
        <>
            <TtiMeasurementView onMeasurementsReady={setTtiMeasurement} />
            {!!ttiMeasurement && (
                <View style={{position: 'absolute', left: 10, right: 10, bottom: 100, backgroundColor: '#FFAAAA', color: 'white'}}>
                    <Text>First draw: {firstDrawTime}ms</Text>
                    <Text>Bundle execution: {runJsBundleStart}ms</Text>
                    <Text>Hermes young GC start: {hermesYoungGcStart}ms</Text>

                    <Text>Startup timestamp: {ttiMeasurement.applicationStartup}ms</Text>
                    <Text>First draw timestamp: {ttiMeasurement.firstDraw}ms</Text>
                    <Text>Bundle execution timestamp: {ttiMeasurement.bundleExecution}ms</Text>
                </View>
            )}
        </>
    );
}

export default TtiMeasurement;

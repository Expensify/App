import {TtiMeasurementView} from '@expensify/nitro-utils';
import type {TtiMeasurementValue} from 'modules/ExpensifyNitroUtils/src';
import {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import performance, {PerformanceObserver} from 'react-native-performance';
import CONST from '@src/CONST';
import Text from './Text';

const IS_TTI_MEASURMENT_ENABLED = true;

function TtiMeasurement() {
    const [ttiMeasurement, setTtiMeasurement] = useState<TtiMeasurementValue | null>(null);

    const [runJsBundleStart, setRunJsBundleStart] = useState<number | undefined>(undefined);
    const [runJsBundleStartTimestamp, setRunJsBundleStartTimestamp] = useState<number | undefined>(undefined);

    const [hermesYoungGcStart, setHermesYoungGcStart] = useState<number | undefined>(undefined);
    const [hermesYoungGcStartTimestamp, setHermesYoungGcStartTimestamp] = useState<number | undefined>(undefined);

    const basedOnStartup = useCallback(
        (timestamp: number | undefined) => {
            if (!ttiMeasurement || !timestamp) {
                return;
            }

            return Math.trunc(timestamp) - ttiMeasurement.applicationStartup;
        },
        [ttiMeasurement],
    );

    useEffect(() => {
        const entries = performance.getEntriesByName('runJsBundleStart');
        for (const entry of entries) {
            if (entry.name === CONST.PERFORMANCE.MARKERS.RUN_JS_BUNDLE_START) {
                setRunJsBundleStartTimestamp(entry.startTime);
                setRunJsBundleStart(basedOnStartup(entry.startTime));
            }
        }
    }, [basedOnStartup]);

    useEffect(() => {
        const measureObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const timestampBasedOnStartup = basedOnStartup(entry.startTime);

                switch (entry.name) {
                    case CONST.PERFORMANCE.MARKERS.HERMES_YOUNG_GC_START:
                        setHermesYoungGcStartTimestamp(entry.startTime);
                        setHermesYoungGcStart(timestampBasedOnStartup);
                        break;
                    case CONST.PERFORMANCE.MARKERS.RUN_JS_BUNDLE_START:
                        setRunJsBundleStartTimestamp(entry.startTime);
                        setRunJsBundleStart(timestampBasedOnStartup);
                        break;
                    default:
                        break;
                }
            }
        });

        measureObserver.observe({type: 'mark', buffered: true});

        return () => {
            measureObserver.disconnect();
        };
    }, [basedOnStartup]);

    const firstDrawTime = basedOnStartup(ttiMeasurement?.firstDraw);

    if (!IS_TTI_MEASURMENT_ENABLED) {
        return null;
    }

    return (
        <>
            <TtiMeasurementView onMeasurementsReady={setTtiMeasurement} />
            {!!ttiMeasurement && (
                <View
                    pointerEvents="none"
                    style={{zIndex: 1000, position: 'absolute', left: 10, right: 10, bottom: 100, backgroundColor: 'cyan', opacity: 0.5}}
                >
                    <View style={{borderWidth: 1, borderColor: 'black', padding: 10, marginBottom: 20}}>
                        <Text color="black">First draw: {firstDrawTime}ms</Text>
                        <Text color="black">Bundle execution: {runJsBundleStart}ms</Text>
                        <Text color="black">Hermes young GC start: {hermesYoungGcStart}ms</Text>
                    </View>

                    <View style={{borderWidth: 1, borderColor: 'black', padding: 10}}>
                        <Text color="black">Startup: {ttiMeasurement.applicationStartup}ms</Text>
                        <Text color="black">First draw: {ttiMeasurement.firstDraw}ms</Text>
                        <Text color="black">Run JS bundle: {runJsBundleStartTimestamp}ms</Text>
                        <Text color="black">Hermes young GC: {hermesYoungGcStartTimestamp}ms</Text>
                    </View>
                </View>
            )}
        </>
    );
}

export default TtiMeasurement;

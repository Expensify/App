import {TtiMeasurementView} from '@expensify/nitro-utils';
import type {TtiMeasurementValue} from 'modules/ExpensifyNitroUtils/src';
import {useMemo, useState} from 'react';
import {View} from 'react-native';
import {callback} from 'react-native-nitro-modules';
import Text from './Text';

const IS_TTI_MEASURMENT_ENABLED = true;

function TtiMeasurment() {
    const [ttiMeasurement, setTtiMeasurement] = useState<TtiMeasurementValue | null>(null);

    const firstDrawTime = useMemo(() => {
        if (!ttiMeasurement) {
            return;
        }

        return ttiMeasurement.firstDraw - ttiMeasurement.startup;
    }, [ttiMeasurement]);

    if (!IS_TTI_MEASURMENT_ENABLED) {
        return null;
    }

    return (
        <>
            <TtiMeasurementView onMeasurement={callback(setTtiMeasurement)} />
            {!!ttiMeasurement && (
                <View style={{position: 'absolute', left: 10, right: 10, bottom: 100, backgroundColor: '#FFAAAA', color: 'white'}}>
                    <Text>First draw: {firstDrawTime}ms</Text>

                    <Text>Startup timestamp: {ttiMeasurement.startup}ms</Text>
                    <Text>First draw timestamp: {ttiMeasurement.firstDraw}ms</Text>
                </View>
            )}
        </>
    );
}

export default TtiMeasurment;

import React, {useEffect} from 'react';
import {View} from 'react-native-web';
import BootSplash from './libs/BootSplash';
import TestComponent from './TestComponent'

function Expensify() {
    useEffect(() => {
        BootSplash.hide();
    }, []);

    return (
        <View>
            <TestComponent />
        </View>
    );
}

export default Expensify;

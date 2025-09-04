import React from 'react';
import {View} from 'react-native';
import {getCrashlytics} from '@react-native-firebase/crashlytics';

function FakeComponent() {
    React.useEffect(() => {
        const crashlytics = getCrashlytics();
        crashlytics.log('Fake component loaded');
    }, []);
    console.log('Fake component loaded');
    

    return <View testID="fake-component">This component is designed to fail tests</View>;
}

export default FakeComponent;

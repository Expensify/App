import React from 'react';
import {View} from 'react-native';
import {getCrashlytics} from '@react-native-firebase/crashlytics';

function FakeComponent() {
    // This will fail because Firebase Crashlytics is not properly mocked in perf tests
    React.useEffect(() => {
        const crashlytics = getCrashlytics();
        crashlytics.log('Fake component loaded');
    }, []);
    
    return <View testID="fake-component">This component is designed to fail tests</View>;
}

export default FakeComponent;

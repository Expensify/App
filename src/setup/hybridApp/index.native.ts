import HybridAppModule from '@expensify/react-native-hybrid-app';
import {Linking} from 'react-native';
import isOldDotURL from '@libs/isOldDotURL';
import Log from '@libs/Log';
import {closeReactNativeApp} from '@userActions/HybridApp';
import CONFIG from '@src/CONFIG';

if (CONFIG.IS_HYBRID_APP) {
    // On HybridApp we need to shadow official implementation of Linking.getInitialURL on NewDot side with our custom implementation.
    // Main benefit from this approach is that our deeplink-related code can be implemented the same way for both standalone NewDot and HybridApp.
    // It's not possible to use the official implementation from the Linking module because the way OldDot handles deeplinks is significantly different from a standard React Native app.
    Linking.getInitialURL = () =>
        HybridAppModule.getInitialURL().then((url) => {
            // If the initial URL is an OD URL, it should not be processed by NewDot.
            // Close the React Native app to return to OldDot which will handle the URL natively.
            if (url && isOldDotURL(url)) {
                Log.info('[Deep link] OD URL received as initial URL in HybridApp, closing React Native app', false, {url});
                closeReactNativeApp({shouldSetNVP: false, isTrackingGPS: false});
                return null;
            }
            return url;
        });
}

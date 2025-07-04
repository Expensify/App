import {Linking} from 'react-native';
import CONFIG from '@src/CONFIG';
import HybridAppModule from '@expensify/react-native-hybrid-app';

// On HybridApp we need to shadow official implementation of Linking.getInitialURL on NewDot side with our custom implementation.
// Main benefit from this approach is that our deeplink-related code can be implemented the same way for both standalone NewDot and HybridApp.
if(CONFIG.IS_HYBRID_APP) {
    Linking.getInitialURL = () => HybridAppModule.getInitialURL();
}

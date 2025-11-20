/**
 * @format
 */
// import of polyfills should always be first
import './src/polyfills/PromiseWithResolvers';
import {AppRegistry} from 'react-native';
import {startProfiling} from "react-native-release-profiler"
import App from './src/App';
import Config from './src/CONFIG';
import additionalAppSetup from './src/setup';


startProfiling();

// Define EXPO_OS before any imports to prevent console errors from Expo DOM components
if (!process.env.EXPO_OS && __DEV__) {
    const {Platform} = require('react-native');
    // Create a new process.env object with EXPO_OS defined
    const originalEnv = process.env;
    process.env = {
        ...originalEnv,
        EXPO_OS: Platform.OS,
    };
}

AppRegistry.registerComponent(Config.APP_NAME, () => App);
additionalAppSetup();

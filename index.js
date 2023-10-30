/**
 * @format
 */

import {enableLegacyWebImplementation} from 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './src/App';
import Config from './src/CONFIG';
import additionalAppSetup from './src/setup';

enableLegacyWebImplementation(true);
AppRegistry.registerComponent(Config.APP_NAME, () => App);
additionalAppSetup();

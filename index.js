/**
 * @format
 */

import 'react-native-gesture-handler';
import {AppRegistry, I18nManager} from 'react-native';
import App from './src/App';
import Config from './src/CONFIG';
import additionalAppSetup from './src/setup';

// force app layout to work left to right.
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);
I18nManager.swapLeftAndRightInRTL(false);

AppRegistry.registerComponent(Config.APP_NAME, () => App);
additionalAppSetup();

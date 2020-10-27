/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import additionalAppSetup from './src/setup';

AppRegistry.registerComponent(appName, () => App);
additionalAppSetup();

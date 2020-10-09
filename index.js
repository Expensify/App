/**
 * Note: This file is the entry point used by React Native for the native platforms.
 * Webpack uses different entry points for web and desktop, located at web/index.js and desktop/index.js, respectively.
 */
/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);

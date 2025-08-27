/**
 * @format
 */
import {AppRegistry} from 'react-native';
import App from './src/App';
import Config from './src/CONFIG';
import './src/polyfills/PromiseWithResolvers';
import additionalAppSetup from './src/setup';

AppRegistry.registerComponent(Config.APP_NAME, () => App);
additionalAppSetup();

/**
 * @format
 */
// import of polyfills should always be first
import './src/polyfills/PromiseWithResolvers';
import {AppRegistry} from 'react-native';
import App from './src/App';
import Config from './src/CONFIG';
import additionalAppSetup from './src/setup';

AppRegistry.registerComponent(Config.APP_NAME, () => App);
additionalAppSetup();

/**
 * @format
 */
import {AppRegistry} from 'react-native';
import toSorted from 'array.prototype.tosorted';
import App from './src/App';
import Config from './src/CONFIG';
import additionalAppSetup from './src/setup';

toSorted.shim();

AppRegistry.registerComponent(Config.APP_NAME, () => App);
additionalAppSetup();

/**
 * @format
 */
import {AppRegistry} from 'react-native';
import {enableLegacyWebImplementation} from 'react-native-gesture-handler';
import App from './src/App';
import Config from './src/CONFIG';
import * as Setup from './src/setup';

enableLegacyWebImplementation(true);

Setup.beforeAppLoad().then(() => {
    AppRegistry.registerComponent(Config.APP_NAME, () => App);
    Setup.afterAppLoad();
});
Setup.additional();

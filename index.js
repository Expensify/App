/**
 * @format
 */

import {enableLegacyWebImplementation} from 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './src/App';
import Config from './src/CONFIG';
import * as Setup from './src/setup';

enableLegacyWebImplementation(true);
Setup.blocking().then(() => AppRegistry.registerComponent(Config.APP_NAME, () => App));
Setup.nonBlocking();

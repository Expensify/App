/**
 * @format
 */

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import OnyxDemo from './src/OnyxDemo';
import Config from './src/CONFIG';
import additionalAppSetup from './src/setup';

AppRegistry.registerComponent(Config.APP_NAME, () => OnyxDemo);
additionalAppSetup();

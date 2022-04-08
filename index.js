/**
 * @format
 */

import 'react-native-gesture-handler';
import {AppRegistry, Text, TextInput} from 'react-native';
import App from './src/App';
import Config from './src/CONFIG';
import additionalAppSetup from './src/setup';

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;
AppRegistry.registerComponent(Config.APP_NAME, () => App);
additionalAppSetup();

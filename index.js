/**
 * @format
 */

import 'react-native-gesture-handler';
import {AppRegistry, Text as RNText, TextInput as RNTextInput} from 'react-native';
import App from './src/App';
import Config from './src/CONFIG';
import additionalAppSetup from './src/setup';

RNText.defaultProps = RNText.defaultProps || {};
RNText.defaultProps.allowFontScaling = false;
RNTextInput.defaultProps = RNTextInput.defaultProps || {};
RNTextInput.defaultProps.allowFontScaling = false;
AppRegistry.registerComponent(Config.APP_NAME, () => App);
additionalAppSetup();

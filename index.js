/**
 * @format
 */
import {AppRegistry} from 'react-native';
import App from './src/App';

AppRegistry.registerComponent('Config.APP_NAME', () => App);
AppRegistry.runApplication('Config.APP_NAME', {
    rootTag: document.getElementById('root'),
});

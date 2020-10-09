/**
 * This file is serving as the webpack entry point for the desktop webpack build.
 * The main process run by electron lives in desktop/main.js.
 */
import {AppRegistry} from 'react-native';
import App from '../src/App';

AppRegistry.registerComponent('App', () => App);

AppRegistry.runApplication('App', {
    rootTag: document.getElementById('root'),
});

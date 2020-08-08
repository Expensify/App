import {AppRegistry} from 'react-native';
import App from '../src/App';

AppRegistry.registerComponent('App', () => App);

AppRegistry.runApplication('App', {
    rootTag: document.getElementById('root'),
});

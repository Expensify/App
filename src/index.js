import {AppRegistry} from 'react-native';
import App from '../js/App';

AppRegistry.registerComponent('App', () => App);

AppRegistry.runApplication('App', {
    rootTag: document.getElementById('root'),
});

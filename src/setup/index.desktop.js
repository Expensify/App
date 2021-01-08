import {AppRegistry} from 'react-native';
import {name as appName} from '../../app.json';

export default function () {
    AppRegistry.runApplication(appName, {
        rootTag: document.getElementById('root'),
    });
}

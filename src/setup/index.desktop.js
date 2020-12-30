import {AppRegistry} from 'react-native';
import Config from '../CONFIG';

export default function () {
    AppRegistry.runApplication(Config.APP_NAME, {
        rootTag: document.getElementById('root'),
    });
}

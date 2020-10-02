import {AppState} from 'react-native';
import EventEmitter from '../EventEmitter';

const Activity = new EventEmitter();

export const APP_BECAME_ACTIVE = 'appBecameActive';

AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        Activity.emit(APP_BECAME_ACTIVE);
    }
});

export default Activity;

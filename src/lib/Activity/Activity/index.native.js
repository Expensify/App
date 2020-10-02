import {AppState} from 'react-native';
import EventEmitter from '../../EventEmitter';
import EVENT from '../Events';

const Activity = new EventEmitter();

AppState.addEventListener('change', (state) => {
    if (state === 'active') {
        Activity.emit(EVENT.APP_BECAME_ACTIVE);
    }
});

export default Activity;

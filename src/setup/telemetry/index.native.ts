import {AppState} from 'react-native';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';

export default function () {
    Timing.start(CONST.TIMING.SPLASH_SCREEN);
    Timing.start(CONST.TIMING.OPEN_APP);

    AppState.addEventListener('change', () => {
        Timing.clearData();
    });
}

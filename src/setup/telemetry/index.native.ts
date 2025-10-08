import {AppState} from 'react-native';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';

export default function () {
    Timing.start(CONST.TIMING.SPLASH_SCREEN);

    AppState.addEventListener('change', (state) => {
        if (state === 'active') {
            return;
        }

        Timing.clearData();
    });
}

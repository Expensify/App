import {I18nManager} from 'react-native';
import intlPolyfill from '@libs/IntlPolyfill';
import * as Device from '@userActions/Device';
import addUtilsToWindow from './addUtilsToWindow';
import initOnyx from './initOnyx';
import platformSetup from './platformSetup';

export default function () {
    initOnyx();

    Device.setDeviceID();

    // Force app layout to work left to right because our design does not currently support devices using this mode
    I18nManager.allowRTL(false);
    I18nManager.forceRTL(false);

    // Polyfill the Intl API if locale data is not as expected
    intlPolyfill();

    // Perform any other platform-specific setup
    platformSetup();

    addUtilsToWindow();
}

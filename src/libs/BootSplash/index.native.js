import {NativeModules} from 'react-native';
import Log from '../Log';

const BootSplash = NativeModules.BootSplash;

function hide() {
    Log.info('[BootSplash] hiding splash screen', false);
    BootSplash.hide();
}

export default {
    hide,
    getVisibilityStatus: BootSplash.getVisibilityStatus,
};

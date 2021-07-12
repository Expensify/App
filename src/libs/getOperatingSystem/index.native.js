import {Platform} from 'react-native';
import CONST from '../../CONST';

/**
 * Reads the current operating system for native platforms.
 * @return {String | null}
 */
export default () => {
    switch (Platform.OS) {
        case 'ios':
            return CONST.OS.IOS;
        case 'android':
            return CONST.OS.ANDROID;
        default:
            return CONST.OS.NATIVE;
    }
};

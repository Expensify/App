import CONST from '@src/CONST';

import {Platform} from 'react-native';

import type GetOperatingSystem from './types';

/**
 * Reads the current operating system for native platforms.
 */
const getOperatingSystem: GetOperatingSystem = () => {
    switch (Platform.OS) {
        case 'ios':
            return CONST.OS.IOS;
        case 'android':
            return CONST.OS.ANDROID;
        default:
            return CONST.OS.NATIVE;
    }
};

export default getOperatingSystem;

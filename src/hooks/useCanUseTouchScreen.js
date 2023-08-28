import {useEffect, useState} from 'react';
import * as DeviceCapabilities from '../libs/DeviceCapabilities';

/**
 * This hook returns a boolean indicating whether the device is a touch screen or not.
 * @returns {Boolean}
 */
export default function useCanUseTouchScreen() {
    const [canUseTouchScreen, setCanUseTouchScreen] = useState(DeviceCapabilities.canUseTouchScreen());

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const newCanUseTouchScreen = DeviceCapabilities.canUseTouchScreen();
        if (canUseTouchScreen === newCanUseTouchScreen) return;
        setCanUseTouchScreen(newCanUseTouchScreen);
    });

    return canUseTouchScreen;
}

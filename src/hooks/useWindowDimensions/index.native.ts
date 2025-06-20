// eslint-disable-next-line no-restricted-imports
import {useSafeAreaFrame} from 'react-native-safe-area-context';
import type WindowDimensions from './types';

/**
 * A wrapper around React Native's useWindowDimensions hook.
 */
export default function (): WindowDimensions {
    // we need to use `useSafeAreaFrame` instead of `useWindowDimensions` because of https://github.com/facebook/react-native/issues/41918
    const {width: windowWidth, height: windowHeight} = useSafeAreaFrame();
    return {
        windowWidth,
        windowHeight,
    };
}

// eslint-disable-next-line no-restricted-imports
import {useWindowDimensions} from 'react-native';
import type WindowDimensions from './types';

/**
 * A convenience wrapper around React Native's useWindowDimensions hook that also provides booleans for our breakpoints.
 */
export default function (): WindowDimensions {
    const {width: windowWidth, height: windowHeight} = useWindowDimensions();
    return {
        windowWidth,
        windowHeight,
    };
}

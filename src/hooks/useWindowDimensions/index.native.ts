// eslint-disable-next-line no-restricted-imports
import {useWindowDimensions} from 'react-native';
import type WindowDimensions from './types';

/**
 * A wrapper around React Native's useWindowDimensions hook.
 */
export default function (): WindowDimensions {
    const {width: windowWidth, height: windowHeight} = useWindowDimensions();
    return {
        windowWidth,
        windowHeight,
    };
}

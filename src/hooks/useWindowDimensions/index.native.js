// eslint-disable-next-line no-restricted-imports
import {useWindowDimensions} from 'react-native';
import variables from '../../styles/variables';

/**
 * A convenience wrapper around React Native's useWindowDimensions hook that also provides booleans for our breakpoints.
 * @returns {Object}
 */
export default function () {
    const {width: windowWidth, height: windowHeight} = useWindowDimensions();
    const isExtraSmallScreenHeight = windowHeight <= variables.extraSmallMobileResponsiveHeightBreakpoint;
    const isSmallScreenWidth = true;
    const isMediumScreenWidth = false;
    const isLargeScreenWidth = false;
    return {
        windowWidth,
        windowHeight,
        isExtraSmallScreenHeight,
        isSmallScreenWidth,
        isMediumScreenWidth,
        isLargeScreenWidth,
    };
}

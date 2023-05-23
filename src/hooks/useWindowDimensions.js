// eslint-disable-next-line no-restricted-imports
import {useWindowDimensions} from 'react-native';
import variables from '../styles/variables';

/**
 * A convenience wrapper around React Native's useWindowDimensions hook that also provides booleans for our breakpoints.
 * @returns {Object}
 */
export default function () {
    const {width: windowWidth, height: windowHeight} = useWindowDimensions();
    const isSmallScreenWidth = windowWidth <= variables.mobileResponsiveWidthBreakpoint;
    const isMediumScreenWidth = windowWidth > variables.mobileResponsiveWidthBreakpoint && windowWidth <= variables.tabletResponsiveWidthBreakpoint;
    const isLargeScreenWidth = windowWidth > variables.tabletResponsiveWidthBreakpoint;
    return {
        windowWidth,
        windowHeight,
        isSmallScreenWidth,
        isMediumScreenWidth,
        isLargeScreenWidth,
    };
}

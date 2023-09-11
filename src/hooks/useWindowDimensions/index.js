// eslint-disable-next-line no-restricted-imports
import {Dimensions, useWindowDimensions} from 'react-native';
import variables from '../../styles/variables';

/**
 * A convenience wrapper around React Native's useWindowDimensions hook that also provides booleans for our breakpoints.
 * @returns {Object}
 */
export default function () {
    const {width: windowWidth, height: windowHeight} = useWindowDimensions();
    // On mWeb, when soft keyboard opens, window height changes. We use screen height instead.
    const screenHeight = Dimensions.get('screen').height;
    const isExtraSmallScreenHeight = screenHeight <= variables.extraSmallMobileResponsiveHeightBreakpoint;
    const isSmallScreenWidth = windowWidth <= variables.mobileResponsiveWidthBreakpoint;
    const isMediumScreenWidth = windowWidth > variables.mobileResponsiveWidthBreakpoint && windowWidth <= variables.tabletResponsiveWidthBreakpoint;
    const isLargeScreenWidth = windowWidth > variables.tabletResponsiveWidthBreakpoint;
    return {
        windowWidth,
        windowHeight,
        isExtraSmallScreenHeight,
        isSmallScreenWidth,
        isMediumScreenWidth,
        isLargeScreenWidth,
    };
}

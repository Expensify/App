// eslint-disable-next-line no-restricted-imports
import {useWindowDimensions} from 'react-native';
import variables from '@styles/variables';
import type WindowDimensions from './types';

/**
 * A convenience wrapper around React Native's useWindowDimensions hook that also provides booleans for our breakpoints.
 */
export default function (): WindowDimensions {
    const {width: windowWidth, height: windowHeight} = useWindowDimensions();

    const isExtraSmallScreenHeight = windowHeight <= variables.extraSmallMobileResponsiveHeightBreakpoint;
    const isSmallScreenWidth = windowWidth <= variables.mobileResponsiveWidthBreakpoint;
    const isMediumScreenWidth = windowWidth > variables.mobileResponsiveWidthBreakpoint && windowWidth <= variables.tabletResponsiveWidthBreakpoint;
    const isLargeScreenWidth = windowWidth > variables.tabletResponsiveWidthBreakpoint;
    const lowerScreenDimension = Math.min(windowWidth, windowHeight);
    const isExtraSmallScreenWidth = windowWidth <= variables.extraSmallMobileResponsiveWidthBreakpoint;
    const isSmallScreen = lowerScreenDimension <= variables.mobileResponsiveWidthBreakpoint;

    return {
        windowWidth,
        windowHeight,
        isExtraSmallScreenHeight,
        isSmallScreenWidth,
        isMediumScreenWidth,
        isLargeScreenWidth,
        isExtraSmallScreenWidth,
        isSmallScreen,
    };
}

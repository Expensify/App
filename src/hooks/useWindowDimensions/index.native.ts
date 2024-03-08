// eslint-disable-next-line no-restricted-imports
import {useWindowDimensions} from 'react-native';
import getIsPad from '@libs/getIsPad';
import variables from '@styles/variables';
import type WindowDimensions from './types';

/**
 * A convenience wrapper around React Native's useWindowDimensions hook that also provides booleans for our breakpoints.
 */
export default function (): WindowDimensions {
    const {width: windowWidth, height: windowHeight} = useWindowDimensions();
    const isPad = getIsPad();

    const isExtraSmallScreenHeight = windowHeight <= variables.extraSmallMobileResponsiveHeightBreakpoint;
    const isSmallScreenWidth = isPad ? windowWidth <= variables.mobileResponsiveWidthBreakpoint : true;
    const isMediumScreenWidth = isPad ? windowWidth > variables.mobileResponsiveWidthBreakpoint && windowWidth <= variables.tabletResponsiveWidthBreakpoint : false;
    const isLargeScreenWidth = isPad ? windowWidth > variables.tabletResponsiveWidthBreakpoint : false;
    const lowerScreenDimmension = Math.min(windowWidth, windowHeight);
    const isExtraSmallScreenWidth = windowWidth <= variables.extraSmallMobileResponsiveWidthBreakpoint;
    const isSmallScreen = isPad ? lowerScreenDimmension <= variables.mobileResponsiveWidthBreakpoint : true;

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

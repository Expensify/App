import ScreenWrapperTopInsetHeaderContext from '@components/ScreenWrapper/ScreenWrapperTopInsetHeaderContext';

import getSpacing from '@libs/getSpacing';

import type {StyleProp, ViewStyle} from 'react-native';

import {useContext, useId, useLayoutEffect} from 'react';
import {StyleSheet} from 'react-native';

import useStatusRingHeaderLayout from './useStatusRingHeaderLayout';

/**
 * For the header at the top of a screen: on devices whose status bar leaves room for the header inside the top inset,
 * asks the screen's ScreenWrapper to leave the top inset out of its padding and returns the style that places the header
 * in the inset. Everywhere else it returns nothing and the screen keeps its top padding. When a screen has more than one
 * header, the first one that asks gets the inset and the others return nothing.
 *
 * `headerStyle` is the style of the view the returned style goes on: the room kept clear of the status bar is added to
 * that view's own side padding, which keeps its content off the screen's rounded corners.
 */
function useTopInsetHeaderStyle(headerStyle?: StyleProp<ViewStyle>): ViewStyle | undefined {
    const headerID = useId();
    const statusRingHeaderLayout = useStatusRingHeaderLayout();
    const topInsetHeaderContext = useContext(ScreenWrapperTopInsetHeaderContext);
    const registerTopInsetHeader = topInsetHeaderContext?.registerTopInsetHeader;
    const shouldPlaceHeaderInTopInset = !!statusRingHeaderLayout;

    // A layout effect so the screen drops its top padding before the first paint, without a frame of both paddings.
    useLayoutEffect(() => {
        if (!shouldPlaceHeaderInTopInset || !registerTopInsetHeader) {
            return;
        }
        return registerTopInsetHeader(headerID);
    }, [shouldPlaceHeaderInTopInset, registerTopInsetHeader, headerID]);

    // Only the first header on the screen gets the inset, so a header further down keeps its own height.
    if (!statusRingHeaderLayout || topInsetHeaderContext?.topInsetHeaderID !== headerID) {
        return undefined;
    }

    const {topOffset, bottomOffset, left, right, height} = statusRingHeaderLayout;
    const ownStyle = StyleSheet.flatten(headerStyle) ?? {};
    const topInsetHeaderStyle: ViewStyle = {
        paddingTop: topOffset,
        paddingBottom: bottomOffset,
        // Some headers have a fixed height for their row, and a minimum height wins over it, so the row keeps its height
        // inside the padding.
        minHeight: height,
    };
    if (left > 0) {
        topInsetHeaderStyle.paddingLeft = getSpacing(ownStyle, ['paddingLeft', 'paddingHorizontal', 'padding']) + left;
    }
    if (right > 0) {
        topInsetHeaderStyle.paddingRight = getSpacing(ownStyle, ['paddingRight', 'paddingHorizontal', 'padding']) + right;
    }
    return topInsetHeaderStyle;
}

export default useTopInsetHeaderStyle;

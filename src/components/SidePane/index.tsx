import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import Animated, {Easing, SlideInRight} from 'react-native-reanimated';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Backdrop from '@components/Modal/BottomDockedModal/Backdrop';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {triggerSidePane} from '@libs/actions/SidePane';
import Navigation from '@libs/Navigation/Navigation';
import {isSidePaneHidden, substituteRouteParameters} from '@libs/SidePaneUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import getHelpContent from './getHelpContent';

function SidePane({shouldShowOverlay = false}: {shouldShowOverlay?: boolean}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const [sidePane] = useOnyx(ONYXKEYS.NVP_SIDE_PANE);
    const isPaneHidden = isSidePaneHidden(sidePane, isExtraLargeScreenWidth);

    const route = useNavigationState((state) => {
        const params = (findFocusedRoute(state)?.params as Record<string, string>) ?? {};
        const activeRoute = Navigation.getActiveRouteWithoutParams();
        return substituteRouteParameters(activeRoute, params);
    });

    const onClose = useCallback(
        (shouldUpdateNarrow = false) => {
            triggerSidePane(false, {shouldOnlyUpdateNarrowLayout: !isExtraLargeScreenWidth || shouldUpdateNarrow});
        },
        [isExtraLargeScreenWidth],
    );

    const sizeChangedFromLargeToNarrow = useRef(!isExtraLargeScreenWidth);
    useEffect(() => {
        // Close the side pane when the screen size changes from large to small
        if (!isExtraLargeScreenWidth && !sizeChangedFromLargeToNarrow.current) {
            onClose(true);
            sizeChangedFromLargeToNarrow.current = true;
        }

        // Reset the trigger when the screen size changes back to large
        if (isExtraLargeScreenWidth) {
            sizeChangedFromLargeToNarrow.current = false;
        }
    }, [isExtraLargeScreenWidth, onClose]);

    console.log(`%%% lastRoute`, route);

    if (isPaneHidden) {
        return null;
    }

    return (
        <>
            {shouldShowOverlay && !isExtraLargeScreenWidth && !shouldUseNarrowLayout && (
                <Backdrop
                    onBackdropPress={onClose}
                    style={styles.sidePaneOverlay}
                />
            )}
            <Animated.View
                style={styles.sidePaneContainer(shouldUseNarrowLayout, isExtraLargeScreenWidth)}
                entering={isExtraLargeScreenWidth ? undefined : SlideInRight.duration(CONST.MODAL.ANIMATION_TIMING.DEFAULT_IN).easing(Easing.inOut(Easing.quad))}
            >
                <ScreenWrapper testID={SidePane.displayName}>
                    <HeaderWithBackButton
                        title={translate('common.help')}
                        style={styles.headerBarDesktopHeight}
                        onBackButtonPress={() => onClose(false)}
                        onCloseButtonPress={() => onClose(false)}
                        shouldShowBackButton={!isExtraLargeScreenWidth}
                        shouldShowCloseButton={isExtraLargeScreenWidth}
                        shouldDisplayHelpButton={false}
                    />
                    {getHelpContent(styles, route)}
                </ScreenWrapper>
            </Animated.View>
        </>
    );
}

function SidePaneWithOverlay() {
    return <SidePane shouldShowOverlay />;
}

SidePane.displayName = 'SidePane';

export default SidePane;
export {SidePaneWithOverlay};

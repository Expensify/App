import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Backdrop from '@components/Modal/BottomDockedModal/Backdrop';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePane from '@hooks/useSidePane';
import useThemeStyles from '@hooks/useThemeStyles';
import {triggerSidePane} from '@libs/actions/SidePane';
import Navigation from '@libs/Navigation/Navigation';
import {substituteRouteParameters} from '@libs/SidePaneUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import getHelpContent from './getHelpContent';

function SidePane({shouldShowOverlay = false}: {shouldShowOverlay?: boolean}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();

    const {route, isInNarrowPaneModal} = useNavigationState((state) => {
        const params = (findFocusedRoute(state)?.params as Record<string, string>) ?? {};
        const activeRoute = Navigation.getActiveRouteWithoutParams();
        return {route: substituteRouteParameters(activeRoute, params), isInNarrowPaneModal: state.routes.some((r) => r.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR)};
    });
    const {sidePaneTranslateX, shouldHideSidePane, shouldHideSidePaneBackdrop, sidePane} = useSidePane();

    const onClose = useCallback(
        (shouldUpdateNarrow = false) => {
            if (!sidePane) {
                return;
            }

            triggerSidePane(false, {shouldOnlyUpdateNarrowLayout: !isExtraLargeScreenWidth || shouldUpdateNarrow});
        },
        [isExtraLargeScreenWidth, sidePane],
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

    if (shouldHideSidePane) {
        return null;
    }

    return (
        <>
            <View>
                {shouldShowOverlay && !shouldHideSidePaneBackdrop && !isInNarrowPaneModal && (
                    <Backdrop
                        onBackdropPress={onClose}
                        style={styles.sidePaneOverlay}
                    />
                )}
            </View>
            <Animated.View style={[styles.sidePaneContainer(shouldUseNarrowLayout, isExtraLargeScreenWidth), {transform: [{translateX: sidePaneTranslateX.current}]}]}>
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
export {SidePaneWithOverlay, useSidePane as useAnimatedPaddingRight};

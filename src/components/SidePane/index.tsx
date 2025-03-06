import type {ParamListBase} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Backdrop from '@components/Modal/BottomDockedModal/Backdrop';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePane from '@hooks/useSidePane';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import {triggerSidePane} from '@libs/actions/SidePane';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackNavigationState} from '@libs/Navigation/PlatformStackNavigation/types';
import {substituteRouteParameters} from '@libs/SidePaneUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import getHelpContent from './getHelpContent';

type SidePaneProps = {
    state: PlatformStackNavigationState<ParamListBase>;
};

function SidePane({state}: SidePaneProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {sidePaneTranslateX, shouldHideSidePane, shouldHideSidePaneBackdrop} = useSidePane();
    const {paddingTop} = useStyledSafeAreaInsets();

    const {route, isInNarrowPaneModal} = useMemo(() => {
        const params = (findFocusedRoute(state)?.params as Record<string, string>) ?? {};
        const activeRoute = Navigation.getActiveRouteWithoutParams();

        return {
            route: substituteRouteParameters(activeRoute, params),
            isInNarrowPaneModal: state?.routes?.some((r) => r.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR),
        };
    }, [state]);

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

    if (shouldHideSidePane) {
        return null;
    }

    return (
        <>
            <View>
                {!shouldHideSidePaneBackdrop && !isInNarrowPaneModal && (
                    <Backdrop
                        onBackdropPress={onClose}
                        style={styles.sidePaneOverlay}
                    />
                )}
            </View>
            <Animated.View style={[styles.sidePaneContainer(shouldUseNarrowLayout, isExtraLargeScreenWidth), {transform: [{translateX: sidePaneTranslateX.current}], paddingTop}]}>
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
            </Animated.View>
        </>
    );
}

SidePane.displayName = 'SidePane';

export default SidePane;

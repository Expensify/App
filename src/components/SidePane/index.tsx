import {findFocusedRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';
import HeaderGap from '@components/HeaderGap';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useEnvironment from '@hooks/useEnvironment';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useSidePane from '@hooks/useSidePane';
import useStyledSafeAreaInsets from '@hooks/useStyledSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import {triggerSidePane} from '@libs/actions/SidePane';
import Navigation from '@libs/Navigation/Navigation';
import {substituteRouteParameters} from '@libs/SidePaneUtils';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import getHelpContent from './getHelpContent';
import SidePaneOverlay from './SidePaneOverlay';

function SidePane() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();
    const {route, isInNarrowPaneModal} = useRootNavigationState((state) => {
        const params = (findFocusedRoute(state)?.params as Record<string, string>) ?? {};
        const activeRoute = Navigation.getActiveRouteWithoutParams();

        return {
            route: substituteRouteParameters(activeRoute, params),
            isInNarrowPaneModal: state?.routes.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
        };
    });

    const {isExtraLargeScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {sidePaneTranslateX, shouldHideSidePane, shouldHideSidePaneBackdrop} = useSidePane();
    const {paddingTop} = useStyledSafeAreaInsets();

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

    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.ESCAPE, () => onClose(), {shouldBubble: shouldHideSidePane, isActive: !isExtraLargeScreenWidth});

    if (shouldHideSidePane) {
        return null;
    }

    return (
        <>
            <View>
                {!shouldHideSidePaneBackdrop && (
                    <SidePaneOverlay
                        onBackdropPress={onClose}
                        isInNarrowPaneModal={isInNarrowPaneModal}
                    />
                )}
            </View>
            <Animated.View style={[styles.sidePaneContainer(shouldUseNarrowLayout, isExtraLargeScreenWidth), {transform: [{translateX: sidePaneTranslateX.current}], paddingTop}]}>
                <HeaderGap />
                <HeaderWithBackButton
                    title={translate('common.help')}
                    style={styles.headerBarDesktopHeight}
                    onBackButtonPress={() => onClose(false)}
                    onCloseButtonPress={() => onClose(false)}
                    shouldShowBackButton={!isExtraLargeScreenWidth}
                    shouldShowCloseButton={isExtraLargeScreenWidth}
                    shouldDisplayHelpButton={false}
                />
                {getHelpContent(styles, route, isProduction)}
            </Animated.View>
        </>
    );
}

SidePane.displayName = 'SidePane';

export default SidePane;

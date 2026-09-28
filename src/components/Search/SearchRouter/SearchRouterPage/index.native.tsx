import ScreenWrapper from '@components/ScreenWrapper';
import SearchRouter from '@components/Search/SearchRouter/SearchRouter';
import {setIsSearchRouterOpenOrOpening, useSearchRouterActions, useSearchRouterState} from '@components/Search/SearchRouter/SearchRouterContext';

import useKeyboardState from '@hooks/useKeyboardState';
import useNetwork from '@hooks/useNetwork';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import getKeyboardHeight from '@libs/getKeyboardHeight';

import React, {useEffect} from 'react';
import {View} from 'react-native';

type GetAvailableHeightParams = {
    isKeyboardOverlapping: boolean;
    keyboardHeight: number;
    keyboardActiveHeight: number;
    bottomInset: number;
    windowHeight: number;
    paddingTop: number;
};

function getAvailableHeight({isKeyboardOverlapping, keyboardHeight, keyboardActiveHeight, bottomInset, windowHeight, paddingTop}: GetAvailableHeightParams): number | undefined {
    const measuredKeyboardHeight = keyboardHeight || getKeyboardHeight(keyboardActiveHeight, bottomInset);
    const effectiveKeyboardHeight = isKeyboardOverlapping ? measuredKeyboardHeight : 0;
    return effectiveKeyboardHeight ? Math.max(windowHeight - effectiveKeyboardHeight - paddingTop, 0) : undefined;
}

function SearchRouterPage() {
    const {closeSearchRouter} = useSearchRouterActions();
    const {isSearchRouterDisplayed} = useSearchRouterState();
    const {isKeyboardActive, keyboardHeight, keyboardActiveHeight} = useKeyboardState();
    const {isOffline} = useNetwork();
    const {paddingTop} = useSafeAreaPaddings();
    const {bottom} = useSafeAreaInsets();
    const {windowHeight} = useWindowDimensions();
    const StyleUtils = useStyleUtils();
    const styles = useThemeStyles();

    // The presence of this route is the source of truth for "the router is open" on native: it mounts on a deep link
    // or a restored last-visited path without openSearchRouter, and hardware Back and the iOS gesture pop it without
    // closeSearchRouter.
    useEffect(() => {
        setIsSearchRouterOpenOrOpening(true);
        return () => setIsSearchRouterOpenOrOpening(false);
    }, []);

    const shouldConstrainForOfflineKeyboard = isOffline && isKeyboardActive;
    // Keep the router between the top safe area and the keyboard; ScreenWrapper and the
    // list already handle bottom safe-area and offline-indicator spacing.
    // Clamp to zero so transient dimensions during animation never produce a negative height.
    const availableHeight = getAvailableHeight({
        isKeyboardOverlapping: shouldConstrainForOfflineKeyboard,
        keyboardHeight,
        keyboardActiveHeight,
        bottomInset: bottom,
        windowHeight,
        paddingTop,
    });

    return (
        <ScreenWrapper
            testID="SearchRouterPage"
            shouldEnableMaxHeight
            enableEdgeToEdgeBottomSafeAreaPadding
            includePaddingTop
            includeSafeAreaPaddingBottom
        >
            <View style={[styles.flex1, availableHeight !== undefined && StyleUtils.getMaximumHeight(availableHeight)]}>
                <SearchRouter
                    onRouterClose={closeSearchRouter}
                    shouldHideInputCaret={false}
                    isSearchRouterDisplayed={isSearchRouterDisplayed}
                />
            </View>
        </ScreenWrapper>
    );
}

export default SearchRouterPage;
export {getAvailableHeight};

import ScreenWrapper from '@components/ScreenWrapper';
import SearchRouter from '@components/Search/SearchRouter/SearchRouter';
import {useSearchRouterActions, useSearchRouterState} from '@components/Search/SearchRouter/SearchRouterContext';

import useKeyboardState from '@hooks/useKeyboardState';
import useNetwork from '@hooks/useNetwork';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import getKeyboardHeight from '@libs/getKeyboardHeight';

import React from 'react';
import {View} from 'react-native';

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
    const isKeyboardOverlapping = isOffline && isKeyboardActive;
    const measuredKeyboardHeight = keyboardHeight || getKeyboardHeight(keyboardActiveHeight, bottom);
    const effectiveKeyboardHeight = isKeyboardOverlapping ? measuredKeyboardHeight : 0;
    // Keep the router between the top safe area and the keyboard; ScreenWrapper and the
    // list already handle bottom safe-area and offline-indicator spacing.
    // Clamp to zero so transient dimensions during animation never produce a negative height.
    const availableHeight = effectiveKeyboardHeight ? Math.max(windowHeight - effectiveKeyboardHeight - paddingTop, 0) : undefined;

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

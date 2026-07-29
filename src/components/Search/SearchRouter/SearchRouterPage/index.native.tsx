import ScreenWrapper from '@components/ScreenWrapper';
import SearchRouter from '@components/Search/SearchRouter/SearchRouter';
import {useSearchRouterActions, useSearchRouterState} from '@components/Search/SearchRouter/SearchRouterContext';

import useKeyboardState from '@hooks/useKeyboardState';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import getKeyboardHeight from '@libs/getKeyboardHeight';

import React from 'react';
import {View} from 'react-native';

function SearchRouterPage() {
    const {closeSearchRouter} = useSearchRouterActions();
    const {isSearchRouterDisplayed} = useSearchRouterState();
    const {isKeyboardActive, keyboardHeight, keyboardActiveHeight} = useKeyboardState();
    const {paddingTop} = useSafeAreaPaddings();
    const {bottom} = useSafeAreaInsets();
    const {windowHeight} = useWindowDimensions();
    const styles = useThemeStyles();
    const effectiveKeyboardHeight = isKeyboardActive ? keyboardHeight || getKeyboardHeight(keyboardActiveHeight, bottom) : 0;
    const availableHeight = effectiveKeyboardHeight ? Math.max(windowHeight - effectiveKeyboardHeight - paddingTop, 0) : undefined;

    return (
        <ScreenWrapper
            testID="SearchRouterPage"
            shouldEnableMaxHeight
            enableEdgeToEdgeBottomSafeAreaPadding
            includePaddingTop
            includeSafeAreaPaddingBottom
        >
            <View style={[styles.flex1, availableHeight !== undefined && {maxHeight: availableHeight}]}>
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

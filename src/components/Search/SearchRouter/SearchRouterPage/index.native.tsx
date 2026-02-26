import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchRouter from '@components/Search/SearchRouter/SearchRouter';
import {useSearchRouterActions, useSearchRouterState} from '@components/Search/SearchRouter/SearchRouterContext';

function SearchRouterPage() {
    const {closeSearchRouter} = useSearchRouterActions();
    const {isSearchRouterDisplayed} = useSearchRouterState();

    return (
        <ScreenWrapper
            testID="SearchRouterPage"
            shouldEnableMaxHeight
            enableEdgeToEdgeBottomSafeAreaPadding
            includePaddingTop
            includeSafeAreaPaddingBottom
        >
            <SearchRouter
                onRouterClose={closeSearchRouter}
                shouldHideInputCaret={false}
                isSearchRouterDisplayed={isSearchRouterDisplayed}
            />
        </ScreenWrapper>
    );
}

export default SearchRouterPage;

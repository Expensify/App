import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchRouter from '@components/Search/SearchRouter/SearchRouter';
import {useSearchRouterContext} from '@components/Search/SearchRouter/SearchRouterContext';

function SearchRouterPage() {
    const {isSearchRouterDisplayed, closeSearchRouter} = useSearchRouterContext();

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

SearchRouterPage.displayName = 'SearchRouterPage';

export default SearchRouterPage;

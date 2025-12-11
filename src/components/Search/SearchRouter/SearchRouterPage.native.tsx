import React from 'react';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchRouter from './SearchRouter';
import {useSearchRouterContext} from './SearchRouterContext';

function SearchRouterPage() {
    const {isSearchRouterDisplayed, closeSearchRouter} = useSearchRouterContext();

    return (
        <ScreenWrapper
            testID={SearchRouterPage.displayName}
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

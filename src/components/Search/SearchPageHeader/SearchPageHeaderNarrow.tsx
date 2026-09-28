import CollapsibleHeaderOnKeyboard from '@components/CollapsibleHeaderOnKeyboard';
import TopBar from '@components/Navigation/TopBar';
import type {SearchQueryJSON} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';

import SearchSelectedNarrow from '@pages/Search/SearchSelectedNarrow';

import variables from '@styles/variables';

import React from 'react';

type SearchPageHeaderNarrowProps = {
    queryJSON: SearchQueryJSON;
    shouldShowLoadingBar: boolean;
    isMobileSelectionModeEnabled: boolean;
};

const TAB_NAVIGATOR_HEIGHT_LANDSCAPE = variables.tabSelectorButtonHeight + variables.tabSelectorButtonPadding;

function SearchPageHeaderNarrow({queryJSON, shouldShowLoadingBar = false, isMobileSelectionModeEnabled}: SearchPageHeaderNarrowProps) {
    const {translate} = useLocalize();

    if (isMobileSelectionModeEnabled) {
        return <SearchSelectedNarrow queryJSON={queryJSON} />;
    }

    // The narrow header is the top-level page title, so it stays a static "Spend". The tab selector rendered directly
    // below it already names the current view, and repeating that name here would show the same label twice.
    return (
        <CollapsibleHeaderOnKeyboard collapsibleHeaderOffset={TAB_NAVIGATOR_HEIGHT_LANDSCAPE}>
            <TopBar
                shouldShowLoadingBar={shouldShowLoadingBar}
                breadcrumbLabel={translate('common.spend')}
                shouldDisplayHelpButton
            />
        </CollapsibleHeaderOnKeyboard>
    );
}

export default SearchPageHeaderNarrow;

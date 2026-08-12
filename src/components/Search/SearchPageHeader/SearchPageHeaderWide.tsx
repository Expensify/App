import TopBar from '@components/Navigation/TopBar';
import type {SearchQueryJSON} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';

import React from 'react';

import getSearchPageHeaderTitle from './getSearchPageHeaderTitle';

type SearchPageHeaderWideProps = {
    queryJSON: SearchQueryJSON;
};

function SearchPageHeaderWide({queryJSON}: SearchPageHeaderWideProps) {
    const {translate} = useLocalize();
    const {typeMenuSections, activeItemIndex, activeSavedSearch} = useSearchTypeMenuSections(queryJSON);
    const selectedItem = activeItemIndex >= 0 ? typeMenuSections.flatMap((section) => section.menuItems).at(activeItemIndex) : undefined;

    const title = getSearchPageHeaderTitle({translate, type: queryJSON.type, activeSavedSearch, selectedItem});

    return (
        <TopBar
            shouldShowLoadingBar={false}
            breadcrumbLabel={title}
            shouldDisplayHelpButton
        />
    );
}

export default SearchPageHeaderWide;

import React from 'react';
import TopBar from '@components/Navigation/TopBar';
import type {SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';

type SearchPageHeaderWideProps = {
    queryJSON: SearchQueryJSON;
};

function SearchPageHeaderWide({queryJSON}: SearchPageHeaderWideProps) {
    const {translate} = useLocalize();
    const {typeMenuSections, activeItemIndex} = useSearchTypeMenuSections(queryJSON);
    const selectedItem = typeMenuSections.flatMap((section) => section.menuItems).at(activeItemIndex);
    const title = activeItemIndex >= 0 && selectedItem ? translate(selectedItem.translationPath) : translate('common.spend');

    return (
        <TopBar
            shouldShowLoadingBar={false}
            breadcrumbLabel={title}
            shouldDisplaySearch={false}
            shouldDisplayHelpButton
        />
    );
}

export default SearchPageHeaderWide;

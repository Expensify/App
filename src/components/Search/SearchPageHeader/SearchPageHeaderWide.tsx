import React from 'react';
import TopBar from '@components/Navigation/TopBar';
import type {SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';

type SearchPageHeaderWideProps = {
    queryJSON: SearchQueryJSON;
};
// NOTE: This is intentionally unused for now. It will be wired up in https://github.com/Expensify/App/issues/84876
function SearchPageHeaderWide({queryJSON}: SearchPageHeaderWideProps) {
    const {translate} = useLocalize();
    const {typeMenuSections, activeItemIndex} = useSearchTypeMenuSections(queryJSON);
    const selectedItem = typeMenuSections.flatMap((section) => section.menuItems).at(activeItemIndex);
    const title = activeItemIndex >= 0 && selectedItem ? translate(selectedItem.translationPath) : translate('common.reports');

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

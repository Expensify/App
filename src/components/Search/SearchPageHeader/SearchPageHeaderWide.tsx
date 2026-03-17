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
    const menuItems = typeMenuSections.flatMap((section) => section.menuItems);
    const title = activeItemIndex >= 0 ? translate(menuItems[activeItemIndex].translationPath) : translate('common.reports');

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

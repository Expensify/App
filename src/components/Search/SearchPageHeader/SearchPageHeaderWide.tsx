import TopBar from '@components/Navigation/TopBar';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';

import CONST from '@src/CONST';

import React from 'react';

type SearchPageHeaderWideProps = {
    queryJSON: SearchQueryJSON;
};

function SearchPageHeaderWide({queryJSON}: SearchPageHeaderWideProps) {
    const {translate} = useLocalize();
    const typeMenuSections = useSearchTypeMenuSections();
    const {currentSearchKey} = useSearchQueryContext();
    const selectedItem = typeMenuSections.flatMap((section) => section.menuItems).find((item) => item.key === currentSearchKey);

    let title = translate('common.spend');
    if (selectedItem) {
        title = translate(selectedItem.translationPath);
    } else {
        const {type} = queryJSON;
        if (type === CONST.SEARCH.DATA_TYPES.TASK) {
            title = translate(`common.tasks`);
        } else if (type === CONST.SEARCH.DATA_TYPES.TRIP) {
            title = translate(`travel.trips`);
        } else if (type === CONST.SEARCH.DATA_TYPES.INVOICE) {
            title = translate(`workspace.common.invoices`);
        } else if (type === CONST.SEARCH.DATA_TYPES.CHAT) {
            title = translate(`common.chats`);
        }
    }

    return (
        <TopBar
            shouldShowLoadingBar={false}
            breadcrumbLabel={title}
            shouldDisplayHelpButton
        />
    );
}

export default SearchPageHeaderWide;

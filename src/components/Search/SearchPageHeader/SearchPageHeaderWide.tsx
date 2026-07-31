import TopBar from '@components/Navigation/TopBar';
import type {SearchQueryJSON} from '@components/Search/types';

import useLocalize from '@hooks/useLocalize';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

type SearchPageHeaderWideProps = {
    queryJSON: SearchQueryJSON;
};

function SearchPageHeaderWide({queryJSON}: SearchPageHeaderWideProps) {
    const {translate} = useLocalize();
    const {typeMenuSections, activeItemIndex} = useSearchTypeMenuSections(queryJSON);
    const selectedItem = typeMenuSections.flatMap((section) => section.menuItems).at(activeItemIndex);
    const [savedSearches] = useOnyx(ONYXKEYS.SAVED_SEARCHES);

    let title = translate('common.spend');
    if (activeItemIndex >= 0 && selectedItem) {
        title = translate(selectedItem.translationPath);
    } else {
        const savedSearch = queryJSON.hash !== undefined ? savedSearches?.[queryJSON.hash] : undefined;
        if (queryJSON.hash !== undefined && savedSearch && savedSearch.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            title = savedSearch.name;
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

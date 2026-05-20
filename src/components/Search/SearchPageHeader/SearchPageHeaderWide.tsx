import React from 'react';
import TopBar from '@components/Navigation/TopBar';
import type {SearchQueryJSON} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useSearchTypeMenuSections from '@hooks/useSearchTypeMenuSections';
import CONST from '@src/CONST';

type SearchPageHeaderWideProps = {
    queryJSON: SearchQueryJSON;
};

function SearchPageHeaderWide({queryJSON}: SearchPageHeaderWideProps) {
    const {translate} = useLocalize();
    const {typeMenuSections, activeItemIndex} = useSearchTypeMenuSections(queryJSON);
    const selectedItem = typeMenuSections.flatMap((section) => section.menuItems).at(activeItemIndex);

    let title = translate('common.spend');
    if (activeItemIndex >= 0 && selectedItem) {
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
            shouldDisplaySearch={false}
            shouldDisplayHelpButton
        />
    );
}

export default SearchPageHeaderWide;

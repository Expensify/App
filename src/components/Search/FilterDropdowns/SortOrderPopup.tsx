import React from 'react';
import {useSearchActionsContext} from '@components/Search/SearchContext';
import type {SearchQueryJSON, SortOrder} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import {close} from '@libs/actions/Modal';
import Navigation from '@libs/Navigation/Navigation';
import {buildSearchQueryString} from '@libs/SearchQueryUtils';
import {getSortOrderOptions} from '@libs/SearchUIUtils';
import SingleSelectPopup from './SingleSelectPopup';

type SortOrderPopupProps = {
    queryJSON: SearchQueryJSON;
    onSort: () => void;
    onBackButtonPress: () => void;
    closeOverlay: () => void;
};

function SortOrderPopup({queryJSON, onSort, onBackButtonPress, closeOverlay}: SortOrderPopupProps) {
    const {translate} = useLocalize();
    const {clearSelectedTransactions} = useSearchActionsContext();

    const onSortChange = (sortOrder: SortOrder) => {
        clearSelectedTransactions();
        const newQuery = buildSearchQueryString({...queryJSON, sortOrder});
        onSort();
        // We want to explicitly clear stale rawQuery since it's only used for manually typed-in queries.
        close(() => {
            Navigation.setParams({q: newQuery, rawQuery: undefined});
        });
    };

    const sortOrderOptions = getSortOrderOptions(translate);
    const sortOrder = {text: translate(`search.filters.sortOrder.${queryJSON.sortOrder}`), value: queryJSON.sortOrder};

    return (
        <SingleSelectPopup
            items={sortOrderOptions}
            value={sortOrder}
            label={translate('search.display.sortOrder')}
            onBackButtonPress={onBackButtonPress}
            closeOverlay={closeOverlay}
            defaultValue={sortOrderOptions.at(0)?.value}
            onChange={(item) => {
                if (!item) {
                    return;
                }
                onSortChange(item.value);
            }}
        />
    );
}

export default SortOrderPopup;

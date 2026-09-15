import {ModalActions} from '@components/Modal/Global/ModalContext';
import {useSearchQueryActions, useSearchQueryContext} from '@components/Search/SearchContext';

import {deleteSavedSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery, buildSearchQueryJSON, getValidLastQuery} from '@libs/SearchQueryUtils';
import {GENERIC_SEARCH_KEYS, searchKeyToSavedSearchID} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {lastExpensesSearchQuerySelector} from '@src/selectors/SearchFilters';

import {useCallback} from 'react';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

export default function useDeleteSavedSearch() {
    const {translate} = useLocalize();
    const {currentSearchKey, suggestedSearches} = useSearchQueryContext();
    const {setCurrentSearchKey} = useSearchQueryActions();
    const {showConfirmModal} = useConfirmModal();
    const [lastExpensesSearchQuery] = useOnyx(ONYXKEYS.SEARCH_FILTERS, {selector: lastExpensesSearchQuerySelector});

    const handleDeleteSavedSearch = useCallback(
        (savedSearchID: string) => {
            showConfirmModal({
                title: translate('search.deleteSavedSearch'),
                prompt: translate('search.deleteSavedSearchConfirm'),
                confirmText: translate('common.delete'),
                cancelText: translate('common.cancel'),
                buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            }).then((result) => {
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                deleteSavedSearch(savedSearchID);

                if (savedSearchID === searchKeyToSavedSearchID(currentSearchKey)) {
                    const defaultQuery = buildCannedSearchQuery();
                    // `getValidLastQuery` only requires the default's filter keys and type, and the expenses default
                    // has no filters, so every expense query satisfies it. That includes a query belonging to another
                    // suggested search, which an older build could store under the expenses key. Fall back to the
                    // default for those, otherwise we would select the Expenses tab while showing another search.
                    const lastQuery = getValidLastQuery(lastExpensesSearchQuery, defaultQuery);
                    const lastQuerySimilarSearchHash = buildSearchQueryJSON(lastQuery)?.similarSearchHash;
                    const isSpecificSuggestedSearchQuery = Object.values(suggestedSearches).some(
                        (search) => !GENERIC_SEARCH_KEYS.has(search.key) && search.similarSearchHash === lastQuerySimilarSearchHash,
                    );
                    const query = isSpecificSuggestedSearchQuery ? defaultQuery : lastQuery;
                    setCurrentSearchKey(CONST.SEARCH.SEARCH_KEYS.EXPENSES, query);
                    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}));
                }
            });
        },
        [showConfirmModal, translate, currentSearchKey, lastExpensesSearchQuery, suggestedSearches, setCurrentSearchKey],
    );

    return {showDeleteModal: handleDeleteSavedSearch};
}

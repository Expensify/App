import {ModalActions} from '@components/Modal/Global/ModalContext';
import {useSearchQueryActions, useSearchQueryContext} from '@components/Search/SearchContext';

import {deleteSavedSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {searchKeyToSavedSearchID} from '@libs/SearchUIUtils';

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
    const {currentSearchKey} = useSearchQueryContext();
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
                    const query = lastExpensesSearchQuery ?? buildCannedSearchQuery();
                    setCurrentSearchKey(CONST.SEARCH.SEARCH_KEYS.EXPENSES, query);
                    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}));
                }
            });
        },
        [showConfirmModal, translate, currentSearchKey, lastExpensesSearchQuery, setCurrentSearchKey],
    );

    return {showDeleteModal: handleDeleteSavedSearch};
}

import {ModalActions} from '@components/Modal/Global/ModalContext';
import {useSearchQueryContext} from '@components/Search/SearchContext';

import {deleteSavedSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {searchKeyToSavedSearchID} from '@libs/SearchKeyUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';

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
                    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query, searchKey: CONST.SEARCH.SEARCH_KEYS.EXPENSES}));
                }
            });
        },
        [showConfirmModal, translate, currentSearchKey, lastExpensesSearchQuery],
    );

    return {showDeleteModal: handleDeleteSavedSearch};
}

import {ModalActions} from '@components/Modal/Global/ModalContext';
import {useSearchQueryActions, useSearchQueryContext} from '@components/Search/SearchContext';

import {deleteSavedSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery, buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {searchKeyToSavedSearchID} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import {useCallback} from 'react';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

export default function useDeleteSavedSearch() {
    const {translate} = useLocalize();
    const {currentSearchKey, currentSearchHash} = useSearchQueryContext();
    const {setCurrentSearchKey} = useSearchQueryActions();
    const {showConfirmModal} = useConfirmModal();

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
                    const query = buildCannedSearchQuery();
                    setCurrentSearchKey(CONST.SEARCH.SEARCH_KEYS.EXPENSES, buildSearchQueryJSON(query)?.hash !== currentSearchHash);
                    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query}));
                }
            });
        },
        [showConfirmModal, translate, currentSearchKey, currentSearchHash, setCurrentSearchKey],
    );

    return {showDeleteModal: handleDeleteSavedSearch};
}

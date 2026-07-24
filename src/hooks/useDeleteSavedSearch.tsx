import {ModalActions} from '@components/Modal/Global/ModalContext';
import {useSearchQueryContext} from '@components/Search/SearchContext';

import {deleteSavedSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {searchKeyToSavedSearchID} from '@libs/SearchUIUtils';

import ROUTES from '@src/ROUTES';

import {useCallback} from 'react';

import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

export default function useDeleteSavedSearch() {
    const {translate} = useLocalize();
    const {currentSearchKey} = useSearchQueryContext();
    const {showConfirmModal} = useConfirmModal();

    const handleDeleteSavedSearch = useCallback(
        (savedSearchID: string) => {
            showConfirmModal({
                title: translate('search.deleteSavedSearch'),
                prompt: translate('search.deleteSavedSearchConfirm'),
                confirmText: translate('common.delete'),
                cancelText: translate('common.cancel'),
                danger: true,
            }).then((result) => {
                if (result.action !== ModalActions.CONFIRM) {
                    return;
                }
                deleteSavedSearch(savedSearchID);

                if (savedSearchID === searchKeyToSavedSearchID(currentSearchKey)) {
                    Navigation.navigate(
                        ROUTES.SEARCH_ROOT.getRoute({
                            query: buildCannedSearchQuery(),
                        }),
                    );
                }
            });
        },
        [showConfirmModal, translate, currentSearchKey],
    );

    return {showDeleteModal: handleDeleteSavedSearch};
}

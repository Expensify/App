import {useCallback} from 'react';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import {useSearchContext} from '@components/Search/SearchContext';
import {deleteSavedSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import ROUTES from '@src/ROUTES';
import useConfirmModal from './useConfirmModal';
import useLocalize from './useLocalize';

export default function useDeleteSavedSearch() {
    const {translate} = useLocalize();
    const {currentSearchHash} = useSearchContext();
    const {showConfirmModal} = useConfirmModal();

    const handleDeleteSavedSearch = useCallback(
        (hash: number) => {
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
                deleteSavedSearch(hash);

                if (hash === currentSearchHash) {
                    Navigation.navigate(
                        ROUTES.SEARCH_ROOT.getRoute({
                            query: buildCannedSearchQuery(),
                        }),
                    );
                }
            });
        },
        [showConfirmModal, translate, currentSearchHash],
    );

    return {showDeleteModal: handleDeleteSavedSearch};
}

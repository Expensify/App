import React, {useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchUtils from '@libs/SearchUtils';
import * as SearchActions from '@userActions/Search';
import ROUTES from '@src/ROUTES';
import useLocalize from './useLocalize';

export default function useDeleteSavedSearch() {
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [hashToDelete, setHashToDelete] = useState(0);
    const {translate} = useLocalize();

    const showDeleteModal = (hash: number) => {
        setIsDeleteModalVisible(true);
        setHashToDelete(hash);
    };

    const handleDelete = () => {
        SearchActions.deleteSavedSearch(hashToDelete);
        setIsDeleteModalVisible(false);
        SearchActions.clearAdvancedFilters();
        Navigation.navigate(
            ROUTES.SEARCH_CENTRAL_PANE.getRoute({
                query: SearchUtils.buildCannedSearchQuery(),
            }),
        );
    };

    function DeleteConfirmModal() {
        return (
            <ConfirmModal
                title={translate('search.deleteSavedSearch')}
                onConfirm={handleDelete}
                onCancel={() => setIsDeleteModalVisible(false)}
                isVisible={isDeleteModalVisible}
                prompt={translate('search.deleteSavedSearchConfirm')}
                confirmText={translate('common.delete')}
                cancelText={translate('common.cancel')}
                danger
            />
        );
    }

    return {showDeleteModal, DeleteConfirmModal};
}

import React, {useState} from 'react';
import ConfirmModal from '@components/ConfirmModal';
import {useSearchContext} from '@components/Search/SearchContext';
import {clearAdvancedFilters, deleteSavedSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import ROUTES from '@src/ROUTES';
import useLocalize from './useLocalize';

export default function useDeleteSavedSearch() {
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [hashToDelete, setHashToDelete] = useState(0);
    const {translate} = useLocalize();
    const {currentSearchHash} = useSearchContext();

    const showDeleteModal = (hash: number) => {
        setIsDeleteModalVisible(true);
        setHashToDelete(hash);
    };

    const handleDelete = () => {
        deleteSavedSearch(hashToDelete);
        setIsDeleteModalVisible(false);

        if (hashToDelete === currentSearchHash) {
            clearAdvancedFilters();
            Navigation.navigate(
                ROUTES.SEARCH_ROOT.getRoute({
                    query: buildCannedSearchQuery(),
                }),
            );
        }
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

import DecisionModal from '@components/DecisionModal';
import {useSearchQueryContext} from '@components/Search/SearchContext';

import useActiveSavedSearch from '@hooks/useActiveSavedSearch';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {close} from '@libs/actions/Modal';
import {saveSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {searchKeyToSavedSearchID} from '@libs/SearchKeyUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React, {useState} from 'react';

import SearchFiltersBarButton from './SearchFiltersBarButton';

function SearchFiltersSaveButton() {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Bookmark']);
    // We need isSmallScreenWidth (not just shouldUseNarrowLayout) because DecisionModal requires it for correct modal type
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {currentSearchKey, currentSearchQueryJSON} = useSearchQueryContext();
    const activeSavedSearch = useActiveSavedSearch();
    const activeSavedSearchID = searchKeyToSavedSearchID(currentSearchKey);

    const [isSaveEditsModalVisible, setIsSaveEditsModalVisible] = useState(false);

    const openSaveSearchPage = () => {
        Navigation.navigate(ROUTES.SEARCH_SAVE);
    };

    const savePressed = () => {
        if (activeSavedSearchID) {
            setIsSaveEditsModalVisible(true);
            return;
        }

        openSaveSearchPage();
    };

    const createNewSavedSearch = () => {
        close(openSaveSearchPage);
    };

    const updateActiveSavedSearch = () => {
        setIsSaveEditsModalVisible(false);

        if (!activeSavedSearchID || !currentSearchQueryJSON) {
            return;
        }

        saveSearch({id: activeSavedSearchID, queryJSON: currentSearchQueryJSON, newName: activeSavedSearch?.name});
    };

    return (
        <>
            <SearchFiltersBarButton
                icon={expensifyIcons.Bookmark}
                text={translate('common.save')}
                onPress={savePressed}
                sentryLabel={CONST.SENTRY_LABEL.SEARCH.SAVE_FILTERS_BUTTON}
            />
            {!!activeSavedSearchID && (
                <DecisionModal
                    title={translate('search.saveEdits.title')}
                    prompt={translate('search.saveEdits.prompt', {name: activeSavedSearch?.name ?? ''})}
                    isSmallScreenWidth={isSmallScreenWidth}
                    firstOptionText={translate('search.saveEdits.createNew')}
                    onFirstOptionSubmit={createNewSavedSearch}
                    secondOptionText={translate('search.saveEdits.updateExisting')}
                    onSecondOptionSubmit={updateActiveSavedSearch}
                    isVisible={isSaveEditsModalVisible}
                    onClose={() => setIsSaveEditsModalVisible(false)}
                />
            )}
        </>
    );
}

export default SearchFiltersSaveButton;

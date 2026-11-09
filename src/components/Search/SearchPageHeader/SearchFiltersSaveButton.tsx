import {ModalActions} from '@components/Modal/Global/ModalContext';
import {useSearchQueryContext} from '@components/Search/SearchContext';

import useActiveSavedSearch from '@hooks/useActiveSavedSearch';
import useDecisionModal from '@hooks/useDecisionModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import {saveSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {searchKeyToSavedSearchID} from '@libs/SearchKeyUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

import SearchFiltersBarButton from './SearchFiltersBarButton';

function SearchFiltersSaveButton() {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Bookmark']);
    const {showDecisionModal} = useDecisionModal();
    const {currentSearchKey, currentSearchQueryJSON} = useSearchQueryContext();
    const activeSavedSearch = useActiveSavedSearch();
    const activeSavedSearchID = searchKeyToSavedSearchID(currentSearchKey);

    const openSaveSearchPage = () => {
        Navigation.navigate(ROUTES.SEARCH_SAVE);
    };

    const savePressed = async () => {
        if (!activeSavedSearchID) {
            openSaveSearchPage();
            return;
        }

        const decision = await showDecisionModal({
            title: translate('search.saveEdits.title'),
            prompt: translate('search.saveEdits.prompt', {name: activeSavedSearch?.name ?? ''}),
            firstOptionText: translate('search.saveEdits.createNew'),
            secondOptionText: translate('search.saveEdits.updateExisting'),
            shouldRenderPromptAsHTML: false,
            shouldReportDismiss: true,
        });

        if (decision.action === ModalActions.CONFIRM) {
            openSaveSearchPage();
            return;
        }

        if (decision.action !== ModalActions.CLOSE || !currentSearchQueryJSON) {
            return;
        }

        saveSearch({id: activeSavedSearchID, queryJSON: currentSearchQueryJSON, newName: activeSavedSearch?.name});
    };

    return (
        <SearchFiltersBarButton
            icon={expensifyIcons.Bookmark}
            text={translate('common.save')}
            onPress={() => {
                savePressed();
            }}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.SAVE_FILTERS_BUTTON}
        />
    );
}

export default SearchFiltersSaveButton;

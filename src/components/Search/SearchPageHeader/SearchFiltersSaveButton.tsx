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

import React, {useRef} from 'react';

import SearchFiltersBarButton from './SearchFiltersBarButton';

function SearchFiltersSaveButton() {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Bookmark']);
    const {showDecisionModal} = useDecisionModal();
    const {currentSearchKey, currentSearchQueryJSON} = useSearchQueryContext();
    const activeSavedSearch = useActiveSavedSearch();
    const activeSavedSearchID = searchKeyToSavedSearchID(currentSearchKey);
    const isDecisionPending = useRef(false);

    const openSaveSearchPage = () => {
        Navigation.navigate(ROUTES.SEARCH_SAVE);
    };

    const savePressed = async () => {
        if (!activeSavedSearchID) {
            openSaveSearchPage();
            return;
        }

        // A ref blocks repeated presses before the global modal can intercept input, without waiting for a render.
        if (isDecisionPending.current) {
            return;
        }

        isDecisionPending.current = true;
        try {
            const decision = await showDecisionModal({
                title: translate('search.saveEdits.title'),
                prompt: translate('search.saveEdits.prompt', {name: activeSavedSearch?.name ?? ''}),
                firstOptionText: translate('search.saveEdits.createNew'),
                secondOptionText: translate('search.saveEdits.updateExisting'),
                shouldRenderPromptAsHTML: false,
                shouldReportDismiss: true,
            });

            // The first option (create new) resolves as CONFIRM and the second (update existing) as CLOSE.
            // With shouldReportDismiss, backdrop/Escape/Back resolve as DISMISS, so only CLOSE may overwrite the saved search.
            if (decision.action === ModalActions.CONFIRM) {
                openSaveSearchPage();
                return;
            }

            if (decision.action !== ModalActions.CLOSE || !currentSearchQueryJSON) {
                return;
            }

            saveSearch({id: activeSavedSearchID, queryJSON: currentSearchQueryJSON, newName: activeSavedSearch?.name});
        } finally {
            isDecisionPending.current = false;
        }
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

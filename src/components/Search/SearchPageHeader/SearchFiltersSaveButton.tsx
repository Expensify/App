import {ModalActions} from '@components/Modal/Global/ModalContext';
import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';

import useActiveSavedSearch from '@hooks/useActiveSavedSearch';
import useDecisionModal from '@hooks/useDecisionModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';

import {saveSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {searchKeyToSavedSearchID} from '@libs/SearchKeyUtils';
import {isSearchQuerySavable} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React, {useLayoutEffect, useRef} from 'react';

import SearchFiltersBarButton from './SearchFiltersBarButton';

function SearchFiltersSaveButton() {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Bookmark']);
    const {showDecisionModal} = useDecisionModal();
    const {currentSearchKey, currentSearchQueryJSON} = useSearchQueryContext();
    const {currentSearchResults} = useSearchResultsContext();
    const canUpdate = isSearchQuerySavable(currentSearchQueryJSON, undefined, currentSearchResults?.search);
    const activeSavedSearch = useActiveSavedSearch();
    const activeSavedSearchID = searchKeyToSavedSearchID(currentSearchKey);
    const isDecisionPending = useRef(false);
    const latestSavableQueryHash = useRef<number | undefined>(undefined);

    // The global modal can outlive the Save button if the server rejects the query while the dialog is open.
    useLayoutEffect(() => {
        latestSavableQueryHash.current = canUpdate ? currentSearchQueryJSON?.hash : undefined;
        return () => {
            latestSavableQueryHash.current = undefined;
        };
    }, [canUpdate, currentSearchQueryJSON?.hash]);

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
        const decision = await showDecisionModal({
            title: translate('search.saveEdits.title'),
            prompt: translate('search.saveEdits.prompt', {name: activeSavedSearch?.name ?? ''}),
            firstOptionText: translate('search.saveEdits.createNew'),
            secondOptionText: translate('search.saveEdits.updateExisting'),
            isSecondOptionDisabled: !canUpdate,
            secondOptionSentryLabel: CONST.SENTRY_LABEL.SEARCH.UPDATE_SAVED_VIEW,
            shouldRenderPromptAsHTML: false,
            shouldReportDismiss: true,
        }).finally(() => {
            isDecisionPending.current = false;
        });

        // The first option (create new) resolves as CONFIRM and the second (update existing) as CLOSE.
        // With shouldReportDismiss, backdrop/Escape/Back resolve as DISMISS, so only CLOSE may overwrite the saved search.
        if (decision.action === ModalActions.CONFIRM) {
            openSaveSearchPage();
            return;
        }

        if (decision.action !== ModalActions.CLOSE || !currentSearchQueryJSON || latestSavableQueryHash.current !== currentSearchQueryJSON.hash) {
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

import {act, render} from '@testing-library/react-native';

import {ModalActions} from '@components/Modal/Global/ModalContext';
import type {ModalStateChangePayload} from '@components/Modal/Global/ModalContext';
import SearchFiltersBarButton from '@components/Search/SearchPageHeader/SearchFiltersBarButton';
import SearchFiltersSaveButton from '@components/Search/SearchPageHeader/SearchFiltersSaveButton';
import type {SearchQueryJSON} from '@components/Search/types';

import {saveSearch} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import type {SearchKey} from '@libs/SearchKeyUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';

const SAVED_SEARCH_ID = '123';
const SAVED_SEARCH_NAME = 'Team expenses';
const mockShowDecisionModal = jest.fn<Promise<ModalStateChangePayload>, [unknown]>();
let mockCurrentSearchKey: SearchKey | undefined;
let mockCurrentSearchQueryJSON: SearchQueryJSON | undefined;

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({currentSearchKey: mockCurrentSearchKey, currentSearchQueryJSON: mockCurrentSearchQueryJSON}),
}));
jest.mock('@components/Search/SearchPageHeader/SearchFiltersBarButton', () => jest.fn(() => null));
jest.mock('@hooks/useActiveSavedSearch', () => ({
    __esModule: true,
    default: () => ({name: SAVED_SEARCH_NAME}),
}));
jest.mock('@hooks/useDecisionModal', () => ({
    __esModule: true,
    default: () => ({showDecisionModal: mockShowDecisionModal}),
}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({Bookmark: () => null})}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));
jest.mock('@libs/actions/Search', () => ({saveSearch: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn()}}));

async function pressSave() {
    await act(async () => {
        jest.mocked(SearchFiltersBarButton).mock.calls.at(-1)?.[0].onPress();
    });
}

describe('SearchFiltersSaveButton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCurrentSearchKey = savedSearchIDToSearchKey(SAVED_SEARCH_ID);
        mockCurrentSearchQueryJSON = buildSearchQueryJSON('type:expense status:paid');
        mockShowDecisionModal.mockResolvedValue({action: ModalActions.DISMISS});
    });

    it('opens the save page without a decision for a search that has not been saved', async () => {
        // Given a search with no saved-search ID
        mockCurrentSearchKey = CONST.SEARCH.SEARCH_KEYS.EXPENSES;
        render(<SearchFiltersSaveButton />);

        // When the user saves it for the first time
        await pressSave();

        // Then naming the new search does not require choosing between create and update
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_SAVE);
        expect(mockShowDecisionModal).not.toHaveBeenCalled();
        expect(saveSearch).not.toHaveBeenCalled();
    });

    it('uses the global decision modal and opts in to distinct dismissal results', async () => {
        // Given an existing saved search whose filters have changed
        render(<SearchFiltersSaveButton />);

        // When the user presses save
        await pressSave();

        // Then the two choices preserve the existing copy and dismissal cannot be confused with update
        expect(mockShowDecisionModal).toHaveBeenCalledTimes(1);
        expect(mockShowDecisionModal).toHaveBeenCalledWith({
            title: 'search.saveEdits.title',
            prompt: 'search.saveEdits.prompt',
            firstOptionText: 'search.saveEdits.createNew',
            secondOptionText: 'search.saveEdits.updateExisting',
            shouldRenderPromptAsHTML: false,
            shouldReportDismiss: true,
        });
    });

    it('opens the save page when the user chooses to create a new search', async () => {
        // Given the first option resolves after the global modal has hidden
        mockShowDecisionModal.mockResolvedValue({action: ModalActions.CONFIRM});
        render(<SearchFiltersSaveButton />);

        // When the user chooses create new
        await pressSave();

        // Then the naming page opens without modifying the existing saved search
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_SAVE);
        expect(saveSearch).not.toHaveBeenCalled();
    });

    it('updates the existing search only when the user chooses the second option', async () => {
        // Given the second option resolves as CLOSE, not DISMISS
        mockShowDecisionModal.mockResolvedValue({action: ModalActions.CLOSE});
        render(<SearchFiltersSaveButton />);

        // When the user chooses update existing
        await pressSave();

        // Then the current filters replace the saved filters while preserving the ID and name
        expect(saveSearch).toHaveBeenCalledTimes(1);
        expect(saveSearch).toHaveBeenCalledWith({id: SAVED_SEARCH_ID, queryJSON: mockCurrentSearchQueryJSON, newName: SAVED_SEARCH_NAME});
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('does not update or navigate when the modal is dismissed', async () => {
        // Given backdrop, Escape and Back resolve as DISMISS for this caller
        render(<SearchFiltersSaveButton />);

        // When the user dismisses the decision instead of choosing an option
        await pressSave();

        // Then the existing search remains untouched and no naming page opens
        expect(mockShowDecisionModal).toHaveBeenCalledTimes(1);
        expect(saveSearch).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('waits for the decision before performing either action', async () => {
        // Given a modal that has not finished hiding yet
        const decision = Promise.withResolvers<ModalStateChangePayload>();
        mockShowDecisionModal.mockReturnValue(decision.promise);
        render(<SearchFiltersSaveButton />);

        // When save opens the decision but no result has resolved
        await pressSave();

        // Then neither action runs until the modal lifecycle completes
        expect(saveSearch).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
        await act(async () => decision.resolve({action: ModalActions.CONFIRM}));
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_SAVE);
        expect(saveSearch).not.toHaveBeenCalled();
    });

    it.each([ModalActions.CONFIRM, ModalActions.CLOSE, ModalActions.DISMISS])('ignores repeated Save presses until %s resolves and allows a later decision', async (action) => {
        // Given an existing saved search with a decision that has not finished hiding
        const decision = Promise.withResolvers<ModalStateChangePayload>();
        mockShowDecisionModal.mockReturnValue(decision.promise);
        render(<SearchFiltersSaveButton />);

        // When Save is pressed twice in the same turn before the modal intercepts input
        await act(async () => {
            const onPress = jest.mocked(SearchFiltersBarButton).mock.calls.at(-1)?.[0].onPress;
            onPress?.();
            onPress?.();
        });

        // Then only one decision is pending and no action runs before it finishes hiding
        expect(mockShowDecisionModal).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();
        expect(saveSearch).not.toHaveBeenCalled();
        await act(async () => decision.resolve({action}));
        expect(Navigation.navigate).toHaveBeenCalledTimes(action === ModalActions.CONFIRM ? 1 : 0);
        expect(saveSearch).toHaveBeenCalledTimes(action === ModalActions.CLOSE ? 1 : 0);

        // When Save is pressed again after the previous decision has completed
        const nextDecision = Promise.withResolvers<ModalStateChangePayload>();
        mockShowDecisionModal.mockReturnValue(nextDecision.promise);
        await pressSave();

        // Then a fresh decision opens instead of leaving Save permanently blocked
        expect(mockShowDecisionModal).toHaveBeenCalledTimes(2);
        await act(async () => nextDecision.resolve({action: ModalActions.DISMISS}));
        expect(Navigation.navigate).toHaveBeenCalledTimes(action === ModalActions.CONFIRM ? 1 : 0);
        expect(saveSearch).toHaveBeenCalledTimes(action === ModalActions.CLOSE ? 1 : 0);
    });

    it('does not update a saved search when the current query is unavailable', async () => {
        // Given an existing search with no current query data
        mockCurrentSearchQueryJSON = undefined;
        mockShowDecisionModal.mockResolvedValue({action: ModalActions.CLOSE});
        render(<SearchFiltersSaveButton />);

        // When the user chooses update existing
        await pressSave();

        // Then missing query data is never written over the saved filters
        expect(saveSearch).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});

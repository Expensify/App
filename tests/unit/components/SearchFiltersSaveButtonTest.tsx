import {fireEvent, render, screen} from '@testing-library/react-native';

import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import SearchFiltersSaveButton from '@components/Search/SearchPageHeader/SearchFiltersSaveButton';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';

import {saveSearch} from '@libs/actions/Search';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import type {PropsWithChildren} from 'react';

import createMock from '../../utils/createMock';
import {translateLocal} from '../../utils/TestHelper';

jest.mock('@components/Modal', () => ({isVisible, children}: PropsWithChildren<{isVisible: boolean}>) => (isVisible ? children : null));
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: jest.fn(),
    useSearchResultsContext: jest.fn(),
}));
jest.mock('@hooks/useActiveSavedSearch', () => jest.fn(() => ({name: 'Coffee'})));
jest.mock('@hooks/useLocalize');
jest.mock('@hooks/useNetwork');
jest.mock('@libs/actions/Search', () => ({saveSearch: jest.fn()}));

beforeAll(() => IntlStore.load(CONST.LOCALES.EN));

it('opens Save while validation is pending and enables Update existing once the search succeeds', () => {
    // Given an online edit to a saved search that has not received a response yet
    const queryJSON = buildSearchQueryJSON('type:expense merchant:coffee');
    jest.mocked(useSearchQueryContext).mockReturnValue(
        createMock<ReturnType<typeof useSearchQueryContext>>({currentSearchKey: savedSearchIDToSearchKey('123'), currentSearchQueryJSON: queryJSON}),
    );
    jest.mocked(useSearchResultsContext).mockReturnValue(createMock<ReturnType<typeof useSearchResultsContext>>({shouldUseLiveData: false}));
    jest.mocked(useNetwork).mockReturnValue(createMock<ReturnType<typeof useNetwork>>({isOffline: false}));
    jest.mocked(useLocalize).mockReturnValue(createMock<ReturnType<typeof useLocalize>>({translate: translateLocal}));
    const {rerender} = render(<SearchFiltersSaveButton />);

    // When the user opens Save while the query is still pending
    fireEvent.press(screen.getByRole('button', {name: 'Save'}));

    // Then they can choose Create new, and Update existing stays disabled
    expect(screen.getByRole('button', {name: 'Create new'})).toBeEnabled();
    expect(screen.getByRole('button', {name: 'Update existing'})).toBeDisabled();
    expect(saveSearch).not.toHaveBeenCalled();

    // When the matching search succeeds and the user confirms the update
    jest.mocked(useSearchResultsContext).mockReturnValue(
        createMock<ReturnType<typeof useSearchResultsContext>>({currentSearchResults: {search: {hash: queryJSON?.hash, hasSuccessfulResponse: true}}}),
    );
    rerender(<SearchFiltersSaveButton />);
    fireEvent.press(screen.getByRole('button', {name: 'Update existing'}));

    // Then the validated query replaces the saved search
    expect(saveSearch).toHaveBeenCalledWith({id: '123', queryJSON, newName: 'Coffee'});
});

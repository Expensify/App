import {fireEvent, render, screen} from '@testing-library/react-native';

import {useSearchQueryContext, useSearchResultsContext} from '@components/Search/SearchContext';
import SearchFiltersSaveButton from '@components/Search/SearchPageHeader/SearchFiltersSaveButton';

import useLocalize from '@hooks/useLocalize';

import {saveSearch} from '@libs/actions/Search';
import {savedSearchIDToSearchKey} from '@libs/SearchKeyUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import type {PropsWithChildren} from 'react';

import createMock from '../../utils/createMock';
import {translateLocal} from '../../utils/TestHelper';

jest.mock(
    '@components/Modal',
    () =>
        ({isVisible, children}: PropsWithChildren<{isVisible: boolean}>) =>
            isVisible ? children : null,
);
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: jest.fn(),
    useSearchResultsContext: jest.fn(),
}));
jest.mock('@hooks/useActiveSavedSearch', () => jest.fn(() => ({name: 'Coffee'})));
jest.mock('@hooks/useLocalize');
jest.mock('@libs/actions/Search', () => ({saveSearch: jest.fn()}));

beforeAll(() => IntlStore.load(CONST.LOCALES.EN));

it('allows updates while the search is pending and disables them if the server rejects the query', () => {
    // Given an online edit to a saved search that has not received a response yet
    const queryJSON = buildSearchQueryJSON('type:expense merchant:coffee');
    jest.mocked(useSearchQueryContext).mockReturnValue(
        createMock<ReturnType<typeof useSearchQueryContext>>({currentSearchKey: savedSearchIDToSearchKey('123'), currentSearchQueryJSON: queryJSON}),
    );
    jest.mocked(useSearchResultsContext).mockReturnValue(createMock<ReturnType<typeof useSearchResultsContext>>({}));
    jest.mocked(useLocalize).mockReturnValue(createMock<ReturnType<typeof useLocalize>>({translate: translateLocal}));
    const {rerender} = render(<SearchFiltersSaveButton />);

    // When the user opens Save while the query is still pending
    fireEvent.press(screen.getByRole('button', {name: 'Save'}));

    // Then they can create a new search or update the saved search without waiting for a response
    expect(screen.getByRole('button', {name: 'Create new'})).toBeEnabled();
    expect(screen.getByRole('button', {name: 'Update existing'})).toBeEnabled();
    fireEvent.press(screen.getByRole('button', {name: 'Update existing'}));
    expect(saveSearch).toHaveBeenCalledWith({id: '123', queryJSON, newName: 'Coffee'});

    // When the server rejects the current query and the user opens Save again
    jest.mocked(useSearchResultsContext).mockReturnValue(
        createMock<ReturnType<typeof useSearchResultsContext>>({currentSearchResults: {search: {hash: queryJSON?.hash, responseJsonCode: CONST.JSON_CODE.INVALID_SEARCH_QUERY}}}),
    );
    rerender(<SearchFiltersSaveButton />);
    fireEvent.press(screen.getByRole('button', {name: 'Save'}));

    // Then they cannot update the saved search with the rejected query
    expect(screen.getByRole('button', {name: 'Update existing'})).toBeDisabled();
});

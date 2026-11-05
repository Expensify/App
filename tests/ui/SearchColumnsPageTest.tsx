import {fireEvent, render, screen} from '@testing-library/react-native';

import type ColumnsSettingsList from '@components/ColumnsSettingsList';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import MockText from '@components/Text';

import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import {buildFilterFormValuesFromQuery, buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import SearchColumnsPage from '@src/pages/Search/SearchColumnsPage';
import SCREENS from '@src/SCREENS';

import type {ComponentProps} from 'react';

const mockGetRootState = jest.fn();
const mockUseSearchQueryContext = jest.fn();

jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@components/Search/SearchContext', () => ({
    ...jest.requireActual<Record<string, unknown>>('@components/Search/SearchContext'),
    useSearchQueryContext: () => mockUseSearchQueryContext() as unknown,
}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn()}}));
jest.mock('@libs/Navigation/navigationRef', () => ({__esModule: true, default: {getRootState: () => mockGetRootState() as unknown}}));
jest.mock(
    '@components/ColumnsSettingsList',
    () =>
        ({onSave, onReset, shouldShowResetColumns}: Pick<ComponentProps<typeof ColumnsSettingsList>, 'onSave' | 'onReset' | 'shouldShowResetColumns'>) => (
            <>
                <MockText onPress={() => onSave(['merchant', 'amount'])}>Save columns</MockText>
                {!!shouldShowResetColumns && <MockText onPress={onReset}>Reset columns</MockText>}
            </>
        ),
);

function renderPage(input: string, {isQueryInSearchContext = true} = {}) {
    const queryJSON = buildSearchQueryJSON(input);
    if (!queryJSON) {
        throw new Error('Invalid test query');
    }

    const form = buildFilterFormValuesFromQuery(queryJSON, {}, {}, {}, {}, {}, {});
    (jest.mocked(useOnyx) as jest.Mock).mockImplementation((key: string) => [key === ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM ? form : undefined, {status: 'loaded'}]);
    mockUseSearchQueryContext.mockReturnValue({currentSearchQueryJSON: isQueryInSearchContext ? queryJSON : undefined});
    mockGetRootState.mockReturnValue({
        routes: [{name: NAVIGATORS.TAB_NAVIGATOR, params: {screen: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, params: {screen: SCREENS.SEARCH.ROOT, params: {q: input}}}}],
    });

    render(
        <OnyxListItemProvider>
            <SearchColumnsPage />
        </OnyxListItemProvider>,
    );

    return queryJSON;
}

function getNavigatedQuery() {
    const [route] = jest.mocked(Navigation.navigate).mock.calls.at(-1) ?? [];
    return buildSearchQueryJSON(new URL(route ?? '', 'https://example.com').searchParams.get('q') ?? '');
}

describe('SearchColumnsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('keeps mixed Merchant predicates when saving different columns', () => {
        // Given a search with mixed Merchant predicates, kept out of the Search context so the page doesn't wait for the snapshot to seed the columns
        const queryJSON = renderPage('merchant=I merchant*:I', {isQueryInSearchContext: false});

        // When the user saves different columns
        fireEvent.press(screen.getByText('Save columns'));

        // Then the filters are kept as they were and only the columns change
        const updatedQuery = getNavigatedQuery();
        expect(updatedQuery?.flatFilters).toEqual(queryJSON.flatFilters);
        expect(updatedQuery?.columns).toEqual(['merchant', 'amount']);
    });

    it('removes the columns from the query when resetting the columns', () => {
        // Given a search with custom columns
        renderPage('type:expense columns:merchant,amount');

        // When the user resets the columns
        fireEvent.press(screen.getByText('Reset columns'));

        // Then the page goes back to the search with no columns in the query, so the table derives them from the data again
        expect(getNavigatedQuery()?.columns).toBeUndefined();
    });

    it("doesn't show the reset columns option when the query has no columns", () => {
        // Given a search without custom columns
        renderPage('type:expense');

        // Then there is nothing to reset, so the option is hidden
        expect(screen.queryByText('Reset columns')).toBeNull();
    });
});

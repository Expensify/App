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

jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn()}}));
jest.mock('@libs/Navigation/navigationRef', () => ({__esModule: true, default: {getRootState: () => mockGetRootState() as unknown}}));
jest.mock('@components/ColumnsSettingsList', () => ({onSave}: Pick<ComponentProps<typeof ColumnsSettingsList>, 'onSave'>) => (
    <>
        <MockText onPress={() => onSave(['merchant', 'amount'], false)}>Save columns</MockText>
        <MockText onPress={() => onSave(['date', 'merchant', 'amount'], true)}>Save default columns</MockText>
    </>
));

describe('SearchColumnsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('keeps mixed Merchant predicates when saving different columns', () => {
        const input = 'merchant=I merchant*:I';
        const queryJSON = buildSearchQueryJSON(input);
        if (!queryJSON) {
            throw new Error('Invalid test query');
        }

        const form = buildFilterFormValuesFromQuery(queryJSON, {}, {}, {}, {}, {}, {});
        (jest.mocked(useOnyx) as jest.Mock).mockImplementation((key: string) => [key === ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM ? form : undefined, {status: 'loaded'}]);
        mockGetRootState.mockReturnValue({
            routes: [{name: NAVIGATORS.TAB_NAVIGATOR, params: {screen: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, params: {screen: SCREENS.SEARCH.ROOT, params: {q: input}}}}],
        });

        render(
            <OnyxListItemProvider>
                <SearchColumnsPage />
            </OnyxListItemProvider>,
        );
        fireEvent.press(screen.getByText('Save columns'));

        const [route] = jest.mocked(Navigation.navigate).mock.calls.at(-1) ?? [];
        const updatedQuery = buildSearchQueryJSON(new URL(route ?? '', 'https://example.com').searchParams.get('q') ?? '');

        expect(updatedQuery?.flatFilters).toEqual(queryJSON.flatFilters);
        expect(updatedQuery?.columns).toEqual(['merchant', 'amount']);
    });

    it("doesn't pin the columns when saving the default selection", () => {
        // Given a search with custom columns
        const input = 'type:expense columns:merchant,amount';
        const queryJSON = buildSearchQueryJSON(input);
        if (!queryJSON) {
            throw new Error('Invalid test query');
        }

        const form = buildFilterFormValuesFromQuery(queryJSON, {}, {}, {}, {}, {}, {});
        (jest.mocked(useOnyx) as jest.Mock).mockImplementation((key: string) => [key === ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM ? form : undefined, {status: 'loaded'}]);
        mockGetRootState.mockReturnValue({
            routes: [{name: NAVIGATORS.TAB_NAVIGATOR, params: {screen: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, params: {screen: SCREENS.SEARCH.ROOT, params: {q: input}}}}],
        });

        render(
            <OnyxListItemProvider>
                <SearchColumnsPage />
            </OnyxListItemProvider>,
        );

        // When the user resets the columns to the defaults and saves
        fireEvent.press(screen.getByText('Save default columns'));

        const [route] = jest.mocked(Navigation.navigate).mock.calls.at(-1) ?? [];
        const updatedQuery = buildSearchQueryJSON(new URL(route ?? '', 'https://example.com').searchParams.get('q') ?? '');

        // Then the query has no columns, so the search doesn't count as having customized columns
        expect(updatedQuery?.columns).toBeUndefined();
    });
});

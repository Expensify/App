import {fireEvent, render, screen} from '@testing-library/react-native';

import type ColumnsSettingsList from '@components/ColumnsSettingsList';
import MockText from '@components/Text';

import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import {buildFilterFormValuesFromQuery, buildSearchQueryJSON} from '@libs/SearchQueryUtils';

import NAVIGATORS from '@src/NAVIGATORS';
import SearchColumnsPage from '@src/pages/Search/SearchColumnsPage';
import SCREENS from '@src/SCREENS';

import type {ComponentProps} from 'react';

const mockGetRootState = jest.fn();

jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {navigate: jest.fn()}}));
jest.mock('@libs/Navigation/navigationRef', () => ({__esModule: true, default: {getRootState: () => mockGetRootState() as unknown}}));
jest.mock('@components/ColumnsSettingsList', () => ({onSave}: Pick<ComponentProps<typeof ColumnsSettingsList>, 'onSave'>) => (
    <MockText onPress={() => onSave(['merchant', 'amount'])}>Save columns</MockText>
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

        const form = buildFilterFormValuesFromQuery(queryJSON, {}, {}, {}, {}, {}, {}, {});
        (jest.mocked(useOnyx) as jest.Mock).mockReturnValue([form]);
        mockGetRootState.mockReturnValue({
            routes: [{name: NAVIGATORS.TAB_NAVIGATOR, params: {screen: NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR, params: {screen: SCREENS.SEARCH.ROOT, params: {q: input}}}}],
        });

        render(<SearchColumnsPage />);
        fireEvent.press(screen.getByText('Save columns'));

        const [route] = jest.mocked(Navigation.navigate).mock.calls.at(-1) ?? [];
        const updatedQuery = buildSearchQueryJSON(new URL(route ?? '', 'https://example.com').searchParams.get('q') ?? '');

        expect(updatedQuery?.flatFilters).toEqual(queryJSON.flatFilters);
        expect(updatedQuery?.columns).toEqual(['merchant', 'amount']);
    });
});

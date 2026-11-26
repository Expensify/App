import {render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import FilterList from '@components/Search/FilterComponents/AdvancedFilters/FilterList';
import ThemeProvider from '@components/ThemeProvider';
import ThemeStylesProvider from '@components/ThemeStylesContextProvider';

import CONST from '@src/CONST';

import React from 'react';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => (key === 'common.type' ? 'Type' : key)}));

describe('FilterList', () => {
    it('names each filter row after the filter the user sees, not its internal key', () => {
        // Given the advanced filters list with the Type filter
        // When it renders
        render(
            <ComposeProviders components={[ThemeProvider, ThemeStylesProvider]}>
                <FilterList
                    type={CONST.SEARCH.DATA_TYPES.EXPENSE}
                    filters={[[CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE]]}
                    searchValue=""
                    onSearchValueChange={jest.fn()}
                />
            </ComposeProviders>,
        );

        // Then screen readers hear "Type" and the row is announced as a button
        expect(screen.getByRole(CONST.ROLE.BUTTON, {name: 'Type'})).toBeOnTheScreen();
        expect(screen.queryByLabelText(CONST.SEARCH.SYNTAX_FILTER_KEYS.TYPE)).not.toBeOnTheScreen();
    });
});

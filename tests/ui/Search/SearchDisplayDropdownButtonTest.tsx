import {cleanup, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {ButtonComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import SearchDisplayDropdownButton from '@components/Search/SearchPageHeader/SearchDisplayDropdownButton';
import ThemeProvider from '@components/ThemeProvider';

import type * as ResponsiveLayout from '@hooks/useResponsiveLayout';

import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import type * as SearchQueryUtils from '@libs/SearchQueryUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {PortalProvider} from '@gorhom/portal';
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const DISPLAY_CHANGED_INDICATOR_TEST_ID = 'SearchDisplayChangedIndicator';

let mockLayout: Pick<ReturnType<typeof ResponsiveLayout.default>, 'shouldUseNarrowLayout' | 'isMediumScreenWidth' | 'isSmallScreenWidth' | 'isLargeScreenWidth'>;

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({...jest.requireActual<typeof ResponsiveLayout>('@hooks/useResponsiveLayout').default(), ...mockLayout}),
}));

// The Expenses search is the default the display options are compared against
jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({
        currentDefaultSearchQueryJSON: jest.requireActual<typeof SearchQueryUtils>('@libs/SearchQueryUtils').buildSearchQueryJSON('type:expense'),
    }),
}));

// Only the button is under test, so the popover wrapper just draws it
jest.mock(
    '@components/Search/FilterDropdowns/FilterPopupButton',
    () =>
        ({renderButton}: {renderButton: (props: ButtonComponentProps) => React.ReactNode}) =>
            renderButton({ref: {current: null}, onPress: jest.fn(), isExpanded: false}),
);

async function renderDisplayButton(query: string) {
    const queryJSON = buildSearchQueryJSON(query);
    if (!queryJSON) {
        throw new Error('Failed to parse query string');
    }

    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider, PortalProvider]}>
            <SearchDisplayDropdownButton
                queryJSON={queryJSON}
                searchResults={undefined}
                onSort={jest.fn()}
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

describe('SearchDisplayDropdownButton', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockLayout = {shouldUseNarrowLayout: true, isSmallScreenWidth: true, isMediumScreenWidth: false, isLargeScreenWidth: false};
        await Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.EN);
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(() => {
        cleanup();
    });

    it('shows a dot on the Display icon on mobile when display options differ from the default', async () => {
        // Given a mobile Expenses search sorted by merchant instead of the default date
        // When the Display icon is drawn
        await renderDisplayButton('type:expense sortBy:merchant sortOrder:desc');

        // Then a dot marks that display options are active, since the icon has no room for the count
        expect(screen.getByTestId(DISPLAY_CHANGED_INDICATOR_TEST_ID)).toBeOnTheScreen();
    });

    it('hides the dot on mobile when display options match the default', async () => {
        // Given a mobile Expenses search with the default display options
        // When the Display icon is drawn
        await renderDisplayButton('type:expense');

        // Then there's no dot, since nothing would be reset
        expect(screen.queryByTestId(DISPLAY_CHANGED_INDICATOR_TEST_ID)).not.toBeOnTheScreen();
    });

    it('shows a dot on the Display icon on medium screens when display options differ from the default', async () => {
        // Given a medium screen, which also shows the Display icon instead of the labeled button, with a changed sort
        mockLayout = {shouldUseNarrowLayout: false, isSmallScreenWidth: false, isMediumScreenWidth: true, isLargeScreenWidth: false};

        // When the Display icon is drawn
        await renderDisplayButton('type:expense sortBy:merchant sortOrder:desc');

        // Then the dot shows there too
        expect(screen.getByTestId(DISPLAY_CHANGED_INDICATOR_TEST_ID)).toBeOnTheScreen();
    });

    it('keeps the count on the labeled Display button on wide screens', async () => {
        // Given a wide screen with a changed sort
        mockLayout = {shouldUseNarrowLayout: false, isSmallScreenWidth: false, isMediumScreenWidth: false, isLargeScreenWidth: true};

        // When the Display button is drawn
        await renderDisplayButton('type:expense sortBy:merchant sortOrder:desc');

        // Then the button keeps its count and shows no dot, so desktop is unchanged
        expect(screen.getByText('Display (1)')).toBeOnTheScreen();
        expect(screen.queryByTestId(DISPLAY_CHANGED_INDICATOR_TEST_ID)).not.toBeOnTheScreen();
    });
});

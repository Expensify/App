import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type * as ReactNavigation from '@react-navigation/native';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import useNetwork from '@hooks/useNetwork';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import StaticSearchTypeMenu from '@pages/Search/SearchPageNarrow/StaticSearchTypeMenu';
import SearchTypeMenuNarrow from '@pages/Search/SearchTypeMenuNarrow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {translateLocal} from '../../utils/TestHelper';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@hooks/useTodoCounts', () => ({
    __esModule: true,
    default: jest.fn(() => ({counts: {}})),
}));

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useNavigation: jest.fn(() => ({dispatch: jest.fn()})),
        useIsFocused: jest.fn(() => true),
    };
});
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

function Wrapper({children}: {children: React.ReactNode}) {
    return (
        <OnyxListItemProvider>
            <LocaleContextProvider>{children}</LocaleContextProvider>
        </OnyxListItemProvider>
    );
}

describe('Search saved-search tab highlight', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
        jest.clearAllMocks();
    });

    it('keeps saved search selected in static narrow menu when similar hash collides', async () => {
        const baseQuery = 'type:expense status:all';
        const savedQueryString = `${baseQuery} sortBy:amount`;
        const savedQueryJSON = buildSearchQueryJSON(savedQueryString);

        if (!savedQueryJSON) {
            throw new Error('Failed to build saved query JSON');
        }

        await act(async () => {
            await Onyx.merge(ONYXKEYS.SAVED_SEARCHES, {
                [savedQueryJSON.hash]: {
                    name: 'My saved search',
                    query: savedQueryString,
                },
            });
        });

        render(
            <Wrapper>
                <StaticSearchTypeMenu queryJSON={savedQueryJSON} />
            </Wrapper>,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByRole('tab', {name: 'My saved search', selected: true})).toBeTruthy();
    });

    it('keeps saved search selected in interactive narrow menu when similar hash collides', async () => {
        const baseQuery = 'type:expense status:all';
        const savedQueryString = `${baseQuery} sortBy:amount`;
        const savedQueryJSON = buildSearchQueryJSON(savedQueryString);

        if (!savedQueryJSON) {
            throw new Error('Failed to build saved query JSON');
        }

        await act(async () => {
            await Onyx.merge(ONYXKEYS.SAVED_SEARCHES, {
                [savedQueryJSON.hash]: {
                    name: 'My saved search',
                    query: savedQueryString,
                },
            });
        });

        render(
            <Wrapper>
                <SearchTypeMenuNarrow queryJSON={savedQueryJSON} />
            </Wrapper>,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByRole('tab', {name: 'My saved search', selected: true})).toBeTruthy();
    });

    it('does not show pending-delete saved search as selected in static narrow menu while online', async () => {
        const baseQuery = 'type:expense status:all';
        const savedQueryString = `${baseQuery} sortBy:amount`;
        const savedQueryJSON = buildSearchQueryJSON(savedQueryString);

        if (!savedQueryJSON) {
            throw new Error('Failed to build saved query JSON');
        }

        (useNetwork as jest.Mock).mockReturnValue({isOffline: false});

        await act(async () => {
            await Onyx.merge(ONYXKEYS.SAVED_SEARCHES, {
                [savedQueryJSON.hash]: {
                    name: 'My saved search',
                    query: savedQueryString,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            });
        });

        render(
            <Wrapper>
                <StaticSearchTypeMenu queryJSON={savedQueryJSON} />
            </Wrapper>,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByRole('tab', {name: 'My saved search'})).toBeNull();
    });

    it('highlights built-in tab when saved search is pending delete while online (interactive narrow)', async () => {
        const baseQuery = 'type:expense status:all';
        const savedQueryString = `${baseQuery} sortBy:amount`;
        const savedQueryJSON = buildSearchQueryJSON(savedQueryString);

        if (!savedQueryJSON) {
            throw new Error('Failed to build saved query JSON');
        }

        (useNetwork as jest.Mock).mockReturnValue({isOffline: false});

        await act(async () => {
            await Onyx.merge(ONYXKEYS.SAVED_SEARCHES, {
                [savedQueryJSON.hash]: {
                    name: 'My saved search',
                    query: savedQueryString,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            });
        });

        render(
            <Wrapper>
                <SearchTypeMenuNarrow queryJSON={savedQueryJSON} />
            </Wrapper>,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.queryByRole('tab', {name: 'My saved search'})).toBeNull();
        expect(screen.getByRole('tab', {name: translateLocal('search.tabs.expenses'), selected: true})).toBeTruthy();
    });
});

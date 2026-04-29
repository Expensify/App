import type * as NativeNavigation from '@react-navigation/native';
import {act, render, screen, waitFor} from '@testing-library/react-native';
import React, {useMemo} from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import {OptionsListActionsContext, OptionsListStateContext} from '@components/OptionListContextProvider';
import SearchRouter from '@components/Search/SearchRouter/SearchRouter';
import type {PrivateIsArchivedMap} from '@hooks/usePrivateIsArchivedMap';
import {createOptionList} from '@libs/OptionsListUtils';
import ComposeProviders from '@src/components/ComposeProviders';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, Report} from '@src/types/onyx';
import createCollection from '../utils/collections/createCollection';
import createPersonalDetails from '../utils/collections/personalDetails';
import {createRandomReport} from '../utils/collections/reports';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

jest.mock('lodash/debounce', () =>
    jest.fn((fn: Record<string, jest.Mock>) => {
        // eslint-disable-next-line no-param-reassign
        fn.cancel = jest.fn();
        return fn;
    }),
);

jest.mock('@src/libs/Log');

jest.mock('@src/libs/API', () => ({
    write: jest.fn(),
    makeRequestWithSideEffects: jest.fn(),
    read: jest.fn(),
}));

// The jest-expo preset resolves to the .native.tsx file which defers rendering via onLayout (which never fires in tests).
// Mock the deferred wrapper to directly render SearchAutocompleteList.
jest.mock('@components/Search/DeferredSearchAutocompleteList', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const module = jest.requireActual<{default: React.ComponentType}>('@components/Search/SearchAutocompleteList');
    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        __esModule: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        default: module.default,
    };
});

jest.mock('@src/libs/Navigation/Navigation', () => ({
    dismissModalWithReport: jest.fn(),
    getTopmostReportId: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
    navigate: jest.fn(),
}));

jest.mock('@src/hooks/useRootNavigationState', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({contextualReportID: undefined, isSearchRouterScreen: false}),
}));

jest.mock('@hooks/useExportedToFilterOptions', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        exportedToFilterOptions: [],
        combinedUniqueExportTemplates: [],
        connectedIntegrationNames: new Set<string>(),
    }),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: () => true,
        useRoute: () => jest.fn(),
        usePreventRemove: () => jest.fn(),
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: () => jest.fn(),
        }),
        createNavigationContainerRef: () => ({
            addListener: () => jest.fn(),
            removeListener: () => jest.fn(),
            isReady: () => jest.fn(),
            getCurrentRoute: () => jest.fn(),
            getState: () => jest.fn(),
        }),
        useNavigationState: () => ({
            routes: [],
        }),
    };
});

jest.mock('@src/components/ConfirmedRoute.tsx');

const getMockedReports = (length = 10) =>
    createCollection<Report>(
        (item) => `${ONYXKEYS.COLLECTION.REPORT}${item.reportID}`,
        (index) => createRandomReport(index, undefined),
        length,
    );

const getMockedPersonalDetails = (length = 10) =>
    createCollection<PersonalDetails>(
        (item) => item.accountID,
        (index) => createPersonalDetails(index),
        length,
    );

const mockedReports = getMockedReports(10);
const mockedBetas = Object.values(CONST.BETAS);
const mockedPersonalDetails = getMockedPersonalDetails(10);
const EMPTY_PRIVATE_IS_ARCHIVED_MAP: PrivateIsArchivedMap = {};
const mockedOptions = createOptionList(mockedPersonalDetails, EMPTY_PRIVATE_IS_ARCHIVED_MAP, mockedReports, undefined);

const mockOnClose = jest.fn();

function SearchRouterWrapper({options = mockedOptions}: {options?: ReturnType<typeof createOptionList>}) {
    return (
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <OptionsListStateContext.Provider value={useMemo(() => ({options, areOptionsInitialized: true}), [options])}>
                <OptionsListActionsContext.Provider value={useMemo(() => ({initializeOptions: () => {}, resetOptions: () => {}}), [])}>
                    <SearchRouter onRouterClose={mockOnClose} />
                </OptionsListActionsContext.Provider>
            </OptionsListStateContext.Provider>
        </ComposeProviders>
    );
}

/**
 * Helper to flush all pending React state updates and Onyx callbacks.
 * With fake timers we need multiple rounds of timer advancement + microtask flushing.
 */
async function flushAllUpdates() {
    for (let i = 0; i < 10; i++) {
        // eslint-disable-next-line no-await-in-loop
        await act(async () => {
            jest.advanceTimersByTime(100);
            await waitForBatchedUpdates();
        });
    }
}

describe('SearchAutocompleteList', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT],
        });
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.clearAllMocks();
    });

    it('should display Recent searches section when query is empty and recent searches exist', async () => {
        const timestampOne = '2024-01-01T00:00:00';
        const timestampTwo = '2024-01-02T00:00:00';
        const recentSearches: Record<string, {query: string; timestamp: string}> = {};
        recentSearches[timestampOne] = {query: 'type:expense status:approved', timestamp: timestampOne};
        recentSearches[timestampTwo] = {query: 'type:chat', timestamp: timestampTwo};

        await waitForBatchedUpdates();
        await Onyx.multiSet({
            ...mockedReports,
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: mockedPersonalDetails,
            [ONYXKEYS.BETAS]: mockedBetas,
            [ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_REPORTS]: true,
            [ONYXKEYS.RECENT_SEARCHES]: recentSearches,
        });

        render(<SearchRouterWrapper />);

        // Flush all pending updates (Onyx subscriptions, useEffect, re-renders)
        await flushAllUpdates();

        // Verify "Recent searches" section header is visible when query is empty and recent searches exist
        await waitFor(() => {
            expect(screen.getByText('Recent searches')).toBeTruthy();
        });

        // Verify the recent search items themselves are also displayed
        expect(screen.getByText('type:expense status:approved')).toBeTruthy();
        expect(screen.getByText('type:chat')).toBeTruthy();
    });
});

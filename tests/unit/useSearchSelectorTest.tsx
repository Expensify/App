import {act, renderHook} from '@testing-library/react-native';
import type {OnyxMultiSetInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import useSearchSelectorBase from '@hooks/useSearchSelector.base';
import {getSearchOptions, getValidOptions} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type {SortedReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ConfirmedRoute.tsx');

const EMPTY_OPTIONS = {recentReports: [], personalDetails: [], userToInvite: null, currentUserOption: null};

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@libs/OptionsListUtils', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    ...jest.requireActual('@libs/OptionsListUtils'),
    getValidOptions: jest.fn(() => EMPTY_OPTIONS),
    getSearchOptions: jest.fn(() => EMPTY_OPTIONS),
}));

const MOCK_ACCOUNT_ID = 12345;
const MOCK_EMAIL = 'test@expensify.com';

const mockGetValidOptions = jest.mocked(getValidOptions);
const mockGetSearchOptions = jest.mocked(getSearchOptions);

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@components/OptionListContextProvider', () => ({
    ...jest.requireActual('@components/OptionListContextProvider'),
    useOptionsList: () => ({
        options: {reports: [], personalDetails: []},
        areOptionsInitialized: true,
        initializeOptions: jest.fn(),
        resetOptions: jest.fn(),
    }),
}));

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => ({}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({
    accountID: MOCK_ACCOUNT_ID,
    email: MOCK_EMAIL,
}));

function buildMockSortedActions(reportIDs: string[]): SortedReportActionsDerivedValue {
    const sortedActions: Record<string, ReportAction[]> = {};
    const lastActions: Record<string, ReportAction> = {};
    const transactionThreadIDs: Record<string, string | undefined> = {};

    for (const id of reportIDs) {
        const action = {
            reportActionID: `action_${id}`,
            created: '2025-01-01 10:00:00.000',
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        } as ReportAction;
        sortedActions[id] = [action];
        lastActions[id] = action;
        transactionThreadIDs[id] = undefined;
    }

    return {sortedActions, lastActions, transactionThreadIDs};
}

describe('useSearchSelector sortedActions integration', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {
                    accountID: MOCK_ACCOUNT_ID,
                    email: MOCK_EMAIL,
                    authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS,
                },
                [ONYXKEYS.BETAS]: [],
                [ONYXKEYS.COUNTRY_CODE]: CONST.DEFAULT_COUNTRY_CODE,
            } as unknown as OnyxMultiSetInput);
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterAll(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('passes undefined sortedActions to getValidOptions when RAM_ONLY_SORTED_REPORT_ACTIONS is not set', async () => {
        renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockGetValidOptions).toHaveBeenCalled();
        const lastCall = mockGetValidOptions.mock.calls.at(-1);
        const config = lastCall?.[8];
        expect(config?.sortedActions).toBeUndefined();
    });

    it('passes sortedActions from RAM_ONLY_SORTED_REPORT_ACTIONS to getValidOptions for GENERAL context', async () => {
        const mockData = buildMockSortedActions(['1', '2']);

        await act(async () => {
            await Onyx.set(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS, mockData);
        });
        await waitForBatchedUpdatesWithAct();

        renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockGetValidOptions).toHaveBeenCalled();
        const lastCall = mockGetValidOptions.mock.calls.at(-1);
        const config = lastCall?.[8];
        expect(config?.sortedActions).toEqual(mockData.sortedActions);
    });

    it('passes sortedActions to getValidOptions for MEMBER_INVITE context', async () => {
        const mockData = buildMockSortedActions(['10']);

        await act(async () => {
            await Onyx.set(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS, mockData);
        });
        await waitForBatchedUpdatesWithAct();

        renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockGetValidOptions).toHaveBeenCalled();
        const lastCall = mockGetValidOptions.mock.calls.at(-1);
        const config = lastCall?.[8];
        expect(config?.sortedActions).toEqual(mockData.sortedActions);
    });

    it('passes sortedActions to getValidOptions for SHARE_DESTINATION context', async () => {
        const mockData = buildMockSortedActions(['20', '21']);

        await act(async () => {
            await Onyx.set(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS, mockData);
        });
        await waitForBatchedUpdatesWithAct();

        renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_SHARE_DESTINATION,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockGetValidOptions).toHaveBeenCalled();
        const lastCall = mockGetValidOptions.mock.calls.at(-1);
        const config = lastCall?.[8];
        expect(config?.sortedActions).toEqual(mockData.sortedActions);
    });

    it('passes sortedActions to getValidOptions for ATTENDEES context', async () => {
        const mockData = buildMockSortedActions(['30']);

        await act(async () => {
            await Onyx.set(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS, mockData);
        });
        await waitForBatchedUpdatesWithAct();

        renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_ATTENDEES,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockGetValidOptions).toHaveBeenCalled();
        const lastCall = mockGetValidOptions.mock.calls.at(-1);
        const config = lastCall?.[8];
        expect(config?.sortedActions).toEqual(mockData.sortedActions);
    });

    it('updates sortedActions when RAM_ONLY_SORTED_REPORT_ACTIONS changes in Onyx', async () => {
        const initialData = buildMockSortedActions(['1']);

        await act(async () => {
            await Onyx.set(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS, initialData);
        });
        await waitForBatchedUpdatesWithAct();

        renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        const firstCallConfig = mockGetValidOptions.mock.calls.at(-1)?.[8];
        expect(firstCallConfig?.sortedActions).toEqual(initialData.sortedActions);

        const updatedData = buildMockSortedActions(['1', '2', '3']);
        await act(async () => {
            await Onyx.set(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS, updatedData);
        });
        await waitForBatchedUpdatesWithAct();

        const latestCallConfig = mockGetValidOptions.mock.calls.at(-1)?.[8];
        expect(latestCallConfig?.sortedActions).toEqual(updatedData.sortedActions);
    });

    it('does not pass sortedActions to getSearchOptions for SEARCH context', async () => {
        const mockData = buildMockSortedActions(['1']);

        await act(async () => {
            await Onyx.set(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS, mockData);
        });
        await waitForBatchedUpdatesWithAct();

        renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_SEARCH,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockGetSearchOptions).toHaveBeenCalled();
        const lastSearchCall = mockGetSearchOptions.mock.calls.at(-1);
        const searchConfig = lastSearchCall?.[0];
        expect(searchConfig).not.toHaveProperty('sortedActions');
    });
});

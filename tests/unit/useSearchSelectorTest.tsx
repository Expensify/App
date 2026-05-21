import {act, renderHook} from '@testing-library/react-native';
import type {OnyxMultiSetInput} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import useSearchSelectorBase from '@hooks/useSearchSelector/base';
import {getSearchOptions, getValidOptions} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type {SortedReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ConfirmedRoute.tsx');

const EMPTY_OPTIONS = {recentReports: [], personalDetails: [], userToInvite: null, currentUserOption: null};

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@libs/OptionsListUtils', () => ({
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
        const config = lastCall?.[7];
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
        const config = lastCall?.[7];
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
        const config = lastCall?.[7];
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
        const config = lastCall?.[7];
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
        const config = lastCall?.[7];
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

        const firstCallConfig = mockGetValidOptions.mock.calls.at(-1)?.[7];
        expect(firstCallConfig?.sortedActions).toEqual(initialData.sortedActions);

        const updatedData = buildMockSortedActions(['1', '2', '3']);
        await act(async () => {
            await Onyx.set(ONYXKEYS.DERIVED.RAM_ONLY_SORTED_REPORT_ACTIONS, updatedData);
        });
        await waitForBatchedUpdatesWithAct();

        const latestCallConfig = mockGetValidOptions.mock.calls.at(-1)?.[7];
        expect(latestCallConfig?.sortedActions).toEqual(updatedData.sortedActions);
    });

    it('passes sortedActions to getSearchOptions for SEARCH context (SEARCH_CONTEXT_SEARCH)', async () => {
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
        expect(searchConfig).toHaveProperty('sortedActions');
    });
});

const EXISTING_CONTACT: OptionData = {
    text: 'Alice Smith',
    login: 'alice@expensify.com',
    accountID: 100,
    isSelected: false,
    keyForList: 'alice@expensify.com',
} as OptionData;

const SECOND_CONTACT: OptionData = {
    text: 'Bob Jones',
    login: 'bob@expensify.com',
    accountID: 200,
    isSelected: false,
    keyForList: 'bob@expensify.com',
} as OptionData;

const NON_EXISTING_USER_TO_INVITE: OptionData = {
    text: 'newuser@gmail.com',
    login: 'newuser@gmail.com',
    accountID: 999999,
    isOptimisticAccount: true,
    isSelected: false,
    keyForList: 'newuser@gmail.com',
} as OptionData;

describe('useSearchSelector selection and non-existing options', () => {
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

    it('keeps selected contacts in availableOptions.personalDetails when shouldKeepSelectedInAvailableOptions is true', async () => {
        const optionsWithSelected = {
            recentReports: [],
            personalDetails: [{...EXISTING_CONTACT, isSelected: true}, SECOND_CONTACT],
            userToInvite: null,
            currentUserOption: null,
        };
        mockGetValidOptions.mockReturnValue(optionsWithSelected);

        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
                shouldKeepSelectedInAvailableOptions: true,
                initialSelected: [EXISTING_CONTACT],
            }),
        );
        await waitForBatchedUpdatesWithAct();

        // The selected contact should remain in availableOptions.personalDetails
        const personalDetailLogins = result.current.availableOptions.personalDetails.map((o) => o.login);
        expect(personalDetailLogins).toContain('alice@expensify.com');
        expect(personalDetailLogins).toContain('bob@expensify.com');
    });

    it('filters out selected contacts from availableOptions.personalDetails when shouldKeepSelectedInAvailableOptions is false', async () => {
        const optionsWithSelected = {
            recentReports: [],
            personalDetails: [{...EXISTING_CONTACT, isSelected: true}, SECOND_CONTACT],
            userToInvite: null,
            currentUserOption: null,
        };
        mockGetValidOptions.mockReturnValue(optionsWithSelected);

        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
                shouldKeepSelectedInAvailableOptions: false,
                initialSelected: [EXISTING_CONTACT],
            }),
        );
        await waitForBatchedUpdatesWithAct();

        // The selected contact should be filtered out from availableOptions
        const personalDetailLogins = result.current.availableOptions.personalDetails.map((o) => o.login);
        expect(personalDetailLogins).not.toContain('alice@expensify.com');
        expect(personalDetailLogins).toContain('bob@expensify.com');
    });

    it('populates selectedNonExistingOptions with selected users not in personalDetails when shouldSeparateNonExistingSelectedOptions is true', async () => {
        // Return contacts that do NOT include the non-existing user
        const optionsWithContacts = {
            recentReports: [],
            personalDetails: [EXISTING_CONTACT],
            userToInvite: null,
            currentUserOption: null,
        };
        mockGetValidOptions.mockReturnValue(optionsWithContacts);

        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
                shouldKeepSelectedInAvailableOptions: true,
                shouldSeparateNonExistingSelectedOptions: true,
                initialSelected: [NON_EXISTING_USER_TO_INVITE],
            }),
        );
        await waitForBatchedUpdatesWithAct();

        // The non-existing user should appear in selectedNonExistingOptions
        expect(result.current.selectedNonExistingOptions).toHaveLength(1);
        expect(result.current.selectedNonExistingOptions?.[0].login).toBe('newuser@gmail.com');

        // The non-existing user should NOT be in availableOptions.personalDetails
        const personalDetailLogins = result.current.availableOptions.personalDetails.map((o) => o.login);
        expect(personalDetailLogins).not.toContain('newuser@gmail.com');
    });

    it('returns empty selectedNonExistingOptions when shouldSeparateNonExistingSelectedOptions is false', async () => {
        const optionsWithContacts = {
            recentReports: [],
            personalDetails: [EXISTING_CONTACT],
            userToInvite: null,
            currentUserOption: null,
        };
        mockGetValidOptions.mockReturnValue(optionsWithContacts);

        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
                shouldKeepSelectedInAvailableOptions: true,
                shouldSeparateNonExistingSelectedOptions: false,
                initialSelected: [NON_EXISTING_USER_TO_INVITE],
            }),
        );
        await waitForBatchedUpdatesWithAct();

        expect(result.current.selectedNonExistingOptions).toHaveLength(0);
    });

    it('does not include existing contacts in selectedNonExistingOptions', async () => {
        const optionsWithContacts = {
            recentReports: [],
            personalDetails: [{...EXISTING_CONTACT, isSelected: true}, SECOND_CONTACT],
            userToInvite: null,
            currentUserOption: null,
        };
        mockGetValidOptions.mockReturnValue(optionsWithContacts);

        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
                shouldKeepSelectedInAvailableOptions: true,
                shouldSeparateNonExistingSelectedOptions: true,
                initialSelected: [EXISTING_CONTACT],
            }),
        );
        await waitForBatchedUpdatesWithAct();

        // Existing contacts should NOT appear in selectedNonExistingOptions
        expect(result.current.selectedNonExistingOptions).toHaveLength(0);

        // They should remain in availableOptions.personalDetails
        const personalDetailLogins = result.current.availableOptions.personalDetails.map((o) => o.login);
        expect(personalDetailLogins).toContain('alice@expensify.com');
    });

    it('adds non-existing user to selectedNonExistingOptions after toggleSelection', async () => {
        const optionsWithUserToInvite = {
            recentReports: [],
            personalDetails: [EXISTING_CONTACT],
            userToInvite: NON_EXISTING_USER_TO_INVITE,
            currentUserOption: null,
        };
        mockGetValidOptions.mockReturnValue(optionsWithUserToInvite);

        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
                shouldKeepSelectedInAvailableOptions: true,
                shouldSeparateNonExistingSelectedOptions: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        // Initially no selected options
        expect(result.current.selectedOptions).toHaveLength(0);
        expect(result.current.selectedNonExistingOptions).toHaveLength(0);

        // Toggle the non-existing user
        act(() => {
            result.current.toggleSelection(NON_EXISTING_USER_TO_INVITE);
        });
        await waitForBatchedUpdatesWithAct();

        // Now the non-existing user should be in selectedOptions and selectedNonExistingOptions
        expect(result.current.selectedOptions).toHaveLength(1);
        expect(result.current.selectedOptions.at(0)?.login).toBe('newuser@gmail.com');
        expect(result.current.selectedNonExistingOptions).toHaveLength(1);
        expect(result.current.selectedNonExistingOptions?.[0].login).toBe('newuser@gmail.com');
    });

    it('removes non-existing user from selectedNonExistingOptions after deselection', async () => {
        const optionsWithContacts = {
            recentReports: [],
            personalDetails: [EXISTING_CONTACT],
            userToInvite: null,
            currentUserOption: null,
        };
        mockGetValidOptions.mockReturnValue(optionsWithContacts);

        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
                shouldKeepSelectedInAvailableOptions: true,
                shouldSeparateNonExistingSelectedOptions: true,
                initialSelected: [NON_EXISTING_USER_TO_INVITE],
            }),
        );
        await waitForBatchedUpdatesWithAct();

        expect(result.current.selectedNonExistingOptions).toHaveLength(1);

        // Deselect the non-existing user
        act(() => {
            result.current.toggleSelection(NON_EXISTING_USER_TO_INVITE);
        });
        await waitForBatchedUpdatesWithAct();

        expect(result.current.selectedOptions).toHaveLength(0);
        expect(result.current.selectedNonExistingOptions).toHaveLength(0);
    });

    it('handles mix of existing and non-existing selected users correctly', async () => {
        const optionsWithContacts = {
            recentReports: [],
            personalDetails: [{...EXISTING_CONTACT, isSelected: true}],
            userToInvite: null,
            currentUserOption: null,
        };
        mockGetValidOptions.mockReturnValue(optionsWithContacts);

        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_MEMBER_INVITE,
                shouldKeepSelectedInAvailableOptions: true,
                shouldSeparateNonExistingSelectedOptions: true,
                initialSelected: [EXISTING_CONTACT, NON_EXISTING_USER_TO_INVITE],
            }),
        );
        await waitForBatchedUpdatesWithAct();

        // Both should be in selectedOptions
        expect(result.current.selectedOptions).toHaveLength(2);

        // Only the non-existing user should be in selectedNonExistingOptions
        expect(result.current.selectedNonExistingOptions).toHaveLength(1);
        expect(result.current.selectedNonExistingOptions?.[0].login).toBe('newuser@gmail.com');

        // The existing contact should remain in availableOptions.personalDetails
        const personalDetailLogins = result.current.availableOptions.personalDetails.map((o) => o.login);
        expect(personalDetailLogins).toContain('alice@expensify.com');
    });
});

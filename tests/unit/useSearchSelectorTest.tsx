import {act, renderHook} from '@testing-library/react-native';

import useSearchSelectorBase from '@hooks/useSearchSelector/base';

import type {SearchOption} from '@libs/OptionsListUtils';
import {getSearchOptions, getValidOptions} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, ReportAction} from '@src/types/onyx';
import type {SortedReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';

import type {OnyxMultiSetInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ConfirmedRoute.tsx');

const EMPTY_OPTIONS = {recentReports: [], personalDetails: [], userToInvite: null, currentUserOption: null};

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@libs/OptionsListUtils', () => ({
    __esModule: true,
    ...jest.requireActual('@libs/OptionsListUtils'),
    getValidOptions: jest.fn(() => ({options: EMPTY_OPTIONS, hasMore: false})),
    getSearchOptions: jest.fn(() => ({options: EMPTY_OPTIONS, hasMore: false})),
}));

const MOCK_ACCOUNT_ID = 12345;
const MOCK_EMAIL = 'test@expensify.com';

const mockGetValidOptions = jest.mocked(getValidOptions);
const mockGetSearchOptions = jest.mocked(getSearchOptions);

// Holds the Onyx-sourced personal detail options returned by the mocked useFilteredOptions, so individual tests can control them.
const mockFilteredPersonalDetails: {current: OptionData[]} = {current: []};

jest.mock('@hooks/useFilteredOptions', () => ({
    __esModule: true,
    default: () => ({
        options: {reports: [], personalDetails: mockFilteredPersonalDetails.current},
        isLoading: false,
        loadMore: jest.fn(),
        hasMore: false,
        isLoadingMore: false,
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
            options: {
                recentReports: [],
                personalDetails: [{...EXISTING_CONTACT, isSelected: true}, SECOND_CONTACT],
                userToInvite: null,
                currentUserOption: null,
            },
        };
        mockGetValidOptions.mockReturnValue(optionsWithSelected);

        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
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
            options: {
                recentReports: [],
                personalDetails: [{...EXISTING_CONTACT, isSelected: true}, SECOND_CONTACT],
                userToInvite: null,
                currentUserOption: null,
            },
        };
        mockGetValidOptions.mockReturnValue(optionsWithSelected);

        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
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
            options: {
                recentReports: [],
                personalDetails: [EXISTING_CONTACT],
                userToInvite: null,
                currentUserOption: null,
            },
        };
        mockGetValidOptions.mockReturnValue(optionsWithContacts);

        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
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
            options: {
                recentReports: [],
                personalDetails: [EXISTING_CONTACT],
                userToInvite: null,
                currentUserOption: null,
            },
        };
        mockGetValidOptions.mockReturnValue(optionsWithContacts);

        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
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
            options: {
                recentReports: [],
                personalDetails: [{...EXISTING_CONTACT, isSelected: true}, SECOND_CONTACT],
                userToInvite: null,
                currentUserOption: null,
            },
        };
        mockGetValidOptions.mockReturnValue(optionsWithContacts);

        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
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
            options: {
                recentReports: [],
                personalDetails: [EXISTING_CONTACT],
                userToInvite: NON_EXISTING_USER_TO_INVITE,
                currentUserOption: null,
            },
        };
        mockGetValidOptions.mockReturnValue(optionsWithUserToInvite);

        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
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
            options: {
                recentReports: [],
                personalDetails: [EXISTING_CONTACT],
                userToInvite: null,
                currentUserOption: null,
            },
        };
        mockGetValidOptions.mockReturnValue(optionsWithContacts);

        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
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
            options: {
                recentReports: [],
                personalDetails: [{...EXISTING_CONTACT, isSelected: true}],
                userToInvite: null,
                currentUserOption: null,
            },
        };
        mockGetValidOptions.mockReturnValue(optionsWithContacts);

        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
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

// Imported device contacts are always given a generated (optimistic) accountID, even when that person already exists in Onyx.
function makeDeviceContact(login: string, accountID: number, text = login): SearchOption<PersonalDetails> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test fixture only needs a minimal contact option shape
    return {login, accountID, text, keyForList: login} as SearchOption<PersonalDetails>;
}

describe('useSearchSelector phone contact de-duplication', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockFilteredPersonalDetails.current = [];
        // getValidOptions is mocked, so the contact de-duplication under test only depends on the inputs passed to the hook.
        mockGetValidOptions.mockReturnValue({options: EMPTY_OPTIONS, hasMore: false});
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterAll(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    /** Returns the personalDetails that were handed to getValidOptions on the most recent call. */
    function getPersonalDetailsPassedToGetValidOptions() {
        return mockGetValidOptions.mock.calls.at(-1)?.[0]?.personalDetails ?? [];
    }

    it('drops an imported contact whose login already exists in personal details, keeping the real Onyx account', async () => {
        // EXISTING_CONTACT is alice@expensify.com with the real Onyx accountID 100.
        mockFilteredPersonalDetails.current = [EXISTING_CONTACT];

        renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
                contactOptions: [makeDeviceContact('alice@expensify.com', 987654, 'Alice From Phone'), makeDeviceContact('carol@gmail.com', 987655, 'Carol')],
            }),
        );
        await waitForBatchedUpdatesWithAct();

        const personalDetails = getPersonalDetailsPassedToGetValidOptions();
        // Alice must appear exactly once, and with the real Onyx accountID rather than the generated contact one.
        const aliceEntries = personalDetails.filter((option) => option.login === 'alice@expensify.com');
        expect(aliceEntries).toHaveLength(1);
        expect(aliceEntries.at(0)?.accountID).toBe(100);
        // The contact that isn't already known must still be added.
        expect(personalDetails.map((option) => option.login)).toContain('carol@gmail.com');
    });

    it('de-dupes imported contacts that share the same login', async () => {
        renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
                contactOptions: [makeDeviceContact('carol@gmail.com', 987655), makeDeviceContact('carol@gmail.com', 111111)],
            }),
        );
        await waitForBatchedUpdatesWithAct();

        const personalDetails = getPersonalDetailsPassedToGetValidOptions();
        expect(personalDetails.filter((option) => option.login === 'carol@gmail.com')).toHaveLength(1);
    });

    it('drops a phone contact that resolves to an SMS login already in personal details', async () => {
        // getContactOption already normalizes a device phone number to its SMS-domain login, so both sides carry the same login.
        const smsLogin = '+15551234567@expensify.sms';
        mockFilteredPersonalDetails.current = [{...EXISTING_CONTACT, login: smsLogin, accountID: 300}];

        renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
                contactOptions: [makeDeviceContact(smsLogin, 987654, 'Alice From Phone')],
            }),
        );
        await waitForBatchedUpdatesWithAct();

        const personalDetails = getPersonalDetailsPassedToGetValidOptions();
        expect(personalDetails).toHaveLength(1);
        expect(personalDetails.at(0)?.accountID).toBe(300);
    });

    it('matches logins case-insensitively so a differently-cased contact is not duplicated', async () => {
        mockFilteredPersonalDetails.current = [EXISTING_CONTACT];

        renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
                contactOptions: [makeDeviceContact('Alice@Expensify.com', 987654)],
            }),
        );
        await waitForBatchedUpdatesWithAct();

        const personalDetails = getPersonalDetailsPassedToGetValidOptions();
        expect(personalDetails).toHaveLength(1);
        expect(personalDetails.at(0)?.accountID).toBe(100);
    });

    it('keeps all imported contacts when none of them are already known', async () => {
        mockFilteredPersonalDetails.current = [EXISTING_CONTACT];

        renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
                contactOptions: [makeDeviceContact('carol@gmail.com', 987655)],
            }),
        );
        await waitForBatchedUpdatesWithAct();

        expect(getPersonalDetailsPassedToGetValidOptions().map((option) => option.login)).toEqual(['alice@expensify.com', 'carol@gmail.com']);
    });
});

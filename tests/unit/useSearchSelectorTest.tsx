import {act, renderHook} from '@testing-library/react-native';

import type * as OnyxListItemProvider from '@components/OnyxListItemProvider';

import useContactImport from '@hooks/useContactImport';
import useSearchSelectorBase from '@hooks/useSearchSelector/base';
import type useSearchSelectorWeb from '@hooks/useSearchSelector/index';
import type useSearchSelectorNative from '@hooks/useSearchSelector/index.native';

import type * as ContactPicker from '@libs/ContactPicker';
import type {SearchOption} from '@libs/OptionsListUtils';
import {getSearchOptions, getValidOptions} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetails, ReportAction} from '@src/types/onyx';
import type {SortedReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';
import type {Participant} from '@src/types/onyx/IOU';

import type {OnyxMultiSetInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';
import {RESULTS} from 'react-native-permissions';

import createMock from '../utils/createMock';
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

let mockCanPickContacts = false;

jest.mock('@hooks/useContactImport', () => ({__esModule: true, default: jest.fn()}));
jest.mock('@libs/ContactPicker', () => ({
    ...jest.requireActual<typeof ContactPicker>('@libs/ContactPicker'),
    get canPickContacts() {
        return mockCanPickContacts;
    },
}));

const MOCK_ACCOUNT_ID = 12345;
const MOCK_EMAIL = 'test@expensify.com';

const mockGetValidOptions = jest.mocked(getValidOptions);
const mockGetSearchOptions = jest.mocked(getSearchOptions);

// Keep the options reference stable while inputs are unchanged, matching useFilteredOptions.
// Tests set personalDetails here; creating a new options object on every render would invalidate the selector's cache.
const mockFilteredOptions: {reports: OptionData[]; personalDetails: OptionData[]} = {reports: [], personalDetails: []};
const mockLoadMore = jest.fn();

jest.mock('@hooks/useFilteredOptions', () => ({
    __esModule: true,
    default: () => ({
        options: mockFilteredOptions,
        isLoading: false,
        loadMore: mockLoadMore,
        hasMore: false,
        isLoadingMore: false,
    }),
}));

// Keep the personal details reference stable while its data is unchanged, matching the real provider.
const mockPersonalDetails = {};

jest.mock('@components/OnyxListItemProvider', () => ({
    ...jest.requireActual<typeof OnyxListItemProvider>('@components/OnyxListItemProvider'),
    usePersonalDetails: () => mockPersonalDetails,
    useCardList: () => ({}),
    useWorkspaceCardList: () => ({}),
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
            await Onyx.multiSet(
                createMock<OnyxMultiSetInput>({
                    [ONYXKEYS.SESSION]: {
                        accountID: MOCK_ACCOUNT_ID,
                        email: MOCK_EMAIL,
                        authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS,
                    },
                    [ONYXKEYS.BETAS]: [],
                    [ONYXKEYS.COUNTRY_CODE]: CONST.DEFAULT_COUNTRY_CODE,
                }),
            );
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

const EXISTING_CONTACT = createMock<OptionData>({
    text: 'Alice Smith',
    login: 'alice@expensify.com',
    accountID: 100,
    isSelected: false,
    keyForList: 'alice@expensify.com',
});

const SECOND_CONTACT = createMock<OptionData>({
    text: 'Bob Jones',
    login: 'bob@expensify.com',
    accountID: 200,
    isSelected: false,
    keyForList: 'bob@expensify.com',
});

const NON_EXISTING_USER_TO_INVITE = createMock<OptionData>({
    text: 'newuser@gmail.com',
    login: 'newuser@gmail.com',
    accountID: 999999,
    isOptimisticAccount: true,
    isSelected: false,
    keyForList: 'newuser@gmail.com',
});

type UnselectedParticipant = Participant & {isSelected: false; reportID?: undefined; login: 'unselected@example.com'; selected: true};

/** These normal calls keep all three selector contracts honest when multi-select changes a literal false flag. */
function checkUnselectedParticipantContracts(
    base: ReturnType<typeof useSearchSelectorBase<UnselectedParticipant>>,
    web: ReturnType<typeof useSearchSelectorWeb<UnselectedParticipant>>,
    native: ReturnType<typeof useSearchSelectorNative<UnselectedParticipant>>,
) {
    const participant: UnselectedParticipant = {login: 'unselected@example.com', isSelected: false, selected: true};
    const newlySelected = {...participant, isSelected: true} satisfies Omit<UnselectedParticipant, 'isSelected'> & {isSelected: true};
    const baseConfig: Parameters<typeof useSearchSelectorBase<UnselectedParticipant>>[0] = {
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
        initialSelected: [participant],
        onSelectionChange: (options) => {
            for (const option of options) {
                if (option.reportID !== undefined) {
                    continue;
                }
                const login: 'unselected@example.com' = option.login;
                const selected: true = option.selected;
                const flag: boolean = option.isSelected;
                // @ts-expect-error Multi-select may have replaced the caller's false flag with true.
                const unchangedFlag: false = option.isSelected;
                expect([login, selected, flag, unchangedFlag]).toBeDefined();
            }
        },
        onSingleSelect: (option) => {
            if (option.reportID !== undefined) {
                return;
            }
            // @ts-expect-error The callback admits previously rewritten selections as well as unchanged inputs.
            const unchangedFlag: false = option.isSelected;
            expect(unchangedFlag).toBeDefined();
        },
    };
    const webConfig: Parameters<typeof useSearchSelectorWeb<UnselectedParticipant>>[0] = {
        ...baseConfig,
        onSelectionChange: (options) => {
            for (const option of options) {
                if (option.reportID === undefined) {
                    // @ts-expect-error The web callback must include the true overwrite category.
                    const unchangedFlag: false = option.isSelected;
                    expect(unchangedFlag).toBeDefined();
                }
            }
        },
    };
    const nativeConfig: Parameters<typeof useSearchSelectorNative<UnselectedParticipant>>[0] = {
        ...baseConfig,
        onSelectionChange: (options) => {
            for (const option of options) {
                if (option.reportID === undefined) {
                    // @ts-expect-error The native callback must include the true overwrite category.
                    const unchangedFlag: false = option.isSelected;
                    expect(unchangedFlag).toBeDefined();
                }
            }
        },
    };
    baseConfig.onSelectionChange?.([participant, newlySelected]);
    webConfig.onSelectionChange?.([participant, newlySelected]);
    nativeConfig.onSelectionChange?.([participant, newlySelected]);
    baseConfig.onSingleSelect?.(newlySelected);
    webConfig.onSingleSelect?.(newlySelected);
    nativeConfig.onSingleSelect?.(newlySelected);
    base.toggleSelection(participant);
    base.toggleSelection(newlySelected);
    base.setSelectedOptions([participant, newlySelected]);
    web.toggleSelection(participant);
    web.toggleSelection(newlySelected);
    web.setSelectedOptions([participant, newlySelected]);
    native.toggleSelection(participant);
    native.toggleSelection(newlySelected);
    native.setSelectedOptions([participant, newlySelected]);
    for (const option of base.selectedOptions) {
        if (option.reportID === undefined) {
            const login: 'unselected@example.com' = option.login;
            const selected: true = option.selected;
            const flag: boolean = option.isSelected;
            // @ts-expect-error Report absence cannot restore the false-only promise after addition.
            const unchangedFlag: false = option.isSelected;
            expect([login, selected, flag, unchangedFlag]).toBeDefined();
        }
    }
    for (const option of web.selectedOptionsForDisplay) {
        if (option.reportID === undefined) {
            // @ts-expect-error Displayed web selections include the true overwrite category.
            const unchangedFlag: false = option.isSelected;
            expect(unchangedFlag).toBeDefined();
        }
    }
    for (const option of native.selectedNonExistingOptions ?? []) {
        if (option.reportID === undefined) {
            // @ts-expect-error Separated native selections include the true overwrite category.
            const unchangedFlag: false = option.isSelected;
            expect(unchangedFlag).toBeDefined();
        }
    }
}

type UnselectedParticipantUnion =
    | (Participant & {isSelected: false; reportID?: undefined; login: 'first@example.com'; text: 'First participant'})
    | (Participant & {isSelected: false; reportID?: undefined; login: 'second@example.com'; accountID: 321});

/** The one-field overwrite must preserve correlations within each participant union member. */
function checkParticipantUnionContracts(
    base: ReturnType<typeof useSearchSelectorBase<UnselectedParticipantUnion>>,
    web: ReturnType<typeof useSearchSelectorWeb<UnselectedParticipantUnion>>,
    native: ReturnType<typeof useSearchSelectorNative<UnselectedParticipantUnion>>,
) {
    for (const option of [...base.selectedOptions, ...web.selectedOptionsForDisplay, ...(native.selectedNonExistingOptions ?? [])]) {
        if (option.reportID !== undefined) {
            continue;
        }
        if (option.login === 'first@example.com') {
            const text: 'First participant' = option.text;
            expect(text).toBeDefined();
        } else {
            const accountID: 321 = option.accountID;
            expect(accountID).toBeDefined();
        }
    }
}

describe('useSearchSelector selection and non-existing options', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await Onyx.multiSet(
                createMock<OnyxMultiSetInput>({
                    [ONYXKEYS.SESSION]: {
                        accountID: MOCK_ACCOUNT_ID,
                        email: MOCK_EMAIL,
                        authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS,
                    },
                    [ONYXKEYS.BETAS]: [],
                    [ONYXKEYS.COUNTRY_CODE]: CONST.DEFAULT_COUNTRY_CODE,
                }),
            );
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterAll(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it.each([
        {enablePhoneContacts: false, canPickContacts: false},
        {enablePhoneContacts: false, canPickContacts: true},
        {enablePhoneContacts: true, canPickContacts: false},
        {enablePhoneContacts: true, canPickContacts: true},
    ])('preserves native contact integration for %o', async ({enablePhoneContacts, canPickContacts}) => {
        // Given picker capability varies by platform while contact import remains below the real wrapper.
        mockCanPickContacts = canPickContacts;
        const contacts: ReturnType<typeof useContactImport>['contacts'] = [createMock<SearchOption<PersonalDetails>>({accountID: 321, login: 'picked@example.com', keyForList: '321'})];
        const importAndSaveContacts = jest.fn<
            ReturnType<ReturnType<typeof useContactImport>['importAndSaveContacts']>,
            Parameters<ReturnType<typeof useContactImport>['importAndSaveContacts']>
        >();
        const pickContact = jest.fn<ReturnType<ReturnType<typeof useContactImport>['pickContact']>, Parameters<ReturnType<typeof useContactImport>['pickContact']>>();
        const setContactPermissionState = jest.fn<
            ReturnType<ReturnType<typeof useContactImport>['setContactPermissionState']>,
            Parameters<ReturnType<typeof useContactImport>['setContactPermissionState']>
        >();
        jest.mocked(useContactImport).mockReturnValue({contacts, contactPermissionState: RESULTS.DENIED, importAndSaveContacts, pickContact, setContactPermissionState});
        const useNativeSelector = jest.requireActual<{default: typeof useSearchSelectorNative}>('@hooks/useSearchSelector/index.native.ts').default;
        mockGetValidOptions.mockReturnValue({options: EMPTY_OPTIONS, hasMore: false});
        mockFilteredOptions.personalDetails = [];

        // When the actual native wrapper delegates to the real base selector.
        const {result} = renderHook(() =>
            useNativeSelector({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
                enablePhoneContacts,
            }),
        );
        await waitForBatchedUpdatesWithAct();
        const optionsCall = mockGetValidOptions.mock.calls.at(-1);
        expect(optionsCall).toBeDefined();
        expect(optionsCall?.[0].personalDetails).toEqual(enablePhoneContacts ? [{...contacts.at(0), isHydrated: true}] : []);

        // Then disabled integration exposes no contact state and enabled integration retains its exact lower callbacks.
        if (!enablePhoneContacts) {
            expect(result.current.contactState).toBeUndefined();
            return;
        }
        const state = result.current.contactState;
        expect(state).toBeDefined();
        expect(state?.contactOptions).toBe(contacts);
        expect(state?.permissionStatus).toBe(RESULTS.DENIED);
        expect(state?.showImportUI).toBe(true);
        expect(state?.importContacts).toBe(importAndSaveContacts);
        expect(state?.setContactPermissionState).toBe(setContactPermissionState);
        expect(state?.pickContact).toBe(canPickContacts ? pickContact : undefined);
    });

    it('preserves initial participants and truthfully emits the added true selection flag', async () => {
        // Given the caller narrows the real Participant model without adding a report or list key.
        const participant: UnselectedParticipant = {login: 'unselected@example.com', isSelected: false, selected: true};
        const initialSelected = [participant];
        const onSelectionChange = jest.fn<
            ReturnType<NonNullable<Parameters<typeof useSearchSelectorBase<UnselectedParticipant>>[0]['onSelectionChange']>>,
            Parameters<NonNullable<Parameters<typeof useSearchSelectorBase<UnselectedParticipant>>[0]['onSelectionChange']>>
        >();
        mockGetValidOptions.mockReturnValue({options: EMPTY_OPTIONS, hasMore: false});
        const {result} = renderHook(() =>
            useSearchSelectorBase<UnselectedParticipant>({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
                initialSelected,
                shouldSeparateNonExistingSelectedOptions: true,
                onSelectionChange,
            }),
        );
        await waitForBatchedUpdatesWithAct();
        expect(result.current.selectedOptions).toBe(initialSelected);
        expect(result.current.selectedOptions.at(0)).toBe(participant);
        expect(result.current.selectedOptions.at(0)?.isSelected).toBe(false);
        expect(result.current.selectedOptionsForDisplay.at(0)).toBe(participant);
        expect(result.current.selectedNonExistingOptions?.[0]).toBe(participant);

        // When removing the initial selection and adding the same false input exercises the real spread overwrite.
        act(() => result.current.toggleSelection(participant));
        expect(result.current.selectedOptions).toEqual([]);
        expect(onSelectionChange).toHaveBeenLastCalledWith([]);
        act(() => result.current.toggleSelection(participant));

        // Then state, callback and displayed categories contain the rewritten value with every other field intact.
        const option = result.current.selectedOptions.at(0);
        const callback = onSelectionChange.mock.calls.at(-1);
        expect(option).toBeDefined();
        expect(callback).toBeDefined();
        if (!option || !callback || option.reportID !== undefined) {
            throw new Error('The real addition must produce a participant without a report and a selection callback');
        }
        const flag: boolean = option.isSelected;
        expect(flag).toBe(true);
        expect(option).toEqual({...participant, isSelected: true});
        expect(option).not.toBe(participant);
        expect(option).not.toHaveProperty('reportID');
        expect(option).not.toHaveProperty('keyForList');
        expect(callback[0]).toBe(result.current.selectedOptions);
        expect(callback[0].at(0)).toBe(option);
        expect(result.current.selectedOptionsForDisplay.at(0)).toBe(option);
        expect(result.current.selectedNonExistingOptions?.[0]).toBe(option);
        expect(participant).toEqual({login: 'unselected@example.com', isSelected: false, selected: true});
        expect(initialSelected).toEqual([participant]);

        // When toggling the rewritten output, unchanged login identity removes it again.
        act(() => result.current.toggleSelection(option));
        // Then all selected categories and the emitted selection are empty without mutating the input.
        expect(result.current.selectedOptions).toEqual([]);
        expect(result.current.selectedOptionsForDisplay).toEqual([]);
        expect(result.current.selectedNonExistingOptions).toEqual([]);
        expect(onSelectionChange).toHaveBeenLastCalledWith([]);
        expect(participant.isSelected).toBe(false);
    });

    it('forwards the original false participant in single-select mode', async () => {
        // Given single selection forwards caller data and does not create a multi-select state entry.
        const participant: UnselectedParticipant = {login: 'unselected@example.com', isSelected: false, selected: true};
        const onSingleSelect = jest.fn<
            ReturnType<NonNullable<Parameters<typeof useSearchSelectorBase<UnselectedParticipant>>[0]['onSingleSelect']>>,
            Parameters<NonNullable<Parameters<typeof useSearchSelectorBase<UnselectedParticipant>>[0]['onSingleSelect']>>
        >();
        const {result} = renderHook(() => useSearchSelectorBase<UnselectedParticipant>({selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE, onSingleSelect}));
        await waitForBatchedUpdatesWithAct();
        // When the false participant is selected through the production handler.
        act(() => result.current.toggleSelection(participant));
        // Then the callback receives that exact object with its original false flag and no fabricated fields.
        expect(onSingleSelect).toHaveBeenCalledTimes(1);
        expect(onSingleSelect.mock.calls.at(0)?.[0]).toBe(participant);
        expect(participant).toEqual({login: 'unselected@example.com', isSelected: false, selected: true});
        expect(result.current.selectedOptions).toEqual([]);
    });

    it('retains report-less initial participants and toggles by account and login identity', async () => {
        // Given the sanitized participant shape written by ParticipantSearchResults, with no report or list key.
        const participant: Participant = {accountID: EXISTING_CONTACT.accountID, login: EXISTING_CONTACT.login, selected: true, reportID: undefined};
        const onSelectionChange = jest.fn<void, [Array<Participant | OptionData>]>();
        mockGetValidOptions.mockReturnValue({options: {recentReports: [], personalDetails: [EXISTING_CONTACT, SECOND_CONTACT], userToInvite: null, currentUserOption: null}});
        const {result} = renderHook(() =>
            useSearchSelectorBase<Participant>({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
                initialSelected: [participant],
                onSelectionChange,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        // When the hook displays initial state and removes a hydrated option matching that participant.
        expect(result.current.selectedOptions).toEqual([participant]);
        expect(result.current.selectedOptions.at(0)).toBe(participant);
        const webSelected: ReturnType<typeof useSearchSelectorWeb<Participant>>['selectedOptions'] = result.current.selectedOptions;
        const nativeSelected: ReturnType<typeof useSearchSelectorNative<Participant>>['selectedOptions'] = result.current.selectedOptions;
        expect(webSelected).toBe(result.current.selectedOptions);
        expect(nativeSelected).toBe(result.current.selectedOptions);
        expect(result.current.searchOptions.personalDetails.at(0)?.isSelected).toBe(true);
        expect(result.current.availableOptions.personalDetails).toEqual([expect.objectContaining({accountID: SECOND_CONTACT.accountID})]);
        act(() => result.current.toggleSelection(EXISTING_CONTACT));

        // Then removal preserves callbacks and adding a new option preserves its full production shape.
        expect(onSelectionChange).toHaveBeenLastCalledWith([]);
        act(() => result.current.toggleSelection(SECOND_CONTACT));
        expect(onSelectionChange).toHaveBeenLastCalledWith([{...SECOND_CONTACT, isSelected: true}]);
        expect(result.current.selectedOptions).toEqual([{...SECOND_CONTACT, isSelected: true}]);

        // When a report-less selection with a different account has the same login.
        act(() => result.current.toggleSelection({login: SECOND_CONTACT.login, accountID: 999}));
        // Then login identity still removes the selected option without fabricating a report ID.
        expect(result.current.selectedOptions).toEqual([]);
        expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    });

    it.each<{initial: Participant; toggled: Participant; matches: boolean}>([
        {initial: {}, toggled: {}, matches: false},
        {initial: {accountID: 0, reportID: '', login: ''}, toggled: {accountID: 0, reportID: '', login: ''}, matches: false},
        {initial: {accountID: 0, reportID: '123'}, toggled: {accountID: 0, reportID: '123'}, matches: true},
        {initial: {reportID: '', login: 'alice@example.com'}, toggled: {reportID: '', login: 'alice@example.com'}, matches: true},
        {initial: {accountID: 1, reportID: '123'}, toggled: {accountID: 2, reportID: '123'}, matches: true},
        {initial: {accountID: 1, reportID: '123', login: 'alice@example.com'}, toggled: {accountID: 2, reportID: '456', login: 'alice@example.com'}, matches: true},
        {initial: {reportID: '-1'}, toggled: {reportID: '-1'}, matches: false},
        {initial: {reportID: '-1', login: 'alice@example.com'}, toggled: {reportID: '-1', login: 'alice@example.com'}, matches: true},
    ])('preserves falsy identity fallthrough for %o', async ({initial, toggled, matches}) => {
        // Given selected-participant writers allow absent and empty identifiers and placeholder report IDs.
        const {result} = renderHook(() =>
            useSearchSelectorBase<Participant>({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                initialSelected: [initial],
            }),
        );
        await waitForBatchedUpdatesWithAct();
        expect(result.current.selectedOptions.at(0)).toBe(initial);
        // When the real selector tests account, report and login identities in their existing order.
        act(() => result.current.toggleSelection(toggled));
        // Then a later identity can remove selection while empty identities never match each other.
        expect(result.current.selectedOptions).toHaveLength(matches ? 0 : 2);
        if (!matches) {
            expect(result.current.selectedOptions.at(0)).toBe(initial);
            expect(result.current.selectedOptions.at(1)).toEqual({...toggled, isSelected: true});
        }
    });

    it('keeps the default selector selected values typed as complete OptionData', async () => {
        // Given a default consumer such as NewChatPage, whose group draft later supplies a production option.
        expect(checkUnselectedParticipantContracts).toBeDefined();
        expect(checkParticipantUnionContracts).toBeDefined();
        const {result} = renderHook(() => useSearchSelectorBase({selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI}));
        await waitForBatchedUpdatesWithAct();
        // When the group-draft setter supplies options and the result reaches the complete-option consumer contract.
        act(() => result.current.setSelectedOptions([EXISTING_CONTACT]));
        const selected: OptionData[] = result.current.selectedOptions;
        const displayed: OptionData[] = result.current.selectedOptionsForDisplay;
        const webSelected: ReturnType<typeof useSearchSelectorWeb>['selectedOptions'] = selected;
        const nativeSelected: ReturnType<typeof useSearchSelectorNative>['selectedOptions'] = selected;
        // Then the key and report guarantees remain available without an assertion.
        expect(selected).toEqual([EXISTING_CONTACT]);
        expect(displayed).toEqual([EXISTING_CONTACT]);
        expect(webSelected).toBe(selected);
        expect(nativeSelected).toBe(selected);
        expect(selected.at(0)?.keyForList).toBe(EXISTING_CONTACT.keyForList);
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
        mockFilteredOptions.personalDetails = [];

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
        mockFilteredOptions.personalDetails = [EXISTING_CONTACT];

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
        mockFilteredOptions.personalDetails = [{...EXISTING_CONTACT, login: smsLogin, accountID: 300}];

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
        mockFilteredOptions.personalDetails = [EXISTING_CONTACT];

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

    it('keeps an imported contact when the only matching Onyx entry is optimistic', async () => {
        // An optimistic personal detail is filtered out by getValidOptions, so it must not suppress the real device contact.
        mockFilteredOptions.personalDetails = [{...EXISTING_CONTACT, isOptimisticPersonalDetail: true}];

        renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
                contactOptions: [makeDeviceContact('alice@expensify.com', 987654, 'Alice From Phone')],
            }),
        );
        await waitForBatchedUpdatesWithAct();

        const personalDetails = getPersonalDetailsPassedToGetValidOptions();
        const aliceContact = personalDetails.find((option) => option.login === 'alice@expensify.com' && option.accountID === 987654);
        expect(aliceContact).toBeDefined();
    });

    it('keeps all imported contacts when none of them are already known', async () => {
        mockFilteredOptions.personalDetails = [EXISTING_CONTACT];

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

describe('useSearchSelector search term trimming', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockFilteredOptions.personalDetails = [];
        mockGetValidOptions.mockReturnValue({options: EMPTY_OPTIONS, hasMore: false});
        mockGetSearchOptions.mockReturnValue({options: EMPTY_OPTIONS, hasMore: false});
        await act(async () => {
            await Onyx.clear();
            await Onyx.multiSet(
                createMock<OnyxMultiSetInput>({
                    [ONYXKEYS.SESSION]: {accountID: MOCK_ACCOUNT_ID, email: MOCK_EMAIL},
                    [ONYXKEYS.BETAS]: [],
                    [ONYXKEYS.COUNTRY_CODE]: CONST.DEFAULT_COUNTRY_CODE,
                }),
            );
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterAll(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    /** Renders the hook for the given search context and types searchTerm into it, flushing the debounce. */
    async function renderWithSearchTerm(searchContext: typeof CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL | typeof CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_SEARCH, searchTerm: string) {
        jest.useFakeTimers();
        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
                searchContext,
                includeUserToInvite: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        act(() => {
            result.current.setSearchTerm(searchTerm);
        });
        // Advance past the debounce delay (300ms)
        await act(async () => {
            jest.advanceTimersByTime(400);
        });
        await waitForBatchedUpdatesWithAct();
        jest.useRealTimers();
    }

    it('trims a leading space out of the email search string passed to getValidOptions', async () => {
        await renderWithSearchTerm(CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL, ' user@example.com');

        const config = mockGetValidOptions.mock.calls.at(-1)?.[7];
        expect(config?.searchString).toBe('user@example.com');
        expect(config?.searchInputValue).toBe('user@example.com');
    });

    it('trims a trailing space out of the email search string passed to getValidOptions', async () => {
        await renderWithSearchTerm(CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL, 'user@example.com ');

        expect(mockGetValidOptions.mock.calls.at(-1)?.[7]?.searchString).toBe('user@example.com');
    });

    it('trims the search query passed to getSearchOptions', async () => {
        await renderWithSearchTerm(CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_SEARCH, ' user@example.com ');

        expect(mockGetSearchOptions.mock.calls.at(-1)?.[0]?.searchQuery).toBe('user@example.com');
    });

    it('still resolves a padded phone number to its e164 form', async () => {
        await renderWithSearchTerm(CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL, ' +1 (234) 567-8901 ');

        expect(mockGetValidOptions.mock.calls.at(-1)?.[7]?.searchString).toBe('+12345678901');
    });
});

describe('useSearchSelector memoization', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockFilteredOptions.personalDetails = [];
        mockGetValidOptions.mockReturnValue({
            options: {
                ...EMPTY_OPTIONS,
                personalDetails: [EXISTING_CONTACT, SECOND_CONTACT],
            },
            hasMore: false,
        });
        await act(async () => {
            await Onyx.clear();
            await Onyx.multiSet(
                createMock<OnyxMultiSetInput>({
                    [ONYXKEYS.SESSION]: {accountID: MOCK_ACCOUNT_ID, email: MOCK_EMAIL},
                    [ONYXKEYS.BETAS]: [],
                    [ONYXKEYS.COUNTRY_CODE]: CONST.DEFAULT_COUNTRY_CODE,
                }),
            );
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterAll(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('does not recompute the option lists when the parent only passes new callbacks', async () => {
        // Given a selector in multiple selection mode whose onSelectionChange callback can change between renders
        const {result, rerender} = renderHook(
            ({onSelectionChange}: {onSelectionChange: (options: OptionData[]) => void}) =>
                useSearchSelectorBase({
                    selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                    searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
                    onSelectionChange,
                }),
            {initialProps: {onSelectionChange: jest.fn()}},
        );
        await waitForBatchedUpdatesWithAct();
        const getValidOptionsCallCount = mockGetValidOptions.mock.calls.length;
        const initialAvailableOptions = result.current.availableOptions;

        // When the parent re-renders with a new callback reference and no data change
        rerender({onSelectionChange: jest.fn()});
        await waitForBatchedUpdatesWithAct();

        // Then getValidOptions keeps its call count and availableOptions keeps its reference,
        // because changing only onSelectionChange leaves the option inputs unchanged.
        expect(mockGetValidOptions).toHaveBeenCalledTimes(getValidOptionsCallCount);
        expect(result.current.availableOptions).toBe(initialAvailableOptions);
    });

    it('updates the available options when the selection changes', async () => {
        // Given a multi-select search selector with nothing selected
        const {result} = renderHook(() =>
            useSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        // When an option is selected
        act(() => {
            result.current.toggleSelection(EXISTING_CONTACT);
        });
        await waitForBatchedUpdatesWithAct();

        // Then availableOptions.personalDetails is recomputed rather than served stale, excluding the selected contact
        expect(result.current.availableOptions.personalDetails.map((option) => option.login)).not.toContain(EXISTING_CONTACT.login);
    });

    it('does not cancel pending page load when parent re-renders during the debounce window', async () => {
        jest.useFakeTimers();

        // Given a search selector with more options to load and a parent that passes inline callbacks
        mockGetValidOptions.mockReturnValue({
            options: {
                ...EMPTY_OPTIONS,
                personalDetails: [EXISTING_CONTACT, SECOND_CONTACT],
            },
            hasMore: true,
        });

        const {result, rerender} = renderHook(
            ({onSelectionChange}: {onSelectionChange: (options: OptionData[]) => void}) =>
                useSearchSelectorBase({
                    selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                    searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
                    onSelectionChange,
                    maxResultsPerPage: 5,
                }),
            {initialProps: {onSelectionChange: jest.fn()}},
        );
        await waitForBatchedUpdatesWithAct();

        // When onListEndReached starts the 300 ms debounce and the parent renders again after 150 ms
        act(() => {
            result.current.onListEndReached();
        });
        act(() => {
            jest.advanceTimersByTime(150);
        });
        rerender({onSelectionChange: jest.fn()});
        await waitForBatchedUpdatesWithAct();

        // Advance past the remainder of the debounce delay
        await act(async () => {
            jest.advanceTimersByTime(200);
        });
        await waitForBatchedUpdatesWithAct();

        // Then the pending page load completes rather than getting cancelled by the re-render, increasing maxElements from 5 to 10
        expect(mockGetValidOptions.mock.calls.at(-1)?.[7]?.maxElements).toBe(10);

        jest.useRealTimers();
    });
});

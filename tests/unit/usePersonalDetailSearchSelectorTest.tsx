import {act, renderHook} from '@testing-library/react-native';

import usePersonalDetailSearchSelectorBase from '@hooks/usePersonalDetailSearchSelector/base';

import {getValidOptions} from '@libs/PersonalDetailOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxMultiSetInput} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@components/ConfirmedRoute.tsx');

const EMPTY_OPTIONS = {recentOptions: [], personalDetails: [], userToInvite: null, currentUserOption: null, selectedOptions: []};

const MOCK_ACCOUNT_ID = 12345;
const MOCK_EMAIL = 'test@expensify.com';

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@libs/PersonalDetailOptionsListUtils', () => ({
    __esModule: true,
    ...jest.requireActual('@libs/PersonalDetailOptionsListUtils'),
    getValidOptions: jest.fn(() => EMPTY_OPTIONS),
}));

const mockGetValidOptions = jest.mocked(getValidOptions);

const MOCK_PERSONAL_DETAIL_OPTIONS: OptionData[] = [
    {
        text: 'Alice Smith',
        login: 'alice@expensify.com',
        accountID: 100,
        isSelected: false,
        keyForList: 'alice@expensify.com',
    } as OptionData,
    {
        text: 'Bob Jones',
        login: 'bob@expensify.com',
        accountID: 200,
        isSelected: false,
        keyForList: 'bob@expensify.com',
    } as OptionData,
];

jest.mock('@hooks/usePersonalDetailOptions', () => () => ({
    options: MOCK_PERSONAL_DETAIL_OPTIONS,
    currentOption: undefined,
    isLoading: false,
}));

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: () => ({}),
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => () => ({
    accountID: MOCK_ACCOUNT_ID,
    email: MOCK_EMAIL,
}));

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- mock data always has elements
const EXISTING_CONTACT = MOCK_PERSONAL_DETAIL_OPTIONS.at(0)!;

const NON_EXISTING_USER: OptionData = {
    text: 'invitee@gmail.com',
    login: 'invitee@gmail.com',
    accountID: 999999,
    isOptimisticAccount: true,
    isSelected: false,
    keyForList: 'invitee@gmail.com',
} as OptionData;

const SECOND_NON_EXISTING_USER: OptionData = {
    text: 'another@gmail.com',
    login: 'another@gmail.com',
    accountID: 888888,
    isOptimisticAccount: true,
    isSelected: false,
    keyForList: 'another@gmail.com',
} as OptionData;

describe('usePersonalDetailSearchSelector selectedNonExistingOptions', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockGetValidOptions.mockReturnValue({
            ...EMPTY_OPTIONS,
            personalDetails: MOCK_PERSONAL_DETAIL_OPTIONS,
        });
        await act(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {
                    accountID: MOCK_ACCOUNT_ID,
                    email: MOCK_EMAIL,
                    authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS,
                },
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

    it('returns empty selectedNonExistingOptions when no extra options exist', async () => {
        const {result} = renderHook(() =>
            usePersonalDetailSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        expect(result.current.selectedNonExistingOptions).toHaveLength(0);
    });

    it('adds non-existing user to selectedNonExistingOptions after toggleSelection', async () => {
        const {result} = renderHook(() =>
            usePersonalDetailSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                shouldKeepSelectedInAvailableOptions: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        act(() => {
            result.current.toggleSelection(NON_EXISTING_USER);
        });
        await waitForBatchedUpdatesWithAct();

        expect(result.current.selectedNonExistingOptions).toHaveLength(1);
        expect(result.current.selectedNonExistingOptions.at(0)?.login).toBe('invitee@gmail.com');
    });

    it('does not include existing contacts in selectedNonExistingOptions', async () => {
        const {result} = renderHook(() =>
            usePersonalDetailSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                shouldKeepSelectedInAvailableOptions: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        // Select an existing contact
        act(() => {
            result.current.toggleSelection(EXISTING_CONTACT);
        });
        await waitForBatchedUpdatesWithAct();

        // Existing contacts should NOT appear in selectedNonExistingOptions
        expect(result.current.selectedNonExistingOptions).toHaveLength(0);
        // But should be in selectedOptions
        expect(result.current.selectedOptions).toHaveLength(1);
        expect(result.current.selectedOptions.at(0)?.login).toBe('alice@expensify.com');
    });

    it('removes non-existing user from selectedNonExistingOptions after deselection', async () => {
        const {result} = renderHook(() =>
            usePersonalDetailSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                shouldKeepSelectedInAvailableOptions: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        // Select then deselect
        act(() => {
            result.current.toggleSelection(NON_EXISTING_USER);
        });
        await waitForBatchedUpdatesWithAct();
        expect(result.current.selectedNonExistingOptions).toHaveLength(1);

        act(() => {
            result.current.toggleSelection(NON_EXISTING_USER);
        });
        await waitForBatchedUpdatesWithAct();

        expect(result.current.selectedNonExistingOptions).toHaveLength(0);
        expect(result.current.selectedOptions).toHaveLength(0);
    });

    it('handles mix of existing and non-existing selected users', async () => {
        const {result} = renderHook(() =>
            usePersonalDetailSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                shouldKeepSelectedInAvailableOptions: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        act(() => {
            result.current.toggleSelection(EXISTING_CONTACT);
        });
        act(() => {
            result.current.toggleSelection(NON_EXISTING_USER);
        });
        await waitForBatchedUpdatesWithAct();

        // Both should be in selectedOptions
        expect(result.current.selectedOptions).toHaveLength(2);

        // Only the non-existing user should be in selectedNonExistingOptions
        expect(result.current.selectedNonExistingOptions).toHaveLength(1);
        expect(result.current.selectedNonExistingOptions.at(0)?.login).toBe('invitee@gmail.com');
    });

    it('clears selectedNonExistingOptions on resetSelection', async () => {
        const {result} = renderHook(() =>
            usePersonalDetailSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                shouldKeepSelectedInAvailableOptions: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        act(() => {
            result.current.toggleSelection(NON_EXISTING_USER);
        });
        await waitForBatchedUpdatesWithAct();
        expect(result.current.selectedNonExistingOptions).toHaveLength(1);

        act(() => {
            result.current.resetSelection();
        });
        await waitForBatchedUpdatesWithAct();

        expect(result.current.selectedNonExistingOptions).toHaveLength(0);
        expect(result.current.selectedOptions).toHaveLength(0);
    });

    it('filters selectedNonExistingOptions by search term', async () => {
        jest.useFakeTimers();

        const {result} = renderHook(() =>
            usePersonalDetailSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                shouldKeepSelectedInAvailableOptions: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        // Select two non-existing users
        act(() => {
            result.current.toggleSelection(NON_EXISTING_USER);
        });
        act(() => {
            result.current.toggleSelection(SECOND_NON_EXISTING_USER);
        });
        await waitForBatchedUpdatesWithAct();
        expect(result.current.selectedNonExistingOptions).toHaveLength(2);

        // Search for "invitee" - should filter to only the matching non-existing option
        act(() => {
            result.current.setSearchTerm('invitee');
        });
        // Advance past the debounce delay (300ms)
        await act(async () => {
            jest.advanceTimersByTime(400);
        });
        await waitForBatchedUpdatesWithAct();

        expect(result.current.selectedNonExistingOptions).toHaveLength(1);
        expect(result.current.selectedNonExistingOptions.at(0)?.login).toBe('invitee@gmail.com');

        jest.useRealTimers();
    });

    it('shows all selectedNonExistingOptions when search term is empty', async () => {
        const {result} = renderHook(() =>
            usePersonalDetailSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                shouldKeepSelectedInAvailableOptions: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        act(() => {
            result.current.toggleSelection(NON_EXISTING_USER);
        });
        act(() => {
            result.current.toggleSelection(SECOND_NON_EXISTING_USER);
        });
        await waitForBatchedUpdatesWithAct();

        // With empty search, both should be visible
        expect(result.current.selectedNonExistingOptions).toHaveLength(2);
    });

    it('filters selectedNonExistingOptions by text field as well as login', async () => {
        jest.useFakeTimers();

        const userWithCustomText: OptionData = {
            text: 'Custom Name',
            login: 'custom@gmail.com',
            accountID: 777777,
            isOptimisticAccount: true,
            isSelected: false,
            keyForList: 'custom@gmail.com',
        } as OptionData;

        const {result} = renderHook(() =>
            usePersonalDetailSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                shouldKeepSelectedInAvailableOptions: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        act(() => {
            result.current.toggleSelection(userWithCustomText);
        });
        await waitForBatchedUpdatesWithAct();

        // Search by text
        act(() => {
            result.current.setSearchTerm('Custom Name');
        });
        await act(async () => {
            jest.advanceTimersByTime(400);
        });
        await waitForBatchedUpdatesWithAct();

        expect(result.current.selectedNonExistingOptions).toHaveLength(1);
        expect(result.current.selectedNonExistingOptions.at(0)?.text).toBe('Custom Name');

        jest.useRealTimers();
    });

    it('includes non-existing user in selectedNonExistingOptions in single-select mode with shouldUpdateSelectedOptionsOnSingleSelect', async () => {
        const {result} = renderHook(() =>
            usePersonalDetailSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
                shouldUpdateSelectedOptionsOnSingleSelect: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        act(() => {
            result.current.toggleSelection(NON_EXISTING_USER);
        });
        await waitForBatchedUpdatesWithAct();

        expect(result.current.selectedNonExistingOptions).toHaveLength(1);
        expect(result.current.selectedNonExistingOptions.at(0)?.login).toBe('invitee@gmail.com');
        expect(result.current.selectedOptions).toHaveLength(1);
    });

    it('replaces selectedNonExistingOptions when a new non-existing user is selected in single-select mode', async () => {
        const {result} = renderHook(() =>
            usePersonalDetailSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
                shouldUpdateSelectedOptionsOnSingleSelect: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        act(() => {
            result.current.toggleSelection(NON_EXISTING_USER);
        });
        await waitForBatchedUpdatesWithAct();
        expect(result.current.selectedNonExistingOptions.at(0)?.login).toBe('invitee@gmail.com');

        // Selecting a second non-existing user replaces the first in single-select mode
        act(() => {
            result.current.toggleSelection(SECOND_NON_EXISTING_USER);
        });
        await waitForBatchedUpdatesWithAct();

        expect(result.current.selectedNonExistingOptions).toHaveLength(1);
        expect(result.current.selectedNonExistingOptions.at(0)?.login).toBe('another@gmail.com');
        expect(result.current.selectedOptions).toHaveLength(1);
    });

    // -------------------------------------------------------------------------
    // Tests below specifically validate filterOption()-based filtering.
    // They PASS with the new implementation (which delegates to filterOption)
    // but FAIL if reverted to the manual filter:
    //   option.text?.toLowerCase().includes(searchValue) || option.login?.toLowerCase().includes(searchValue)
    // because that filter (a) never deburrs accented characters and (b) tries
    // to match the full multi-word search string against a single field instead
    // of splitting terms and checking each against the combined text+login.
    // -------------------------------------------------------------------------

    it('shows a selected non-existing option when search matches via deburr (accented chars)', async () => {
        // filterOption deburrs before matching: "bjorn" should match "Björn".
        // The old manual filter does a raw .includes() without deburr, so it
        // would NOT match and would hide the option instead.
        jest.useFakeTimers();

        const userWithAccent: OptionData = {
            text: 'Björn',
            login: 'user@example.com', // no accent in login so old filter can't match via login either
            accountID: 654321,
            isOptimisticAccount: true,
            isSelected: false,
            keyForList: 'user@example.com',
        } as OptionData;

        const {result} = renderHook(() =>
            usePersonalDetailSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                shouldKeepSelectedInAvailableOptions: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        act(() => {
            result.current.toggleSelection(userWithAccent);
        });
        await waitForBatchedUpdatesWithAct();

        // Search without the umlaut
        act(() => {
            result.current.setSearchTerm('bjorn');
        });
        await act(async () => {
            jest.advanceTimersByTime(400);
        });
        await waitForBatchedUpdatesWithAct();

        // filterOption deburrs → match; old manual filter → no match → would return 0
        expect(result.current.selectedNonExistingOptions).toHaveLength(1);
        expect(result.current.selectedNonExistingOptions.at(0)?.text).toBe('Björn');

        jest.useRealTimers();
    });

    it('shows a selected non-existing option when multi-word search terms are split across text and login', async () => {
        // filterOption uses processSearchString which splits on spaces and checks
        // each term against the combined "text login" string.
        // "alice smith" → ["alice","smith"]; combined "Alice smith@example.com" contains both.
        // The old manual filter tries text.includes("alice smith") and
        // login.includes("alice smith") — both false — and hides the option.
        jest.useFakeTimers();

        const userAlice: OptionData = {
            text: 'Alice',
            login: 'smith@example.com',
            accountID: 112233,
            isOptimisticAccount: true,
            isSelected: false,
            keyForList: 'smith@example.com',
        } as OptionData;

        const {result} = renderHook(() =>
            usePersonalDetailSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_MULTI,
                shouldKeepSelectedInAvailableOptions: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        act(() => {
            result.current.toggleSelection(userAlice);
        });
        await waitForBatchedUpdatesWithAct();

        // Multi-word: "alice" is in text, "smith" is at the start of login
        act(() => {
            result.current.setSearchTerm('alice smith');
        });
        await act(async () => {
            jest.advanceTimersByTime(400);
        });
        await waitForBatchedUpdatesWithAct();

        // filterOption splits on spaces and matches each term in combined field → found;
        // old filter tries the full string "alice smith" in "Alice" or "smith@example.com" → not found → 0
        expect(result.current.selectedNonExistingOptions).toHaveLength(1);
        expect(result.current.selectedNonExistingOptions.at(0)?.login).toBe('smith@example.com');

        jest.useRealTimers();
    });

    it('clears selectedNonExistingOptions when the same non-existing user is toggled off in single-select mode', async () => {
        const {result} = renderHook(() =>
            usePersonalDetailSearchSelectorBase({
                selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
                shouldUpdateSelectedOptionsOnSingleSelect: true,
            }),
        );
        await waitForBatchedUpdatesWithAct();

        act(() => {
            result.current.toggleSelection(NON_EXISTING_USER);
        });
        await waitForBatchedUpdatesWithAct();
        expect(result.current.selectedNonExistingOptions).toHaveLength(1);

        act(() => {
            result.current.toggleSelection(NON_EXISTING_USER);
        });
        await waitForBatchedUpdatesWithAct();

        expect(result.current.selectedNonExistingOptions).toHaveLength(0);
        expect(result.current.selectedOptions).toHaveLength(0);
    });
});

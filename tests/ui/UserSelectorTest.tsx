import {render} from '@testing-library/react-native';

import {usePersonalDetails} from '@components/OnyxListItemProvider';
import UserSelector from '@components/Search/FilterComponents/UserSelector';
import SelectionList from '@components/SelectionList';

import useOnyx from '@hooks/useOnyx';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import useSearchUserFilters from '@hooks/useSearchUserFilters';

import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList} from '@src/types/onyx';

import React from 'react';

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/UserSelectionListItem', () => jest.fn(() => null));
jest.mock('@components/OnyxListItemProvider', () => ({usePersonalDetails: jest.fn()}));
jest.mock('@hooks/usePersonalDetailSearchSelector', () => jest.fn());
jest.mock('@hooks/useSearchUserFilters', () => jest.fn());
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({email: 'me@expensify.com', accountID: 999})));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({pb0: {}})));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@libs/PolicyUtils', () => ({getExpensifyTeamExclusions: () => ({})}));

describe('UserSelector', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const mockedUsePersonalDetailSearchSelector = jest.mocked(usePersonalDetailSearchSelector);
    const mockedUseSearchUserFilters = jest.mocked(useSearchUserFilters);
    const mockedUsePersonalDetails = jest.mocked(usePersonalDetails);
    const mockedUseOnyx = jest.mocked(useOnyx);

    // Pre-selected rows are only floated to the top once the list reaches STANDARD_LIST_ITEM_LIMIT, so build
    // enough options to exceed that threshold (see moveInitialSelectionToTop in SelectionListOrderUtils).
    const OPTION_COUNT = CONST.STANDARD_LIST_ITEM_LIMIT + 2;
    const keyForIndex = (index: number) => String(100 + index);
    const personalDetailOptions: OptionData[] = Array.from({length: OPTION_COUNT}, (_, index) => ({
        text: `User ${index}`,
        login: `user${index}@example.com`,
        accountID: 100 + index,
        keyForList: keyForIndex(index),
    }));
    const personalDetailsList = Object.fromEntries(personalDetailOptions.map((option) => [option.keyForList, {accountID: option.accountID, login: option.login}])) as PersonalDetailsList;

    // The real hook (with shouldKeepSelectedInAvailableOptions) keeps selected rows inside personalDetails in their
    // natural sorted position, only flipping their `isSelected` flag. The mock mirrors that: the order is constant and
    // selection is derived from the live `initialSelected` set the component passes in (built from the current `value`).
    let currentUserOption: OptionData | null = null;
    const buildSelectorReturn = (config: Parameters<typeof usePersonalDetailSearchSelector>[0]) => {
        const selected = config.initialSelected ?? new Set<string>();
        const selectedOptions = personalDetailOptions.filter((option) => selected.has(String(option.accountID))).map((option) => ({...option, isSelected: true}));
        return {
            searchTerm: '',
            debouncedSearchTerm: '',
            setSearchTerm: jest.fn(),
            selectedOptions,
            availableOptions: {
                selectedOptions: [],
                recentOptions: [],
                personalDetails: personalDetailOptions.map((option) => ({...option, isSelected: selected.has(String(option.accountID))})),
                userToInvite: null,
                extraOptions: [],
                currentUserOption,
            },
            totalOptionsCount: OPTION_COUNT,
            toggleSelection: jest.fn(),
            resetSelection: jest.fn(),
            areOptionsInitialized: true,
            contactState: undefined,
            selectedNonExistingOptions: [],
        } as ReturnType<typeof usePersonalDetailSearchSelector>;
    };

    beforeEach(() => {
        mockedSelectionList.mockClear();
        mockedUsePersonalDetailSearchSelector.mockClear();
        mockedUseSearchUserFilters.mockClear();
        mockedUseOnyx.mockReset().mockReturnValue([undefined, {status: 'loaded'}]);
        currentUserOption = null;
        mockedUsePersonalDetails.mockReturnValue(personalDetailsList);
        mockedUsePersonalDetailSearchSelector.mockImplementation(buildSelectorReturn);
        mockedUseSearchUserFilters.mockReturnValue({
            isSearching: false,
            isLoadingMore: false,
            hasMore: false,
            loadMoreUsers: jest.fn(),
        });
    });

    it('floats pre-selected items to the top on first render', () => {
        const preselectedKey = keyForIndex(10);

        render(
            <UserSelector
                value={[preselectedKey]}
                policyID={undefined}
                onChange={jest.fn()}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: preselectedKey,
                value: preselectedKey,
                isSelected: true,
            }),
        );
        // Everything else stays in its natural sorted order below the pinned row.
        const expectedOrder = [preselectedKey, ...personalDetailOptions.map((option) => option.keyForList).filter((key) => key !== preselectedKey)];
        expect(selectionListProps?.data.map((item) => item.keyForList)).toEqual(expectedOrder);
    });

    it('keeps a row in place when it is toggled after first render (does not jump to the top)', () => {
        const preselectedKey = keyForIndex(10);
        const toggledKey = keyForIndex(3);

        const {rerender} = render(
            <UserSelector
                value={[preselectedKey]}
                policyID={undefined}
                onChange={jest.fn()}
            />,
        );

        // Simulate the user toggling another row on: the parent re-renders the filter with the updated value.
        rerender(
            <UserSelector
                value={[preselectedKey, toggledKey]}
                policyID={undefined}
                onChange={jest.fn()}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];

        // The originally pre-selected row is still pinned to the top.
        expect(selectionListProps?.data.at(0)?.keyForList).toBe(preselectedKey);

        // The newly toggled row is marked selected but stays in its natural sorted position instead of jumping up,
        // because the ordering keys on the snapshot of the value taken on first render (useInitialValue).
        const toggledItem = selectionListProps?.data.find((item) => item.keyForList === toggledKey);
        expect(toggledItem).toEqual(expect.objectContaining({keyForList: toggledKey, isSelected: true}));

        const expectedOrder = [preselectedKey, ...personalDetailOptions.map((option) => option.keyForList).filter((key) => key !== preselectedKey)];
        expect(selectionListProps?.data.map((item) => item.keyForList)).toEqual(expectedOrder);
    });

    it('renders the current user just below the pinned pre-selected rows', () => {
        const preselectedKey = keyForIndex(10);
        currentUserOption = {
            text: 'Me',
            login: 'me@expensify.com',
            accountID: 999,
            keyForList: '999',
        };

        render(
            <UserSelector
                value={[preselectedKey]}
                policyID={undefined}
                onChange={jest.fn()}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)?.keyForList).toBe(preselectedKey);
        expect(selectionListProps?.data.at(1)?.keyForList).toBe('999');
    });

    it('renders a pre-selected public-profile user without a login', () => {
        // Given a search filter containing a user whose public profile does not expose their login
        const publicProfileAccountID = 1000;
        const publicProfileOption: OptionData = {
            text: 'Public profile user',
            accountID: publicProfileAccountID,
            keyForList: String(publicProfileAccountID),
            isSelected: true,
        };
        mockedUsePersonalDetails.mockReturnValue({
            ...personalDetailsList,
            [publicProfileAccountID]: {
                accountID: publicProfileAccountID,
                displayName: publicProfileOption.text,
            },
        });
        mockedUsePersonalDetailSearchSelector.mockImplementation((config) => ({
            ...buildSelectorReturn(config),
            selectedOptions: [publicProfileOption],
        }));

        // When the From selector opens
        render(
            <UserSelector
                value={[String(publicProfileAccountID)]}
                policyID={undefined}
                onChange={jest.fn()}
            />,
        );

        // Then the selected user remains visible so they can be deselected
        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(expect.objectContaining(publicProfileOption));
    });

    it('hides the no-results message while loading, searching, or debouncing and shows it once an empty lookup settles', () => {
        // Given an empty option list
        let searchTerm = '';
        let debouncedSearchTerm = '';
        let areOptionsInitialized = false;
        let isSearching = false;
        mockedUsePersonalDetailSearchSelector.mockImplementation((config) => ({
            ...buildSelectorReturn(config),
            searchTerm,
            debouncedSearchTerm,
            availableOptions: {
                selectedOptions: [],
                recentOptions: [],
                personalDetails: [],
                userToInvite: null,
                extraOptions: [],
                currentUserOption: null,
            },
            areOptionsInitialized,
        }));
        mockedUseSearchUserFilters.mockImplementation(() => ({
            isSearching,
            isLoadingMore: false,
            hasMore: false,
            loadMoreUsers: jest.fn(),
        }));

        // When options are not initialized yet (skeleton showing)
        const {rerender} = render(
            <UserSelector
                value={[]}
                policyID={undefined}
                onChange={jest.fn()}
            />,
        );
        expect(mockedSelectionList.mock.lastCall?.[0]?.textInputOptions?.headerMessage).toBeUndefined();

        // When options are initialized but the server lookup is still in flight
        areOptionsInitialized = true;
        isSearching = true;
        rerender(
            <UserSelector
                value={[]}
                policyID={undefined}
                onChange={jest.fn()}
            />,
        );
        expect(mockedSelectionList.mock.lastCall?.[0]?.textInputOptions?.headerMessage).toBeUndefined();

        // When the lookup has settled but the user typed a new search term that is still debouncing
        isSearching = false;
        searchTerm = 'alice';
        debouncedSearchTerm = '';
        rerender(
            <UserSelector
                value={[]}
                policyID={undefined}
                onChange={jest.fn()}
            />,
        );
        expect(mockedSelectionList.mock.lastCall?.[0]?.textInputOptions?.headerMessage).toBeUndefined();

        // When the debounced search term catches up and the lookup has settled with no results
        debouncedSearchTerm = 'alice';
        rerender(
            <UserSelector
                value={[]}
                policyID={undefined}
                onChange={jest.fn()}
            />,
        );
        expect(mockedSelectionList.mock.lastCall?.[0]?.textInputOptions?.headerMessage).toBe('common.noResultsFound');
    });

    it('merges cached server-scoped logins into workspaceMemberLogins and sorts policyIDs canonically', () => {
        // Given a workspace filter with two policies and cached server-scoped logins in RAM-only Onyx
        const memberEmail = 'member@example.com';
        mockedUseOnyx.mockImplementation((key) => {
            if (key === ONYXKEYS.COLLECTION.POLICY) {
                return [
                    {
                        [`${ONYXKEYS.COLLECTION.POLICY}policy-2`]: {
                            id: 'policy-2',
                            owner: 'owner2@example.com',
                            employeeList: {},
                        },
                        [`${ONYXKEYS.COLLECTION.POLICY}policy-1`]: {
                            id: 'policy-1',
                            owner: 'owner1@example.com',
                            employeeList: {
                                [memberEmail]: {email: memberEmail},
                            },
                        },
                    },
                    {status: 'loaded'},
                ];
            }
            if (key === `${ONYXKEYS.COLLECTION.RAM_ONLY_SEARCH_USER_FILTERS_STATE}policy-1,policy-2`) {
                return [['removed@example.com'], {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        // When UserSelector renders with policies in reverse order
        render(
            <UserSelector
                value={[]}
                policyID={{value: ['policy-2', 'policy-1'], isNegated: false}}
                onChange={jest.fn()}
            />,
        );

        // Then policyIDs are sorted canonically and cached server-scoped logins are included
        expect(mockedUseSearchUserFilters).toHaveBeenLastCalledWith(expect.objectContaining({policyIDs: 'policy-1,policy-2'}));
        const includeLogins = mockedUsePersonalDetailSearchSelector.mock.lastCall?.[0]?.includeLoginsOnly;
        expect(includeLogins).toEqual(new Set(['member@example.com', 'owner1@example.com', 'owner2@example.com', 'removed@example.com']));
    });
});

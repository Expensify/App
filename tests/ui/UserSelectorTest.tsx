import {render} from '@testing-library/react-native';

import {usePersonalDetails} from '@components/OnyxListItemProvider';
import UserSelector from '@components/Search/FilterComponents/UserSelector';
import SelectionList from '@components/SelectionList';

import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';

import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';

import CONST from '@src/CONST';
import type {PersonalDetailsList} from '@src/types/onyx';

import React from 'react';

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/UserSelectionListItem', () => jest.fn(() => null));
jest.mock('@components/OnyxListItemProvider', () => ({usePersonalDetails: jest.fn()}));
jest.mock('@hooks/usePersonalDetailSearchSelector', () => jest.fn());
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
    const mockedUsePersonalDetails = jest.mocked(usePersonalDetails);

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
        return {
            searchTerm: '',
            debouncedSearchTerm: '',
            setSearchTerm: jest.fn(),
            selectedOptions: [],
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
        currentUserOption = null;
        mockedUsePersonalDetails.mockReturnValue(personalDetailsList);
        mockedUsePersonalDetailSearchSelector.mockImplementation(buildSelectorReturn);
    });

    it('floats pre-selected items to the top on first render', () => {
        const preselectedKey = keyForIndex(10);

        render(
            <UserSelector
                value={[preselectedKey]}
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
                onChange={jest.fn()}
            />,
        );

        // Simulate the user toggling another row on: the parent re-renders the filter with the updated value.
        rerender(
            <UserSelector
                value={[preselectedKey, toggledKey]}
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
                onChange={jest.fn()}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)?.keyForList).toBe(preselectedKey);
        expect(selectionListProps?.data.at(1)?.keyForList).toBe('999');
    });
});

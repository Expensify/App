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
        formatPhoneNumber: (phoneNumber: string) => phoneNumber,
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
        currentUserOption = null;
        mockedUsePersonalDetails.mockReturnValue(personalDetailsList);
        mockedUsePersonalDetailSearchSelector.mockImplementation(buildSelectorReturn);
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

    describe('typed emails', () => {
        const typedEmail = 'removed.member@example.com';
        const typedEmailOption: OptionData = {
            text: typedEmail,
            login: typedEmail,
            accountID: 5000,
            keyForList: '5000',
            isOptimisticPersonalDetail: true,
        };

        it('offers a typed email that matches no member when typed emails are allowed', () => {
            // Given the selector finds no member for a typed email, e.g. someone removed from the workspace
            mockedUsePersonalDetailSearchSelector.mockImplementation((config) => {
                const selectorReturn = buildSelectorReturn(config);
                return {
                    ...selectorReturn,
                    totalOptionsCount: 1,
                    availableOptions: {...selectorReturn.availableOptions, personalDetails: [], userToInvite: config.includeUserToInvite ? typedEmailOption : null},
                };
            });

            // When the From selector renders with typed emails allowed
            render(
                <UserSelector
                    value={[]}
                    policyID={undefined}
                    shouldAllowTypedEmail
                    onChange={jest.fn()}
                />,
            );

            // Then the typed email is offered and the search input is shown even for a short list, so an email can be typed
            const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
            expect(selectionListProps?.data.map((item) => item.login)).toEqual([typedEmail]);
            expect(selectionListProps?.textInputOptions).toBeDefined();
        });

        it('does not offer a typed email when typed emails are not allowed', () => {
            // Given a selector used by a filter that only accepts known users, like To
            mockedUsePersonalDetailSearchSelector.mockImplementation((config) => {
                const selectorReturn = buildSelectorReturn(config);
                return {...selectorReturn, availableOptions: {...selectorReturn.availableOptions, personalDetails: [], userToInvite: config.includeUserToInvite ? typedEmailOption : null}};
            });

            // When it renders without typed emails allowed
            render(
                <UserSelector
                    value={[]}
                    policyID={undefined}
                    onChange={jest.fn()}
                />,
            );

            // Then no typed email row is shown
            const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
            expect(selectionListProps?.data).toEqual([]);
        });

        it('stores a selected typed email as the email instead of its optimistic accountID', () => {
            // Given the From selector with typed emails allowed
            const onChange = jest.fn();
            render(
                <UserSelector
                    value={[keyForIndex(1)]}
                    policyID={undefined}
                    shouldAllowTypedEmail
                    onChange={onChange}
                />,
            );

            // When the selector reports a selection that includes a typed email next to a known user
            const config = mockedUsePersonalDetailSearchSelector.mock.lastCall?.[0];
            const knownUserOptions = personalDetailOptions.filter((option) => option.keyForList === keyForIndex(1));
            config?.onSelectionChange?.([keyForIndex(1), String(typedEmailOption.accountID)], [...knownUserOptions, {...typedEmailOption, isSelected: true}]);

            // Then the known user keeps their accountID and the typed email is stored as the email, which the server can resolve
            expect(onChange).toHaveBeenCalledWith([keyForIndex(1), typedEmail]);
        });

        it('keeps a previously typed email selected when the filter reopens', () => {
            // Given a From value that holds a typed email with no personal details
            render(
                <UserSelector
                    value={[typedEmail]}
                    policyID={undefined}
                    shouldAllowTypedEmail
                    onChange={jest.fn()}
                />,
            );

            // When the selector is set up
            const config = mockedUsePersonalDetailSearchSelector.mock.lastCall?.[0];

            // Then the email is passed in as a selected extra option so it shows as selected and can be deselected
            expect(config?.initialExtraOptions).toEqual([expect.objectContaining({login: typedEmail, isSelected: true, isOptimisticPersonalDetail: true})]);
            const extraOptionAccountID = String(config?.initialExtraOptions?.at(0)?.accountID);
            expect(config?.initialSelected?.has(extraOptionAccountID)).toBe(true);
        });
    });
});

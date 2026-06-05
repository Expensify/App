import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import SelectionList from '@components/SelectionList';
import WorkspaceMembersSelectionList from '@components/WorkspaceMembersSelectionList';
import CONST from '@src/CONST';

const mockUseState = React.useState;
const mockPolicy = {
    owner: 'owner@example.com',
    employeeList: Object.fromEntries(
        Array.from({length: CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD + 2}, (_, index) => [
            `user${index}@example.com`,
            {
                email: `user${index}@example.com`,
                role: CONST.POLICY.ROLE.USER,
            },
        ]),
    ),
};
const mockPersonalDetails = Object.fromEntries(
    Array.from({length: CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD + 2}, (_, index) => [
        index + 1,
        {
            accountID: index + 1,
            avatar: '',
            displayName: `User ${index}`,
            login: `user${index}@example.com`,
        },
    ]),
);

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/InviteMemberListItem', () => jest.fn(() => null));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({login: 'current@example.com'})));
jest.mock('@hooks/useDebouncedState', () =>
    jest.fn((initialValue: string) => {
        const [value, setValue] = mockUseState(initialValue);
        return [value, value, setValue];
    }),
);
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({FallbackAvatar: 'fallback-avatar'})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    })),
);
jest.mock('@hooks/useOnyx', () => jest.fn(() => ['US']));
jest.mock('@hooks/usePolicy', () => jest.fn(() => mockPolicy));
jest.mock('@hooks/useScreenWrapperTransitionStatus', () => jest.fn(() => ({didScreenTransitionEnd: true})));
jest.mock('@libs/DeviceCapabilities', () => ({
    canUseTouchScreen: jest.fn(() => false),
}));
jest.mock('@pages/workspace/MemberRightIcon', () => jest.fn(() => null));
jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: jest.fn(() => mockPersonalDetails),
}));

describe('WorkspaceMembersSelectionList', () => {
    const mockedSelectionList = jest.mocked(SelectionList);
    const initialApprover = 'user9@example.com';
    const updatedApprover = 'user8@example.com';

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the initial selected approver to the top and disables mount-time focused scroll', () => {
        render(
            <WorkspaceMembersSelectionList
                policyID="policyID"
                selectedApprover={initialApprover}
                setApprover={jest.fn()}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: initialApprover,
                value: initialApprover,
                isSelected: true,
            }),
        );
        expect(selectionListProps?.initiallyFocusedItemKey).toBe(initialApprover);
        expect(selectionListProps?.searchValueForFocusSync).toBe('');
        expect(selectionListProps?.shouldScrollToFocusedIndexOnMount).toBe(false);
    });

    it('keeps the initial approver pinned while the live selection changes during the same mount', () => {
        const {rerender} = render(
            <WorkspaceMembersSelectionList
                policyID="policyID"
                selectedApprover={initialApprover}
                setApprover={jest.fn()}
            />,
        );

        rerender(
            <WorkspaceMembersSelectionList
                policyID="policyID"
                selectedApprover={updatedApprover}
                setApprover={jest.fn()}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0];
        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: initialApprover,
                isSelected: false,
            }),
        );
        expect(selectionListProps?.data.find((item) => item.keyForList === updatedApprover)).toEqual(
            expect.objectContaining({
                keyForList: updatedApprover,
                isSelected: true,
            }),
        );
    });

    it('keeps natural filtered ordering while search is active', () => {
        render(
            <WorkspaceMembersSelectionList
                policyID="policyID"
                selectedApprover={initialApprover}
                setApprover={jest.fn()}
            />,
        );

        const initialProps = mockedSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('User 1');
        });

        const searchedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(searchedProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: 'user1@example.com',
            }),
        );
        expect(searchedProps?.searchValueForFocusSync).toBe('User 1');
    });
});

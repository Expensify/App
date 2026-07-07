import {act, render} from '@testing-library/react-native';

import ApproverSelectionList from '@components/ApproverSelectionList';
import type {SelectionListApprover} from '@components/ApproverSelectionList';
import SelectionList from '@components/SelectionList';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';
import type {PropsWithChildren} from 'react';

import React from 'react';

const mockUseState = React.useState;
const mockPolicy = {id: 'policyID', owner: 'owner@example.com'} as Policy;

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/InviteMemberListItem', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/BlockingViews/BlockingView', () => jest.fn(() => null));
jest.mock('@components/BlockingViews/FullPageNotFoundView', () => jest.fn(({children}: PropsWithChildren) => children));
jest.mock('@hooks/useDebouncedState', () =>
    jest.fn((initialValue: string) => {
        const [value, setValue] = mockUseState(initialValue);
        return [value, value, setValue];
    }),
);
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn(() => ({TurtleInShell: 'turtle'})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    })),
);
jest.mock('@hooks/useOnyx', () => jest.fn(() => ['US']));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        pb10: {},
        textSupporting: {},
    })),
);
jest.mock('@libs/DeviceCapabilities', () => ({
    canUseTouchScreen: jest.fn(() => false),
}));
jest.mock('@libs/PolicyUtils', () => ({
    goBackFromInvalidPolicy: jest.fn(),
    isPendingDeletePolicy: jest.fn(() => false),
    isPolicyAdmin: jest.fn(() => true),
}));

type MockSelectionListProps = {
    data: SelectionListApprover[];
    initiallyFocusedItemKey?: string;
    shouldScrollToTopOnSelect?: boolean;
    textInputOptions?: {
        onChangeText?: (value: string) => void;
    };
};

const selectedApprover = 'user9@example.com';
const updatedApprover = 'user8@example.com';

function buildApprovers(selectedLogin = selectedApprover) {
    return Array.from({length: CONST.STANDARD_LIST_ITEM_LIMIT + 2}, (_, index): SelectionListApprover => {
        const login = `user${index}@example.com`;

        return {
            text: `User ${index}`,
            alternateText: login,
            keyForList: login,
            value: index,
            login,
            icons: [],
            isSelected: login === selectedLogin,
        };
    });
}

function renderApproverSelectionList(allApprovers = buildApprovers()) {
    return render(
        <ApproverSelectionList
            testID="ApproverSelectionList"
            headerTitle="Approver"
            policy={mockPolicy}
            allApprovers={allApprovers}
            initiallyFocusedOptionKey={selectedApprover}
            onBackButtonPress={jest.fn()}
            onSelectApprover={jest.fn()}
        />,
    );
}

describe('ApproverSelectionList', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('pins the initially selected approver to the top on open', () => {
        renderApproverSelectionList();

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: selectedApprover,
                isSelected: true,
            }),
        );
        expect(selectionListProps?.initiallyFocusedItemKey).toBe(selectedApprover);
        expect(selectionListProps?.shouldScrollToTopOnSelect).toBe(false);
    });

    it('keeps the initial approver pinned while the live selection changes during the same mount', () => {
        const {rerender} = renderApproverSelectionList();

        rerender(
            <ApproverSelectionList
                testID="ApproverSelectionList"
                headerTitle="Approver"
                policy={mockPolicy}
                allApprovers={buildApprovers(updatedApprover)}
                initiallyFocusedOptionKey={updatedApprover}
                onBackButtonPress={jest.fn()}
                onSelectApprover={jest.fn()}
            />,
        );

        const selectionListProps = mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

        expect(selectionListProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: selectedApprover,
                isSelected: false,
            }),
        );
        expect(selectionListProps?.data.find((item) => item.keyForList === updatedApprover)).toEqual(
            expect.objectContaining({
                keyForList: updatedApprover,
                isSelected: true,
            }),
        );
        expect(selectionListProps?.initiallyFocusedItemKey).toBe(selectedApprover);
    });

    it('keeps natural filtered ordering while search is active', () => {
        renderApproverSelectionList();

        const initialProps = mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

        act(() => {
            initialProps?.textInputOptions?.onChangeText?.('User 1');
        });

        const searchedProps = mockedSelectionList.mock.lastCall?.[0] as MockSelectionListProps | undefined;

        expect(searchedProps?.data.at(0)).toEqual(
            expect.objectContaining({
                keyForList: 'user1@example.com',
            }),
        );
    });
});

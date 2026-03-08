import type * as ReactNavigation from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import React from 'react';
import ApproverSelectionList from '@components/ApproverSelectionList';
import SelectionList from '@components/SelectionList';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/BlockingViews/BlockingView', () => jest.fn(() => null));
jest.mock('@components/BlockingViews/FullPageNotFoundView', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@components/ScreenWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@components/SelectionList', () => jest.fn(() => null));
jest.mock('@hooks/useDebouncedState', () => jest.fn((initialValue: string) => [initialValue, initialValue, jest.fn()]));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn(() => ({TurtleInShell: 'turtle'})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        localeCompare: (left: string, right: string) => left.localeCompare(right),
    })),
);
jest.mock('@hooks/useOnyx', () => jest.fn(() => ['US']));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        textSupporting: {},
        pb10: {},
    })),
);
jest.mock('@libs/DeviceCapabilities', () => ({
    canUseTouchScreen: jest.fn(() => true),
}));
jest.mock('@libs/PolicyUtils', () => ({
    goBackFromInvalidPolicy: jest.fn(),
    isPendingDeletePolicy: jest.fn(() => false),
    isPolicyAdmin: jest.fn(() => true),
}));

type ApproverSelectionListProps = React.ComponentProps<typeof ApproverSelectionList>;

function buildApprover(login: string, isSelected = false): NonNullable<ApproverSelectionListProps['allApprovers']>[number] {
    return {
        text: login,
        alternateText: login,
        keyForList: login,
        login,
        isSelected,
    };
}

function buildProps(initiallyFocusedOptionKey?: string): ApproverSelectionListProps {
    return {
        testID: 'ApproverSelectionList',
        headerTitle: 'Approver',
        onBackButtonPress: jest.fn(),
        allApprovers: [buildApprover('first@test.com', initiallyFocusedOptionKey === 'first@test.com'), buildApprover('second@test.com', initiallyFocusedOptionKey === 'second@test.com')],
        initiallyFocusedOptionKey,
        onSelectApprover: jest.fn(),
        policy: {id: 'policyID'} as ApproverSelectionListProps['policy'],
    };
}

describe('ApproverSelectionList', () => {
    const mockedSelectionList = jest.mocked(SelectionList);

    beforeEach(() => {
        mockedSelectionList.mockClear();
    });

    it('keeps the initially focused item key stable while the selected approver changes during the same mount', () => {
        const initialComponentProps = buildProps('first@test.com');
        const {rerender} = render(
            <ApproverSelectionList
                testID={initialComponentProps.testID}
                headerTitle={initialComponentProps.headerTitle}
                onBackButtonPress={initialComponentProps.onBackButtonPress}
                allApprovers={initialComponentProps.allApprovers}
                initiallyFocusedOptionKey={initialComponentProps.initiallyFocusedOptionKey}
                onSelectApprover={initialComponentProps.onSelectApprover}
                policy={initialComponentProps.policy}
            />,
        );

        const initialProps = mockedSelectionList.mock.lastCall?.[0];
        expect(initialProps?.initiallyFocusedItemKey).toBe('first@test.com');
        expect(initialProps?.data.at(0)?.keyForList).toBe('first@test.com');

        const updatedComponentProps = buildProps('second@test.com');
        rerender(
            <ApproverSelectionList
                testID={updatedComponentProps.testID}
                headerTitle={updatedComponentProps.headerTitle}
                onBackButtonPress={updatedComponentProps.onBackButtonPress}
                allApprovers={updatedComponentProps.allApprovers}
                initiallyFocusedOptionKey={updatedComponentProps.initiallyFocusedOptionKey}
                onSelectApprover={updatedComponentProps.onSelectApprover}
                policy={updatedComponentProps.policy}
            />,
        );

        const updatedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(updatedProps?.initiallyFocusedItemKey).toBe('first@test.com');
        expect(updatedProps?.data.at(0)?.keyForList).toBe('first@test.com');
        expect(updatedProps?.data.find((item) => item.keyForList === 'second@test.com')?.isSelected).toBe(true);
    });

    it('refreshes the initially focused item key when the list is reopened', () => {
        const initialComponentProps = buildProps('first@test.com');
        const {unmount} = render(
            <ApproverSelectionList
                testID={initialComponentProps.testID}
                headerTitle={initialComponentProps.headerTitle}
                onBackButtonPress={initialComponentProps.onBackButtonPress}
                allApprovers={initialComponentProps.allApprovers}
                initiallyFocusedOptionKey={initialComponentProps.initiallyFocusedOptionKey}
                onSelectApprover={initialComponentProps.onSelectApprover}
                policy={initialComponentProps.policy}
            />,
        );
        unmount();
        mockedSelectionList.mockClear();

        const reopenedComponentProps = buildProps('second@test.com');
        render(
            <ApproverSelectionList
                testID={reopenedComponentProps.testID}
                headerTitle={reopenedComponentProps.headerTitle}
                onBackButtonPress={reopenedComponentProps.onBackButtonPress}
                allApprovers={reopenedComponentProps.allApprovers}
                initiallyFocusedOptionKey={reopenedComponentProps.initiallyFocusedOptionKey}
                onSelectApprover={reopenedComponentProps.onSelectApprover}
                policy={reopenedComponentProps.policy}
            />,
        );

        const reopenedProps = mockedSelectionList.mock.lastCall?.[0];
        expect(reopenedProps?.initiallyFocusedItemKey).toBe('second@test.com');
        expect(reopenedProps?.data.find((item) => item.keyForList === 'second@test.com')?.isSelected).toBe(true);
    });
});

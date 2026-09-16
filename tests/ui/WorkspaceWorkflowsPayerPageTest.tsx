import {act, render} from '@testing-library/react-native';

import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';

import WorkspaceWorkflowsPayerPage from '@pages/workspace/workflows/WorkspaceWorkflowsPayerPage';

import type {PersonalDetailsList, Policy} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');
    return {
        ...actualNavigation,
        // No-op focus effect: useInitialSelection still freezes via its useState seed, which is what we assert on.
        useFocusEffect: jest.fn(),
    };
});

// The HOC injects policy/personalDetails from Onyx; the test injects them directly instead.
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => (component: unknown) => component);
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/BlockingViews/FullPageNotFoundView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/HeaderWithBackButton', () => jest.fn(() => null));
jest.mock('@pages/workspace/workflows/WorkspaceWorkflowsPayerSuccessPage', () => jest.fn(() => null));
jest.mock('@components/SelectionList/SelectionListWithSections', () => jest.fn(() => null));
jest.mock('@components/SelectionList/ListItem/UserListItem', () => jest.fn(() => null));

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined]));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useConfirmModal', () => jest.fn(() => ({showConfirmModal: jest.fn(), closeModal: jest.fn()})));
jest.mock('@hooks/usePressLoading', () => jest.fn(() => ({isLoading: false, startWithLoading: jest.fn()})));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn(() => ({accountID: 1, login: 'owner@test.com'})));
jest.mock('@hooks/usePersonalDetailByLogin', () => jest.fn(() => 'Display Name'));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: jest.fn(() => ({FallbackAvatar: 'FallbackAvatar'}))}));
jest.mock('@libs/BankAccountUtils', () => ({isBankAccountPartiallySetup: jest.fn(() => false)}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
        formatPhoneNumber: (value: string) => value,
    })),
);
jest.mock('@libs/PolicyUtils', () => {
    const actual = jest.requireActual('@libs/PolicyUtils');
    return {
        ...actual,
        canMemberWrite: jest.fn(() => true),
        isExpensifyTeam: jest.fn(() => false),
        isPendingDeletePolicy: jest.fn(() => false),
        goBackFromInvalidPolicy: jest.fn(),
        getMemberAccountIDsForWorkspace: jest.fn(() => ({'payer@test.com': 2, 'admin@test.com': 3})),
    };
});

type MockMember = {keyForList: string; accountID: number; isSelected?: boolean};
type MockSection = {data: MockMember[]};

type MockSectionsListProps = {
    sections: MockSection[];
    onSelectRow: (item: MockMember) => void;
    shouldUpdateFocusedIndex?: boolean;
    initiallyFocusedItemKey?: string;
};

const PERSONAL_DETAILS = {
    2: {accountID: 2, login: 'payer@test.com', displayName: 'Payer'},
    3: {accountID: 3, login: 'admin@test.com', displayName: 'Admin'},
} as unknown as PersonalDetailsList;

const POLICY = {
    id: 'policy1',
    owner: 'owner@test.com',
    ownerAccountID: 1,
    reimbursementChoice: 'reimburseManual',
    achAccount: {reimburser: 'payer@test.com', bankAccountID: 55, state: 'OPEN'},
    employeeList: {
        'payer@test.com': {role: 'admin'},
        'admin@test.com': {role: 'admin'},
    },
} as unknown as Policy;

function pageElement() {
    return (
        <WorkspaceWorkflowsPayerPage
            policy={POLICY}
            personalDetails={PERSONAL_DETAILS}
            isLoadingReportData={false}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only route.params.policyID is read
            route={{params: {policyID: 'policy1'}} as never}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- navigation object is unused in this test
            navigation={{} as never}
        />
    );
}

describe('WorkspaceWorkflowsPayerPage', () => {
    const mockedList = jest.mocked(SelectionListWithSections);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- narrows the props captured from the mocked list in this test
    const getListProps = () => mockedList.mock.lastCall?.[0] as MockSectionsListProps | undefined;

    beforeEach(() => {
        mockedList.mockClear();
    });

    it('pins the initially selected payer to the top section on open', () => {
        render(pageElement());

        const props = getListProps();
        // First (untitled) section holds the frozen initial payer.
        expect(props?.sections.at(0)?.data.at(0)?.keyForList).toBe('2');
        expect(props?.sections.at(0)?.data.at(0)?.isSelected).toBe(true);
        expect(props?.initiallyFocusedItemKey).toBe('2');
        expect(props?.shouldUpdateFocusedIndex).toBe(true);
    });

    it('keeps the initial payer pinned in the top section while the live selection changes', () => {
        render(pageElement());

        // Simulate the user picking a different admin; the frozen section placement must not jump.
        act(() => {
            getListProps()?.onSelectRow({keyForList: '3', accountID: 3});
        });

        const props = getListProps();
        // The initial payer is still alone at the top section...
        expect(props?.sections.at(0)?.data.at(0)?.keyForList).toBe('2');
        expect(props?.sections.at(0)?.data.at(0)?.isSelected).toBe(false);
        // ...and the newly picked admin only got the checkmark, staying in the admins section.
        const admin = props?.sections.at(1)?.data.find((member) => member.keyForList === '3');
        expect(admin?.isSelected).toBe(true);
    });
});

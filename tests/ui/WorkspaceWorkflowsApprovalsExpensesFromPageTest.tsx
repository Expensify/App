import type * as ReactNavigation from '@react-navigation/native';
import {act, render} from '@testing-library/react-native';
import React from 'react';
import ApproverSelectionList from '@components/ApproverSelectionList';
import {setApprovalWorkflowMembers} from '@libs/actions/Workflow';
import Navigation from '@libs/Navigation/Navigation';
import {WorkspaceWorkflowsApprovalsExpensesFromPage} from '@pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsExpensesFromPage';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useFocusEffect: jest.fn(),
    };
});

jest.mock('@components/ApproverSelectionList', () => jest.fn(() => null));
jest.mock('@components/Text', () => jest.fn(() => null));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({FallbackAvatar: 'fallback-avatar'})),
}));
jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);
jest.mock('@hooks/useOnyx', () =>
    jest.fn((key: string) => {
        if (key === 'approvalWorkflow') {
            return [
                {
                    action: 'create',
                    isInitialFlow: true,
                    approvers: [{email: 'approver@test.com'}],
                    originalApprovers: [{email: 'approver@test.com'}],
                    members: [{displayName: 'Selected User', avatar: 'selected-avatar', email: 'selected@test.com'}],
                    availableMembers: [
                        {displayName: 'Available User', avatar: 'available-avatar', email: 'available@test.com'},
                        {displayName: 'Other User', avatar: 'other-avatar', email: 'other@test.com'},
                    ],
                },
                {},
            ];
        }

        return [undefined, {}];
    }),
);
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        flexReset: {},
        flexGrow0: {},
        flexShrink0: {},
        flexBasisAuto: {},
        textHeadlineH1: {},
        mh5: {},
        mv3: {},
    })),
);
jest.mock('@libs/actions/Workflow', () => ({
    setApprovalWorkflowMembers: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));
jest.mock('@libs/PolicyUtils', () => ({
    getMemberAccountIDsForWorkspace: jest.fn(() => {
        const policyMemberEmailsToAccountIDs = {} as Record<string, number>;
        policyMemberEmailsToAccountIDs['selected@test.com'] = 1;
        policyMemberEmailsToAccountIDs['available@test.com'] = 2;
        policyMemberEmailsToAccountIDs['other@test.com'] = 3;
        policyMemberEmailsToAccountIDs['approver@test.com'] = 4;

        return policyMemberEmailsToAccountIDs;
    }),
    isPendingDeletePolicy: jest.fn(() => false),
    isPolicyAdmin: jest.fn(() => true),
}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@pages/workspace/MemberRightIcon', () => jest.fn(() => null));
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => {
    const esModuleProperty = '__esModule';

    return {
        [esModuleProperty]: true,
        default: (Component: typeof WorkspaceWorkflowsApprovalsExpensesFromPage) => Component,
    };
});
jest.mock('@src/types/utils/isLoadingOnyxValue', () => jest.fn(() => false));

type PageProps = React.ComponentProps<typeof WorkspaceWorkflowsApprovalsExpensesFromPage>;

function buildPageProps(): PageProps {
    const employeeList = {} as NonNullable<PageProps['policy']>['employeeList'];
    employeeList['selected@test.com'] = {email: 'selected@test.com', role: 'admin'};
    employeeList['available@test.com'] = {email: 'available@test.com', role: 'user'};
    employeeList['other@test.com'] = {email: 'other@test.com', role: 'user'};
    employeeList['approver@test.com'] = {email: 'approver@test.com', role: 'admin'};

    return {
        policy: {
            id: 'policyID',
            employeeList,
            owner: 'owner@test.com',
            preventSelfApproval: true,
        } as PageProps['policy'],
        isLoadingReportData: false,
        route: {
            key: '',
            name: '',
            params: {policyID: 'policyID'},
        } as never,
        navigation: {} as never,
    };
}

function getApproverEmails(componentProps: React.ComponentProps<typeof ApproverSelectionList> | undefined): string[] {
    return componentProps?.allApprovers.map((approver) => approver.login ?? '') ?? [];
}

describe('WorkspaceWorkflowsApprovalsExpensesFromPage', () => {
    const mockedApproverSelectionList = jest.mocked(ApproverSelectionList);
    const mockedSetApprovalWorkflowMembers = jest.mocked(setApprovalWorkflowMembers);
    const mockedNavigation = jest.mocked(Navigation);

    beforeEach(() => {
        mockedApproverSelectionList.mockClear();
        mockedSetApprovalWorkflowMembers.mockClear();
        mockedNavigation.navigate.mockClear();
        mockedNavigation.goBack.mockClear();
    });

    it('keeps the same row order when selecting a new available member', () => {
        const pageProps = buildPageProps();

        render(
            <WorkspaceWorkflowsApprovalsExpensesFromPage
                policy={pageProps.policy}
                isLoadingReportData={pageProps.isLoadingReportData}
                route={pageProps.route}
                navigation={pageProps.navigation}
            />,
        );

        const initialProps = mockedApproverSelectionList.mock.lastCall?.[0];
        expect(getApproverEmails(initialProps)).toEqual(['selected@test.com', 'available@test.com', 'other@test.com']);
        expect(initialProps?.allApprovers.map((approver) => approver.isSelected)).toEqual([true, false, false]);

        act(() => {
            initialProps?.onSelectApprover?.([
                initialProps.allApprovers.at(0),
                {...initialProps.allApprovers.at(1), isSelected: true},
            ]);
        });

        const updatedProps = mockedApproverSelectionList.mock.lastCall?.[0];
        expect(getApproverEmails(updatedProps)).toEqual(['selected@test.com', 'available@test.com', 'other@test.com']);
        expect(updatedProps?.allApprovers.map((approver) => approver.isSelected)).toEqual([true, true, false]);
    });

    it('keeps deselected initial members in place and only updates their selected state', () => {
        const pageProps = buildPageProps();

        render(
            <WorkspaceWorkflowsApprovalsExpensesFromPage
                policy={pageProps.policy}
                isLoadingReportData={pageProps.isLoadingReportData}
                route={pageProps.route}
                navigation={pageProps.navigation}
            />,
        );

        const initialProps = mockedApproverSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.onSelectApprover?.([]);
        });

        const updatedProps = mockedApproverSelectionList.mock.lastCall?.[0];
        expect(getApproverEmails(updatedProps)).toEqual(['selected@test.com', 'available@test.com', 'other@test.com']);
        expect(updatedProps?.allApprovers.map((approver) => approver.isSelected)).toEqual([false, false, false]);
    });

    it('saves the currently selected members from the stable base list', () => {
        const pageProps = buildPageProps();

        render(
            <WorkspaceWorkflowsApprovalsExpensesFromPage
                policy={pageProps.policy}
                isLoadingReportData={pageProps.isLoadingReportData}
                route={pageProps.route}
                navigation={pageProps.navigation}
            />,
        );

        const initialProps = mockedApproverSelectionList.mock.lastCall?.[0];

        act(() => {
            initialProps?.onSelectApprover?.([
                initialProps.allApprovers.at(0),
                {...initialProps.allApprovers.at(1), isSelected: true},
            ]);
        });

        const updatedProps = mockedApproverSelectionList.mock.lastCall?.[0];
        const footerContent = updatedProps?.footerContent as React.ReactElement<{onSubmit: () => void}>;

        act(() => {
            footerContent.props.onSubmit();
        });

        expect(mockedSetApprovalWorkflowMembers).toHaveBeenCalledWith([
            {displayName: 'Selected User', avatar: 'selected-avatar', email: 'selected@test.com'},
            {displayName: 'Available User', avatar: 'available-avatar', email: 'available@test.com'},
        ]);
        expect(mockedNavigation.navigate).toHaveBeenCalled();
    });
});

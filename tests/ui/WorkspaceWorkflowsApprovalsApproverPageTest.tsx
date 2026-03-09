import type * as ReactNavigation from '@react-navigation/native';
import {render} from '@testing-library/react-native';
import React from 'react';
import ApproverSelectionList from '@components/ApproverSelectionList';
import {WorkspaceWorkflowsApprovalsApproverPage} from '@pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsApproverPage';
import SCREENS from '@src/SCREENS';

jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useNavigationState: jest.fn((selector: (state: {routes: Array<{name: string}>}) => unknown) => selector({routes: [{name: 'root'}]})),
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
                    approvers: [{email: 'selected@test.com'}],
                    action: 'edit',
                    isDefault: false,
                    members: [],
                },
                {},
            ];
        }

        return [undefined, {}];
    }),
);
jest.mock('@hooks/usePersonalDetailsByEmail', () => jest.fn(() => ({})));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        textHeadlineH1: {},
        mh5: {},
        mv3: {},
        mb3: {},
        textSupporting: {},
    })),
);
jest.mock('@libs/actions/Workflow', () => ({
    clearApprovalWorkflowApprover: jest.fn(),
    clearApprovalWorkflowApprovers: jest.fn(),
    setApprovalWorkflowApprover: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));
jest.mock('@libs/PolicyUtils', () => ({
    getDefaultApprover: jest.fn(() => undefined),
    getMemberAccountIDsForWorkspace: jest.fn(() => {
        const policyMemberEmailsToAccountIDs = {} as Record<string, number>;
        policyMemberEmailsToAccountIDs['selected@test.com'] = 1;
        policyMemberEmailsToAccountIDs['other@test.com'] = 2;

        return policyMemberEmailsToAccountIDs;
    }),
}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@pages/workspace/MemberRightIcon', () => jest.fn(() => null));
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => {
    const esModuleProperty = '__esModule';

    return {
        [esModuleProperty]: true,
        default: (Component: typeof WorkspaceWorkflowsApprovalsApproverPage) => Component,
    };
});
jest.mock('@src/types/utils/isLoadingOnyxValue', () => jest.fn(() => false));

type PageProps = React.ComponentProps<typeof WorkspaceWorkflowsApprovalsApproverPage>;

function buildPageProps(routeName: typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER | typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER_CHANGE): PageProps {
    const employeeList = {} as NonNullable<NonNullable<PageProps['policy']>['employeeList']>;
    employeeList['selected@test.com'] = {email: 'selected@test.com', role: 'admin'};
    employeeList['other@test.com'] = {email: 'other@test.com', role: 'user'};

    const personalDetails = {} as NonNullable<PageProps['personalDetails']>;
    personalDetails[1] = {accountID: 1, avatar: '', displayName: 'Selected User', login: 'selected@test.com'};
    personalDetails[2] = {accountID: 2, avatar: '', displayName: 'Other User', login: 'other@test.com'};

    return {
        policy: {
            id: 'policyID',
            employeeList,
            owner: 'owner@test.com',
            preventSelfApproval: false,
        } as PageProps['policy'],
        policyDraft: undefined,
        isLoadingPolicy: false,
        personalDetails,
        isLoadingReportData: false,
        route: {
            key: '',
            name: routeName,
            params: {policyID: 'policyID', approverIndex: 0},
        } as never,
        navigation: {} as never,
    };
}

describe('WorkspaceWorkflowsApprovalsApproverPage', () => {
    const mockedApproverSelectionList = jest.mocked(ApproverSelectionList);

    beforeEach(() => {
        mockedApproverSelectionList.mockClear();
    });

    it('disables click-driven focused index updates on the approver-change route', () => {
        const pageProps = buildPageProps(SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER_CHANGE);

        render(
            <WorkspaceWorkflowsApprovalsApproverPage
                policy={pageProps.policy}
                policyDraft={pageProps.policyDraft}
                isLoadingPolicy={pageProps.isLoadingPolicy}
                personalDetails={pageProps.personalDetails}
                isLoadingReportData={pageProps.isLoadingReportData}
                route={pageProps.route}
                navigation={pageProps.navigation}
            />,
        );

        const approverSelectionListProps = mockedApproverSelectionList.mock.lastCall?.[0];
        expect(approverSelectionListProps?.shouldUpdateFocusedIndex).toBe(false);
        expect(approverSelectionListProps?.initiallyFocusedOptionKey).toBe('selected@test.com');
    });

    it('disables click-driven focused index updates on the approver route as well', () => {
        const pageProps = buildPageProps(SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER);

        render(
            <WorkspaceWorkflowsApprovalsApproverPage
                policy={pageProps.policy}
                policyDraft={pageProps.policyDraft}
                isLoadingPolicy={pageProps.isLoadingPolicy}
                personalDetails={pageProps.personalDetails}
                isLoadingReportData={pageProps.isLoadingReportData}
                route={pageProps.route}
                navigation={pageProps.navigation}
            />,
        );

        const approverSelectionListProps = mockedApproverSelectionList.mock.lastCall?.[0];
        expect(approverSelectionListProps?.shouldUpdateFocusedIndex).toBe(false);
        expect(approverSelectionListProps?.initiallyFocusedOptionKey).toBe('selected@test.com');
    });
});

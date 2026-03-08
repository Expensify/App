import {render} from '@testing-library/react-native';
import React from 'react';
import ApproverSelectionList from '@components/ApproverSelectionList';
import {WorkspaceWorkflowsApprovalsOverLimitApproverPage} from '@pages/workspace/workflows/approvals/WorkspaceWorkflowsApprovalsOverLimitApproverPage';

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
                    approvers: [{email: 'current@test.com', overLimitForwardsTo: 'selected@test.com'}],
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
    })),
);
jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
}));
jest.mock('@libs/PolicyUtils', () => ({
    getMemberAccountIDsForWorkspace: jest.fn(() => {
        const policyMemberEmailsToAccountIDs = {} as Record<string, number>;
        policyMemberEmailsToAccountIDs['current@test.com'] = 1;
        policyMemberEmailsToAccountIDs['selected@test.com'] = 2;
        policyMemberEmailsToAccountIDs['other@test.com'] = 3;

        return policyMemberEmailsToAccountIDs;
    }),
}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => jest.fn(({children}: {children: React.ReactNode}) => children));
jest.mock('@pages/workspace/MemberRightIcon', () => jest.fn(() => null));
jest.mock('@pages/workspace/withPolicyAndFullscreenLoading', () => {
    const esModuleProperty = '__esModule';

    return {
        [esModuleProperty]: true,
        default: (Component: typeof WorkspaceWorkflowsApprovalsOverLimitApproverPage) => Component,
    };
});
jest.mock('@src/types/utils/isLoadingOnyxValue', () => jest.fn(() => false));

type PageProps = React.ComponentProps<typeof WorkspaceWorkflowsApprovalsOverLimitApproverPage>;

function buildPageProps(): PageProps {
    const employeeList = {} as NonNullable<PageProps['policy']>['employeeList'];
    employeeList['current@test.com'] = {email: 'current@test.com', role: 'admin'};
    employeeList['selected@test.com'] = {email: 'selected@test.com', role: 'user'};
    employeeList['other@test.com'] = {email: 'other@test.com', role: 'user'};

    const personalDetails = {} as PageProps['personalDetails'];
    personalDetails[1] = {avatar: '', displayName: 'Current User', login: 'current@test.com'};
    personalDetails[2] = {avatar: '', displayName: 'Selected User', login: 'selected@test.com'};
    personalDetails[3] = {avatar: '', displayName: 'Other User', login: 'other@test.com'};

    return {
        policy: {
            id: 'policyID',
            employeeList,
            owner: 'owner@test.com',
            preventSelfApproval: false,
        } as PageProps['policy'],
        personalDetails,
        isLoadingReportData: false,
        route: {
            key: '',
            name: '',
            params: {policyID: 'policyID', approverIndex: 0},
        } as never,
        navigation: {} as never,
    };
}

describe('WorkspaceWorkflowsApprovalsOverLimitApproverPage', () => {
    const mockedApproverSelectionList = jest.mocked(ApproverSelectionList);

    beforeEach(() => {
        mockedApproverSelectionList.mockClear();
    });

    it('disables click-driven focused index updates and preserves the focused approver key', () => {
        const pageProps = buildPageProps();

        render(
            <WorkspaceWorkflowsApprovalsOverLimitApproverPage
                policy={pageProps.policy}
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

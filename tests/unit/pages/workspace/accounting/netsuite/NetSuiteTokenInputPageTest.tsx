import {render, screen} from '@testing-library/react-native';

import {isAuthenticationError} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';

import NetSuiteTokenInputPage from '@pages/workspace/accounting/netsuite/NetSuiteTokenInput/NetSuiteTokenInputPage';
import type {CustomSubPageTokenInputProps} from '@pages/workspace/accounting/netsuite/types';

import CONST from '@src/CONST';
import type Policy from '@src/types/onyx/Policy';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

const POLICY_ID = '123';
const PAGE_NAME = CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME;

type RouteParams = {
    policyID: string;
    subPage: string;
    authType?: string;
    isMigration?: string;
};

type MockStepHeaderProps = {
    stepNames: readonly string[];
};

// `Mock`-prefixed bindings are allowed inside jest.mock factories, unlike regular imports.
const MockView = View;

// The route is shared between the `route` prop and `useRoute()`, which `useSubPage` reads.
const mockRoute: {current: {key: string; name: string; params: RouteParams}} = {
    current: {key: 'test-route', name: 'Workspace_Accounting_NetSuite_Token_Input', params: {policyID: POLICY_ID, subPage: PAGE_NAME.INSTALL}},
};
const mockStepNames: {current: readonly string[] | undefined} = {current: undefined};
const mockCapturedOnNext: {current: (() => void) | undefined} = {current: undefined};
const mockCapturedShouldBeBlocked: {current: boolean | undefined} = {current: undefined};

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));
jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);
jest.mock('@libs/actions/connections', () => ({
    isAuthenticationError: jest.fn(() => false),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dismissModal: jest.fn(),
}));
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useRoute: () => mockRoute.current,
    useNavigation: () => ({setParams: jest.fn()}),
}));
jest.mock('@pages/workspace/withPolicyConnections', () => (Component: React.ComponentType) => Component);
jest.mock('@components/ConnectionLayout', () => ({children, shouldBeBlocked}: {children: React.ReactNode; shouldBeBlocked?: boolean}) => {
    mockCapturedShouldBeBlocked.current = shouldBeBlocked;
    return children;
});
jest.mock('@components/InteractiveStepSubPageHeader', () => ({stepNames}: MockStepHeaderProps) => {
    mockStepNames.current = stepNames;
    return null;
});
jest.mock(
    '@pages/workspace/accounting/netsuite/NetSuiteTokenInput/subPages/NetSuiteTokenInputForm',
    () =>
        ({isOAuthFlow, shouldShowTokenAuthenticationLink}: CustomSubPageTokenInputProps) => (
            <>
                <MockView testID={isOAuthFlow ? 'oauth-form' : 'token-form'} />
                {shouldShowTokenAuthenticationLink && <MockView testID="token-authentication-link" />}
            </>
        ),
);
jest.mock('@pages/workspace/accounting/netsuite/NetSuiteTokenInput/subPages/NetSuiteTokenSetupContent', () => ({onNext}: CustomSubPageTokenInputProps) => {
    mockCapturedOnNext.current = onNext;
    return null;
});

const mockedIsAuthenticationError = jest.mocked(isAuthenticationError);

function buildNetsuitePolicy(tokenID: string, authType?: ValueOf<typeof CONST.NETSUITE_CONFIG.TOKEN_INPUT.AUTH_TYPE>): Policy {
    return {
        id: POLICY_ID,
        name: '',
        role: CONST.POLICY.ROLE.ADMIN,
        type: CONST.POLICY.TYPE.TEAM,
        owner: '',
        outputCurrency: 'USD',
        connections: {
            netsuite: {
                accountID: 'NS_ACCOUNT',
                tokenID,
                tokenSecret: '',
                verified: false,
                lastSyncDate: '',
                lastErrorSyncDate: '',
                options: {
                    data: {customLists: [], subsidiaryList: [], payableList: []},
                    config: {
                        exportToNextOpenPeriod: false,
                        reimbursableExpensesExportDestination: 'EXPENSE_REPORT',
                        subsidiary: '',
                        autoCreateEntities: false,
                        nonreimbursableExpensesExportDestination: 'VENDOR_BILL',
                        reimbursablePayableAccount: '',
                        approvalAccount: '',
                        payableAcct: '',
                        syncOptions: {
                            mapping: {classes: 'NETSUITE_DEFAULT', jobs: 'NETSUITE_DEFAULT', locations: 'NETSUITE_DEFAULT', customers: 'NETSUITE_DEFAULT', departments: 'NETSUITE_DEFAULT'},
                            crossSubsidiaryCustomers: false,
                            syncApprovalWorkflow: false,
                            exportReportsTo: 'REPORTS_APPROVED_NONE',
                            exportVendorBillsTo: 'VENDOR_BILLS_APPROVED_NONE',
                            setFinalApprover: false,
                            syncReimbursedReports: false,
                            syncPeople: false,
                            hasChosenAutoSyncOption: false,
                            finalApprover: '',
                            syncCategories: false,
                            hasChosenSyncReimbursedReportsOption: false,
                            exportJournalsTo: 'JOURNALS_APPROVED_NONE',
                        },
                    },
                },
                config: {autoSync: {enabled: false, jobID: ''}, authType},
            },
        },
    };
}

function renderPage(subPage: string, authType?: string, policy?: Policy, isMigration?: boolean) {
    mockRoute.current = {...mockRoute.current, params: {policyID: POLICY_ID, subPage, authType, ...(isMigration ? {isMigration: 'true'} : {})}};
    render(
        <NetSuiteTokenInputPage
            policy={policy}
            policyDraft={undefined}
            isLoadingPolicy={false}
            // @ts-expect-error - route type from navigator
            route={mockRoute.current}
        />,
    );
}

describe('NetSuiteTokenInputPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockStepNames.current = undefined;
        mockCapturedOnNext.current = undefined;
        mockCapturedShouldBeBlocked.current = undefined;
        mockedIsAuthenticationError.mockReturnValue(false);
    });

    it('runs the OAuth flow by default and offers the TBA link for a fresh connection', () => {
        // Given a workspace with no NetSuite connection
        // When the credentials page is rendered
        renderPage(PAGE_NAME.CREDENTIALS);

        // Then the OAuth form and OAuth step names are shown, and the admin can switch to TBA
        expect(screen.getByTestId('oauth-form')).toBeOnTheScreen();
        expect(screen.getByTestId('token-authentication-link')).toBeOnTheScreen();
        expect(mockStepNames.current).toBe(CONST.NETSUITE_CONFIG.TOKEN_INPUT.OAUTH_STEP_INDEX_LIST);
    });

    it('runs the TBA flow for a fresh connection when the route asks for it', () => {
        // Given a workspace with no NetSuite connection and a TBA auth type in the route
        // When the credentials page is rendered with the TBA param
        renderPage(PAGE_NAME.CREDENTIALS, CONST.NETSUITE_CONFIG.TOKEN_INPUT.AUTH_TYPE.TBA);

        // Then the TBA form and TBA step names are shown, with no TBA link
        expect(screen.getByTestId('token-form')).toBeOnTheScreen();
        expect(screen.queryByTestId('token-authentication-link')).toBeNull();
        expect(mockStepNames.current).toBe(CONST.NETSUITE_CONFIG.TOKEN_INPUT.STEP_INDEX_LIST);
    });

    it('offers the TBA link when reconnecting a TBA connection after an auth error', () => {
        // Given an existing TBA connection (tokenID present) that has an auth error
        mockedIsAuthenticationError.mockReturnValue(true);
        const policy = buildNetsuitePolicy('encrypted-token-id');

        // When the credentials page is rendered for reconnection
        renderPage(PAGE_NAME.CREDENTIALS, undefined, policy);

        // Then the OAuth form is shown, and the admin can enter new TBA tokens instead
        expect(screen.getByTestId('oauth-form')).toBeOnTheScreen();
        expect(screen.getByTestId('token-authentication-link')).toBeOnTheScreen();
        expect(mockStepNames.current).toBe(CONST.NETSUITE_CONFIG.TOKEN_INPUT.OAUTH_STEP_INDEX_LIST);
    });

    it('hides the TBA link and ignores the TBA route param for a working TBA connection', () => {
        // Given a working TBA connection opened from the OAuth upgrade prompt, because a TBA submit would reset its settings
        const policy = buildNetsuitePolicy('encrypted-token-id');

        // When the credentials page is rendered with the TBA param
        renderPage(PAGE_NAME.CREDENTIALS, CONST.NETSUITE_CONFIG.TOKEN_INPUT.AUTH_TYPE.TBA, policy, true);

        // Then only the OAuth form is shown
        expect(screen.getByTestId('oauth-form')).toBeOnTheScreen();
        expect(screen.queryByTestId('token-authentication-link')).toBeNull();
    });

    it('hides the TBA link when reconnecting an OAuth connection after an auth error', () => {
        // Given an existing OAuth connection that has an auth error, because new TBA tokens would not move it off OAuth
        mockedIsAuthenticationError.mockReturnValue(true);
        const policy = buildNetsuitePolicy('', CONST.NETSUITE_CONFIG.TOKEN_INPUT.AUTH_TYPE.OAUTH2);

        // When the credentials page is rendered for reconnection
        renderPage(PAGE_NAME.CREDENTIALS, undefined, policy);

        // Then the OAuth credentials form is shown without the TBA link
        expect(screen.getByTestId('oauth-form')).toBeOnTheScreen();
        expect(screen.queryByTestId('token-authentication-link')).toBeNull();
        expect(mockStepNames.current).toBe(CONST.NETSUITE_CONFIG.TOKEN_INPUT.OAUTH_STEP_INDEX_LIST);
    });

    it('preserves the isMigration param when navigating to the next step', () => {
        // Given the wizard is opened with isMigration=true in the route (e.g. from a migration nudge)
        renderPage(PAGE_NAME.INSTALL, undefined, undefined, true);

        // When the user advances to the next step
        mockCapturedOnNext.current?.();

        // Then Navigation.navigate is called with isMigration=true preserved, so later steps can read the flag
        expect(Navigation.navigate).toHaveBeenCalledWith(expect.stringContaining('isMigration=true'));
    });

    it('blocks the wizard for a healthy OAuth connection even when isMigration=true is in the URL', () => {
        // Given a healthy OAuth connection (no tokenID, no auth error)
        mockedIsAuthenticationError.mockReturnValue(false);
        const policy = buildNetsuitePolicy('');

        // When the page is rendered with isMigration=true in the URL
        renderPage(PAGE_NAME.CREDENTIALS, undefined, policy, true);

        // Then the page is blocked — isMigration in the URL must not bypass a healthy OAuth connection
        expect(mockCapturedShouldBeBlocked.current).toBe(true);
    });
});

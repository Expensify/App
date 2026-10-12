import {render, screen} from '@testing-library/react-native';

import useEnvironment from '@hooks/useEnvironment';

import {isAuthenticationError} from '@libs/actions/connections';

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
jest.mock('@hooks/useEnvironment');
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
jest.mock(
    '@components/ConnectionLayout',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
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
jest.mock('@pages/workspace/accounting/netsuite/NetSuiteTokenInput/subPages/NetSuiteTokenSetupContent', () => () => null);

const mockedUseEnvironment = jest.mocked(useEnvironment);
const mockedIsAuthenticationError = jest.mocked(isAuthenticationError);

function setEnvironment(environment: ValueOf<typeof CONST.ENVIRONMENT>) {
    mockedUseEnvironment.mockReturnValue({
        environment,
        environmentURL: 'https://new.expensify.com',
        isProduction: environment === CONST.ENVIRONMENT.PRODUCTION,
        isDevelopment: environment === CONST.ENVIRONMENT.DEV,
    });
}

function buildNetsuitePolicy(tokenID: string): Policy {
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
                config: {autoSync: {enabled: false, jobID: ''}},
            },
        },
    };
}

function renderPage(subPage: string, authType?: string, policy?: Policy) {
    mockRoute.current = {...mockRoute.current, params: {policyID: POLICY_ID, subPage, authType}};
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
        mockedIsAuthenticationError.mockReturnValue(false);
    });

    it('runs the OAuth flow by default for fresh connections in production', () => {
        // Given a fresh connection (no auth error) in production
        setEnvironment(CONST.ENVIRONMENT.PRODUCTION);

        // When the credentials page is rendered
        renderPage(PAGE_NAME.CREDENTIALS);

        // Then the OAuth form and OAuth step names are shown, with no TBA fallback link
        expect(screen.getByTestId('oauth-form')).toBeOnTheScreen();
        expect(screen.queryByTestId('token-authentication-link')).toBeNull();
        expect(mockStepNames.current).toBe(CONST.NETSUITE_CONFIG.TOKEN_INPUT.OAUTH_STEP_INDEX_LIST);
    });

    it('ignores the TBA route param in production and keeps OAuth', () => {
        // Given a fresh connection in production with a TBA auth type in the route
        setEnvironment(CONST.ENVIRONMENT.PRODUCTION);

        // When the credentials page is rendered with the TBA param
        renderPage(PAGE_NAME.CREDENTIALS, CONST.NETSUITE_CONFIG.TOKEN_INPUT.AUTH_TYPE.TBA);

        // Then production ignores the param and still shows the OAuth form
        expect(screen.getByTestId('oauth-form')).toBeOnTheScreen();
    });

    it('offers the TBA fallback link on staging when using OAuth', () => {
        // Given a fresh connection on staging (non-production)
        setEnvironment(CONST.ENVIRONMENT.STAGING);

        // When the credentials page is rendered
        renderPage(PAGE_NAME.CREDENTIALS);

        // Then the OAuth form is shown along with the TBA fallback link
        expect(screen.getByTestId('oauth-form')).toBeOnTheScreen();
        expect(screen.getByTestId('token-authentication-link')).toBeOnTheScreen();
    });

    it('runs the TBA flow on dev when the route asks for it', () => {
        // Given a fresh connection on dev with TBA auth type in the route
        setEnvironment(CONST.ENVIRONMENT.DEV);

        // When the credentials page is rendered with the TBA param
        renderPage(PAGE_NAME.CREDENTIALS, CONST.NETSUITE_CONFIG.TOKEN_INPUT.AUTH_TYPE.TBA);

        // Then the TBA form and TBA step names are shown, with no TBA fallback link
        expect(screen.getByTestId('token-form')).toBeOnTheScreen();
        expect(screen.queryByTestId('token-authentication-link')).toBeNull();
        expect(mockStepNames.current).toBe(CONST.NETSUITE_CONFIG.TOKEN_INPUT.STEP_INDEX_LIST);
    });

    it('shows the TBA credentials form when reconnecting after an auth error on a TBA connection', () => {
        // Given an existing TBA connection (tokenID present) that has an auth error
        setEnvironment(CONST.ENVIRONMENT.PRODUCTION);
        mockedIsAuthenticationError.mockReturnValue(true);
        const policy = buildNetsuitePolicy('encrypted-token-id');

        // When the credentials page is rendered for reconnection
        renderPage(PAGE_NAME.CREDENTIALS, undefined, policy);

        // Then the TBA credentials form is shown (OAuth not used for TBA reconnect until Release 5)
        expect(screen.getByTestId('token-form')).toBeOnTheScreen();
        expect(mockStepNames.current).toBe(CONST.NETSUITE_CONFIG.TOKEN_INPUT.STEP_INDEX_LIST);
    });

    it('shows the OAuth credentials form when reconnecting after an auth error on an OAuth connection', () => {
        // Given an existing OAuth connection (no tokenID) that has an auth error
        setEnvironment(CONST.ENVIRONMENT.PRODUCTION);
        mockedIsAuthenticationError.mockReturnValue(true);
        const policy = buildNetsuitePolicy('');

        // When the credentials page is rendered for reconnection
        renderPage(PAGE_NAME.CREDENTIALS, undefined, policy);

        // Then the OAuth credentials form is shown
        expect(screen.getByTestId('oauth-form')).toBeOnTheScreen();
        expect(mockStepNames.current).toBe(CONST.NETSUITE_CONFIG.TOKEN_INPUT.OAUTH_STEP_INDEX_LIST);
    });
});

import {render, screen} from '@testing-library/react-native';

import useEnvironment from '@hooks/useEnvironment';
import usePermissions from '@hooks/usePermissions';

import NetSuiteTokenInputPage from '@pages/workspace/accounting/netsuite/NetSuiteTokenInput/NetSuiteTokenInputPage';
import type {CustomSubPageTokenInputProps} from '@pages/workspace/accounting/netsuite/types';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

const POLICY_ID = '123';
const PAGE_NAME = CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME;

type RouteParams = {
    policyID: string;
    subPage: string;
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
jest.mock('@hooks/usePermissions');
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
jest.mock('@pages/workspace/accounting/netsuite/NetSuiteTokenInput/subPages/NetSuiteTokenInputForm', () => ({isOAuthFlow}: CustomSubPageTokenInputProps) => (
    <MockView testID={isOAuthFlow ? 'oauth-form' : 'token-form'} />
));
jest.mock('@pages/workspace/accounting/netsuite/NetSuiteTokenInput/subPages/NetSuiteTokenSetupContent', () => () => null);

const mockedUseEnvironment = jest.mocked(useEnvironment);
const mockedUsePermissions = jest.mocked(usePermissions);

function setEnvironment({isDevelopment, isOAuthBetaEnabled}: {isDevelopment: boolean; isOAuthBetaEnabled: boolean}) {
    mockedUseEnvironment.mockReturnValue({
        environment: isDevelopment ? CONST.ENVIRONMENT.DEV : CONST.ENVIRONMENT.PRODUCTION,
        environmentURL: 'https://new.expensify.com',
        isProduction: !isDevelopment,
        isDevelopment,
    });
    mockedUsePermissions.mockReturnValue({
        isBetaEnabled: (beta) => beta === CONST.BETAS.NETSUITE_OAUTH && isOAuthBetaEnabled,
    } as ReturnType<typeof usePermissions>);
}

function renderPage(subPage: string) {
    mockRoute.current = {...mockRoute.current, params: {policyID: POLICY_ID, subPage}};
    render(
        <NetSuiteTokenInputPage
            policy={undefined}
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
    });

    describe('outside a dev environment', () => {
        it('runs the token-based authentication flow without the beta', () => {
            setEnvironment({isDevelopment: false, isOAuthBetaEnabled: false});
            renderPage(PAGE_NAME.CREDENTIALS);

            expect(screen.getByTestId('token-form')).toBeOnTheScreen();
            expect(mockStepNames.current).toBe(CONST.NETSUITE_CONFIG.TOKEN_INPUT.STEP_INDEX_LIST);
        });

        it('runs the OAuth flow with the beta', () => {
            setEnvironment({isDevelopment: false, isOAuthBetaEnabled: true});
            renderPage(PAGE_NAME.CREDENTIALS);

            expect(screen.getByTestId('oauth-form')).toBeOnTheScreen();
        });
    });
});

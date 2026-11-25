import {render} from '@testing-library/react-native';

import ConnectToNetSuiteFlow from '@components/ConnectToNetSuiteFlow';

import {isAuthenticationError} from '@libs/actions/connections';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type Policy from '@src/types/onyx/Policy';

import React from 'react';

const POLICY_ID = '123';

const mockPolicy: {current: Partial<Policy> | undefined} = {current: undefined};
const mockPopoverMenu = jest.fn<void, [{isVisible: boolean}]>();

jest.mock('@components/PopoverMenu', () => ({
    __esModule: true,
    default: (props: {isVisible: boolean}) => {
        mockPopoverMenu(props);
        return null;
    },
}));
jest.mock('@hooks/useHasReusablePoliciesConnectedTo', () => jest.fn(() => true));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Copy: 'Copy', LinkCopy: 'LinkCopy'})),
}));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));
jest.mock('@hooks/useOnyx', () => jest.fn(() => [mockPolicy.current]));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isSmallScreenWidth: true})));
jest.mock('@libs/actions/connections', () => ({
    isAuthenticationError: jest.fn(() => false),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));
jest.mock('@pages/workspace/accounting/AccountingContext/contexts', () => ({
    useAccountingState: jest.fn(() => ({popoverAnchorRefs: {current: {netsuite: {current: null}}}})),
}));

const mockedIsAuthenticationError = jest.mocked(isAuthenticationError);
const mockedNavigate = jest.mocked(Navigation.navigate);

function wasReuseConnectionPopoverShown() {
    return mockPopoverMenu.mock.calls.some(([props]) => props.isVisible);
}

describe('ConnectToNetSuiteFlow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPolicy.current = undefined;
        mockedIsAuthenticationError.mockReturnValue(false);
    });

    it('opens the credentials step of an OAuth connection without an auth error', () => {
        // Given a working NetSuite OAuth connection, and other workspaces with a connection the admin could reuse
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- The flow only reads the auth type and the tokenID of the NetSuite connection, so the rest of the connection is left out.
        mockPolicy.current = {connections: {netsuite: {config: {authType: CONST.NETSUITE_CONFIG.AUTH_TYPE.OAUTH2}}}} as Partial<Policy>;

        // When the admin selects Update credentials
        render(<ConnectToNetSuiteFlow policyID={POLICY_ID} />);

        // Then the flow opens the credentials step, because reusing another connection would replace this connection
        expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT.getRoute(POLICY_ID, CONST.NETSUITE_CONFIG.TOKEN_INPUT.PAGE_NAME.CREDENTIALS));
        expect(wasReuseConnectionPopoverShown()).toBe(false);
    });

    it('offers to reuse an existing connection for a workspace without a NetSuite connection', () => {
        // Given a workspace without a NetSuite connection, and other workspaces with a connection the admin could reuse

        // When the admin starts the NetSuite setup
        render(<ConnectToNetSuiteFlow policyID={POLICY_ID} />);

        // Then the flow asks whether to create a connection or reuse one, instead of opening the setup steps
        expect(mockedNavigate).not.toHaveBeenCalled();
        expect(wasReuseConnectionPopoverShown()).toBe(true);
    });
});

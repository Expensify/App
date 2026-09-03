import {act, render} from '@testing-library/react-native';

import {getXeroSetupLink} from '@libs/actions/connections/Xero';
import {markPolicyConnectionsAsStale} from '@libs/actions/PolicyConnections';
import getPlatform from '@libs/getPlatform';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {TwoFactorAuthNavigatorParamList} from '@libs/Navigation/types';

import DynamicSuccessPage from '@pages/settings/Security/TwoFactorAuth/DynamicSuccessPage';

import {openLink} from '@userActions/Link';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const POLICY_ID = '123';

// Captures the button handler so a test can invoke it without rendering the real success screen.
const mockSuccessPageProps: {current: {onButtonPress: () => void} | undefined} = {current: undefined};

jest.mock('@hooks/useEnvironment', () => () => ({environmentURL: 'https://new.expensify.com'}));
jest.mock('@hooks/useDynamicBackPath', () => () => '/settings/security');
jest.mock('@hooks/useDynamicForwardPath', () => () => '/settings/workspaces/123/accounting/xero');
// Returning no state keeps both the USD-bank-account and Settings > Security branches out of the way, so the
// button press falls through to the Xero handoff this test is about.
jest.mock('@libs/Navigation/helpers/getStateFromPath', () => ({__esModule: true, default: jest.fn(() => undefined)}));
jest.mock('@pages/settings/Security/TwoFactorAuth/SuccessPageBase', () => ({onButtonPress}: {onButtonPress: () => void}) => {
    mockSuccessPageProps.current = {onButtonPress};
    return null;
});

jest.mock('@libs/getPlatform', () => ({__esModule: true, default: jest.fn(() => 'web')}));
jest.mock('@libs/actions/connections/Xero', () => ({
    getXeroSetupLink: jest.fn((policyID: string) => `https://xero-setup.example/${policyID}`),
}));
jest.mock('@libs/actions/PolicyConnections', () => ({
    markPolicyConnectionsAsStale: jest.fn(),
}));
jest.mock('@userActions/Link', () => ({openLink: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    revealRouteBeforeDismissingModal: jest.fn(),
}));
jest.mock('@userActions/TwoFactorAuthActions', () => ({
    clearTwoFactorAuthData: jest.fn(),
    quitAndNavigateBack: jest.fn(),
}));
jest.mock('@userActions/BankAccounts', () => ({openReimbursementAccountPage: jest.fn()}));
jest.mock('@userActions/HybridApp', () => ({closeReactNativeApp: jest.fn()}));

const mockedMarkPolicyConnectionsAsStale = jest.mocked(markPolicyConnectionsAsStale);
const mockedGetXeroSetupLink = jest.mocked(getXeroSetupLink);
const mockedOpenLink = jest.mocked(openLink);
const mockedGetPlatform = jest.mocked(getPlatform);
const mockedNavigate = jest.mocked(Navigation.navigate);

// The page only reads `route.params.policyID`; building a full navigation route would add fields nothing here uses.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const buildRoute = (policyID?: string) => ({params: {policyID}}) as PlatformStackScreenProps<TwoFactorAuthNavigatorParamList, typeof SCREENS.TWO_FACTOR_AUTH.DYNAMIC_SUCCESS>['route'];

const renderAndPressButton = async (policyID?: string) => {
    render(<DynamicSuccessPage route={buildRoute(policyID)} />);
    await waitForBatchedUpdates();
    act(() => mockSuccessPageProps.current?.onButtonPress());
    await waitForBatchedUpdates();
};

// This screen hands off to Xero setup directly rather than through ConnectToXeroFlow, so it has to mark the
// policy's connections stale itself — otherwise users who set up 2FA while connecting Xero keep serving the
// policy.connections copy fetched before the connection existed.
describe('DynamicSuccessPage Xero handoff', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        mockSuccessPageProps.current = undefined;
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('marks the policy connections as stale and opens the setup link on web', async () => {
        await renderAndPressButton(POLICY_ID);

        expect(mockedMarkPolicyConnectionsAsStale).toHaveBeenCalledWith(POLICY_ID);
        expect(mockedGetXeroSetupLink).toHaveBeenCalledWith(POLICY_ID);
        expect(mockedOpenLink).toHaveBeenCalledWith(`https://xero-setup.example/${POLICY_ID}`, 'https://new.expensify.com');
    });

    it('marks the policy connections as stale and navigates to the WebView setup screen on native', async () => {
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.ANDROID);

        await renderAndPressButton(POLICY_ID);

        expect(mockedMarkPolicyConnectionsAsStale).toHaveBeenCalledWith(POLICY_ID);
        expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_XERO_SETUP.getRoute(POLICY_ID));
        expect(mockedOpenLink).not.toHaveBeenCalled();
    });

    it('does nothing when the route carries no policyID', async () => {
        await renderAndPressButton(undefined);

        expect(mockedMarkPolicyConnectionsAsStale).not.toHaveBeenCalled();
        expect(mockedOpenLink).not.toHaveBeenCalled();
    });
});

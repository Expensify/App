import Navigation from '@libs/Navigation/Navigation';

import connectToNetSuiteOAuthSetup from '@pages/workspace/accounting/netsuite/NetSuiteTokenInput/subPages/connectToNetSuiteOAuthSetup.native';

import {openLink} from '@userActions/Link';

import ROUTES from '@src/ROUTES';
import type Session from '@src/types/onyx/Session';

import type {OnyxEntry} from 'react-native-onyx';

const POLICY_ID = '123';
const ACCOUNT_ID = 'TSTDRV1234567';
const ENVIRONMENT_URL = 'https://new.expensify.com';
const TEST_SESSION: OnyxEntry<Session> = {accountID: 1, email: 'test@test.com'};

jest.mock('@userActions/Link', () => ({
    openLink: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
}));

const mockedOpenLink = jest.mocked(openLink);
const mockedNavigate = jest.mocked(Navigation.navigate);
const mockedDismissModal = jest.mocked(Navigation.dismissModal);

describe('connectToNetSuiteOAuthSetup (native)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('navigates to the in-app NetSuite setup screen', () => {
        connectToNetSuiteOAuthSetup(POLICY_ID, ACCOUNT_ID, ENVIRONMENT_URL, TEST_SESSION);

        expect(mockedNavigate).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_NETSUITE_SETUP.getRoute(POLICY_ID, ACCOUNT_ID));
    });

    it('does not open an external browser tab', () => {
        connectToNetSuiteOAuthSetup(POLICY_ID, ACCOUNT_ID, ENVIRONMENT_URL, TEST_SESSION);

        expect(mockedOpenLink).not.toHaveBeenCalled();
    });

    it('leaves the RHP open so the setup screen it just pushed stays mounted', () => {
        connectToNetSuiteOAuthSetup(POLICY_ID, ACCOUNT_ID, ENVIRONMENT_URL, TEST_SESSION);

        expect(mockedDismissModal).not.toHaveBeenCalled();
    });
});

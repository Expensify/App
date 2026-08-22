import {getNetSuiteSetupLink} from '@libs/actions/connections/NetSuiteCommands';
import Navigation from '@libs/Navigation/Navigation';

import type connectToNetSuiteOAuthSetupType from '@pages/workspace/accounting/netsuite/NetSuiteTokenInput/subPages/connectToNetSuiteOAuthSetup';

import {openLink} from '@userActions/Link';

import type Session from '@src/types/onyx/Session';

import type {OnyxEntry} from 'react-native-onyx';

// Jest (jest-expo) resolves the `.native` variant by default, so we require the web entry point
// explicitly (with its `.ts` extension) to exercise the web implementation.
const connectToNetSuiteOAuthSetupModule: unknown = require('@pages/workspace/accounting/netsuite/NetSuiteTokenInput/subPages/connectToNetSuiteOAuthSetup.ts');

// The `require` above yields `any`, and narrowing it to the module shape needs a type assertion that
// can't be avoided for this test-only web-entry-point escape hatch, so disable the rule on this line.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const connectToNetSuiteOAuthSetup = (connectToNetSuiteOAuthSetupModule as {default: typeof connectToNetSuiteOAuthSetupType}).default;

const POLICY_ID = '123';
const ACCOUNT_ID = 'TSTDRV1234567';
const ENVIRONMENT_URL = 'https://new.expensify.com';
const SETUP_LINK = 'https://netsuite-setup.example/123';
const TEST_SESSION: OnyxEntry<Session> = {accountID: 1, email: 'test@test.com'};

jest.mock('@libs/actions/connections/NetSuiteCommands', () => ({
    getNetSuiteSetupLink: jest.fn(),
}));
jest.mock('@userActions/Link', () => ({
    openLink: jest.fn(),
}));
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
}));

const mockedGetNetSuiteSetupLink = jest.mocked(getNetSuiteSetupLink);
const mockedOpenLink = jest.mocked(openLink);
const mockedNavigate = jest.mocked(Navigation.navigate);
const mockedDismissModal = jest.mocked(Navigation.dismissModal);

describe('connectToNetSuiteOAuthSetup (web)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedGetNetSuiteSetupLink.mockReturnValue(SETUP_LINK);
    });

    it('opens the NetSuite setup link built from the policy and account ID', () => {
        connectToNetSuiteOAuthSetup(POLICY_ID, ACCOUNT_ID, ENVIRONMENT_URL, TEST_SESSION);

        expect(mockedGetNetSuiteSetupLink).toHaveBeenCalledWith(POLICY_ID, ACCOUNT_ID);
        expect(mockedOpenLink).toHaveBeenCalledWith(SETUP_LINK, ENVIRONMENT_URL, false, TEST_SESSION);
    });

    it('dismisses the RHP, which the OAuth tab cannot do from its own browsing context', () => {
        connectToNetSuiteOAuthSetup(POLICY_ID, ACCOUNT_ID, ENVIRONMENT_URL, TEST_SESSION);

        expect(mockedDismissModal).toHaveBeenCalled();
    });

    it('does not navigate to the in-app setup screen', () => {
        connectToNetSuiteOAuthSetup(POLICY_ID, ACCOUNT_ID, ENVIRONMENT_URL, TEST_SESSION);

        expect(mockedNavigate).not.toHaveBeenCalled();
    });
});

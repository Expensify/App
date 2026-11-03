import {getNetSuiteSetupLink} from '@libs/actions/connections/NetSuiteCommands';
import Navigation from '@libs/Navigation/Navigation';

import type connectToNetSuiteOAuthSetupType from '@pages/workspace/accounting/netsuite/NetSuiteTokenInput/subPages/connectToNetSuiteOAuthSetup';

import {openLink} from '@userActions/Link';

import CONST from '@src/CONST';

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
        connectToNetSuiteOAuthSetup(POLICY_ID, ACCOUNT_ID, ENVIRONMENT_URL, undefined, undefined);

        expect(mockedGetNetSuiteSetupLink).toHaveBeenCalledWith(POLICY_ID, ACCOUNT_ID, undefined);
        expect(mockedOpenLink).toHaveBeenCalledWith(SETUP_LINK, ENVIRONMENT_URL, false, undefined);
    });

    it('dismisses the RHP, which the OAuth tab cannot do from its own browsing context', () => {
        connectToNetSuiteOAuthSetup(POLICY_ID, ACCOUNT_ID, ENVIRONMENT_URL, undefined, undefined);

        expect(mockedDismissModal).toHaveBeenCalled();
    });

    it('does not navigate to the in-app setup screen', () => {
        connectToNetSuiteOAuthSetup(POLICY_ID, ACCOUNT_ID, ENVIRONMENT_URL, undefined, undefined);

        expect(mockedNavigate).not.toHaveBeenCalled();
    });

    it('passes isMigration flag to getNetSuiteSetupLink when migrating a TBA connection to OAuth', () => {
        // Given a TBA → OAuth migration
        // When the OAuth setup is triggered with isMigration: true
        connectToNetSuiteOAuthSetup(POLICY_ID, ACCOUNT_ID, ENVIRONMENT_URL, true, undefined);

        // Then the setup link is built with the migration flag so the backend knows to migrate
        expect(mockedGetNetSuiteSetupLink).toHaveBeenCalledWith(POLICY_ID, ACCOUNT_ID, true);
    });

    it('passes the session to openLink', () => {
        // Given an anonymous session, which openLink uses to decide whether to redirect to sign in
        const session = {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS};

        // When the OAuth setup is triggered
        connectToNetSuiteOAuthSetup(POLICY_ID, ACCOUNT_ID, ENVIRONMENT_URL, undefined, session);

        // Then the setup link is opened with the passed session
        expect(mockedOpenLink).toHaveBeenCalledWith(SETUP_LINK, ENVIRONMENT_URL, false, session);
    });
});

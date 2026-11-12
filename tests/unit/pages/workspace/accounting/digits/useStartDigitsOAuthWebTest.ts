import {renderHook} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import type useStartDigitsOAuthType from '@pages/workspace/accounting/digits/useStartDigitsOAuth';

import {openLink} from '@userActions/Link';

const POLICY_ID = '123';

// Jest (jest-expo) resolves the `.native` variant by default, so we require the web entry point
// explicitly (with its `.ts` extension) to exercise the web implementation.
const useStartDigitsOAuthModule: unknown = require('@pages/workspace/accounting/digits/useStartDigitsOAuth/index.ts');

// The `require` above yields `any`, and narrowing it to the module shape needs a type assertion that
// can't be avoided for this test-only web-entry-point escape hatch, so disable the rule on this line.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const useStartDigitsOAuth = (useStartDigitsOAuthModule as {default: typeof useStartDigitsOAuthType}).default;

jest.mock('@hooks/useEnvironment', () => () => ({environmentURL: 'https://new.expensify.com'}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@libs/actions/connections/Digits', () => ({
    getDigitsSetupLink: (policyID: string) => `https://digits-setup.example/${policyID}`,
}));
jest.mock('@userActions/Link', () => ({openLink: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({dismissModal: jest.fn()}));

const mockedOpenLink = jest.mocked(openLink);
const mockedDismissModal = jest.mocked(Navigation.dismissModal);

describe('useStartDigitsOAuth (web)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should close the RHP after opening the sign-in when the caller asks for it', () => {
        // Given the Existing connections page, which sits in the RHP while the sign-in opens in another tab
        const {result} = renderHook(() => useStartDigitsOAuth());

        // When the admin presses "Create new connection"
        result.current(POLICY_ID, {shouldDismissModal: true});

        // Then the sign-in opens and the RHP closes, because the sign-in tab never reports back and the page left open would look like nothing happened
        expect(mockedOpenLink).toHaveBeenCalledWith(`https://digits-setup.example/${POLICY_ID}`, 'https://new.expensify.com', false, undefined);
        expect(mockedDismissModal).toHaveBeenCalledTimes(1);
    });

    it('should leave navigation alone by default', () => {
        // Given the connect flow, which runs on the Connections page with no RHP to close
        const {result} = renderHook(() => useStartDigitsOAuth());

        // When it opens the sign-in
        result.current(POLICY_ID);

        // Then only the sign-in opens, since dismissing with no modal open would just log a failed dismiss
        expect(mockedOpenLink).toHaveBeenCalledTimes(1);
        expect(mockedDismissModal).not.toHaveBeenCalled();
    });
});

import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockSetAuthenticationData = jest.fn();
const mockSetAttribute = jest.fn();

jest.mock('@libs/FraudProtection/GroupIBSdkBridge', () => ({
    init: jest.fn(),
    sendEvent: jest.fn(),
    setAttribute: mockSetAttribute,
    setAuthenticationData: mockSetAuthenticationData,
}));

// Load the module once. Onyx connections are registered at module scope.
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('@libs/FraudProtection');

beforeAll(() =>
    Onyx.init({
        keys: ONYXKEYS,
    }),
);

beforeEach(async () => {
    await Onyx.clear();
    await waitForBatchedUpdates();

    // Clear mocks AFTER Onyx.clear() finishes, because the clear triggers callbacks.
    jest.clearAllMocks();
});

/** Returns the sessionID argument from the Nth call to setAuthenticationData. */
function getSessionIDFromCall(callIndex: number): string {
    const call = mockSetAuthenticationData.mock.calls.at(callIndex) as unknown[];
    return call.at(1) as string;
}

describe('FraudProtection', () => {
    it('should not send auth data when only account data arrives without a session', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: 'user@expensify.com', requiresTwoFactorAuth: false, validated: true});
        await waitForBatchedUpdates();

        expect(mockSetAuthenticationData).not.toHaveBeenCalled();
    });

    it('should not send auth data when session arrives without account data', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'token123', accountID: 12345});
        await waitForBatchedUpdates();

        expect(mockSetAuthenticationData).not.toHaveBeenCalled();
    });

    it('should send auth data once both account and session are available', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: 'user@expensify.com', requiresTwoFactorAuth: true, validated: true});
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'token123', accountID: 12345});
        await waitForBatchedUpdates();

        expect(mockSetAuthenticationData).toHaveBeenCalledTimes(1);
        expect(mockSetAuthenticationData).toHaveBeenCalledWith('12345', expect.any(String));
        expect(mockSetAttribute).toHaveBeenCalledWith('email', 'user@expensify.com', false, true);
        expect(mockSetAttribute).toHaveBeenCalledWith('mfa', '2fa_enabled', false, true);
        expect(mockSetAttribute).toHaveBeenCalledWith('is_validated', 'true', false, true);
    });

    it('should send auth data when session arrives after account (multi-step sign-in)', async () => {
        // Step 1: BeginSignIn returns account data (no session yet)
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: 'user@expensify.com', requiresTwoFactorAuth: false, validated: true});
        await waitForBatchedUpdates();

        expect(mockSetAuthenticationData).not.toHaveBeenCalled();

        // Step 2: Magic code verified, session is created
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'token123', accountID: 12345});
        await waitForBatchedUpdates();

        expect(mockSetAuthenticationData).toHaveBeenCalledTimes(1);
        expect(mockSetAuthenticationData).toHaveBeenCalledWith('12345', expect.any(String));
    });

    it('should not re-send identity when session updates but identity has not changed, but should re-send attributes', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: 'user@expensify.com', requiresTwoFactorAuth: false, validated: false});
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'token123', accountID: 12345});
        await waitForBatchedUpdates();

        expect(mockSetAuthenticationData).toHaveBeenCalledTimes(1);
        jest.clearAllMocks();

        // Session token refreshes but accountID stays the same
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'token456', accountID: 12345});
        await waitForBatchedUpdates();

        expect(mockSetAuthenticationData).not.toHaveBeenCalled();
        expect(mockSetAttribute).toHaveBeenCalledWith('email', 'user@expensify.com', false, true);
    });

    it('should forward updated account attributes for the same identity', async () => {
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: 'user@expensify.com', requiresTwoFactorAuth: false, validated: false});
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'token123', accountID: 12345});
        await waitForBatchedUpdates();
        jest.clearAllMocks();

        // User enables 2FA while already logged in
        await Onyx.merge(ONYXKEYS.ACCOUNT, {requiresTwoFactorAuth: true});
        await waitForBatchedUpdates();

        expect(mockSetAuthenticationData).not.toHaveBeenCalled();
        expect(mockSetAttribute).toHaveBeenCalledWith('mfa', '2fa_enabled', false, true);
    });

    it('should send new session with empty identity on logout', async () => {
        // Login
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: 'user@expensify.com', requiresTwoFactorAuth: false, validated: true});
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'token123', accountID: 12345});
        await waitForBatchedUpdates();

        const firstSessionID = getSessionIDFromCall(0);
        jest.clearAllMocks();

        // Logout: clear the session (Onyx.merge strips undefined, so use set with null)
        await Onyx.set(ONYXKEYS.SESSION, null);
        await waitForBatchedUpdates();

        expect(mockSetAuthenticationData).toHaveBeenCalledTimes(1);
        expect(mockSetAuthenticationData).toHaveBeenCalledWith('', expect.any(String));

        // The new sessionID should differ from the one used during auth
        const logoutSessionID = getSessionIDFromCall(0);
        expect(logoutSessionID).not.toBe(firstSessionID);

        // Previous user's attributes should be cleared on logout
        expect(mockSetAttribute).toHaveBeenCalledWith('email', '', false, true);
        expect(mockSetAttribute).toHaveBeenCalledWith('mfa', '2fa_disabled', false, true);
        expect(mockSetAttribute).toHaveBeenCalledWith('is_validated', 'false', false, true);
    });

    it('should use a new sessionID after logout and re-login', async () => {
        // First login
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: 'user@expensify.com', requiresTwoFactorAuth: false, validated: true});
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'token123', accountID: 12345});
        await waitForBatchedUpdates();

        const firstSessionID = getSessionIDFromCall(0);

        // Logout
        await Onyx.set(ONYXKEYS.SESSION, null);
        await waitForBatchedUpdates();
        jest.clearAllMocks();

        // Second login with a different account
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: 'other@expensify.com', requiresTwoFactorAuth: true, validated: false});
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'token999', accountID: 67890});
        await waitForBatchedUpdates();

        expect(mockSetAuthenticationData).toHaveBeenCalledTimes(1);
        expect(mockSetAuthenticationData).toHaveBeenCalledWith('67890', expect.any(String));
        expect(mockSetAttribute).toHaveBeenCalledWith('email', 'other@expensify.com', false, true);
        expect(mockSetAttribute).toHaveBeenCalledWith('mfa', '2fa_enabled', false, true);
        expect(mockSetAttribute).toHaveBeenCalledWith('is_validated', 'false', false, true);

        // Should use a different sessionID than the first login
        const secondSessionID = getSessionIDFromCall(0);
        expect(secondSessionID).not.toBe(firstSessionID);
    });

    it('should set 2FA attribute correctly based on account data', async () => {
        // Without 2FA
        await Onyx.merge(ONYXKEYS.ACCOUNT, {primaryLogin: 'user@expensify.com', requiresTwoFactorAuth: false, validated: true});
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'token123', accountID: 11111});
        await waitForBatchedUpdates();

        expect(mockSetAttribute).toHaveBeenCalledWith('mfa', '2fa_disabled', false, true);
    });
});

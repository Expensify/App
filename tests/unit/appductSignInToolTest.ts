type ToolRegistration = {
    name: string;
    handler: unknown;
};

/**
 * PoC sign-in tool behavior (web entry). The module registers tools at call
 * time and reads state through Onyx.connect callbacks, so the test drives the
 * captured registrations with a mocked @appduct/web and a mocked Session
 * action layer, and real timers for the 100ms polling in waitFor.
 */
const mockRegistrations = new Map<string, ToolRegistration>();

jest.mock('@appduct/web', () => ({
    registerTool: (registration: ToolRegistration) => {
        mockRegistrations.set(registration.name, registration);
        return {remove: jest.fn()};
    },
}));

jest.mock('@userActions/Session', () => ({
    beginSignIn: jest.fn(),
    signUpUser: jest.fn(),
    isAnonymousUser: (session: {authTokenType?: string} | undefined) => session?.authTokenType === 'anonymous',
}));

import {beginSignIn, signUpUser} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';
// eslint-disable-next-line no-restricted-syntax -- importing the web entry directly: the tools only exist on web
import registerAppductTools from '@src/setup/appductTools/index.web';

import Onyx from 'react-native-onyx';

type ToolHandler = (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
const call = (name: string, input: Record<string, unknown> = {}) => (mockRegistrations.get(name)?.handler as unknown as ToolHandler)(input);

describe('appduct sign_in tool', () => {
    beforeAll(() => {
        jest.useRealTimers();
    });

    beforeEach(async () => {
        mockRegistrations.clear();
        jest.mocked(beginSignIn).mockReset();
        jest.mocked(signUpUser).mockReset();
        await Onyx.init({keys: ONYXKEYS});
        await Onyx.clear();
        registerAppductTools();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('registers sign_in and prestart_status', () => {
        expect([...mockRegistrations.keys()]).toEqual(['sign_in', 'prestart_status']);
    });

    it('waits for boot and signs up a new account via beginSignIn + signUpUser', async () => {
        // Boot: beginSignIn resolves with accountExists=false -> signUpUser.
        jest.mocked(beginSignIn).mockImplementation(() => {
            void Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false, accountExists: false});
        });
        jest.mocked(signUpUser).mockImplementation(() => {
            void Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', authTokenType: null, email: 'x+1@gmail.com', accountID: 42, autoAuthState: 'signedIn'});
            void Onyx.merge(ONYXKEYS.CREDENTIALS, {accountID: 42, login: 'x+1@gmail.com'});
        });

        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'anon', authTokenType: 'anonymous'});

        const result = await call('sign_in', {email: 'x+1@gmail.com', timeoutMs: 2000});
        expect(result).toMatchObject({signedIn: true, source: 'sign-up-user', accountID: 42, login: 'x+1@gmail.com'});
        expect(beginSignIn).toHaveBeenCalledWith('x+1@gmail.com');
        expect(signUpUser).toHaveBeenCalledTimes(1);
    });

    it('returns already-signed-in without touching the sign-in actions', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', email: 'in@gmail.com', autoAuthState: 'signedIn'});

        const result = await call('sign_in', {email: 'in@gmail.com', timeoutMs: 2000});
        expect(result).toMatchObject({signedIn: true, source: 'already-signed-in', login: 'in@gmail.com'});
        expect(beginSignIn).not.toHaveBeenCalled();
        expect(signUpUser).not.toHaveBeenCalled();
    });

    it('reports the magic-code wall instead of pretending success', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'anon', authTokenType: 'anonymous'});
        jest.mocked(beginSignIn).mockImplementation(() => {
            void Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false, accountExists: true});
        });

        const result = await call('sign_in', {email: 'old@gmail.com', timeoutMs: 2000});
        expect(result.signedIn).toBe(false);
        expect(String(result.reason)).toContain('magic code');
        expect(signUpUser).not.toHaveBeenCalled();
    });

    it('surfaces beginSignIn errors with the Onyx error payload', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'anon', authTokenType: 'anonymous'});
        jest.mocked(beginSignIn).mockImplementation(() => {
            void Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false, errors: {'1': {message: 'Blocked'}}});
        });

        const result = await call('sign_in', {email: 'bad@gmail.com', timeoutMs: 2000});
        expect(result.signedIn).toBe(false);
        expect(String(result.reason)).toContain('Blocked');
    });

    it('gives up with the account snapshot when no session token arrives', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'anon', authTokenType: 'anonymous'});
        jest.mocked(beginSignIn).mockImplementation(() => {
            void Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false, accountExists: false});
        });

        const result = await call('sign_in', {email: 'slow@gmail.com', timeoutMs: 400});
        expect(result.signedIn).toBe(false);
        expect(String(result.reason)).toContain('no session token');
        expect(result.account).toBeTruthy();
    });

    it('prestart_status reports the state without acting', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', email: 's@gmail.com', autoAuthState: 'signedIn'});

        const result = await call('prestart_status');
        expect(result).toMatchObject({booted: true, signedIn: true, anonymous: false, login: 's@gmail.com'});
        expect(beginSignIn).not.toHaveBeenCalled();
    });
});

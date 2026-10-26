import {beginSignIn, signUpUser} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import registerAppductTools from '@src/setup/appductTools/index.web';

import Onyx from 'react-native-onyx';

/**
 * sign_in tool behavior. The module registers tools at call time and reads
 * state through Onyx.connectWithoutView callbacks, so the test drives the
 * captured registrations with a mocked @appduct/web and a mocked Session
 * action layer, and real timers for the 100ms polling in waitFor.
 */
type ToolRegistration = {
    name: string;
    handler: (input: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

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
    // isAnonymousUser stays real: the anonymous token type is 'anonymousAccount'
    // (CONST.AUTH_TOKEN_TYPES.ANONYMOUS), and a re-implemented predicate drifts
    // from the constant it must agree with.
    isAnonymousUser: jest.requireActual<{isAnonymousUser: (session: {authTokenType?: string} | undefined) => boolean}>('@userActions/Session').isAnonymousUser,
}));

const ANONYMOUS = CONST.AUTH_TOKEN_TYPES.ANONYMOUS;

const call = (name: string, input: Record<string, unknown> = {}) => mockRegistrations.get(name)?.handler(input);

describe('appduct sign_in tool', () => {
    beforeAll(() => {
        jest.useRealTimers();
    });

    beforeEach(async () => {
        mockRegistrations.clear();
        jest.mocked(beginSignIn).mockReset();
        jest.mocked(signUpUser).mockReset();
        Onyx.init({keys: ONYXKEYS});
        await Onyx.clear();
        registerAppductTools();
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    it('registers get_state, sign_in and complete_onboarding', () => {
        // Given/When: the web entry runs.
        // Then: the three contract tools are all callable by their contract names.
        expect([...mockRegistrations.keys()]).toEqual(['get_state', 'sign_in', 'complete_onboarding']);
    });

    it('waits for boot and signs up a new account via beginSignIn + signUpUser', async () => {
        // Given: the app boots anonymous, beginSignIn resolves accountExists=false,
        // and signUpUser lands a session token.
        jest.mocked(beginSignIn).mockImplementation(() => {
            Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false, accountExists: false});
        });
        jest.mocked(signUpUser).mockImplementation(() => {
            Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', authTokenType: null, email: 'x+1@gmail.com', accountID: 42, autoAuthState: CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN});
            Onyx.merge(ONYXKEYS.CREDENTIALS, {accountID: 42, login: 'x+1@gmail.com'});
        });

        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'anon', authTokenType: ANONYMOUS});

        // When: the tool runs before Onyx even carries a session, it waits for
        // boot instead of deciding from an empty store.
        const result = await call('sign_in', {email: 'x+1@gmail.com', timeoutMs: 2000});

        // Then: ok:true is only reported after a non-anonymous session exists.
        expect(result).toMatchObject({ok: true, state: {accountID: 42, login: 'x+1@gmail.com'}});
        expect(beginSignIn).toHaveBeenCalledWith('x+1@gmail.com');
        expect(signUpUser).toHaveBeenCalledTimes(1);
    });

    it('reports already with the shared envelope when the session matches the email', async () => {
        // Given: a real (non-anonymous) session for the requested email.
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', email: 'in@gmail.com', autoAuthState: CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN});

        const result = await call('sign_in', {email: 'in@gmail.com', timeoutMs: 2000});

        // Then: nothing is dispatched; the contract says already:true means the
        // state held before the call.
        expect(result).toMatchObject({ok: true, already: true, state: {login: 'in@gmail.com'}});
        expect(beginSignIn).not.toHaveBeenCalled();
        expect(signUpUser).not.toHaveBeenCalled();
    });

    it('refuses a session that belongs to a different login', async () => {
        // Given: signed in as someone else (shared-browser leftovers).
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', email: 'other@gmail.com', autoAuthState: CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN});

        const result = await call('sign_in', {email: 'wanted@gmail.com', timeoutMs: 2000});

        // Then: ok:false with a reason naming both logins, so the caller does
        // not attribute another identity's state to this run.
        expect(result?.ok).toBe(false);
        expect(String(result?.reason)).toContain('other@gmail.com');
        expect(String(result?.reason)).toContain('wanted@gmail.com');
        expect(beginSignIn).not.toHaveBeenCalled();
    });

    it('reports the validate-code wall instead of pretending success', async () => {
        // Given: beginSignIn says the account exists.
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'anon', authTokenType: ANONYMOUS});
        jest.mocked(beginSignIn).mockImplementation(() => {
            Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false, accountExists: true});
        });

        const result = await call('sign_in', {email: 'old@gmail.com', timeoutMs: 2000});

        // Then: the remaining step is the emailed code no CI run can read.
        expect(result?.ok).toBe(false);
        expect(String(result?.reason)).toContain('magic code');
        expect(signUpUser).not.toHaveBeenCalled();
    });

    it('surfaces beginSignIn errors with the Onyx error payload', async () => {
        // Given: beginSignIn writes account errors (Onyx keys them by error code).
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'anon', authTokenType: ANONYMOUS});
        jest.mocked(beginSignIn).mockImplementation(() => {
            Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false, errors: {errorCode: 'Blocked'}});
        });

        const result = await call('sign_in', {email: 'bad@gmail.com', timeoutMs: 2000});

        // Then: the envelope carries the reason verbatim enough to act on.
        expect(result?.ok).toBe(false);
        expect(String(result?.reason)).toContain('Blocked');
    });

    it('gives up with the account snapshot when no session token arrives', async () => {
        // Given: signUpUser never lands a session.
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'anon', authTokenType: ANONYMOUS});
        jest.mocked(beginSignIn).mockImplementation(() => {
            Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false, accountExists: false});
        });

        const result = await call('sign_in', {email: 'slow@gmail.com', timeoutMs: 400});

        // Then: the timeout reason plus the account state explain the stall.
        expect(result?.ok).toBe(false);
        expect(String(result?.reason)).toContain('no session token');
        expect(result?.state).toBeTruthy();
    });
});

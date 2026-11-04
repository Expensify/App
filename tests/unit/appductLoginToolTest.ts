import {beginSignIn, signUpUser} from '@userActions/Session';

import {registerLoginTool} from '@src/appduct/loginTool';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, Session} from '@src/types/onyx';

import {registerTool} from '@appduct/web';
import Onyx from 'react-native-onyx';

type Registration = {
    name: string;
    inputSchema: unknown;
    outputSchema: unknown;
    handler: (args: Record<string, unknown>, ctx: {signal: AbortSignal}) => Promise<Record<string, unknown>>;
};

// jest.mock factories are hoisted above module scope, so the registry is filled by stubbing
// registerTool in beforeAll rather than from inside the factory.
jest.mock('@appduct/web', () => ({registerTool: jest.fn()}));

jest.mock('@userActions/Session', () => ({
    beginSignIn: jest.fn(),
    signUpUser: jest.fn(),
}));

const registrations = new Map<string, Registration>();
let tool: Registration;

function callTool(args: Record<string, unknown>) {
    return tool.handler(args, {signal: new AbortController().signal});
}

function accountPatch(patch: Record<string, unknown>) {
    return patch as Account;
}

function sessionPatch(patch: Record<string, unknown>) {
    return patch as Session;
}

function serverError(message: string) {
    return {[String(Date.now())]: {message, errorList: ''}};
}

/** Let a write's rejection settle in this test without returning a promise from a void callback. */
function fire(promise: Promise<unknown>) {
    promise.catch(() => {});
}

/**
 * Resolves with the first value Onyx publishes for one of the two keys this tool watches.
 * Keyed explicitly rather than generically so the Onyx types stay inferred.
 */
function waitForAccount(): Promise<Account | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.ACCOUNT,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

function waitForSession(): Promise<Session | undefined> {
    return new Promise((resolve) => {
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.SESSION,
            callback: (value) => {
                Onyx.disconnect(connection);
                resolve(value);
            },
        });
    });
}

/**
 * Writes that stand in for an API response, deferred by one macrotask so both key
 * subscriptions exist before they land, the way a network round trip guarantees.
 */
function respond(merge: () => Promise<unknown>) {
    setTimeout(() => {
        fire(merge());
    }, 0);
}

function respondWithAccount(patch: Record<string, unknown>) {
    respond(() => Onyx.merge(ONYXKEYS.ACCOUNT, accountPatch(patch)));
}

function respondWithSession(patch: Record<string, unknown>) {
    respond(() => Onyx.merge(ONYXKEYS.SESSION, sessionPatch(patch)));
}

beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
    jest.mocked(registerTool).mockImplementation((registration) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only: the mocked registrar captures a real registration, which the SDK types generically per schema
        const typed = registration as unknown as Registration;
        registrations.set(typed.name, typed);
        return {remove: () => registrations.delete(typed.name)};
    });
    registerLoginTool();
    const registration = registrations.get('ensure_test_session');
    if (!registration) {
        throw new Error('ensure_test_session was not registered');
    }
    tool = registration;
});

beforeEach(async () => {
    jest.clearAllMocks();
    await Onyx.clear();
});

afterAll(async () => {
    await Onyx.clear();
});

describe('ensure_test_session', () => {
    it('declares both schemas: a value-returning handler without an outputSchema is rejected at call time', () => {
        expect(tool.inputSchema).toBeTruthy();
        expect(tool.outputSchema).toBeTruthy();
    });

    it('creates a new account through the UI actions and reports the session', async () => {
        jest.mocked(beginSignIn).mockImplementation(() => {
            respondWithAccount({accountExists: false, isLoading: false});
        });
        jest.mocked(signUpUser).mockImplementation(() => {
            respondWithSession({authToken: 'token-1', accountID: 4242});
        });

        const result = await callTool({login: 'melvinbottestuser+new@gmail.com'});

        expect(beginSignIn).toHaveBeenCalledWith('melvinbottestuser+new@gmail.com');
        expect(signUpUser).toHaveBeenCalledWith('melvinbottestuser+new@gmail.com', undefined);
        expect(result).toMatchObject({outcome: 'authenticated', accountID: 4242, login: 'melvinbottestuser+new@gmail.com'});
    });

    it('refuses an existing account rather than waiting for a magic code it cannot read', async () => {
        jest.mocked(beginSignIn).mockImplementation(() => {
            respondWithAccount({accountExists: true, isLoading: false});
        });

        const result = await callTool({login: 'someone@gmail.com'});

        expect(result).toMatchObject({outcome: 'needs_validate_code'});
        expect(signUpUser).not.toHaveBeenCalled();
    });

    it('reports a server error from BeginSignIn instead of signing up anyway', async () => {
        jest.mocked(beginSignIn).mockImplementation(() => {
            respondWithAccount({accountExists: false, isLoading: false, errors: serverError('Please try again later')});
        });

        const result = await callTool({login: 'melvinbottestuser+err@gmail.com'});

        expect(result).toMatchObject({outcome: 'begin_signin_failed', detail: 'Please try again later'});
        expect(signUpUser).not.toHaveBeenCalled();
    });

    it('reports sign_up_failed as soon as SignUpUser leaves an error, without burning the timeout', async () => {
        jest.mocked(beginSignIn).mockImplementation(() => {
            respondWithAccount({accountExists: false, isLoading: false});
        });
        jest.mocked(signUpUser).mockImplementation(() => {
            respondWithAccount({accountExists: false, isLoading: false, errors: serverError('Account creation is blocked')});
        });

        const startedAt = Date.now();
        const result = await callTool({login: 'melvinbottestuser+blocked@gmail.com'});

        expect(result).toMatchObject({outcome: 'sign_up_failed', detail: 'Account creation is blocked'});
        expect(Date.now() - startedAt).toBeLessThan(5000);
    });

    it('does not mistake the anonymous boot session for a signup landing', async () => {
        // Public-room access signs the boot state in with a real token of type
        // anonymousAccount, so a wait on "any token" would report authenticated the
        // instant SignUpUser was dispatched, before the server answered anything.
        await Onyx.merge(ONYXKEYS.SESSION, sessionPatch({authToken: 'anonymous-token', authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS, accountID: 1}));
        jest.mocked(beginSignIn).mockImplementation(() => {
            respondWithAccount({accountExists: false, isLoading: false});
        });
        jest.mocked(signUpUser).mockImplementation(() => {
            // Only the anonymous token ever exists: the signup never lands.
            respondWithAccount({accountExists: false, isLoading: false, errors: serverError('Signup never completed')});
        });

        const result = await callTool({login: 'melvinbottestuser+anon@gmail.com'});

        expect(result).toMatchObject({outcome: 'sign_up_failed'});
    });

    it('stops at BeginSignIn in dryRun and never calls SignUpUser', async () => {
        jest.mocked(beginSignIn).mockImplementation(() => {
            respondWithAccount({accountExists: false, isLoading: false});
        });

        const result = await callTool({login: 'melvinbottestuser+dry@gmail.com', dryRun: true});

        expect(result).toMatchObject({outcome: 'dry_run', detail: 'accountExists=false'});
        expect(signUpUser).not.toHaveBeenCalled();
    });

    it('sees a response written while the dispatch is still on the stack', async () => {
        // The subscribe-before-dispatch ordering exists for this case: a merge applied before
        // beginSignIn returns is invisible to a subscriber that attaches after it returns.
        const accountWritten = waitForAccount();
        const sessionWritten = waitForSession();

        jest.mocked(beginSignIn).mockImplementation(() => {
            fire(Onyx.merge(ONYXKEYS.ACCOUNT, accountPatch({accountExists: false, isLoading: false})));
        });
        jest.mocked(signUpUser).mockImplementation(() => {
            fire(Onyx.merge(ONYXKEYS.SESSION, sessionPatch({authToken: 'token-2'})));
        });

        const result = callTool({login: 'melvinbottestuser+sync@gmail.com'});
        await accountWritten;
        await sessionWritten;

        await expect(result).resolves.toMatchObject({outcome: 'authenticated'});
    });
});

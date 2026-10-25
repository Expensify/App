import {beginSignIn, signUpUser} from '@userActions/Session';

import type {AppductTool} from './types';

import {isSignedIn, state} from './appductState';
import waitFor from './waitFor';

/**
 * Sign the app in as an identity through the same actions the sign-in form
 * performs (BeginSignIn, then SignUpUser for a new account). The contract is
 * defined by the CI caller and mirrored in the description below.
 *
 * The form resolves the pressed element into a snapshot ref, and that ref goes
 * stale when the signed-in tree re-renders between capture and press. This tool
 * calls the button handlers directly, with no snapshot in the path, and waits
 * for the session token instead of returning at dispatch.
 */
function registerSignInTool(registerTool: (tool: AppductTool) => void) {
    const accountSnapshot = () => ({
        isLoading: state.account?.isLoading ?? null,
        accountExists: state.account?.accountExists ?? null,
        errors: state.account?.errors ?? null,
    });

    const identityState = () => ({
        signedIn: true,
        accountID: state.session?.accountID ?? state.credentials?.accountID ?? null,
        login: state.session?.email ?? state.credentials?.login ?? null,
    });

    /** The session login can arrive on the session, the credentials, or the personal details. */
    const signedInAs = (email: string) => {
        const login = (state.session?.email ?? state.credentials?.login ?? '').toLowerCase();
        return login === email.toLowerCase();
    };

    registerTool({
        name: 'sign_in',
        description:
            'Sign in with a test account email through the same actions the sign-in form performs (BeginSignIn, then SignUpUser for a new account). ' +
            'Guarantees a non-anonymous session whose login is the given email, checked before returning. Returns ok:false with a reason instead of throwing.',
        inputSchema: {
            type: 'object',
            properties: {
                email: {type: 'string', description: 'Test account email to sign in as.'},
                timeoutMs: {type: 'number', description: 'Overall budget in ms. Default 45000.'},
            },
            required: ['email'],
        },
        outputSchema: {
            type: 'object',
            properties: {
                ok: {type: 'boolean'},
                already: {type: 'boolean'},
                state: {type: 'object'},
                reason: {type: 'string'},
            },
            required: ['ok'],
        },
        timeoutMs: 120_000,
        handler: async (input) => {
            // Defensive reads: the raw JSON Schema drives export, the handler is
            // the last place a malformed call can be turned into a reason.
            const email = typeof input.email === 'string' ? input.email.trim() : '';
            if (!email) {
                return {ok: false, reason: 'email is required and must be a string'};
            }
            const budget = typeof input.timeoutMs === 'number' ? input.timeoutMs : 45_000;
            const deadline = Date.now() + budget;

            // The app boots anonymous; sign_in cannot decide anything before
            // Onyx carries a session (even the anonymous one).
            if (!state.session) {
                const booted = await waitFor(() => !!state.session, budget);
                if (!booted) {
                    return {ok: false, reason: 'session Onyx key never populated (app not booted yet?)'};
                }
            }

            if (isSignedIn()) {
                if (!signedInAs(email)) {
                    return {
                        ok: false,
                        reason: `already signed in as ${state.session?.email ?? state.credentials?.login ?? 'an unknown login'}, not ${email}`,
                    };
                }
                return {ok: true, already: true, state: identityState()};
            }

            // Mirror the form: Continue calls beginSignIn even for brand-new
            // accounts; the response (ACCOUNT.accountExists) decides sign-up
            // vs validate-code.
            beginSignIn(email);
            await waitFor(() => state.account?.isLoading === false, deadline - Date.now());

            if (isSignedIn()) {
                return {ok: true, state: identityState()};
            }

            if (state.account?.accountExists) {
                // Returning account: the remaining step is the emailed magic
                // code, which no CI run can read. The caller must mint a fresh
                // alias, not retry.
                return {ok: false, reason: 'account exists and needs the emailed magic code; mint a new alias email'};
            }

            if (state.account?.errors && Object.keys(state.account.errors).length > 0) {
                return {ok: false, reason: `beginSignIn failed: ${JSON.stringify(state.account.errors)}`};
            }

            signUpUser(email, undefined);
            const ok = await waitFor(isSignedIn, deadline - Date.now());
            if (!ok) {
                return {ok: false, reason: `no session token within ${budget}ms`, state: accountSnapshot()};
            }
            return {ok: true, state: identityState()};
        },
    });
}

export default registerSignInTool;

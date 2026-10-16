import {beginSignIn, isAnonymousUser, signUpUser} from '@userActions/Session';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Account, Credentials, Session as SessionOnyx} from '@src/types/onyx';

import {registerTool} from '@appduct/web';
// Appduct tools for the CI web pre-start ceremony (PoC).
//
// The CI pre-start replays sign-in through agent-device (fill email, press
// Continue). Replay resolves the selector into a snapshot ref, and the ref goes
// stale when the signed-in tree re-renders between capture and press: the press
// then fails "Unknown ref" instead of clicking. The tool below performs the
// sign-in the form performs, through the same actions the buttons call, with no
// snapshot and no ref in the path.
//
// Caller: `appduct tools call sign_in --input '{"email":"..."}'`, run by the
// CI pre-start before it falls back to replaying flows/macros/web/sign-in.ad.
// Dev builds only: @appduct/web resolves to an inert entry outside the
// `development` export condition, so the production bundle registers nothing
// and opens no connection.
//
// Scope: sign-in only, to the landing the sign-in.ad @post asserts. Onboarding
// stays macro-driven; state=onboarding-incomplete stays possible.
import Onyx from 'react-native-onyx';

import {waitFor} from './waitFor';

function registerAppductTools() {
    // The keys the sign-in page reads; module-level connect is the pattern
    // already used outside components (see libs/CurrencyUtils.ts).
    let session: SessionOnyx | undefined;
    let account: Account | undefined;
    let credentials: Credentials | undefined;

    Onyx.connect({key: ONYXKEYS.SESSION, callback: (value) => (session = value)});
    Onyx.connect({key: ONYXKEYS.ACCOUNT, callback: (value) => (account = value)});
    Onyx.connect({key: ONYXKEYS.CREDENTIALS, callback: (value) => (credentials = value)});

    const isSignedIn = () => Boolean(session?.authToken) && !isAnonymousUser(session);

    const signedInResult = (source: string) => ({
        signedIn: true,
        source,
        accountID: credentials?.accountID ?? null,
        login: session?.email ?? credentials?.login ?? null,
    });

    const accountSnapshot = () => ({
        isLoading: account?.isLoading ?? null,
        accountExists: account?.accountExists ?? null,
        errors: account?.errors ?? null,
        loadingForm: account?.loadingForm ?? null,
    });

    registerTool({
        name: 'sign_in',
        description:
            'Sign in with a test account email through the same actions the sign-in form performs (BeginSignIn, then SignUpUser for a new account). ' +
            'Waits for the session token instead of returning at dispatch. Returns signedIn=false with a reason instead of throwing when the flow cannot complete.',
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
                signedIn: {type: 'boolean'},
                source: {type: 'string'},
                accountID: {type: ['integer', 'null']},
                login: {type: ['string', 'null']},
                reason: {type: 'string'},
                account: {type: 'object'},
            },
            required: ['signedIn'],
        },
        timeoutMs: 120_000,
        handler: async ({email, timeoutMs}: {email: string; timeoutMs?: number}) => {
            const budget = timeoutMs ?? 45_000;
            const deadline = Date.now() + budget;

            // The app boots anonymous; sign_in cannot decide anything before
            // Onyx carries a session (even the anonymous one).
            if (!session) {
                const booted = await waitFor(() => Boolean(session), budget);
                if (!booted) {
                    return {signedIn: false, reason: 'session Onyx key never populated (app not booted yet?)'};
                }
            }

            if (isSignedIn()) {
                return signedInResult('already-signed-in');
            }

            // Mirror the form: Continue calls beginSignIn even for brand-new
            // accounts; the response (ACCOUNT.accountExists) decides sign-up
            // vs validate-code.
            beginSignIn(email);
            await waitFor(() => account?.isLoading === false, deadline - Date.now());

            if (isSignedIn()) {
                return signedInResult('begin-sign-in');
            }

            if (account?.accountExists) {
                // Returning account: the remaining step is the emailed magic
                // code, which no CI run can read. The caller must mint a fresh
                // alias (same rule the macro path already follows), not retry.
                return {signedIn: false, reason: 'account exists and needs the emailed magic code; mint a new alias email'};
            }

            if (account?.errors && Object.keys(account.errors).length > 0) {
                return {signedIn: false, reason: `beginSignIn failed: ${JSON.stringify(account.errors)}`};
            }

            signUpUser(email, undefined);
            const ok = await waitFor(isSignedIn, deadline - Date.now());
            if (!ok) {
                return {signedIn: false, reason: `no session token within ${budget}ms`, account: accountSnapshot()};
            }
            return signedInResult('sign-up-user');
        },
    });

    registerTool({
        name: 'prestart_status',
        description: 'Report current auth state without acting: the sign-in landing check, in machine form.',
        inputSchema: {type: 'object', properties: {}},
        outputSchema: {
            type: 'object',
            properties: {
                booted: {type: 'boolean'},
                signedIn: {type: 'boolean'},
                anonymous: {type: 'boolean'},
                autoAuthState: {type: ['string', 'null']},
                login: {type: ['string', 'null']},
                accountID: {type: ['integer', 'null']},
            },
            required: ['booted', 'signedIn', 'anonymous'],
        },
        timeoutMs: 5_000,
        handler: async () => ({
            booted: Boolean(session),
            signedIn: isSignedIn(),
            anonymous: isAnonymousUser(session),
            autoAuthState: session?.autoAuthState ?? null,
            login: session?.email ?? null,
            accountID: credentials?.accountID ?? null,
        }),
    });
}

export default registerAppductTools;

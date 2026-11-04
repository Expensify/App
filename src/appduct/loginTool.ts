import {beginSignIn, signUpUser} from '@userActions/Session';

import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasNonAnonymousSessionSelector} from '@src/selectors/Session';
import type {Account, Session} from '@src/types/onyx';

import {registerTool} from '@appduct/web';
/**
 * Appduct login tool (PoC).
 *
 * Replaces the three tap sequences Melvin's pre-start ceremony replays
 * (sign-in.ad, join.ad, complete-onboarding.ad) with one call that returns a
 * structured verdict instead of a UI landmark match.
 *
 * It drives the same action layer the UI does. No new auth path: BeginSignIn
 * then SignUpUser, the two commands SignUpWelcomeForm's Join button reaches
 * through. SignUpUser signs the new account in itself, so no magic code is
 * involved, which is the same reason the .ad ceremony never fetched one.
 *
 * Registered only in dev builds; see the require site in index.js.
 */
import Onyx from 'react-native-onyx';

import {rawSchema} from './schema';

type Outcome = 'authenticated' | 'needs_validate_code' | 'begin_signin_failed' | 'sign_up_failed' | 'timeout' | 'dry_run';

type LoginInput = {
    login: string;
    dryRun?: boolean;
};

type LoginOutput = {
    outcome: Outcome;
    login: string;
    accountID?: number | null;
    onboardingSkippedByConfig: boolean;
    detail?: string | null;
};

// BeginSignIn and SignUpUser each round-trip; the ceremony budget they replace is 45s.
const PHASE_TIMEOUT_MS = 45000;

/**
 * Resolves with what `subscribe` reports, or `undefined` at the deadline.
 *
 * `subscribe` owns its connection and must notify at most once, disconnecting before it does:
 * that keeps the Onyx key types at the call site instead of casting them here.
 *
 * `dispatch` runs after the subscription exists, because BeginSignIn's optimistic merge can land
 * before a subscriber attached afterwards would see it. The deadline is still needed: a failed
 * request clears the loading flag and leaves the watched field unchanged, which no predicate on
 * that field separates from "still loading".
 */
function waitFor<T>(subscribe: (notify: (value: T) => void) => void, dispatch: (() => void) | undefined, signal: AbortSignal, timeoutMs: number): Promise<T | undefined> {
    return new Promise((resolve) => {
        let settled = false;
        let timer: ReturnType<typeof setTimeout>;
        const onAbort = () => finish(undefined);
        function finish(value: T | undefined) {
            if (settled) {
                return;
            }
            settled = true;
            clearTimeout(timer);
            signal.removeEventListener('abort', onAbort);
            resolve(value);
        }
        timer = setTimeout(() => finish(undefined), timeoutMs);
        signal.addEventListener('abort', onAbort, {once: true});
        subscribe(finish);
        dispatch?.();
    });
}

/** What a signup attempt settled on: a session, an account error, or neither within the budget. */
type SignupOutcome = {session: Session | undefined; accountError: string | undefined};

function latestError(account: Account | undefined): string | undefined {
    const errors = account?.errors ? Object.values(account.errors) : [];
    if (errors.length === 0) {
        return undefined;
    }
    return String(errors.at(-1)?.message ?? '');
}

function registerLoginTool(): void {
    registerTool({
        name: 'ensure_test_session',
        description:
            'Sign this dev build in as a test login through the app’s own auth actions, skipping the login form, the Join button and the onboarding flow. Returns a structured verdict instead of a screen match. Only a brand-new address can complete: an existing account needs a magic code no automated caller can obtain.',
        // A raw JSON Schema is published verbatim and never validated app-side, so the handler
        // receives exactly what the caller sent.
        inputSchema: rawSchema<LoginInput>({
            type: 'object',
            properties: {
                login: {type: 'string', description: 'Email to sign in as. Mint a fresh alias; a used one resolves to needs_validate_code.'},
                dryRun: {type: 'boolean', description: 'Send BeginSignIn only and report what it decided. Creates no account.'},
            },
            required: ['login'],
            additionalProperties: false,
        }),
        // A handler that returns a value with no outputSchema is rejected at call time with
        // tool_output_validation_error, so the verdict shape has to be declared.
        outputSchema: rawSchema<LoginOutput>({
            type: 'object',
            properties: {
                outcome: {type: 'string', enum: ['authenticated', 'needs_validate_code', 'begin_signin_failed', 'sign_up_failed', 'timeout', 'dry_run']},
                login: {type: 'string'},
                accountID: {type: ['number', 'null']},
                onboardingSkippedByConfig: {type: 'boolean', description: 'CONFIG.SKIP_ONBOARDING in this bundle. False means the caller still has to clear the onboarding UI.'},
                detail: {type: ['string', 'null'], description: 'Server error text, or the phase a timeout died in.'},
            },
            required: ['outcome', 'login', 'onboardingSkippedByConfig'],
        }),
        timeoutMs: 120000,
        group: 'auth',
        handler: async ({login, dryRun}, {signal}) => {
            const base = {login, onboardingSkippedByConfig: CONFIG.SKIP_ONBOARDING};

            const account = await waitFor<Account>(
                (notify) => {
                    const connection = Onyx.connectWithoutView({
                        key: ONYXKEYS.ACCOUNT,
                        callback: (value) => {
                            if (!value || value.isLoading === true || value.accountExists === undefined) {
                                return;
                            }
                            Onyx.disconnect(connection);
                            notify(value);
                        },
                    });
                },
                () => beginSignIn(login),
                signal,
                PHASE_TIMEOUT_MS,
            );

            // dryRun stops at the one read-only command. It answers the question that decides
            // whether this approach holds for a given address: can that account be created?
            if (dryRun) {
                const outcome: Outcome = account?.accountExists === true ? 'needs_validate_code' : 'dry_run';
                return {...base, outcome, detail: account ? `accountExists=${String(account.accountExists)}` : 'BeginSignIn produced no accountExists within the budget'};
            }

            if (!account) {
                return {...base, outcome: 'timeout' as const, detail: 'BeginSignIn produced no accountExists within the budget'};
            }
            const beginError = latestError(account);
            if (account.accountExists === true) {
                return {...base, outcome: 'needs_validate_code' as const, detail: beginError ?? null};
            }
            if (beginError) {
                return {...base, outcome: 'begin_signin_failed' as const, detail: beginError};
            }

            // SignUpUser reports success by writing a session token and failure by writing an
            // account error. Waiting on the token alone turns every rejected signup into a full
            // timeout, so watch both and take whichever arrives first. Anonymous public-room
            // sessions also carry a token, so "any token" would read the boot state as the
            // signup landing; the app's own signed-in definition excludes them.
            const signedIn = waitFor<Session>(
                (notify) => {
                    const connection = Onyx.connectWithoutView({
                        key: ONYXKEYS.SESSION,
                        callback: (value) => {
                            if (!value || !hasNonAnonymousSessionSelector(value)) {
                                return;
                            }
                            Onyx.disconnect(connection);
                            notify(value);
                        },
                    });
                },
                () => signUpUser(login, undefined),
                signal,
                PHASE_TIMEOUT_MS,
            ).then((session): SignupOutcome => ({session, accountError: undefined}));

            const signupRejected = waitFor<Account>(
                (notify) => {
                    const connection = Onyx.connectWithoutView({
                        key: ONYXKEYS.ACCOUNT,
                        callback: (value) => {
                            const error = latestError(value);
                            if (value?.isLoading === true || error === undefined) {
                                return;
                            }
                            Onyx.disconnect(connection);
                            notify(value);
                        },
                    });
                },
                undefined,
                signal,
                PHASE_TIMEOUT_MS,
            ).then((failedAccount): SignupOutcome => ({session: undefined, accountError: latestError(failedAccount)}));

            const {session, accountError} = await Promise.race([signedIn, signupRejected]);
            if (!session || !hasNonAnonymousSessionSelector(session)) {
                return {...base, outcome: accountError ? ('sign_up_failed' as const) : ('timeout' as const), detail: accountError ?? 'no authToken after SignUpUser'};
            }

            // SKIP_ONBOARDING makes OnboardingGuard bounce the REPLACE into onboarding to home,
            // which is what leaves a fresh account on the app shell. Without the flag the caller
            // still has to clear onboarding, so report that instead of claiming a landing this
            // bundle will not produce.
            if (!CONFIG.SKIP_ONBOARDING) {
                return {...base, outcome: 'authenticated' as const, accountID: session.accountID ?? null, detail: 'authenticated; onboarding UI still active (SKIP_ONBOARDING not set)'};
            }

            return {...base, outcome: 'authenticated' as const, accountID: session.accountID ?? null, detail: null};
        },
    });
}

export {registerLoginTool};
export type {LoginInput, LoginOutput, Outcome as LoginOutcome};

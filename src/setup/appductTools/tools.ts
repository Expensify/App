import {getOnboardingMessages} from '@libs/actions/Welcome/OnboardingFlow';
import {waitForWrites} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';
import getIsSmallScreenWidth from '@libs/getIsSmallScreenWidth';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import navigationRef from '@libs/Navigation/navigationRef';
import {getPersonalDetail} from '@libs/PersonalDetailsStore';

import {completeOnboarding} from '@userActions/Report';
import {beginSignIn, isAnonymousUser, signUpUser} from '@userActions/Session';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import NAVIGATORS from '@src/NAVIGATORS';

import {hasSeenTourSelector} from '@selectors/Onboarding';

import {getCurrentAccountID, getOnboardingCompletedFlag, getSessionLogin, isGuidedSetupPending, isSignedIn, markSignInAttemptLoading, state} from './appductState';

// ok:true means the state was read back inside the app, never just dispatched. already:true means it held
// before the call. ok:false always carries a reason.
type ToolResult = {
    ok: boolean;
    already?: boolean;
    state?: Record<string, unknown>;
    reason?: string;
};

// Both schemas are required so the SDK infers Record<string, unknown> on both sides of the handler.
type AppductTool = {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    outputSchema: Record<string, unknown>;
    timeoutMs: number;
    handler: (input: Record<string, unknown>) => Promise<ToolResult>;
};

const OUTPUT_SCHEMA = {
    type: 'object',
    properties: {
        ok: {type: 'boolean'},
        already: {type: 'boolean'},
        state: {type: 'object'},
        reason: {type: 'string'},
    },
    required: ['ok'],
};

const SIGN_IN_BUDGET_MS = 45_000;
const ONBOARDING_BUDGET_MS = 60_000;
const MODAL_CLOSE_BUDGET_MS = 5_000;

const stringInputSchema = (...fields: string[]) => ({
    type: 'object',
    properties: Object.fromEntries(fields.map((field) => [field, {type: 'string'}])),
    required: fields,
});

const fail = (reason: string): ToolResult => ({ok: false, reason});

// The input schema is not enforced at call time.
const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

function waitFor(check: () => boolean, timeoutMs: number): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    return new Promise((resolve) => {
        const poll = () => {
            if (check()) {
                resolve(true);
            } else if (Date.now() >= deadline) {
                resolve(false);
            } else {
                setTimeout(poll, 100);
            }
        };
        poll();
    });
}

const getState: AppductTool = {
    name: 'get_state',
    description:
        'Report the app state of the current identity without acting: booted, signedIn, anonymous, login, accountID, onboardingCompleted, isLoadingApp. ' +
        'onboardingCompleted is the raw stored flag; null means it has not loaded yet.',
    inputSchema: {type: 'object', properties: {}},
    outputSchema: OUTPUT_SCHEMA,
    timeoutMs: 5_000,
    handler: async () => ({
        ok: true,
        state: {
            booted: !!state.session,
            signedIn: isSignedIn(),
            anonymous: isAnonymousUser(state.session),
            // Personal details first: a fresh sign-up fills them, the session and the credentials at different times.
            login: getPersonalDetail(getCurrentAccountID())?.login ?? getSessionLogin() ?? null,
            accountID: getCurrentAccountID() ?? null,
            onboardingCompleted: getOnboardingCompletedFlag(),
            isLoadingApp: state.isLoadingApp ?? null,
        },
    }),
};

// Calls the form's actions directly: a snapshot ref of the pressed button goes stale when the signed-in
// tree re-renders between capture and press.
const signIn: AppductTool = {
    name: 'sign_in',
    description:
        'Sign up and sign in a brand-new test account through the same actions the sign-in form performs (BeginSignIn, then SignUpUser). ' +
        'Only works for an email with no account yet: an existing account needs the emailed magic code, which this tool cannot read, so it returns ok:false. ' +
        'Guarantees a non-anonymous session whose login is the given email, checked before returning. Returns ok:false with a reason instead of throwing.',
    inputSchema: stringInputSchema('email'),
    outputSchema: OUTPUT_SCHEMA,
    timeoutMs: 120_000,
    handler: async (input) => {
        const email = text(input.email);
        if (!email) {
            return fail('email is required and must be a string');
        }
        const deadline = Date.now() + SIGN_IN_BUDGET_MS;
        const until = (check: () => boolean) => waitFor(check, deadline - Date.now());
        const identity = () => ({signedIn: true, accountID: getCurrentAccountID() ?? null, login: getSessionLogin() ?? null});

        // The app boots anonymous; nothing can be decided before Onyx carries a session.
        if (!(await until(() => !!state.session))) {
            return fail('session Onyx key never populated (app not booted yet?)');
        }

        if (isSignedIn()) {
            return (getSessionLogin() ?? '').toLowerCase() === email.toLowerCase()
                ? {ok: true, already: true, state: identity()}
                : fail(`already signed in as ${getSessionLogin() ?? 'an unknown login'}, not ${email}`);
        }

        // Like the form, call beginSignIn even for a brand-new account: the response decides sign-up vs validate-code.
        // The loading flag is set before the call: beginSignIn only applies its own optimistic isLoading after
        // Device.getDeviceInfoWithID() resolves, so waiting for the idle value alone would read the idle state
        // seeded at boot and sign an existing account up.
        await markSignInAttemptLoading();
        beginSignIn(email);
        if (!(await until(() => state.account?.isLoading === false))) {
            return fail(`BeginSignIn got no response within ${SIGN_IN_BUDGET_MS}ms`);
        }

        if (!isSignedIn()) {
            if (state.account?.accountExists) {
                return fail('account already exists and needs the emailed magic code to sign in');
            }
            if (state.account?.errors && Object.keys(state.account.errors).length > 0) {
                return fail(`beginSignIn failed: ${JSON.stringify(state.account.errors)}`);
            }
            signUpUser(email, IntlStore.getCurrentLocale(), undefined, undefined, state.session);
            if (!(await until(isSignedIn))) {
                return {
                    ...fail(`no session token within ${SIGN_IN_BUDGET_MS}ms`),
                    state: {isLoading: state.account?.isLoading ?? null, accountExists: state.account?.accountExists ?? null, errors: state.account?.errors ?? null},
                };
            }
        }
        return {ok: true, state: identity()};
    },
};

function isOnboardingModalClosed(): boolean {
    return !navigationRef.isReady() || !navigationRef.getRootState()?.routes.some((route) => route.name === NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
}

const completeOnboardingTool: AppductTool = {
    name: 'complete_onboarding',
    description:
        'Complete first-run onboarding with the "looking around" engagement choice and the given name, through the same action the onboarding form performs. ' +
        'Waits for the stored onboarding-complete flag after the write queue drains, then closes the onboarding modal and lands on the home screen. ' +
        'Returns ok:false with a reason instead of throwing.',
    inputSchema: stringInputSchema('firstName', 'lastName'),
    outputSchema: OUTPUT_SCHEMA,
    timeoutMs: 180_000,
    handler: async (input) => {
        const firstName = text(input.firstName);
        const lastName = text(input.lastName);
        if (!firstName || !lastName) {
            return fail('firstName and lastName are required strings');
        }

        // The flag must be loaded before `false` can be told apart from "not loaded yet".
        if (!(await waitFor(() => isSignedIn() && state.isLoadingApp === false && getOnboardingCompletedFlag() !== null, ONBOARDING_BUDGET_MS))) {
            return fail(
                `onboarding preconditions never held within ${ONBOARDING_BUDGET_MS}ms: ` +
                    `signedIn=${isSignedIn()}, isLoadingApp=${String(state.isLoadingApp)}, onboardingLoaded=${getOnboardingCompletedFlag() !== null}`,
            );
        }

        // A queued request from an earlier call is waited for, never posted twice. A completed flag still runs
        // the exit below, so a modal left mounted by an interrupted exit gets closed.
        let already = false;
        if (isGuidedSetupPending()) {
            if (!(await waitFor(() => !isGuidedSetupPending() && getOnboardingCompletedFlag() === true, ONBOARDING_BUDGET_MS))) {
                return fail('a CompleteGuidedSetup request stayed queued past the timeout, or its response reverted the flag');
            }
        } else if (getOnboardingCompletedFlag() === true) {
            already = true;
        } else {
            // Without the Concierge chat as its target, completeOnboarding silently does nothing.
            if (!(await waitFor(() => !!state.conciergeReportID && !!state.conciergeChat?.reportID, ONBOARDING_BUDGET_MS))) {
                return fail(`concierge report never loaded (conciergeReportID=${String(state.conciergeReportID)})`);
            }

            const {onboardingMessages} = getOnboardingMessages(IntlStore.getCurrentLocale());
            await completeOnboarding({
                engagementChoice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND,
                onboardingMessage: onboardingMessages[CONST.ONBOARDING_CHOICES.LOOKING_AROUND],
                firstName,
                lastName,
                adminsChatReportID: state.onboardingAdminsChatReportID,
                onboardingPolicyID: state.onboardingPolicyID,
                introSelected: state.introSelected,
                isSelfTourViewed: hasSeenTourSelector(state.onboarding),
                conciergeChat: state.conciergeChat,
                currentUserAccountID: getCurrentAccountID() ?? CONST.DEFAULT_NUMBER_ID,
                delegateAccountID: undefined,
            });

            // The promise resolves at queue time and the flag is optimistic until the response settles it.
            // waitForWrites also resolves offline, where the request was only queued locally, so check the queue too.
            await waitForWrites(WRITE_COMMANDS.COMPLETE_GUIDED_SETUP);
            if (!(await waitFor(() => !isGuidedSetupPending(), 2_000))) {
                return fail('CompleteGuidedSetup never left the queue (offline? the server never saw it)');
            }
            if (getOnboardingCompletedFlag() !== true) {
                return fail('server rejected CompleteGuidedSetup: the onboarding flag reverted to false');
            }
        }

        // The navigator stays mounted until something navigates out of it, so the UI's own exit is called with the
        // values the page would read. canUseDefaultRooms is false (a fresh CI account has no betas) and
        // isAnonymousUser is false (the tool only runs once signed in).
        navigateAfterOnboardingWithMicrotaskQueue(getIsSmallScreenWidth(), false, state.conciergeReportID, undefined, false, state.onboardingPolicyID, undefined, false);
        if (!(await waitFor(isOnboardingModalClosed, MODAL_CLOSE_BUDGET_MS))) {
            return fail(`the onboarding modal stayed open after navigateAfterOnboarding (${MODAL_CLOSE_BUDGET_MS}ms)`);
        }

        const result = {ok: true, state: {onboardingCompleted: true, onboardingModalClosed: true}};
        return already ? {...result, already: true} : result;
    },
};

const tools: AppductTool[] = [getState, signIn, completeOnboardingTool];

export default tools;

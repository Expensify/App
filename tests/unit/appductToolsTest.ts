import {waitForWrites} from '@libs/API';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import navigationRef from '@libs/Navigation/navigationRef';

import {completeOnboarding} from '@userActions/Report';
import {beginSignIn, signUpUser} from '@userActions/Session';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import tools from '@src/setup/appduct/tools';
import type Account from '@src/types/onyx/Account';
import type {AnyRequest} from '@src/types/onyx/Request';

import type {NavigationState} from '@react-navigation/native';

import {addAppductListener, registerTool} from '@appduct/react-native';
import Onyx from 'react-native-onyx';

jest.mock('@userActions/Session', () => ({
    ...jest.requireActual<Record<string, unknown>>('@userActions/Session'),
    beginSignIn: jest.fn(),
    signUpUser: jest.fn(),
}));
jest.mock('@userActions/Report', () => ({completeOnboarding: jest.fn()}));
jest.mock('@libs/API', () => ({waitForWrites: jest.fn()}));
jest.mock('@libs/navigateAfterOnboarding', () => ({
    navigateAfterOnboarding: jest.fn(),
    navigateAfterOnboardingWithMicrotaskQueue: jest.fn(),
    navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue: jest.fn(),
}));
// isReady false means no navigator is mounted, so the onboarding modal counts as closed unless a test opens it.
jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {isReady: jest.fn(), getRootState: jest.fn()},
}));

const ANONYMOUS_SESSION = {authToken: 'anon', authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS};
const ACCOUNT_ID = 7;
const SIGNED_IN_SESSION = {authToken: 'tok', email: 's@gmail.com', accountID: ACCOUNT_ID};
const GUIDED_SETUP_REQUEST: AnyRequest = {command: 'CompleteGuidedSetup'};
const QUEUED_GUIDED_SETUP: AnyRequest[] = [GUIDED_SETUP_REQUEST];

function isStateChangeListener(listener: unknown): listener is (event: {state: 'connecting' | 'active'}) => void {
    return typeof listener === 'function';
}

/** Runs a tool to completion, fast-forwarding the fake clock through its polling waits. */
async function call(name: string, input: Record<string, unknown> = {}) {
    const result = tools.find((tool) => tool.name === name)?.handler(input);
    await jest.runAllTimersAsync();
    return result;
}

/** Makes beginSignIn answer with the given account state, as its response would. */
function mockBeginSignInResponse(account: Account) {
    jest.mocked(beginSignIn).mockImplementation(() => {
        Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false, ...account});
    });
}

function rootStateWith(routeNames: string[]): NavigationState {
    return {key: 'root', index: Math.max(routeNames.length - 1, 0), routeNames, routes: routeNames.map((name) => ({key: name, name})), type: 'stack', stale: false};
}

/* eslint-disable @typescript-eslint/unbound-method -- jest.fn() mocks don't rely on `this` binding */
const mockIsReady = jest.mocked(navigationRef.isReady);
const mockGetRootState = jest.mocked(navigationRef.getRootState);
/* eslint-enable @typescript-eslint/unbound-method */

beforeEach(async () => {
    jest.useFakeTimers();
    for (const mock of [registerTool, beginSignIn, signUpUser, completeOnboarding, waitForWrites, navigateAfterOnboardingWithMicrotaskQueue]) {
        jest.mocked(mock).mockReset();
    }
    mockIsReady.mockReturnValue(false);
    mockGetRootState.mockReturnValue(rootStateWith([]));
    Onyx.init({keys: ONYXKEYS});
    await Onyx.clear();
});

afterEach(async () => {
    await Onyx.clear();
    jest.useRealTimers();
});

describe('registration', () => {
    it('registers the contract tools by name once a session is active', async () => {
        await import('@src/setup/appduct');
        const onStateChange = jest.mocked(addAppductListener).mock.calls.at(0)?.[1];
        if (!isStateChangeListener(onStateChange)) {
            throw new Error('no stateChange listener was added');
        }

        onStateChange({state: 'connecting'});
        await jest.runAllTimersAsync();
        expect(registerTool).not.toHaveBeenCalled();

        onStateChange({state: 'active'});
        // The module registers from a dynamic import of ./tools, so let it settle.
        await jest.runAllTimersAsync();
        expect(jest.mocked(registerTool).mock.calls.map(([tool]) => tool.name)).toEqual(['get_state', 'sign_in', 'complete_onboarding']);
    });
});

describe('get_state', () => {
    it('reports an anonymous boot with the unloaded onboarding flag as null, without acting', async () => {
        await Onyx.multiSet({[ONYXKEYS.SESSION]: ANONYMOUS_SESSION, [ONYXKEYS.IS_LOADING_APP]: true});

        expect(await call('get_state')).toMatchObject({
            ok: true,
            state: {booted: true, signedIn: false, anonymous: true, onboardingCompleted: null, isLoadingApp: true},
        });
        expect(beginSignIn).not.toHaveBeenCalled();
        expect(signUpUser).not.toHaveBeenCalled();
    });

    it('reports the signed-in identity, taking the login from personal details', async () => {
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: {...SIGNED_IN_SESSION, email: 'session@gmail.com'},
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: 's@gmail.com'}},
            [ONYXKEYS.NVP_ONBOARDING]: {hasCompletedGuidedSetupFlow: true},
            [ONYXKEYS.IS_LOADING_APP]: false,
        });

        expect(await call('get_state')).toMatchObject({
            ok: true,
            state: {booted: true, signedIn: true, anonymous: false, login: 's@gmail.com', accountID: ACCOUNT_ID, onboardingCompleted: true, isLoadingApp: false},
        });
    });

    it('keeps an unfinished onboarding flag as false, distinct from null', async () => {
        await Onyx.multiSet({[ONYXKEYS.SESSION]: SIGNED_IN_SESSION, [ONYXKEYS.NVP_ONBOARDING]: {hasCompletedGuidedSetupFlow: false}});

        expect(await call('get_state')).toMatchObject({ok: true, state: {signedIn: true, onboardingCompleted: false}});
    });
});

describe('sign_in', () => {
    it('waits for boot, then signs up a new account', async () => {
        mockBeginSignInResponse({accountExists: false});
        jest.mocked(signUpUser).mockImplementation(() => {
            Onyx.merge(ONYXKEYS.SESSION, {...SIGNED_IN_SESSION, email: 'x+1@gmail.com', accountID: 42, authTokenType: null});
        });

        const result = call('sign_in', {email: 'x+1@gmail.com'});
        await Onyx.merge(ONYXKEYS.SESSION, ANONYMOUS_SESSION);

        expect(await result).toMatchObject({ok: true, state: {accountID: 42, login: 'x+1@gmail.com'}});
        expect(beginSignIn).toHaveBeenCalledWith('x+1@gmail.com');
        expect(signUpUser).toHaveBeenCalledTimes(1);
    });

    it('asks for the magic code without signing up an existing account, even while ACCOUNT holds its idle boot value', async () => {
        // The real BeginSignIn applies its optimistic isLoading late, only after Device.getDeviceInfoWithID()
        // resolves, so a tool that read the idle value seeded by src/setup/index.ts would sign the account up.
        await Onyx.multiSet({[ONYXKEYS.SESSION]: ANONYMOUS_SESSION, [ONYXKEYS.ACCOUNT]: CONST.DEFAULT_ACCOUNT_DATA});
        jest.mocked(beginSignIn).mockImplementation(() => {
            setTimeout(() => {
                Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: true, loadingForm: CONST.FORMS.LOGIN_FORM});
            }, 50);
            setTimeout(() => {
                Onyx.merge(ONYXKEYS.ACCOUNT, {isLoading: false, accountExists: true});
            }, 150);
        });

        const result = await call('sign_in', {email: 'x@gmail.com'});

        expect(result?.ok).toBe(false);
        expect(result?.reason).toContain('magic code');
        expect(signUpUser).not.toHaveBeenCalled();
    });

    it('reports already when the session matches the email, without acting', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, SIGNED_IN_SESSION);

        expect(await call('sign_in', {email: 'S@gmail.com'})).toMatchObject({ok: true, already: true, state: {login: 's@gmail.com'}});
        expect(beginSignIn).not.toHaveBeenCalled();
    });

    it('refuses a session that belongs to a different login', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, SIGNED_IN_SESSION);

        const result = await call('sign_in', {email: 'wanted@gmail.com'});

        expect(result?.ok).toBe(false);
        expect(result?.reason).toContain('s@gmail.com');
        expect(result?.reason).toContain('wanted@gmail.com');
        expect(beginSignIn).not.toHaveBeenCalled();
    });

    it.each([
        ['beginSignIn reports errors', {errors: {errorCode: 'Blocked'}}, 'Blocked', 0],
        ['sign-up never lands a session', {accountExists: false}, 'no session token', 1],
    ])('fails when %s', async (_title, account, reason, signUps) => {
        await Onyx.merge(ONYXKEYS.SESSION, ANONYMOUS_SESSION);
        mockBeginSignInResponse(account);

        const result = await call('sign_in', {email: 'x@gmail.com'});

        expect(result?.ok).toBe(false);
        expect(result?.reason).toContain(reason);
        expect(signUpUser).toHaveBeenCalledTimes(signUps);
    });

    it('fails without signing up when BeginSignIn never responds', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, ANONYMOUS_SESSION);
        jest.mocked(beginSignIn).mockImplementation(() => {});

        const result = await call('sign_in', {email: 'x@gmail.com'});

        expect(result?.ok).toBe(false);
        expect(result?.reason).toContain('BeginSignIn got no response');
        expect(signUpUser).not.toHaveBeenCalled();
    });
});

describe('complete_onboarding', () => {
    async function seed({flag, concierge = true}: {flag: boolean; concierge?: boolean}) {
        await Onyx.multiSet({
            [ONYXKEYS.SESSION]: SIGNED_IN_SESSION,
            [ONYXKEYS.NVP_ONBOARDING]: {hasCompletedGuidedSetupFlow: flag},
            [ONYXKEYS.IS_LOADING_APP]: false,
        });
        if (concierge) {
            await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, '99');
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}99`, {reportID: '99'});
        }
    }

    /** Behaves like the real action: optimistic flag, queued request, promise resolved at queue time. */
    function mockOptimisticCompletion() {
        jest.mocked(completeOnboarding).mockImplementation(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
            await Onyx.merge(ONYXKEYS.PERSISTED_REQUESTS, QUEUED_GUIDED_SETUP);
        });
    }

    it('completes with the looking-around choice and returns only after the queue drains', async () => {
        await seed({flag: false});
        mockOptimisticCompletion();
        jest.mocked(waitForWrites).mockImplementation(() => Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, []));

        const result = await call('complete_onboarding', {firstName: ' Test', lastName: 'Account'});

        expect(result).toMatchObject({ok: true, state: {onboardingCompleted: true}});
        expect(completeOnboarding).toHaveBeenCalledTimes(1);
        expect(completeOnboarding).toHaveBeenCalledWith(
            expect.objectContaining({
                engagementChoice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND,
                firstName: 'Test',
                lastName: 'Account',
                conciergeChat: expect.objectContaining({reportID: '99'}),
            }),
        );
        expect(navigateAfterOnboardingWithMicrotaskQueue).toHaveBeenCalledTimes(1);
    });

    it('reports already when the flag is true and nothing is queued, still closing the modal', async () => {
        await seed({flag: true, concierge: false});

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B'});

        expect(result).toMatchObject({ok: true, already: true, state: {onboardingCompleted: true}});
        expect(completeOnboarding).not.toHaveBeenCalled();
        expect(navigateAfterOnboardingWithMicrotaskQueue).toHaveBeenCalledTimes(1);
    });

    // The sequential queue moves its head request into the ongoing slot before the response lands, so a request
    // in either key is still pending.
    it.each([
        ['queue', (pending: boolean) => Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, pending ? QUEUED_GUIDED_SETUP : [])],
        ['ongoing slot', (pending: boolean) => Onyx.set(ONYXKEYS.PERSISTED_ONGOING_REQUESTS, pending ? GUIDED_SETUP_REQUEST : null)],
    ])('waits for a request in the %s instead of posting a second one', async (_slot, park) => {
        await seed({flag: true, concierge: false});
        await park(true);
        setTimeout(() => {
            park(false);
        }, 250);

        // No `already`: that would mean the pending request was missed and the optimistic flag taken as final.
        expect(await call('complete_onboarding', {firstName: 'A', lastName: 'B'})).toEqual({ok: true, state: {onboardingCompleted: true, onboardingModalClosed: true}});
        expect(completeOnboarding).not.toHaveBeenCalled();
    });

    it('fails when the onboarding modal stays open after navigating', async () => {
        await seed({flag: true, concierge: false});
        mockIsReady.mockReturnValue(true);
        mockGetRootState.mockReturnValue(rootStateWith([NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR]));

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B'});

        expect(result?.ok).toBe(false);
        expect(result?.reason).toContain('modal stayed open');
    });

    it('fails with the reason when the response reverts the flag', async () => {
        await seed({flag: false});
        mockOptimisticCompletion();
        jest.mocked(waitForWrites).mockImplementation(async () => {
            await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
            await Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, []);
        });

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B'});

        expect(result?.ok).toBe(false);
        expect(result?.reason).toContain('reverted');
        expect(navigateAfterOnboardingWithMicrotaskQueue).not.toHaveBeenCalled();
    });

    it('fails when the request never leaves the queue', async () => {
        await seed({flag: false});
        mockOptimisticCompletion();

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B'});

        expect(result?.ok).toBe(false);
        expect(result?.reason).toContain('never left the queue');
    });

    it('fails with the unmet precondition when the app never becomes ready', async () => {
        await Onyx.multiSet({[ONYXKEYS.SESSION]: ANONYMOUS_SESSION, [ONYXKEYS.IS_LOADING_APP]: true});

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B'});

        expect(result?.ok).toBe(false);
        expect(result?.reason).toContain('signedIn=false');
        expect(completeOnboarding).not.toHaveBeenCalled();
    });

    it('fails when the concierge report never loads', async () => {
        await seed({flag: false, concierge: false});

        const result = await call('complete_onboarding', {firstName: 'A', lastName: 'B'});

        expect(result?.ok).toBe(false);
        expect(result?.reason).toContain('concierge report never loaded');
        expect(completeOnboarding).not.toHaveBeenCalled();
    });
});

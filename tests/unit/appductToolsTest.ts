import {waitForWrites} from '@libs/API';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';

import {completeOnboarding} from '@userActions/Report';
import {beginSignIn, signUpUser} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import registerAppductTools from '@src/setup/appductTools/index.web';
import tools from '@src/setup/appductTools/tools';
import type Account from '@src/types/onyx/Account';
import type {AnyRequest} from '@src/types/onyx/Request';

import {registerTool} from '@appduct/web';
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

const ANONYMOUS_SESSION = {authToken: 'anon', authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS};
const SIGNED_IN_SESSION = {authToken: 'tok', email: 's@gmail.com', accountID: 7};
const QUEUED_GUIDED_SETUP: AnyRequest[] = [{command: 'CompleteGuidedSetup'}];

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

beforeEach(async () => {
    jest.useFakeTimers();
    [registerTool, beginSignIn, signUpUser, completeOnboarding, waitForWrites, navigateAfterOnboardingWithMicrotaskQueue].forEach((mock) => jest.mocked(mock).mockReset());
    Onyx.init({keys: ONYXKEYS});
    await Onyx.clear();
});

afterEach(async () => {
    await Onyx.clear();
    jest.useRealTimers();
});

describe('registration', () => {
    it('registers the contract tools by name', () => {
        registerAppductTools();
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
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: {7: {accountID: 7, login: 's@gmail.com'}},
            [ONYXKEYS.NVP_ONBOARDING]: {hasCompletedGuidedSetupFlow: true},
            [ONYXKEYS.IS_LOADING_APP]: false,
        });

        expect(await call('get_state')).toMatchObject({
            ok: true,
            state: {booted: true, signedIn: true, anonymous: false, login: 's@gmail.com', accountID: 7, onboardingCompleted: true, isLoadingApp: false},
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
        ['an existing account needs the magic code', {accountExists: true}, 'magic code', 0],
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

    it('waits for a queued request instead of posting a second one', async () => {
        await seed({flag: true, concierge: false});
        await Onyx.merge(ONYXKEYS.PERSISTED_REQUESTS, QUEUED_GUIDED_SETUP);
        setTimeout(() => {
            Onyx.set(ONYXKEYS.PERSISTED_REQUESTS, []);
        }, 250);

        expect(await call('complete_onboarding', {firstName: 'A', lastName: 'B'})).toMatchObject({ok: true, state: {onboardingCompleted: true}});
        expect(completeOnboarding).not.toHaveBeenCalled();
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

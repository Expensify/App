import {beginSignIn, signUpUser} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import registerAppductTools from '@src/setup/appductTools/index.web';

import Onyx from 'react-native-onyx';

/**
 * get_state tool behavior: a read of the Onyx snapshot with no actions
 * dispatched, so the test writes Onyx directly and calls the captured handler.
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
    isAnonymousUser: jest.requireActual<{isAnonymousUser: (session: {authTokenType?: string} | undefined) => boolean}>('@userActions/Session').isAnonymousUser,
}));

const ANONYMOUS = CONST.AUTH_TOKEN_TYPES.ANONYMOUS;
const ACCOUNT_ID = 7;

const call = (name: string, input: Record<string, unknown> = {}) => mockRegistrations.get(name)?.handler(input);

describe('appduct get_state tool', () => {
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

    it('reports an anonymous boot without acting', async () => {
        // Given: the app has just booted with the anonymous session and
        // nvp_onboarding has not loaded.
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'anon', authTokenType: ANONYMOUS});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);

        const result = await call('get_state');

        // Then: the raw flag is null (not defaulted to true), so a caller
        // cannot mistake "not loaded" for "done".
        expect(result).toMatchObject({
            ok: true,
            state: {booted: true, signedIn: false, anonymous: true, onboardingCompleted: null, isLoadingApp: true},
        });
        expect(beginSignIn).not.toHaveBeenCalled();
        expect(signUpUser).not.toHaveBeenCalled();
    });

    it('reports the signed-in identity and its state', async () => {
        // Given: a real session, personal details for the account, onboarding
        // complete.
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', email: 's@gmail.com', accountID: ACCOUNT_ID, autoAuthState: CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN});
        // The store wrapper reads personalDetailsList; seeding the key drives it.
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: 's@gmail.com'}});
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);

        const result = await call('get_state');

        // Then: read-only, and the fields the prestart recipe checks are all
        // present with their real values.
        expect(result).toMatchObject({
            ok: true,
            state: {booted: true, signedIn: true, anonymous: false, login: 's@gmail.com', accountID: ACCOUNT_ID, onboardingCompleted: true, isLoadingApp: false},
        });
        expect(beginSignIn).not.toHaveBeenCalled();
    });

    it('reports the unfinished onboarding flag as false', async () => {
        // Given: signed in with onboarding loaded and not completed.
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', email: 's@gmail.com', accountID: ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);

        const result = await call('get_state');

        // Then: false and null stay distinct; the recipe only accepts true.
        expect(result).toMatchObject({ok: true, state: {signedIn: true, onboardingCompleted: false}});
    });
});

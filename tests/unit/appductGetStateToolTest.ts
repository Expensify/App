type ToolRegistration = {
    name: string;
    handler: unknown;
};

/**
 * get_state tool behavior: a read of the Onyx snapshot with no actions
 * dispatched, so the test writes Onyx directly and calls the captured handler.
 */
const mockRegistrations = new Map<string, ToolRegistration>();

jest.mock('@appduct/web', () => ({
    registerTool: (registration: ToolRegistration) => {
        mockRegistrations.set(registration.name, registration);
        return {remove: jest.fn()};
    },
}));

jest.mock('@userActions/Session', () => {
    const CONST = require('@src/CONST').default;
    return {
        beginSignIn: jest.fn(),
        signUpUser: jest.fn(),
        isAnonymousUser: (session: {authTokenType?: string} | undefined) => session?.authTokenType === CONST.AUTH_TOKEN_TYPES.ANONYMOUS,
    };
});

import {beginSignIn, signUpUser} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
// eslint-disable-next-line no-restricted-syntax -- importing the web entry directly: native resolves a different file and Jest resolves platform files by the native preset
import registerAppductTools from '@src/setup/appductTools/index.web';

import Onyx from 'react-native-onyx';

const ANONYMOUS = CONST.AUTH_TOKEN_TYPES.ANONYMOUS;

type ToolHandler = (input?: Record<string, unknown>) => Promise<Record<string, unknown>>;
const call = (name: string, input: Record<string, unknown> = {}) => (mockRegistrations.get(name)?.handler as unknown as ToolHandler)(input);

describe('appduct get_state tool', () => {
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
        // Given: a real session, loaded personal details, onboarding complete.
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', email: 's@gmail.com', accountID: 7, autoAuthState: CONST.AUTO_AUTH_STATE.JUST_SIGNED_IN});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[7]: {accountID: 7, login: 's@gmail.com'}});
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: true});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);

        const result = await call('get_state');

        // Then: read-only, and the fields the prestart recipe checks are all
        // present with their real values.
        expect(result).toMatchObject({
            ok: true,
            state: {booted: true, signedIn: true, anonymous: false, login: 's@gmail.com', accountID: 7, onboardingCompleted: true, isLoadingApp: false},
        });
        expect(beginSignIn).not.toHaveBeenCalled();
    });

    it('reports the unfinished onboarding flag as false', async () => {
        // Given: signed in with onboarding loaded and not completed.
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'tok', email: 's@gmail.com', accountID: 7});
        await Onyx.merge(ONYXKEYS.NVP_ONBOARDING, {hasCompletedGuidedSetupFlow: false});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);

        const result = await call('get_state');

        // Then: false and null stay distinct; the recipe only accepts true.
        expect(result).toMatchObject({ok: true, state: {signedIn: true, onboardingCompleted: false}});
    });
});

import {openLink} from '@libs/actions/Link';
import CONST from '@src/CONST';

// Navigation is mocked globally via tests/unit/mocks or jest setup; mock it here explicitly.
const mockNavigate = jest.fn();
jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        navigate: (...args: unknown[]): void => {
            mockNavigate(...args);
        },
        closeRHPFlow: jest.fn(),
    },
}));

// asyncOpenURL underlies openExternalLink — spy on it to detect external opens.
const mockAsyncOpenURL = jest.fn();
jest.mock('@libs/asyncOpenURL', () => ({
    __esModule: true,
    default: (...args: unknown[]): void => {
        mockAsyncOpenURL(...args);
    },
}));

// Keep layout simple (not narrow) so the RHP swap branch doesn't run.
jest.mock('@libs/getIsNarrowLayout', () => ({
    __esModule: true,
    default: () => false,
}));

// Provide a minimal navigation state with no open RHP.
jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {
        getRootState: () => ({routes: []}),
    },
}));

// Not an anonymous user — skip the sign-out branch.
jest.mock('@libs/actions/Session', () => ({
    isAnonymousUser: () => false,
    canAnonymousUserAccessRoute: () => true,
    signOutAndRedirectToSignIn: jest.fn(),
    waitForUserSignIn: jest.fn(),
}));

// Cut the two deep transitive chains that Link.ts pulls in at module load time.
jest.mock('@libs/API', () => ({makeRequestWithSideEffects: jest.fn()}));
jest.mock('@libs/Navigation/helpers/swapBackgroundTabForRHPTarget', () => ({
    __esModule: true,
    default: jest.fn(),
}));
jest.mock('@libs/NetworkState', () => ({
    getIsOffline: () => false,
    subscribe: () => () => {},
    onReachabilityConfirmed: () => () => {},
}));

beforeEach(() => {
    mockNavigate.mockClear();
    mockAsyncOpenURL.mockClear();
});

describe('openLink — cross-environment NewDot navigation', () => {
    it('navigates internally when link is a production NewDot URL and app is on staging', () => {
        openLink('https://new.expensify.com/settings/wallet', CONST.STAGING_NEW_EXPENSIFY_URL);

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('settings/wallet');
        expect(mockAsyncOpenURL).not.toHaveBeenCalled();
    });

    it('navigates internally when link is a production NewDot URL and app is on production', () => {
        openLink('https://new.expensify.com/settings/wallet', CONST.NEW_EXPENSIFY_URL);

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('settings/wallet');
        expect(mockAsyncOpenURL).not.toHaveBeenCalled();
    });

    it('navigates internally when link is a staging NewDot URL and app is on production', () => {
        openLink('https://staging.new.expensify.com/settings/wallet', CONST.NEW_EXPENSIFY_URL);

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('settings/wallet');
        expect(mockAsyncOpenURL).not.toHaveBeenCalled();
    });

    it('opens externally for a non-NewDot URL', () => {
        openLink('https://google.com', CONST.STAGING_NEW_EXPENSIFY_URL);

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockAsyncOpenURL).toHaveBeenCalledTimes(1);
    });

    it('opens externally for a NewDot URL whose path is in PATHS_TO_TREAT_AS_EXTERNAL', () => {
        // NewExpensify.dmg is listed in CONST.PATHS_TO_TREAT_AS_EXTERNAL
        openLink('https://new.expensify.com/NewExpensify.dmg', CONST.STAGING_NEW_EXPENSIFY_URL);

        expect(mockNavigate).not.toHaveBeenCalled();
        expect(mockAsyncOpenURL).toHaveBeenCalledTimes(1);
    });
});

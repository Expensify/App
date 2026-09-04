import {renderHook} from '@testing-library/react-native';

import useOnboardingDeeplinkIntent from '@hooks/useOnboardingDeeplinkIntent';

import CONST from '@src/CONST';

const mockGetCurrentUrl = jest.fn<string, []>();
jest.mock('@libs/Navigation/currentUrl', () => ({
    __esModule: true,
    default: () => mockGetCurrentUrl(),
}));

const mockUseInitialURLState = jest.fn<{initialURL: string | null; isAuthenticatedAtStartup: boolean}, []>();
jest.mock('@components/InitialURLContextProvider', () => ({
    useInitialURLState: () => mockUseInitialURLState(),
}));

const ONBOARDING_LINK = 'https://new.expensify.com/onboarding?intent=submit';

describe('useOnboardingDeeplinkIntent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // The two platform defaults: no address bar on native, no initial URL on web.
        mockGetCurrentUrl.mockReturnValue('');
        mockUseInitialURLState.mockReturnValue({initialURL: null, isAuthenticatedAtStartup: false});
    });

    it('reads the intent from the address bar, as on web', () => {
        mockGetCurrentUrl.mockReturnValue(ONBOARDING_LINK);

        const {result} = renderHook(() => useOnboardingDeeplinkIntent());

        expect(result.current).toBe(CONST.ONBOARDING_INTENTS.SUBMIT);
    });

    it('reads the intent from the initial URL when there is no address bar, as on native', () => {
        mockUseInitialURLState.mockReturnValue({initialURL: 'new-expensify://onboarding?intent=submit', isAuthenticatedAtStartup: false});

        const {result} = renderHook(() => useOnboardingDeeplinkIntent());

        expect(result.current).toBe(CONST.ONBOARDING_INTENTS.SUBMIT);
    });

    it('keeps the intent after the app navigates and rewrites the address bar', () => {
        mockGetCurrentUrl.mockReturnValue(ONBOARDING_LINK);

        const {result, rerender} = renderHook(() => useOnboardingDeeplinkIntent());
        mockGetCurrentUrl.mockReturnValue('https://new.expensify.com/home');
        rerender({});

        expect(result.current).toBe(CONST.ONBOARDING_INTENTS.SUBMIT);
        expect(mockGetCurrentUrl).toHaveBeenCalledTimes(1);
    });

    it('returns undefined when neither source carries an intent', () => {
        mockGetCurrentUrl.mockReturnValue('https://new.expensify.com/home');

        const {result} = renderHook(() => useOnboardingDeeplinkIntent());

        expect(result.current).toBeUndefined();
    });
});

import {renderHook} from '@testing-library/react-native';

import {useInitialURLState} from '@components/InitialURLContextProvider';

import useOnyx from '@hooks/useOnyx';
import useRootNavigationState from '@hooks/useRootNavigationState';
import useShouldSuppressPromotionalUI from '@hooks/useShouldSuppressPromotionalUI';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';
import type {UseOnyxResult} from 'react-native-onyx';

import {emailSelector} from '@selectors/Session';

// The SESSION/ACCOUNT selector mapping is covered by tests/unit/selectors/SessionTest.ts and AccountTest.ts,
// so here we mock useOnyx to exercise the hook's own logic: combining the booleans.
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useRootNavigationState', () => jest.fn());
jest.mock('@components/InitialURLContextProvider', () => ({
    useInitialURLState: jest.fn(),
}));

const mockedUseOnyx = jest.mocked(useOnyx);
const mockedUseRootNavigationState = jest.mocked(useRootNavigationState);
const mockedUseInitialURLState = jest.mocked(useInitialURLState);

type MockedResult = UseOnyxResult<boolean>;

const LOADED = {status: 'loaded'} as const;

// The account signed in to NewDot, and the different account the OldDot link belongs to.
const OUTGOING_EMAIL = 'outgoing@test.com';
const INCOMING_EMAIL = 'incoming@test.com';

// The link OldDot web builds, for an account other than the signed-in one. The query string keeps it out of the Route union.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const OTHER_ACCOUNT_TRANSITION_URL = `${CONST.DEEPLINK_BASE_URL}/${ROUTES.TRANSITION_BETWEEN_APPS}?${new URLSearchParams({
    accountID: '123',
    email: INCOMING_EMAIL,
    shortLivedAuthToken: 'token',
    exitTo: ROUTES.HOME,
}).toString()}` as Route;

function mockUseOnyx(session: MockedResult, account: MockedResult, sessionEmail?: string) {
    mockedUseOnyx.mockImplementation((key, options) => {
        if (key !== ONYXKEYS.SESSION) {
            return account;
        }

        // Both SESSION subscriptions share the loading state of the mocked session. The email one is matched by the emailSelector
        // reference, so the hook has to keep using that exact selector for this mock to answer it.
        return options?.selector === emailSelector ? [sessionEmail, session[1]] : session;
    });
}

function mockNavigation(initialURL: Route | null, isTransitionScreenOnTop: boolean) {
    mockedUseInitialURLState.mockReturnValue({initialURL, isLoadingInitialURL: false, isAuthenticatedAtStartup: false});
    mockedUseRootNavigationState.mockImplementation((selector: (state: NavigationState | undefined) => unknown) => {
        // The transition route stays in the stack under Home after a cancel, so only its position tells the two cases apart.
        const routeNames = isTransitionScreenOnTop ? [SCREENS.TRANSITION_BETWEEN_APPS] : [SCREENS.TRANSITION_BETWEEN_APPS, NAVIGATORS.TAB_NAVIGATOR];
        const routes = routeNames.map((name) => ({name, key: name}));

        // The hook's selector only reads route names, so a partial state stands in for a real one.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        return selector({routes, index: routes.length - 1} as unknown as NavigationState);
    });
}

describe('useShouldSuppressPromotionalUI', () => {
    beforeEach(() => {
        mockNavigation(null, false);
    });

    afterEach(() => {
        mockedUseOnyx.mockReset();
        mockedUseRootNavigationState.mockReset();
        mockedUseInitialURLState.mockReset();
    });

    it('returns false for a loaded regular (non-supportal, non-copilot) session', () => {
        mockUseOnyx([false, LOADED], [false, LOADED]);

        const {result} = renderHook(() => useShouldSuppressPromotionalUI());

        expect(result.current).toBe(false);
    });

    it('returns true for a supportal session', () => {
        mockUseOnyx([true, LOADED], [false, LOADED]);

        const {result} = renderHook(() => useShouldSuppressPromotionalUI());

        expect(result.current).toBe(true);
    });

    it('returns true when acting as a copilot', () => {
        mockUseOnyx([false, LOADED], [true, LOADED]);

        const {result} = renderHook(() => useShouldSuppressPromotionalUI());

        expect(result.current).toBe(true);
    });

    it('returns true while a transition link for another account waits on the switch prompt', () => {
        // Given the app launched on a transition link for another account and the transition screen is still on top
        mockUseOnyx([false, LOADED], [false, LOADED], OUTGOING_EMAIL);
        mockNavigation(OTHER_ACCOUNT_TRANSITION_URL, true);

        // When the hook is read, as promotional UI does during boot
        const {result} = renderHook(() => useShouldSuppressPromotionalUI());

        // Then promotional UI waits so it does not open next to the prompt
        expect(result.current).toBe(true);
    });

    it('returns false once the link account is the signed-in session', () => {
        // Given the same launch link, with the switch confirmed and the link account now signed in
        mockUseOnyx([false, LOADED], [false, LOADED], INCOMING_EMAIL);
        mockNavigation(OTHER_ACCOUNT_TRANSITION_URL, true);

        // When the hook is read
        const {result} = renderHook(() => useShouldSuppressPromotionalUI());

        // Then the new account gets its promotional UI as usual
        expect(result.current).toBe(false);
    });

    it('returns false once the transition screen is left, as after cancelling the switch', () => {
        // Given the same launch link, with the switch cancelled and Home on top of the transition screen
        mockUseOnyx([false, LOADED], [false, LOADED], OUTGOING_EMAIL);
        mockNavigation(OTHER_ACCOUNT_TRANSITION_URL, false);

        // When the hook is read
        const {result} = renderHook(() => useShouldSuppressPromotionalUI());

        // Then the account that stayed signed in gets its promotional UI back
        expect(result.current).toBe(false);
    });

    it('fails closed (returns true) while navigation is not ready for a transition link for another account', () => {
        // Given the app launched on a transition link for another account, before the navigation state exists
        mockUseOnyx([false, LOADED], [false, LOADED], OUTGOING_EMAIL);
        mockedUseInitialURLState.mockReturnValue({initialURL: OTHER_ACCOUNT_TRANSITION_URL, isLoadingInitialURL: false, isAuthenticatedAtStartup: false});
        mockedUseRootNavigationState.mockImplementation((selector: (state: NavigationState | undefined) => unknown) => selector(undefined));

        // When the hook is read
        const {result} = renderHook(() => useShouldSuppressPromotionalUI());

        // Then promotional UI waits, so nothing opens before the switch prompt can show
        expect(result.current).toBe(true);
    });
});

import {renderHook} from '@testing-library/react-native';

import useShouldSignInThroughClassic from '@hooks/useShouldSignInThroughClassic';

import ONYXKEYS from '@src/ONYXKEYS';

import type * as ReactNavigation from '@react-navigation/native';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

let mockIsSharedProductHost = true;
jest.mock('@libs/ExperienceCookie', () => ({
    isSharedProductHost: () => mockIsSharedProductHost,
}));

const mockCanOpenClassicSignIn = jest.fn(() => true);
jest.mock('@libs/ClassicSignIn', () => ({
    canOpenClassicSignIn: () => mockCanOpenClassicSignIn(),
}));

let mockIsFocused = true;
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigation>('@react-navigation/native'),
    useIsFocused: () => mockIsFocused,
}));

async function renderWithOnyx(values: Parameters<typeof Onyx.multiSet>[0] = {}) {
    await Onyx.multiSet(values);
    const rendered = renderHook(() => useShouldSignInThroughClassic());
    await waitForBatchedUpdates();
    return rendered;
}

describe('useShouldSignInThroughClassic', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockIsSharedProductHost = true;
        mockIsFocused = true;
        mockCanOpenClassicSignIn.mockClear();
        mockCanOpenClassicSignIn.mockReturnValue(true);
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    it('is true for a signed-out user on the shared product host', async () => {
        // Given a signed-out user on the shared product host with the sign-in screen in front

        // When the sign-in screen asks where to sign in
        const {result} = await renderWithOnyx();

        // Then the Classic sign-in page is the answer
        expect(result.current).toBe(true);
    });

    it('is false on other hosts', async () => {
        // Given a host that serves only New Expensify
        mockIsSharedProductHost = false;

        // When the sign-in screen asks where to sign in
        const {result} = await renderWithOnyx();

        // Then New Expensify keeps its own sign-in screen
        expect(result.current).toBe(false);
    });

    it('is false on the path of the Classic sign-in page', async () => {
        // Given a browser that got New Expensify at the path of the Classic sign-in page
        window.history.pushState({}, '', '/signin');

        try {
            // When the sign-in screen asks where to sign in
            const {result} = await renderWithOnyx();

            // Then New Expensify keeps its own sign-in screen, since opening the same path again would loop
            expect(result.current).toBe(false);
        } finally {
            window.history.pushState({}, '', '/');
        }
    });

    it('is false for a signed-in user', async () => {
        // Given a signed-in user

        // When the sign-in screen asks where to sign in
        const {result} = await renderWithOnyx({[ONYXKEYS.SESSION]: {authToken: 'token'}});

        // Then New Expensify keeps its own sign-in screen
        expect(result.current).toBe(false);
    });

    it('is false while another screen covers the sign-in screen', async () => {
        // Given another public screen, like the one that signs in with a short-lived token, in front
        mockIsFocused = false;

        // When the sign-in screen asks where to sign in
        const {result} = await renderWithOnyx();

        // Then New Expensify keeps its own sign-in screen
        expect(result.current).toBe(false);
    });

    it('is false while signing in with a short-lived token', async () => {
        // Given a sign-in with a short-lived token in progress

        // When the sign-in screen asks where to sign in
        const {result} = await renderWithOnyx({[ONYXKEYS.RAM_ONLY_IS_AUTHENTICATING_WITH_SHORT_LIVED_TOKEN]: true});

        // Then New Expensify keeps its own sign-in screen
        expect(result.current).toBe(false);
    });

    it('is false when a sign-in has a stored login', async () => {
        // Given a sign-in that New Expensify started, like a SAML one

        // When the sign-in screen asks where to sign in
        const {result} = await renderWithOnyx({[ONYXKEYS.CREDENTIALS]: {login: 'user@example.com'}});

        // Then New Expensify keeps its own sign-in screen
        expect(result.current).toBe(false);
    });

    it('is false when a sign-in has a stored validate code', async () => {
        // Given a sign-in waiting for its two-factor step

        // When the sign-in screen asks where to sign in
        const {result} = await renderWithOnyx({[ONYXKEYS.CREDENTIALS]: {validateCode: '123456'}});

        // Then New Expensify keeps its own sign-in screen
        expect(result.current).toBe(false);
    });

    it('is false when the Classic sign-in page opened too often in this tab', async () => {
        // Given a tab where the Classic sign-in page keeps coming back without a session
        mockCanOpenClassicSignIn.mockReturnValue(false);

        // When the sign-in screen asks where to sign in
        const {result} = await renderWithOnyx();

        // Then New Expensify shows its own sign-in screen, so the tab stops going around in a loop
        expect(result.current).toBe(false);
    });

    it('checks the limit once per screen', async () => {
        // Given a sign-in screen that is allowed to open the Classic sign-in page
        const {result, rerender} = await renderWithOnyx();

        // When opening the page reaches the limit and the screen renders again while the page unloads
        mockCanOpenClassicSignIn.mockReturnValue(false);
        rerender({});

        // Then the screen keeps asking for the Classic sign-in page instead of flashing the form
        expect(result.current).toBe(true);
        expect(mockCanOpenClassicSignIn).toHaveBeenCalledTimes(1);
    });
});

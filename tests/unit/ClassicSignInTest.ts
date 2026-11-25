import * as NativeClassicSignIn from '@libs/ClassicSignIn/index.native';
import type * as WebClassicSignIn from '@libs/ClassicSignIn/index.ts';

import CONST from '@src/CONST';

let mockIsSharedProductHost = true;
jest.mock('@libs/ExperienceCookie', () => ({
    isSharedProductHost: () => mockIsSharedProductHost,
}));

let mockIsOffline = false;
jest.mock('@libs/NetworkState', () => ({
    getIsOffline: () => mockIsOffline,
}));

jest.mock('@libs/Log');

const SIGN_IN_URL = 'https://expensify.com.dev/signin';
const SIGN_OUT_URL = 'https://expensify.com.dev/signout';
const ONE_MINUTE_MS = 60 * 1000;

/** Lets the cleanup promises settle */
async function waitForPromises() {
    await new Promise((resolve) => {
        setImmediate(resolve);
    });
}

const mockReplace = jest.fn<void, [string]>();
let realLocation: Location;

/** Loads a fresh copy of the web implementation, since the React Native preset resolves index.native.ts first and the module remembers that it's leaving the page */
function loadClassicSignIn() {
    let classicSignIn: typeof WebClassicSignIn | undefined;
    jest.isolateModules(() => {
        classicSignIn = jest.requireActual<typeof WebClassicSignIn>('@libs/ClassicSignIn/index.ts');
    });
    if (!classicSignIn) {
        throw new Error('ClassicSignIn failed to load');
    }
    return classicSignIn;
}

beforeEach(() => {
    mockIsSharedProductHost = true;
    mockIsOffline = false;
    mockReplace.mockClear();
    window.localStorage.clear();
    realLocation = window.location;
    Object.defineProperty(window, 'location', {value: {origin: 'https://expensify.com.dev', replace: mockReplace}, writable: true, configurable: true});
});

afterEach(() => {
    Object.defineProperty(window, 'location', {value: realLocation, writable: true, configurable: true});
    jest.restoreAllMocks();
});

describe('ClassicSignIn', () => {
    it('opens the Classic sign-in page on the shared product host', () => {
        // Given a page on the shared product host
        const {openClassicSignIn} = loadClassicSignIn();

        // When the Classic sign-in page is opened
        openClassicSignIn();

        // Then the page is replaced with the sign-in page of the same host
        expect(mockReplace).toHaveBeenCalledWith(SIGN_IN_URL);
    });

    it('opens the Classic sign-in page only once', () => {
        // Given a page that already started opening the Classic sign-in page
        const {openClassicSignIn} = loadClassicSignIn();
        openClassicSignIn();

        // When it's opened again
        openClassicSignIn();

        // Then the page is replaced only once, since a second navigation would cancel the first
        expect(mockReplace).toHaveBeenCalledTimes(1);
    });

    it('opens the Classic sign-out page after the cleanup settles', async () => {
        // Given a cleanup that is still running
        const {openClassicSignOutAfter} = loadClassicSignIn();
        const cleanup = Promise.withResolvers<void>();

        // When the Classic sign-out page is requested
        openClassicSignOutAfter(cleanup.promise);

        // Then the page stays until the cleanup finishes, since leaving earlier would keep the local session
        expect(mockReplace).not.toHaveBeenCalled();

        cleanup.resolve();
        await waitForPromises();
        expect(mockReplace).toHaveBeenCalledWith(SIGN_OUT_URL);
    });

    it('opens the Classic sign-out page when the cleanup fails', async () => {
        // Given a cleanup that fails
        const {openClassicSignOutAfter} = loadClassicSignIn();

        // When the Classic sign-out page is requested
        openClassicSignOutAfter(Promise.reject(new Error('cleanup failed')));
        await waitForPromises();

        // Then the sign-out page still opens, so the Classic session ends
        expect(mockReplace).toHaveBeenCalledWith(SIGN_OUT_URL);
    });

    it('does not open the Classic sign-in page while signing out', async () => {
        // Given a sign out that waits for its cleanup
        const {openClassicSignIn, openClassicSignOutAfter} = loadClassicSignIn();
        openClassicSignOutAfter(Promise.resolve());

        // When the sign-in screen appears before the cleanup finishes
        openClassicSignIn();
        await waitForPromises();

        // Then only the sign-out page opens, since the sign-in page would sign the live Classic session back in
        expect(mockReplace).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith(SIGN_OUT_URL);
    });

    it('opens the Classic sign-out page when another tab started signing out', () => {
        // Given another tab that just started signing out, which signs this tab out before the Classic session ends
        loadClassicSignIn().openClassicSignOutAfter(new Promise(() => {}));
        const {openClassicSignIn} = loadClassicSignIn();

        // When the sign-in screen of this tab appears
        openClassicSignIn();

        // Then this tab ends the Classic session too, instead of letting the sign-in page sign it back in
        expect(mockReplace).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith(SIGN_OUT_URL);
    });

    it('opens the Classic sign-in page once the sign out of another tab is over', () => {
        // Given another tab that started signing out a while ago
        loadClassicSignIn().openClassicSignOutAfter(new Promise(() => {}));
        jest.spyOn(Date, 'now').mockReturnValue(Date.now() + ONE_MINUTE_MS);
        const {openClassicSignIn} = loadClassicSignIn();

        // When the sign-in screen of this tab appears
        openClassicSignIn();

        // Then the sign-in page opens, so a live Classic session can sign the user in
        expect(mockReplace).toHaveBeenCalledWith(SIGN_IN_URL);
    });

    it('waits for the connection before opening the Classic sign-out page', async () => {
        // Given a sign out that finishes its cleanup offline
        mockIsOffline = true;
        const {openClassicSignIn, openClassicSignOutAfter} = loadClassicSignIn();
        openClassicSignOutAfter(Promise.resolve());
        await waitForPromises();

        // Then the page stays, since the browser would show its own error page
        expect(mockReplace).not.toHaveBeenCalled();

        // When the connection is back and the sign-in screen asks for the Classic sign-in page
        mockIsOffline = false;
        openClassicSignIn();

        // Then the sign-out page opens, since the Classic session is still alive
        expect(mockReplace).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith(SIGN_OUT_URL);
    });

    it('does not open the Classic sign-in page while another page is about to open', async () => {
        // Given a sign out that opens another page itself
        const {openClassicSignIn, preventClassicSignInDuring} = loadClassicSignIn();
        preventClassicSignInDuring(Promise.resolve());

        // When the sign-in screen appears
        openClassicSignIn();
        await waitForPromises();

        // Then the page stays for the other navigation
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('opens the Classic sign-in page when the other page fails to open', async () => {
        // Given a sign out whose own navigation fails while the sign-in screen is waiting
        const {openClassicSignIn, preventClassicSignInDuring} = loadClassicSignIn();
        preventClassicSignInDuring(Promise.reject(new Error('navigation failed')));
        openClassicSignIn();
        expect(mockReplace).not.toHaveBeenCalled();

        // When the failure is known
        await waitForPromises();

        // Then the sign-in page opens, so the user isn't left on an empty screen
        expect(mockReplace).toHaveBeenCalledWith(SIGN_IN_URL);
    });

    it('does not open the Classic sign-in page once the request is withdrawn', async () => {
        // Given a sign-in screen that stopped waiting, for example because a sign-in started in New Expensify
        const {openClassicSignIn, preventClassicSignInDuring} = loadClassicSignIn();
        preventClassicSignInDuring(Promise.reject(new Error('navigation failed')));
        const withdraw = openClassicSignIn();
        withdraw();

        // When the other navigation fails
        await waitForPromises();

        // Then the page stays, since nothing asks for the sign-in page anymore
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('does nothing on other hosts', async () => {
        // Given a page on a host that serves only New Expensify
        mockIsSharedProductHost = false;
        const {openClassicSignIn, openClassicSignOutAfter} = loadClassicSignIn();

        // When the Classic pages are requested
        openClassicSignIn();
        openClassicSignOutAfter(Promise.resolve());
        await waitForPromises();

        // Then the page stays and other tabs aren't told about a sign out
        expect(mockReplace).not.toHaveBeenCalled();
        expect(window.localStorage.getItem(CONST.LOCAL_STORAGE_KEYS.CLASSIC_SIGN_OUT_STARTED_AT)).toBeNull();
    });

    it('does nothing in native apps', () => {
        // When the native implementation is asked to open the Classic pages
        NativeClassicSignIn.openClassicSignIn();
        NativeClassicSignIn.openClassicSignOutAfter(Promise.resolve());

        // Then the page stays
        expect(mockReplace).not.toHaveBeenCalled();
    });
});

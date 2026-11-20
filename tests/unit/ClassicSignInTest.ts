import * as NativeClassicSignIn from '@libs/ClassicSignIn/index.native';
import type * as WebClassicSignIn from '@libs/ClassicSignIn/index.ts';

let mockIsSharedProductHost = true;
jest.mock('@libs/ExperienceCookie', () => ({
    isSharedProductHost: () => mockIsSharedProductHost,
}));

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
    mockReplace.mockClear();
    realLocation = window.location;
    Object.defineProperty(window, 'location', {value: {origin: 'https://expensify.com.dev', replace: mockReplace}, writable: true, configurable: true});
});

afterEach(() => {
    Object.defineProperty(window, 'location', {value: realLocation, writable: true, configurable: true});
});

describe('ClassicSignIn', () => {
    it('opens the Classic sign-in page on the shared product host', async () => {
        // Given a page on the shared product host
        const {openClassicSignIn} = loadClassicSignIn();

        // When the Classic sign-in page is opened
        const didOpen = openClassicSignIn();
        await waitForPromises();

        // Then the page is replaced with the sign-in page of the same host
        expect(didOpen).toBe(true);
        expect(mockReplace).toHaveBeenCalledWith('https://expensify.com.dev/signin');
    });

    it('opens the Classic sign-in page only once', async () => {
        // Given a page that already started opening the Classic sign-in page
        const {openClassicSignIn} = loadClassicSignIn();
        openClassicSignIn();

        // When it's opened again
        openClassicSignIn();
        await waitForPromises();

        // Then the page is replaced only once
        expect(mockReplace).toHaveBeenCalledTimes(1);
    });

    it('opens the Classic sign-out page after the cleanup settles', async () => {
        // Given a cleanup that is still running
        const {openClassicSignOutAfter} = loadClassicSignIn();
        let finishCleanup: () => void = () => {};
        const cleanup = new Promise<void>((resolve) => {
            finishCleanup = resolve;
        });

        // When the Classic sign-out page is requested
        const willOpen = openClassicSignOutAfter(cleanup);

        // Then the page stays until the cleanup finishes
        expect(willOpen).toBe(true);
        expect(mockReplace).not.toHaveBeenCalled();

        finishCleanup();
        await waitForPromises();
        expect(mockReplace).toHaveBeenCalledWith('https://expensify.com.dev/signout');
    });

    it('does not open the Classic sign-in page while signing out', async () => {
        // Given a sign out that waits for its cleanup
        const {openClassicSignIn, openClassicSignOutAfter} = loadClassicSignIn();
        const cleanup = Promise.resolve();
        openClassicSignOutAfter(cleanup);

        // When the sign-in page is requested before the cleanup finishes
        openClassicSignIn();
        await waitForPromises();

        // Then only the sign-out page opens
        expect(mockReplace).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith('https://expensify.com.dev/signout');
    });

    it('does not open the Classic sign-in page once it is prevented', async () => {
        // Given a sign out that opens another page itself
        const {openClassicSignIn, preventClassicSignIn} = loadClassicSignIn();
        preventClassicSignIn();

        // When the sign-in page is requested
        openClassicSignIn();
        await waitForPromises();

        // Then the page stays for the other navigation
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('opens the Classic sign-out page when the cleanup fails', async () => {
        // Given a cleanup that fails
        const {openClassicSignOutAfter} = loadClassicSignIn();

        // When the Classic sign-out page is requested
        openClassicSignOutAfter(Promise.reject(new Error('cleanup failed')));
        await waitForPromises();

        // Then the sign-out page still opens, so the Classic session ends
        expect(mockReplace).toHaveBeenCalledWith('https://expensify.com.dev/signout');
    });

    it('does nothing on other hosts', async () => {
        // Given a page on a host that serves only New Expensify
        mockIsSharedProductHost = false;
        const {openClassicSignIn, openClassicSignOutAfter} = loadClassicSignIn();

        // When the Classic pages are requested
        const cleanup = Promise.resolve();
        const didOpenSignIn = openClassicSignIn();
        const willOpenSignOut = openClassicSignOutAfter(cleanup);
        await waitForPromises();

        // Then the page stays
        expect(didOpenSignIn).toBe(false);
        expect(willOpenSignOut).toBe(false);
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('does nothing in native apps', () => {
        // When the native implementation is asked to open the Classic pages
        const didOpenSignIn = NativeClassicSignIn.openClassicSignIn();
        const willOpenSignOut = NativeClassicSignIn.openClassicSignOutAfter(Promise.resolve());

        // Then the page stays
        expect(didOpenSignIn).toBe(false);
        expect(willOpenSignOut).toBe(false);
        expect(mockReplace).not.toHaveBeenCalled();
    });
});

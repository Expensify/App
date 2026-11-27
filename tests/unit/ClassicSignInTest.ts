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

// Each isolated copy of the module gets its own Log mock, so they all report to one function
const mockHmmm = jest.fn<void, unknown[]>();
jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {info: jest.fn(), hmmm: (...args: unknown[]) => mockHmmm(...args)},
}));

const SIGN_IN_URL = 'https://expensify.com.dev/signin';
const SIGN_OUT_URL = 'https://expensify.com.dev/signout';
const ONE_MINUTE_MS = 60 * 1000;
const SIGN_OUT_PAGE_LOAD_MS = 30 * 1000;

/** Lets the cleanup promises settle */
async function waitForPromises() {
    await new Promise((resolve) => {
        setImmediate(resolve);
    });
}

/** Dispatches the event the browser fires when it shows the page, with `persisted` set when the page comes from the back/forward cache */
function showPage(persisted: boolean) {
    const event = new Event('pageshow');
    Object.defineProperty(event, 'persisted', {value: persisted});
    window.dispatchEvent(event);
}

/** Opens the Classic sign-in page from a freshly loaded page, the way each return to New Expensify does */
function openSignInPageFromNewPage() {
    loadClassicSignIn().openClassicSignIn();
}

const mockReplace = jest.fn<void, [string]>();
let realLocation: Location;
let addEventListenerSpy: jest.SpyInstance<void, Parameters<typeof window.addEventListener>>;

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
    mockHmmm.mockClear();
    window.localStorage.clear();
    window.sessionStorage.clear();

    // Every copy of the module listens to the window, so the listeners are tracked and removed after each test
    addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    realLocation = window.location;
    Object.defineProperty(window, 'location', {value: {origin: 'https://expensify.com.dev', replace: mockReplace}, writable: true, configurable: true});
});

afterEach(() => {
    for (const [type, listener] of addEventListenerSpy.mock.calls) {
        window.removeEventListener(type, listener);
    }
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

    it('keeps a sign out unfinished until a tab opens the Classic sign-out page', () => {
        // Given another tab that started signing out long ago and never opened the sign-out page
        loadClassicSignIn().openClassicSignOutAfter(new Promise(() => {}));
        jest.spyOn(Date, 'now').mockReturnValue(Date.now() + 24 * 60 * ONE_MINUTE_MS);
        const {openClassicSignIn} = loadClassicSignIn();

        // When the sign-in screen of a freshly loaded tab appears
        openClassicSignIn();

        // Then the sign-out page opens, since the Classic session is still alive
        expect(mockReplace).toHaveBeenCalledWith(SIGN_OUT_URL);
    });

    it('stores the time the Classic sign-out page opened', async () => {
        // Given a sign out that waits for its cleanup
        const openedAt = Date.now();
        jest.spyOn(Date, 'now').mockReturnValue(openedAt);
        const cleanup = Promise.withResolvers<void>();
        loadClassicSignIn().openClassicSignOutAfter(cleanup.promise);
        expect(window.localStorage.getItem(CONST.LOCAL_STORAGE_KEYS.CLASSIC_SIGN_OUT)).not.toBe(String(openedAt));

        // When the sign-out page opens
        cleanup.resolve();
        await waitForPromises();

        // Then other tabs know when the page opened
        expect(mockReplace).toHaveBeenCalledWith(SIGN_OUT_URL);
        expect(window.localStorage.getItem(CONST.LOCAL_STORAGE_KEYS.CLASSIC_SIGN_OUT)).toBe(String(openedAt));
    });

    it('opens the Classic sign-out page while the sign-out page of another tab is still loading', async () => {
        // Given another tab that opened the sign-out page moments ago
        loadClassicSignIn().openClassicSignOutAfter(Promise.resolve());
        await waitForPromises();
        mockReplace.mockClear();
        jest.spyOn(Date, 'now').mockReturnValue(Date.now() + SIGN_OUT_PAGE_LOAD_MS - 1000);
        const {openClassicSignIn} = loadClassicSignIn();

        // When the sign-in screen of this tab appears
        openClassicSignIn();

        // Then this tab opens the sign-out page too, since the Classic session may not have ended yet
        expect(mockReplace).toHaveBeenCalledWith(SIGN_OUT_URL);
    });

    it('keeps the time the sign-out page of another tab opened', () => {
        // Given another tab that opened the sign-out page 10 seconds ago
        const openedAt = Date.now() - 10 * 1000;
        window.localStorage.setItem(CONST.LOCAL_STORAGE_KEYS.CLASSIC_SIGN_OUT, String(openedAt));
        const {openClassicSignIn} = loadClassicSignIn();

        // When the sign-in screen of this tab appears
        openClassicSignIn();

        // Then this tab opens the sign-out page too, without extending the time other tabs wait for it
        expect(mockReplace).toHaveBeenCalledWith(SIGN_OUT_URL);
        expect(window.localStorage.getItem(CONST.LOCAL_STORAGE_KEYS.CLASSIC_SIGN_OUT)).toBe(String(openedAt));
    });

    it('stops opening the Classic sign-out page for a page that keeps coming back', async () => {
        // Given a sign out that opened the sign-out page
        const openedAt = Date.now();
        const now = jest.spyOn(Date, 'now').mockReturnValue(openedAt);
        loadClassicSignIn().openClassicSignOutAfter(Promise.resolve());
        await waitForPromises();
        mockReplace.mockClear();

        // When the tab keeps landing back on the sign-in screen every 5 seconds
        const openedPages: string[] = [];
        for (let elapsed = 5 * 1000; elapsed <= SIGN_OUT_PAGE_LOAD_MS; elapsed += 5 * 1000) {
            now.mockReturnValue(openedAt + elapsed);
            loadClassicSignIn().openClassicSignIn();
            openedPages.push(mockReplace.mock.calls.at(-1)?.at(0) ?? '');
        }

        // Then it opens the sign-out page until the first opening is 30 seconds old, and the sign-in page from then on
        expect(openedPages).toEqual([SIGN_OUT_URL, SIGN_OUT_URL, SIGN_OUT_URL, SIGN_OUT_URL, SIGN_OUT_URL, SIGN_IN_URL]);
    });

    it('opens the Classic sign-in page once the sign-out page of another tab had time to load', async () => {
        // Given another tab that opened the sign-out page a while ago
        loadClassicSignIn().openClassicSignOutAfter(Promise.resolve());
        await waitForPromises();
        mockReplace.mockClear();
        jest.spyOn(Date, 'now').mockReturnValue(Date.now() + SIGN_OUT_PAGE_LOAD_MS + 1000);
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

    it('opens the Classic sign-out page after a sign out that started offline and a reload', async () => {
        // Given a sign out that finished its cleanup offline
        mockIsOffline = true;
        loadClassicSignIn().openClassicSignOutAfter(Promise.resolve());
        await waitForPromises();
        expect(mockReplace).not.toHaveBeenCalled();

        // When the page is reloaded much later and the sign-in screen appears once the connection is back
        jest.spyOn(Date, 'now').mockReturnValue(Date.now() + ONE_MINUTE_MS);
        const {openClassicSignIn} = loadClassicSignIn();
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

    it('opens the Classic sign-in page when the browser restores the page from the back/forward cache', () => {
        // Given a sign-in screen waiting for another page that the user left with the back button
        const {openClassicSignIn, preventClassicSignInDuring} = loadClassicSignIn();
        preventClassicSignInDuring(new Promise(() => {}));
        openClassicSignIn();
        expect(mockReplace).not.toHaveBeenCalled();

        // When the browser restores the page from the back/forward cache
        showPage(true);

        // Then the sign-in page opens, so the user isn't left on the loading indicator
        expect(mockReplace).toHaveBeenCalledWith(SIGN_IN_URL);
    });

    it('opens the Classic sign-out page when the browser restores the page during an unfinished sign out', () => {
        // Given a sign-in screen waiting for another page that the user left with the back button, while another tab signs out
        const {openClassicSignIn, preventClassicSignInDuring} = loadClassicSignIn();
        preventClassicSignInDuring(new Promise(() => {}));
        openClassicSignIn();
        loadClassicSignIn().openClassicSignOutAfter(new Promise(() => {}));

        // When the browser restores the page from the back/forward cache
        showPage(true);

        // Then the sign-out page opens, since the sign-in page would sign the live Classic session back in
        expect(mockReplace).toHaveBeenCalledTimes(1);
        expect(mockReplace).toHaveBeenCalledWith(SIGN_OUT_URL);
    });

    it('stays on the page when the browser shows it without restoring it', () => {
        // Given a sign-in screen waiting for another page
        const {openClassicSignIn, preventClassicSignInDuring} = loadClassicSignIn();
        preventClassicSignInDuring(new Promise(() => {}));
        openClassicSignIn();

        // When the browser shows a page that isn't restored from the back/forward cache
        showPage(false);

        // Then the page keeps waiting for the other navigation
        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('allows opening the Classic sign-in page twice within a minute', () => {
        // Given a tab that opened the sign-in page once
        openSignInPageFromNewPage();

        // When the sign-in screen of the next page load checks the limit
        const {canOpenClassicSignIn} = loadClassicSignIn();

        // Then the sign-in page can open again
        expect(canOpenClassicSignIn()).toBe(true);
        expect(mockHmmm).not.toHaveBeenCalled();
    });

    it('refuses a third opening of the Classic sign-in page within a minute', () => {
        // Given a tab that opened the sign-in page twice and came back without a session each time
        openSignInPageFromNewPage();
        openSignInPageFromNewPage();

        // When the sign-in screen of the next page load checks the limit
        const {canOpenClassicSignIn} = loadClassicSignIn();

        // Then the sign-in page can't open, so the tab stops going around in a loop
        expect(canOpenClassicSignIn()).toBe(false);
        expect(mockHmmm).toHaveBeenCalledTimes(1);
    });

    it('allows opening the Classic sign-in page again after a minute', () => {
        // Given a tab that opened the sign-in page twice a minute ago
        openSignInPageFromNewPage();
        openSignInPageFromNewPage();
        jest.spyOn(Date, 'now').mockReturnValue(Date.now() + ONE_MINUTE_MS);

        // When the sign-in screen of the next page load checks the limit
        const {canOpenClassicSignIn} = loadClassicSignIn();

        // Then the sign-in page can open again
        expect(canOpenClassicSignIn()).toBe(true);
    });

    it('does not count openings of the Classic sign-out page', async () => {
        // Given a tab that opened the sign-out page twice
        loadClassicSignIn().openClassicSignOutAfter(Promise.resolve());
        await waitForPromises();
        loadClassicSignIn().openClassicSignOutAfter(Promise.resolve());
        await waitForPromises();
        expect(mockReplace).toHaveBeenCalledTimes(2);

        // When the sign-in screen checks the limit once the sign-out pages had time to load
        jest.spyOn(Date, 'now').mockReturnValue(Date.now() + SIGN_OUT_PAGE_LOAD_MS + 1000);
        const {canOpenClassicSignIn} = loadClassicSignIn();

        // Then the sign-in page can open
        expect(canOpenClassicSignIn()).toBe(true);
    });

    it('does not hold back a sign out that has not reached Classic yet', () => {
        // Given a tab that opened the sign-in page twice, and another tab that started signing out
        openSignInPageFromNewPage();
        openSignInPageFromNewPage();
        loadClassicSignIn().openClassicSignOutAfter(new Promise(() => {}));
        mockReplace.mockClear();

        // When the sign-in screen of the next page load checks the limit and asks for the sign-in page
        const {canOpenClassicSignIn, openClassicSignIn} = loadClassicSignIn();
        const canOpen = canOpenClassicSignIn();
        openClassicSignIn();

        // Then the request goes ahead and opens the sign-out page, which ends the Classic session
        expect(canOpen).toBe(true);
        expect(mockReplace).toHaveBeenCalledWith(SIGN_OUT_URL);
    });

    it('allows opening the Classic sign-in page when storage is unavailable', () => {
        // Given a tab that opened the sign-in page twice, in a browser whose storage now throws
        openSignInPageFromNewPage();
        openSignInPageFromNewPage();
        jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
            throw new Error('Storage is disabled');
        });

        // When the sign-in screen of the next page load checks the limit
        const {canOpenClassicSignIn} = loadClassicSignIn();

        // Then the sign-in page can open, since the limit can't be known
        expect(canOpenClassicSignIn()).toBe(true);
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
        expect(window.localStorage.getItem(CONST.LOCAL_STORAGE_KEYS.CLASSIC_SIGN_OUT)).toBeNull();
    });

    it('does nothing in native apps', () => {
        // Given the native implementation of the module

        // When it is asked to open the Classic pages
        NativeClassicSignIn.openClassicSignIn();
        NativeClassicSignIn.openClassicSignOutAfter(Promise.resolve());

        // Then the page stays, and nothing limits the sign-in
        expect(mockReplace).not.toHaveBeenCalled();
        expect(NativeClassicSignIn.canOpenClassicSignIn()).toBe(true);
    });
});

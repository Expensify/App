import {clearMoneyRequest, clearMoneyRequestAmount} from '@libs/actions/IOU/MoneyRequest';
import {hasAuthToken} from '@libs/actions/Session';
import subscribe from '@libs/Navigation/linkingConfig/subscribe';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import {Linking} from 'react-native';

jest.mock('@libs/actions/Session', () => ({
    hasAuthToken: jest.fn(),
}));

jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
    clearMoneyRequest: jest.fn(),
    clearMoneyRequestAmount: jest.fn(),
}));

// subscribe() only reads the ref to resolve the focused screen for its skip rules. It stays empty unless a
// test sets a focused screen, which keeps the skip rules out of the way.
jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {current: null},
}));

const mockedHasAuthToken = jest.mocked(hasAuthToken);
const mockedClearMoneyRequest = jest.mocked(clearMoneyRequest);
const mockedClearMoneyRequestAmount = jest.mocked(clearMoneyRequestAmount);
const mockedNavigationRef = jest.requireMock<{default: {current: unknown}}>('@libs/Navigation/navigationRef').default;

/**
 * Makes `screenName` the focused route that subscribe()'s skip rules read from the navigation ref.
 */
function focusScreen(screenName: string) {
    mockedNavigationRef.current = {getRootState: () => ({index: 0, routes: [{name: screenName}]})};
}

const REPORT_ID = '269886405016917';
const ACCOUNT_ID = '22839920';
const VALIDATE_CODE = 'ABC123';

/**
 * Delivers a single warm deep link (a React Native `Linking` `url` event) to subscribe()'s handler and
 * returns the React Navigation listener it was given, so callers can assert whether (and with what)
 * the link was forwarded.
 */
function deliverDeepLink(url: string): jest.Mock {
    const listener = jest.fn();
    // Capture the handler subscribe() registers, then hand it the URL directly. The teardown it returns
    // is left alone on purpose: Linking is mocked here and hands back no subscription to remove.
    const addEventListener = jest.spyOn(Linking, 'addEventListener').mockImplementation(jest.fn());

    subscribe?.(listener);
    const handleUrl = addEventListener.mock.calls.at(-1)?.[1];
    handleUrl?.({url});
    addEventListener.mockRestore();

    return listener;
}

describe('linkingConfig subscribe', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedNavigationRef.current = null;
    });

    describe('unauthenticated session', () => {
        beforeEach(() => {
            mockedHasAuthToken.mockReturnValue(false);
        });

        // The Report screen lives in AuthScreens and is not mounted while PublicScreens is showing, so
        // forwarding these would throw "NAVIGATE ... was not handled by any navigator".
        // openReportFromDeepLink() opens the public room anonymously instead. See #92672.
        it.each([
            'https://new.expensify.com/r/269886405016917',
            'https://staging.new.expensify.com/r/269886405016917',
            'new-expensify://r/269886405016917',
            'app://-/r/269886405016917',
            'https://new.expensify.com/r/269886405016917?secureKey=abc123',
            'https://new.expensify.com/r/269886405016917#anchor',
            'https://new.expensify.com/r/269886405016917/details',
            'https://new.expensify.com/search/r/269886405016917',
        ])('drops the report deep link %s', (url) => {
            expect(deliverDeepLink(url)).not.toHaveBeenCalled();
        });

        // The guard matches on the path only, so a report route parked in a query string or fragment no
        // longer swallows the link. Without this, the magic link below never reached ValidateLoginPage and
        // the invited user was dropped into the app signed out. See #99156.
        it.each([
            `https://staging.new.expensify.com/v/${ACCOUNT_ID}/${VALIDATE_CODE}?exitTo=/r/${REPORT_ID}`,
            `new-expensify://v/${ACCOUNT_ID}/${VALIDATE_CODE}?exitTo=/r/${REPORT_ID}`,
            `https://new.expensify.com/transition?email=someone%40example.com&exitTo=/r/${REPORT_ID}`,
            `https://new.expensify.com/settings/profile#/r/${REPORT_ID}`,
        ])('forwards %s, where the report route is only in the query string or fragment', (url) => {
            expect(deliverDeepLink(url)).toHaveBeenCalledWith(url);
        });

        it('forwards the magic link verbatim so exitTo survives for ValidateLoginPage', () => {
            const url = `https://staging.new.expensify.com/v/${ACCOUNT_ID}/${VALIDATE_CODE}?exitTo=/r/${REPORT_ID}`;

            const listener = deliverDeepLink(url);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith(url);
        });

        it.each(['https://new.expensify.com/', `https://new.expensify.com/v/${ACCOUNT_ID}/${VALIDATE_CODE}`, 'https://new.expensify.com/settings/profile'])(
            'forwards %s, which has no report route at all',
            (url) => {
                expect(deliverDeepLink(url)).toHaveBeenCalledWith(url);
            },
        );
    });

    describe('authenticated session', () => {
        beforeEach(() => {
            mockedHasAuthToken.mockReturnValue(true);
        });

        it('forwards a report deep link, because AuthScreens can handle it', () => {
            const url = `https://new.expensify.com/r/${REPORT_ID}`;

            expect(deliverDeepLink(url)).toHaveBeenCalledWith(url);
        });

        // Home-screen quick actions open the create screen straight for OPTIMISTIC_TRANSACTION_ID, skipping the
        // start/... redirect that clears the last draft. Without this the old amount came back. See #101340.
        it.each([
            `new-expensify://create/create/start/1/${REPORT_ID}/manual`,
            `new-expensify://create/create/start/1/${REPORT_ID}/scan`,
            `new-expensify://create/create/start/1/${REPORT_ID}/distance-new`,
            `new-expensify://create/create/start/1/${REPORT_ID}/distance-new/`,
            `https://new.expensify.com/create/submit/start/1/${REPORT_ID}/manual?foo=bar`,
        ])('clears the old draft before forwarding the quick-action link %s', (url) => {
            // Given the user is not on the create screen
            // When a quick-action create link arrives
            const listener = deliverDeepLink(url);

            // Then the old draft is removed so the screen builds a fresh one, and the link still navigates
            expect(mockedClearMoneyRequest).toHaveBeenCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, [CONST.IOU.OPTIMISTIC_TRANSACTION_ID]);
            expect(listener).toHaveBeenCalledWith(url);
        });

        it.each([
            // A GPS link reopens a trip that is still being tracked, so its draft has to survive.
            `new-expensify://create/create/start/1/${REPORT_ID}/distance-new/distance-gps`,
            // Editing a real transaction is not a quick action.
            `new-expensify://create/create/start/123/${REPORT_ID}/manual`,
            `https://new.expensify.com/r/${REPORT_ID}`,
        ])('keeps the draft for %s, which is not a quick-action create link', (url) => {
            // Given a link that is not a quick-action create link
            // When it arrives
            const listener = deliverDeepLink(url);

            // Then the draft is left alone and the link is forwarded
            expect(mockedClearMoneyRequest).not.toHaveBeenCalled();
            expect(listener).toHaveBeenCalledWith(url);
        });

        it('clears the amount in place when the manual tab is already open', () => {
            // Given the manual tab is still open with the last unfinished expense
            focusScreen(ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.route);

            // When the "Create expense" quick action fires again
            const listener = deliverDeepLink(`new-expensify://create/create/start/1/${REPORT_ID}/manual`);

            // Then the link is still dropped to avoid re-navigating, but the old amount is cleared
            expect(listener).not.toHaveBeenCalled();
            expect(mockedClearMoneyRequestAmount).toHaveBeenCalledWith(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
            expect(mockedClearMoneyRequest).not.toHaveBeenCalled();
        });

        it('keeps the draft when the scan tab is already open', () => {
            // Given the scan tab is already open
            focusScreen(ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.route);

            // When the "Scan receipt" quick action fires again
            const listener = deliverDeepLink(`new-expensify://create/create/start/1/${REPORT_ID}/scan`);

            // Then the link is dropped and the draft is not touched, since there is no amount on screen to clear
            expect(listener).not.toHaveBeenCalled();
            expect(mockedClearMoneyRequestAmount).not.toHaveBeenCalled();
            expect(mockedClearMoneyRequest).not.toHaveBeenCalled();
        });
    });
});

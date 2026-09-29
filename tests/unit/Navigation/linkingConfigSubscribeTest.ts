import {hasAuthToken} from '@libs/actions/Session';
import subscribe from '@libs/Navigation/linkingConfig/subscribe';

import {Linking} from 'react-native';

jest.mock('@libs/actions/Session', () => ({
    hasAuthToken: jest.fn(),
}));

// subscribe() only reads the ref to resolve the focused screen for its skip rules. None of the URLs
// exercised here match a skip rule, so an empty ref keeps that branch out of the way.
jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {current: null},
}));

const mockedHasAuthToken = jest.mocked(hasAuthToken);

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
    });
});

import {hasAuthToken} from '@libs/CurrentUserStore';
import subscribe from '@libs/Navigation/linkingConfig/subscribe';

import {Linking} from 'react-native';

// A jest mock factory replaces the whole module, and subscribe() also pulls CurrentUserStore in through
// ROUTES -> Log, which needs getCurrentUserEmail.
jest.mock('@libs/CurrentUserStore', () => ({
    getCurrentUserEmail: jest.fn(() => null),
    hasAuthToken: jest.fn(),
}));

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {current: null},
}));

const mockedHasAuthToken = jest.mocked(hasAuthToken);

const REPORT_ID = '269886405016917';
const ACCOUNT_ID = '22839920';
const VALIDATE_CODE = 'ABC123';

function deliverDeepLink(url: string): jest.Mock {
    const listener = jest.fn();
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

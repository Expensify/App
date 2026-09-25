import buildOldDotURL from '@libs/buildOldDotURL';
import {getCurrentUserEmail} from '@libs/CurrentUserStore';
import getPlatform from '@libs/getPlatform';

import CONST from '@src/CONST';

jest.mock('@libs/CurrentUserStore', () => ({
    getCurrentUserEmail: jest.fn(),
}));

jest.mock('@libs/Environment/Environment', () => ({
    __esModule: true,
    getOldDotEnvironmentURL: jest.fn(() => Promise.resolve('https://www.example.com')),
}));

jest.mock('@libs/getPlatform', () => ({
    __esModule: true,
    default: jest.fn(() => 'ios'),
}));

const mockedGetCurrentUserEmail = jest.mocked(getCurrentUserEmail);
const mockedGetPlatform = jest.mocked(getPlatform);

describe('buildOldDotURL', () => {
    beforeEach(() => {
        mockedGetCurrentUserEmail.mockReturnValue('test@example.com');
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.IOS);
    });

    test('appends the email param to a plain path', async () => {
        await expect(buildOldDotURL('r/12345')).resolves.toBe('https://www.example.com/r/12345?email=test%40example.com');
    });

    test('joins params with & when the url already has a query', async () => {
        await expect(buildOldDotURL('r/12345?tab=expenses')).resolves.toBe('https://www.example.com/r/12345?tab=expenses&email=test%40example.com');
    });

    test('keeps hash params at the end of the built url', async () => {
        await expect(buildOldDotURL('r/12345#reports')).resolves.toBe('https://www.example.com/r/12345?email=test%40example.com#reports');
    });

    test('puts the short lived auth token before the email param', async () => {
        await expect(buildOldDotURL('r/12345', 'secret-token')).resolves.toBe('https://www.example.com/r/12345?authToken=secret-token&email=test%40example.com');
    });

    test('uses an empty email when there is no signed-in user', async () => {
        mockedGetCurrentUserEmail.mockReturnValue(null);

        await expect(buildOldDotURL('r/12345')).resolves.toBe('https://www.example.com/r/12345?email=');
    });

    test('marks the url to stay in the browser on web', async () => {
        // Given the url is opened from the browser, where the installed app would otherwise claim OldDot links
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);

        // When the OldDot url is built
        const url = buildOldDotURL('inbox', 'secret-token');

        // Then it carries the param excluded from app handling in the app link configs
        await expect(url).resolves.toBe('https://www.example.com/inbox?authToken=secret-token&email=test%40example.com&openInBrowser=true');
    });

    test('keeps the params before hash params on web', async () => {
        // Given the url is opened from the browser and has hash params
        mockedGetPlatform.mockReturnValue(CONST.PLATFORM.WEB);

        // When the OldDot url is built
        const url = buildOldDotURL('policy?param=%7B%7D#connections');

        // Then the browser marker stays in the query so the app link configs can match it
        await expect(url).resolves.toBe('https://www.example.com/policy?param=%7B%7D&email=test%40example.com&openInBrowser=true#connections');
    });
});

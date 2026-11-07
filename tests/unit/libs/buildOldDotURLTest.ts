import buildOldDotURL from '@libs/buildOldDotURL';
import {getCurrentUserEmail} from '@libs/CurrentUserStore';

jest.mock('@libs/CurrentUserStore', () => ({
    getCurrentUserEmail: jest.fn(),
}));

jest.mock('@libs/Environment/Environment', () => ({
    __esModule: true,
    getOldDotEnvironmentURL: jest.fn(() => Promise.resolve('https://www.example.com')),
}));

const mockedGetCurrentUserEmail = jest.mocked(getCurrentUserEmail);

describe('buildOldDotURL', () => {
    beforeEach(() => {
        mockedGetCurrentUserEmail.mockReturnValue('test@example.com');
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
});

import getURLForLogging from '@libs/asyncOpenURL/getURLForLogging';

describe('getURLForLogging', () => {
    it('drops the token from a URL passed as a string', () => {
        // Given a hosted form link whose query string carries a token
        const url = 'https://wise-sandbox.com/embedded-flows/verification?token=secret&checkId=123';

        // When the URL is prepared for a log line
        const urlForLogging = getURLForLogging(url);

        // Then only the part without the token is left
        expect(urlForLogging).toBe('https://wise-sandbox.com/embedded-flows/verification?<redacted>');
    });

    it('logs a placeholder for a URL built from the promise result', () => {
        // Given a URL that only exists once the promise resolves, so it can hold a fresh token
        const buildURL = (token: string) => `https://example.com/auth?authCode=${token}`;

        // When the URL is prepared for a log line
        const urlForLogging = getURLForLogging(buildURL);

        // Then a placeholder stands in for the URL, so no token reaches the log
        expect(urlForLogging).toBe('[function]');
    });
});

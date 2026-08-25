import NEW_EXPENSIFY_URL from '@src/CONST/NEW_EXPENSIFY_URL.web';

jest.mock('react-native-config', () => ({NEW_EXPENSIFY_URL: 'https://staging.example.com'}));

describe('NEW_EXPENSIFY_URL', () => {
    it('uses the configured URL and adds a trailing slash', () => {
        expect(NEW_EXPENSIFY_URL).toBe('https://staging.example.com/');
    });
});

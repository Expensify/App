import CONST_RUNTIME from '@src/CONST/runtime.web';

jest.mock('react-native-config', () => ({
    NEW_EXPENSIFY_URL: 'https://staging.example.com',
    EXPENSIFY_ACCOUNT_ID_ACCOUNTING: '123',
}));

jest.mock('react-native-key-command', () => ({
    constants: {
        keyInputEnter: 'configuredEnter',
    },
}));

describe('CONST runtime values', () => {
    it('uses configured values with defaults for missing values', () => {
        expect(CONST_RUNTIME.NEW_EXPENSIFY_URL).toBe('https://staging.example.com/');
        expect(CONST_RUNTIME.EXPENSIFY_ACCOUNT_IDS.ACCOUNTING).toBe(123);
        expect(CONST_RUNTIME.EXPENSIFY_ACCOUNT_IDS.CONCIERGE).toBe(8392101);
        expect(CONST_RUNTIME.KEY_COMMANDS.keyInputEnter).toBe('configuredEnter');
        expect(CONST_RUNTIME.KEY_COMMANDS.keyInputEscape).toBe('keyInputEscape');
    });
});

import openBankConnection from '@pages/settings/Wallet/PersonalCards/steps/BankConnection/openBankConnection/index.web';

describe('openBankConnection', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('reuses the open bank connection window', () => {
        // Given an open bank connection window
        const focus = jest.fn();
        const bankConnectionWindow = {closed: false, focus} as unknown as Window;
        const openWindow = jest.spyOn(window, 'open').mockReturnValue(bankConnectionWindow);
        openBankConnection('https://example.com/bank');

        // When the connection screen asks to open the same flow
        const result = openBankConnection('https://example.com/bank');

        // Then the existing window is focused without restarting the connection
        expect(result).toBe(bankConnectionWindow);
        expect(openWindow).toHaveBeenCalledTimes(1);
        expect(focus).toHaveBeenCalledTimes(1);
    });
});

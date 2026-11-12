import createMock from '../utils/createMock';

type OpenBankConnection = (url: string, shouldRestartConnection?: boolean) => Window | null;

function loadOpenBankConnection(): OpenBankConnection {
    let openBankConnection: OpenBankConnection | undefined;
    jest.isolateModules(() => {
        openBankConnection = jest.requireActual<{default: OpenBankConnection}>('@pages/settings/Wallet/PersonalCards/steps/BankConnection/openBankConnection/index.web').default;
    });
    if (!openBankConnection) {
        throw new Error('openBankConnection was not loaded');
    }
    return openBankConnection;
}

describe('openBankConnection', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('reuses the open bank connection window', () => {
        // Given an open bank connection window
        const openBankConnection = loadOpenBankConnection();
        const focus = jest.fn();
        const bankConnectionWindow = createMock<Window>({closed: false, focus, location: {href: 'https://example.com/bank'}});
        const openWindow = jest.spyOn(window, 'open').mockReturnValue(bankConnectionWindow);
        openBankConnection('https://example.com/bank');

        // When the connection screen asks to open the same flow
        const result = openBankConnection('https://example.com/bank');

        // Then the existing window is focused without restarting the connection
        expect(result).toBe(bankConnectionWindow);
        expect(bankConnectionWindow.location.href).toBe('https://example.com/bank');
        expect(openWindow).toHaveBeenCalledTimes(1);
        expect(focus).toHaveBeenCalledTimes(1);
    });

    it('restarts the connection when the user asks to open it again', () => {
        // Given an open window that may be showing a stale callback or error page
        const openBankConnection = loadOpenBankConnection();
        const focus = jest.fn();
        const bankConnectionWindow = createMock<Window>({closed: false, focus, location: {href: 'https://example.com/error'}});
        jest.spyOn(window, 'open').mockReturnValue(bankConnectionWindow);
        openBankConnection('https://example.com/new-bank');

        // When the user explicitly retries the connection
        openBankConnection('https://example.com/new-bank', true);

        // Then the existing popup starts the connection again instead of only being focused
        expect(bankConnectionWindow.location.href).toBe('https://example.com/new-bank');
        expect(focus).toHaveBeenCalledTimes(1);
    });
});

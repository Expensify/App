import Clipboard from '@libs/Clipboard';

describe('Clipboard', () => {
    const originalNavigator = global.navigator;
    const originalDocument = global.document;

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('setString', () => {
        it('returns true when navigator.clipboard.writeText resolves successfully', async () => {
            const writeTextMock = jest.fn().mockResolvedValue(undefined);
            Object.defineProperty(global, 'navigator', {
                value: {
                    clipboard: {
                        writeText: writeTextMock,
                    },
                },
                writable: true,
                configurable: true,
            });

            const result = await Clipboard.setString('test-string');
            expect(result).toBe(true);
            expect(writeTextMock).toHaveBeenCalledWith('test-string');
        });

        it('catches NotAllowedError without unhandled rejection and falls back to execCommand', async () => {
            const notAllowedError = new Error('Document is not focused');
            notAllowedError.name = 'NotAllowedError';
            const writeTextMock = jest.fn().mockRejectedValue(notAllowedError);

            Object.defineProperty(global, 'navigator', {
                value: {
                    clipboard: {
                        writeText: writeTextMock,
                    },
                },
                writable: true,
                configurable: true,
            });

            const execCommandMock = jest.fn().mockReturnValue(true);
            document.execCommand = execCommandMock;

            const result = await Clipboard.setString('recovery-codes-text');
            expect(result).toBe(true);
            expect(writeTextMock).toHaveBeenCalledWith('recovery-codes-text');
            expect(execCommandMock).toHaveBeenCalledWith('copy');
        });

        it('returns false when both navigator.clipboard.writeText and execCommand fail', async () => {
            const writeTextMock = jest.fn().mockRejectedValue(new Error('Permission denied'));
            Object.defineProperty(global, 'navigator', {
                value: {
                    clipboard: {
                        writeText: writeTextMock,
                    },
                },
                writable: true,
                configurable: true,
            });

            const execCommandMock = jest.fn().mockReturnValue(false);
            document.execCommand = execCommandMock;

            const result = await Clipboard.setString('failed-copy');
            expect(result).toBe(false);
        });
    });
});

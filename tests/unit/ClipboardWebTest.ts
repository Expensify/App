/** Verifies browser clipboard failures stay observable without leaking rejected promises. */
import type ClipboardModule from '../../src/libs/Clipboard';

const Clipboard = jest.requireActual<{default: typeof ClipboardModule}>('../../src/libs/Clipboard/index.ts').default;

describe('web clipboard writes', () => {
    const writeText = jest.fn<Promise<void>, [string]>();
    const execCommand = jest.fn<boolean, [string]>();
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const originalExecCommand = Object.getOwnPropertyDescriptor(document, 'execCommand');

    beforeEach(() => {
        jest.clearAllMocks();
        Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText}});
        Object.defineProperty(document, 'execCommand', {configurable: true, value: execCommand});
    });

    afterAll(() => {
        if (originalClipboard) {
            Object.defineProperty(navigator, 'clipboard', originalClipboard);
        } else {
            Reflect.deleteProperty(navigator, 'clipboard');
        }
        if (originalExecCommand) {
            Object.defineProperty(document, 'execCommand', originalExecCommand);
        } else {
            Reflect.deleteProperty(document, 'execCommand');
        }
    });

    it('waits for the browser write before reporting success', async () => {
        // Given the actual browser API has not finished writing
        const {promise, resolve} = Promise.withResolvers<void>();
        writeText.mockReturnValueOnce(promise);
        const completed = jest.fn();

        // When the wrapper is called
        const result = Clipboard.setString('test recovery codes').then(completed);
        await Promise.resolve();
        expect(completed).not.toHaveBeenCalled();
        resolve();
        await result;

        // Then success follows browser completion, without invoking legacy copying
        expect(completed).toHaveBeenCalledWith(true);
        expect(execCommand).not.toHaveBeenCalled();
    });

    it.each([false, true])('handles an unfocused document and returns fallback result %s', async (fallbackResult) => {
        // Given both the browser refusal and the legacy command result are known
        writeText.mockRejectedValueOnce(new DOMException('Document is not focused.', 'NotAllowedError'));
        const setData = jest.fn();
        execCommand.mockImplementationOnce(() => {
            const event = new Event('copy', {bubbles: true, cancelable: true});
            Object.defineProperty(event, 'clipboardData', {value: {clearData: jest.fn(), setData}});
            window.getSelection()?.anchorNode?.dispatchEvent(event);
            return fallbackResult;
        });
        const initialChildren = document.body.childElementCount;

        // When the caller awaits the result
        const result = await Clipboard.setString('test recovery codes');

        // Then the rejection is handled and no sensitive temporary node remains
        expect(result).toBe(fallbackResult);
        expect(document.body.childElementCount).toBe(initialChildren);
        expect(document.body.textContent).not.toContain('test recovery codes');
        expect(setData).toHaveBeenCalledWith('text/plain', 'test recovery codes');
        expect(setData).not.toHaveBeenCalledWith('text/html', expect.anything());
    });

    it('handles synchronous exceptions from both copying APIs', async () => {
        // Given even API invocation can throw rather than return a promise
        writeText.mockImplementationOnce(() => {
            throw new Error('denied');
        });
        execCommand.mockImplementationOnce(() => {
            throw new Error('denied');
        });

        // When copying is attempted, then failure resolves rather than escaping
        await expect(Clipboard.setString('test recovery codes')).resolves.toBe(false);
        expect(document.body.textContent).not.toContain('test recovery codes');
    });
});

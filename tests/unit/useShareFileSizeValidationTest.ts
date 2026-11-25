import {renderHook} from '@testing-library/react-native';

import getFileSize from '@pages/Share/getFileSize';
import useShareFileSizeValidation from '@pages/Share/useShareFileSizeValidation';

import CONST from '@src/CONST';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@pages/Share/getFileSize', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {warn: jest.fn()},
}));

// Render the raw translation keys so assertions don't depend on the copy. One function is reused so the effect doesn't re-run on every render.
const mockTranslate = (key: string) => key;
jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate}));

const mockGetFileSize = jest.mocked(getFileSize);
const mockLogWarn = jest.requireMock<{default: {warn: jest.Mock}}>('@libs/Log').default.warn;

const SHARED_FILE = 'file:///data/user/0/com.expensify.chat/files/Expensify/receipt.pdf';

describe('useShareFileSizeValidation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows the too large error for a file above the API limit', async () => {
        // Given a shared file bigger than the API accepts
        mockGetFileSize.mockResolvedValue(CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
        const setErrorTitle = jest.fn();
        const setErrorMessage = jest.fn();

        // When its size is validated
        renderHook(() => useShareFileSizeValidation(SHARED_FILE, setErrorTitle, setErrorMessage));
        await waitForBatchedUpdates();

        // Then the user sees why it can't be shared
        expect(setErrorTitle).toHaveBeenCalledWith('attachmentPicker.attachmentTooLarge');
        expect(setErrorMessage).toHaveBeenCalledWith('attachmentPicker.sizeExceeded');
    });

    it('logs and shows no error when the size cannot be read', async () => {
        // Given a shared file whose size can't be read, for example because it was removed
        mockGetFileSize.mockRejectedValue(new Error('ENOENT'));
        const setErrorTitle = jest.fn();
        const setErrorMessage = jest.fn();

        // When its size is validated
        renderHook(() => useShareFileSizeValidation(SHARED_FILE, setErrorTitle, setErrorMessage));
        await waitForBatchedUpdates();

        // Then the failure is logged with its message, and the share isn't blocked by a size error it can't prove
        expect(mockLogWarn).toHaveBeenCalledWith('[useShareFileSizeValidation] Failed to get the shared file size', {error: 'ENOENT'});
        expect(setErrorTitle).not.toHaveBeenCalled();
        expect(setErrorMessage).not.toHaveBeenCalled();
    });

    it('ignores a size that arrives after the page is gone', async () => {
        // Given a size read that is still running
        let resolveSize: (size: number) => void = () => {};
        mockGetFileSize.mockReturnValue(
            new Promise<number>((resolve) => {
                resolveSize = resolve;
            }),
        );
        const setErrorTitle = jest.fn();
        const setErrorMessage = jest.fn();
        const {unmount} = renderHook(() => useShareFileSizeValidation(SHARED_FILE, setErrorTitle, setErrorMessage));

        // When the page unmounts before the size of a too large file arrives
        unmount();
        resolveSize(CONST.API_ATTACHMENT_VALIDATIONS.MAX_SIZE + 1);
        await waitForBatchedUpdates();

        // Then no error is set on the page that is gone
        expect(setErrorTitle).not.toHaveBeenCalled();
        expect(setErrorMessage).not.toHaveBeenCalled();
    });
});

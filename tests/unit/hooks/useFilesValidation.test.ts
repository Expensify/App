import {act, renderHook, waitFor} from '@testing-library/react-native';

import type PDFThumbnailProps from '@components/PDFThumbnail/types';

import useFilesValidation from '@hooks/useFilesValidation';

import type * as FileUtilsModule from '@libs/fileDownload/FileUtils';
import {resizeImageIfNeeded} from '@libs/fileDownload/FileUtils';
import convertHeicImage from '@libs/fileDownload/heicConverter';
import validateAttachmentFile from '@libs/validateAttachmentFile';

import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

import type * as MockUseConfirmModalUtil from '../../utils/mockUseConfirmModal';

import {getShowConfirmModalOption, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../../utils/mockUseConfirmModal';

jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});

jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

jest.mock('@hooks/useThemeStyles', () => () => ({
    invisiblePDF: {},
}));

jest.mock('@components/FullScreenLoaderContext', () => ({
    useFullScreenLoaderActions: () => ({setIsLoaderVisible: jest.fn()}),
}));

jest.mock('@libs/validateAttachmentFile', () => jest.fn());

jest.mock('@libs/fileDownload/heicConverter', () => jest.fn());

jest.mock('@libs/fileDownload/FileUtils', () => {
    const actual = jest.requireActual<typeof FileUtilsModule>('@libs/fileDownload/FileUtils');
    return {
        ...actual,
        resizeImageIfNeeded: jest.fn(),
    };
});

const mockValidateAttachmentFile = jest.mocked(validateAttachmentFile);
const mockConvertHeicImage = jest.mocked(convertHeicImage);
const mockResizeImageIfNeeded = jest.mocked(resizeImageIfNeeded);

type ValidateAttachmentResult = Awaited<ReturnType<typeof validateAttachmentFile>>;

function createFile(overrides: Partial<FileObject> & {uri: string}): FileObject {
    return {
        name: 'file.jpg',
        size: 1024,
        type: 'image/jpeg',
        ...overrides,
    };
}

function getPDFValidationProps(pdfValidationComponent: ReturnType<typeof useFilesValidation>['PDFValidationComponent']): PDFThumbnailProps | undefined {
    // PDFValidationComponent is typed as a plain JSX.Element, so its `props` has no generic type information to narrow from.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return pdfValidationComponent?.props as unknown as PDFThumbnailProps | undefined;
}

describe('useFilesValidation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetMockConfirmModal();
    });

    describe('guard & edge cases', () => {
        it('ignores a validateFiles call while a previous validation is still in progress', async () => {
            const onFilesValidated = jest.fn();
            const file = createFile({uri: 'file-1'});
            let resolvePendingValidation: ((value: ValidateAttachmentResult) => void) | undefined;
            mockValidateAttachmentFile.mockImplementation(
                () =>
                    new Promise<ValidateAttachmentResult>((resolve) => {
                        resolvePendingValidation = resolve;
                    }),
            );

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([file]);
            });

            await waitFor(() => expect(mockValidateAttachmentFile).toHaveBeenCalledTimes(1));

            act(() => {
                result.current.validateFiles([file]);
            });

            // The second call was rejected because validation was already in progress.
            expect(mockValidateAttachmentFile).toHaveBeenCalledTimes(1);

            await act(async () => {
                resolvePendingValidation?.({isValid: true, file});
            });

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledTimes(1));
        });

        it('[gap] gets permanently stuck when validateFiles is called with an empty array', async () => {
            const onFilesValidated = jest.fn();

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([]);
            });

            // `validateAndResizeFiles` returns immediately for an empty list without ever calling `reset()`,
            // so `isValidatingFiles` is stuck `true` and every future call is silently ignored.
            const file = createFile({uri: 'file-1'});
            mockValidateAttachmentFile.mockResolvedValue({isValid: true, file});
            act(() => {
                result.current.validateFiles([file]);
            });

            expect(mockValidateAttachmentFile).not.toHaveBeenCalled();
            expect(onFilesValidated).not.toHaveBeenCalled();
        });
    });

    describe('successful validation', () => {
        it('validates and returns a single valid file without showing a modal', async () => {
            const onFilesValidated = jest.fn();
            const validFile = createFile({uri: 'file-1'});
            mockValidateAttachmentFile.mockResolvedValue({isValid: true, file: validFile});

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([validFile]);
            });

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledTimes(1));

            expect(onFilesValidated).toHaveBeenCalledWith([validFile], []);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('sorts multiple valid files back into their original selection order', async () => {
            const onFilesValidated = jest.fn();
            const fileA = createFile({uri: 'file-a'});
            const fileB = createFile({uri: 'file-b'});
            mockValidateAttachmentFile.mockImplementation(async (file) => ({isValid: true, file}) as ValidateAttachmentResult);

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([fileA, fileB]);
            });

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledTimes(1));

            expect(onFilesValidated).toHaveBeenCalledWith([fileA, fileB], []);
        });
    });

    describe('single error modal', () => {
        it('shows a confirm modal for an invalid file and does not proceed when cancelled', async () => {
            const onFilesValidated = jest.fn();
            const invalidFile = createFile({uri: 'file-1'});
            mockValidateAttachmentFile.mockResolvedValue({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE});

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([invalidFile]);
            });

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('title')).toBe('attachmentPicker.wrongFileType');
            expect(getShowConfirmModalOption('confirmText')).toBe('common.close');
            expect(getShowConfirmModalOption('shouldShowCancelButton')).toBe(false);

            await act(async () => {
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            expect(onFilesValidated).not.toHaveBeenCalled();
        });

        it('skips the invalid file and proceeds with the remaining valid files when confirmed', async () => {
            const onFilesValidated = jest.fn();
            const validFile = createFile({uri: 'file-valid'});
            const invalidFile = createFile({uri: 'file-invalid'});
            mockValidateAttachmentFile.mockImplementation(async (file) => {
                if (file === invalidFile) {
                    return {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE};
                }
                return {isValid: true, file};
            });

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([validFile, invalidFile]);
            });

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('confirmText')).toBe('common.continue');
            expect(getShowConfirmModalOption('shouldShowCancelButton')).toBe(true);

            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledTimes(1));
            expect(onFilesValidated).toHaveBeenCalledWith([validFile], []);
        });

        it('discards the entire batch on cancel, even files that already passed validation', async () => {
            const onFilesValidated = jest.fn();
            const validFile = createFile({uri: 'file-valid'});
            const invalidFile = createFile({uri: 'file-invalid'});
            mockValidateAttachmentFile.mockImplementation(async (file) => {
                if (file === invalidFile) {
                    return {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE};
                }
                return {isValid: true, file};
            });

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([validFile, invalidFile]);
            });

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            await act(async () => {
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            expect(onFilesValidated).not.toHaveBeenCalled();

            // Confirms the batch was fully discarded and the hook reset (not stuck on the valid file).
            const nextFile = createFile({uri: 'file-next'});
            mockValidateAttachmentFile.mockResolvedValue({isValid: true, file: nextFile});
            act(() => {
                result.current.validateFiles([nextFile]);
            });
            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([nextFile], []));
        });
    });

    describe('multiple sequential error modals', () => {
        it('walks through multiple errors one at a time, switching to non-cancellable wording on the last one, and resets without proceeding once all files are invalid', async () => {
            const onFilesValidated = jest.fn();
            const firstInvalidFile = createFile({uri: 'file-1'});
            const secondInvalidFile = createFile({uri: 'file-2'});
            mockValidateAttachmentFile.mockImplementation(async (file) => {
                if (file === firstInvalidFile) {
                    return {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE};
                }
                return {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED};
            });

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([firstInvalidFile, secondInvalidFile]);
            });

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('title')).toBe('attachmentPicker.someFilesCantBeUploaded');

            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(2));
            expect(getShowConfirmModalOption('title')).toBe('attachmentPicker.attachmentError');
            // No valid files survived, so the final modal drops the "Continue" wording and cancel button.
            expect(getShowConfirmModalOption('confirmText')).toBe('common.close');
            expect(getShowConfirmModalOption('shouldShowCancelButton')).toBe(false);

            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            // No valid files survived, so validation should complete without ever calling onFilesValidated.
            await waitFor(() => expect(mockValidateAttachmentFile).toHaveBeenCalledTimes(2));
            expect(onFilesValidated).not.toHaveBeenCalled();

            // Confirms the hook reset itself (a stuck `isValidatingFiles` flag would make this call a no-op).
            const nextValidFile = createFile({uri: 'file-3'});
            mockValidateAttachmentFile.mockResolvedValue({isValid: true, file: nextValidFile});
            act(() => {
                result.current.validateFiles([nextValidFile]);
            });
            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([nextValidFile], []));
        });
    });

    describe('max file limit', () => {
        it('shows the max file limit modal immediately and validates only the truncated list once confirmed', async () => {
            const onFilesValidated = jest.fn();
            const maxFileLimit = CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT;
            const files = Array.from({length: maxFileLimit + 1}, (_, index) => createFile({uri: `file-${index}`}));
            mockValidateAttachmentFile.mockImplementation(async (file) => ({isValid: true, file}) as ValidateAttachmentResult);

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles(files);
            });

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('title')).toBe('attachmentPicker.someFilesCantBeUploaded');
            // The limit is enforced up front, so no file is validated until the user confirms.
            expect(mockValidateAttachmentFile).not.toHaveBeenCalled();

            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledTimes(1));
            expect(mockValidateAttachmentFile).toHaveBeenCalledTimes(maxFileLimit);
            expect(onFilesValidated).toHaveBeenCalledWith(files.slice(0, maxFileLimit), []);
        });

        it('discards the entire selection when the max-file-limit modal is cancelled', async () => {
            const onFilesValidated = jest.fn();
            const maxFileLimit = CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT;
            const files = Array.from({length: maxFileLimit + 1}, (_, index) => createFile({uri: `file-${index}`}));
            mockValidateAttachmentFile.mockImplementation(async (file) => ({isValid: true, file}) as ValidateAttachmentResult);

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles(files);
            });

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            await act(async () => {
                resolveShowConfirmModal({action: 'CLOSE'});
            });

            // Cancelling means none of the files are ever validated, not even the first 30.
            expect(mockValidateAttachmentFile).not.toHaveBeenCalled();
            expect(onFilesValidated).not.toHaveBeenCalled();

            // Hook reset itself and accepts a new call.
            const nextFile = createFile({uri: 'file-next'});
            act(() => {
                result.current.validateFiles([nextFile]);
            });
            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([nextFile], []));
        });
    });

    describe('HEIC/HEIF conversion', () => {
        it('converts a HEIC file and includes the converted result', async () => {
            const onFilesValidated = jest.fn();
            const heicFile = createFile({uri: 'file-heic', name: 'photo.heic'});
            const convertedFile = createFile({uri: 'file-heic-converted', name: 'photo.jpg', size: 2048});
            mockValidateAttachmentFile.mockResolvedValue({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE});
            mockConvertHeicImage.mockImplementation((file, callbacks) => callbacks?.onSuccess?.(convertedFile));

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([heicFile]);
            });

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledTimes(1));
            expect(onFilesValidated).toHaveBeenCalledWith([convertedFile], []);
        });

        it('[gap] silently falls back to the original, unconverted file when HEIC conversion fails', async () => {
            const onFilesValidated = jest.fn();
            const heicFile = createFile({uri: 'file-heic', name: 'photo.heic'});
            mockValidateAttachmentFile.mockResolvedValue({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE});
            mockConvertHeicImage.mockImplementation((file, callbacks) => callbacks?.onError?.(new Error('conversion failed'), file));

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([heicFile]);
            });

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledTimes(1));
            // The conversion error is swallowed: the original file is passed through as if it were valid.
            expect(onFilesValidated).toHaveBeenCalledWith([heicFile], []);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('routes an oversized converted receipt image to resizing, then includes the resized result', async () => {
            const onFilesValidated = jest.fn();
            const heicFile = createFile({uri: 'file-heic', name: 'photo.heic'});
            const oversizedConvertedFile = createFile({uri: 'file-heic-converted', name: 'photo.jpg', size: CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 1});
            const resizedFile = createFile({uri: 'file-heic-resized', name: 'photo.jpg', size: 1024});
            mockValidateAttachmentFile.mockResolvedValue({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE});
            mockConvertHeicImage.mockImplementation((file, callbacks) => callbacks?.onSuccess?.(oversizedConvertedFile));
            mockResizeImageIfNeeded.mockResolvedValue(resizedFile);

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([heicFile], [], {isValidatingReceipts: true});
            });

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledTimes(1));
            expect(mockResizeImageIfNeeded).toHaveBeenCalledWith(oversizedConvertedFile);
            expect(onFilesValidated).toHaveBeenCalledWith([resizedFile], []);
        });
    });

    describe('image resizing', () => {
        it('resizes an oversized image and includes the resized result', async () => {
            const onFilesValidated = jest.fn();
            const largeImage = createFile({uri: 'file-large', name: 'photo.jpg'});
            const resizedFile = createFile({uri: 'file-resized', name: 'photo.jpg', size: 1024});
            mockValidateAttachmentFile.mockResolvedValue({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE});
            mockResizeImageIfNeeded.mockResolvedValue(resizedFile);

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([largeImage]);
            });

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledTimes(1));
            expect(onFilesValidated).toHaveBeenCalledWith([resizedFile], []);
        });

        it('surfaces a dimensions-too-large error when resizing rejects with that specific reason', async () => {
            const onFilesValidated = jest.fn();
            const largeImage = createFile({uri: 'file-large', name: 'photo.jpg'});
            mockValidateAttachmentFile.mockResolvedValue({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE});
            mockResizeImageIfNeeded.mockRejectedValue(new Error(CONST.FILE_VALIDATION_ERRORS.IMAGE_DIMENSIONS_TOO_LARGE));

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([largeImage]);
            });

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('prompt')).toBe('attachmentPicker.imageDimensionsTooLarge');
        });

        it('[gap] masks any other resize failure reason behind a generic file-corrupted error', async () => {
            const onFilesValidated = jest.fn();
            const largeImage = createFile({uri: 'file-large', name: 'photo.jpg'});
            mockValidateAttachmentFile.mockResolvedValue({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE});
            mockResizeImageIfNeeded.mockRejectedValue(new Error('some unrelated network failure'));

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([largeImage]);
            });

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            // The real failure reason never reaches the user — it's always shown as a generic corruption error.
            expect(getShowConfirmModalOption('prompt')).toBe('attachmentPicker.errorWhileSelectingCorruptedAttachment');
        });
    });

    describe('PDF validation', () => {
        it('validates a PDF thumbnail and proceeds once it loads successfully', async () => {
            const onFilesValidated = jest.fn();
            const pdfFile = createFile({uri: 'file-pdf', name: 'document.pdf'});
            mockValidateAttachmentFile.mockResolvedValue({isValid: true, file: pdfFile});

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([pdfFile]);
            });

            await waitFor(() => expect(result.current.PDFValidationComponent).toBeDefined());

            act(() => {
                getPDFValidationProps(result.current.PDFValidationComponent)?.onLoadSuccess?.();
            });

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledTimes(1));
            expect(onFilesValidated).toHaveBeenCalledWith([pdfFile], []);
        });

        it('shows a corrupted-file error when the PDF thumbnail fails to load', async () => {
            const onFilesValidated = jest.fn();
            const pdfFile = createFile({uri: 'file-pdf', name: 'document.pdf'});
            mockValidateAttachmentFile.mockResolvedValue({isValid: true, file: pdfFile});

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([pdfFile]);
            });

            await waitFor(() => expect(result.current.PDFValidationComponent).toBeDefined());

            act(() => {
                getPDFValidationProps(result.current.PDFValidationComponent)?.onLoadError?.();
            });

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('title')).toBe('attachmentPicker.attachmentError');

            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
            });

            expect(onFilesValidated).not.toHaveBeenCalled();
        });

        it('treats a password-protected PDF as an error when validating receipts', async () => {
            const onFilesValidated = jest.fn();
            const pdfFile = createFile({uri: 'file-pdf', name: 'document.pdf'});
            mockValidateAttachmentFile.mockResolvedValue({isValid: true, file: pdfFile});

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([pdfFile], [], {isValidatingReceipts: true});
            });

            await waitFor(() => expect(result.current.PDFValidationComponent).toBeDefined());

            act(() => {
                getPDFValidationProps(result.current.PDFValidationComponent)?.onPassword?.();
            });

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('title')).toBe('attachmentPicker.attachmentError');
            expect(getShowConfirmModalOption('prompt')).toBe('attachmentPicker.protectedPDFNotSupported');
        });

        it('treats a password-protected PDF as valid when not validating receipts', async () => {
            const onFilesValidated = jest.fn();
            const pdfFile = createFile({uri: 'file-pdf', name: 'document.pdf'});
            mockValidateAttachmentFile.mockResolvedValue({isValid: true, file: pdfFile});

            const {result} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([pdfFile], [], {isValidatingReceipts: false});
            });

            await waitFor(() => expect(result.current.PDFValidationComponent).toBeDefined());

            act(() => {
                getPDFValidationProps(result.current.PDFValidationComponent)?.onPassword?.();
            });

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledTimes(1));
            expect(onFilesValidated).toHaveBeenCalledWith([pdfFile], []);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });
    });

    describe('unmount safety', () => {
        it('does not call onFilesValidated once a pending HEIC conversion resolves after unmount', async () => {
            const onFilesValidated = jest.fn();
            const heicFile = createFile({uri: 'file-heic', name: 'photo.heic'});
            let resolveConversion: (() => void) | undefined;
            mockValidateAttachmentFile.mockResolvedValue({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE});
            mockConvertHeicImage.mockImplementation((file, callbacks) => {
                resolveConversion = () => callbacks?.onSuccess?.(file);
            });

            const {result, unmount} = renderHook(() => useFilesValidation(onFilesValidated));

            act(() => {
                result.current.validateFiles([heicFile]);
            });

            await waitFor(() => expect(mockConvertHeicImage).toHaveBeenCalledTimes(1));

            unmount();

            // handleNext() checks isMountedRef before touching onFilesValidated/state, so a conversion that
            // finishes after unmount is a safe no-op rather than firing the callback on a torn-down component.
            act(() => {
                resolveConversion?.();
            });

            expect(onFilesValidated).not.toHaveBeenCalled();
        });
    });
});

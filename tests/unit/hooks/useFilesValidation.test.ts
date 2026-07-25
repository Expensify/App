import {act, renderHook, waitFor} from '@testing-library/react-native';

import type PDFThumbnailProps from '@components/PDFThumbnail/types';

import useFilesValidation from '@hooks/useFilesValidation';

import type * as FileUtilsModule from '@libs/fileDownload/FileUtils';
import {resizeImageIfNeeded} from '@libs/fileDownload/FileUtils';
import convertHeicImage from '@libs/fileDownload/heicConverter';
import validateAttachmentFile from '@libs/validateAttachmentFile';

import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

import type {ValueOf} from 'type-fest';

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
type UseFilesValidationResult = ReturnType<typeof useFilesValidation>;

function createFile(overrides: Partial<FileObject> & {uri: string}): FileObject {
    return {
        name: 'file.jpg',
        size: 1024,
        type: 'image/jpeg',
        ...overrides,
    };
}

/** Mounts the hook with a fresh `onFilesValidated` spy. */
function setup() {
    const onFilesValidated = jest.fn();
    return {onFilesValidated, ...renderHook(() => useFilesValidation(onFilesValidated))};
}

/** Calls `validateFiles` inside `act`, matching how a real event handler would invoke it. */
function triggerValidation(result: {current: UseFilesValidationResult}, ...args: Parameters<UseFilesValidationResult['validateFiles']>) {
    act(() => {
        result.current.validateFiles(...args);
    });
}

/** Resolves the currently-open confirm modal (defaults to the user confirming). */
async function resolveModal(action: 'CONFIRM' | 'CLOSE' = 'CONFIRM') {
    await act(async () => {
        resolveShowConfirmModal({action});
    });
}

function mockValid(file: FileObject) {
    mockValidateAttachmentFile.mockResolvedValue({isValid: true, file});
}

function mockInvalid(error: ValueOf<typeof CONST.FILE_VALIDATION_ERRORS>) {
    mockValidateAttachmentFile.mockResolvedValue({isValid: false, error});
}

function getPDFValidationProps(pdfValidationComponent: UseFilesValidationResult['PDFValidationComponent']): PDFThumbnailProps | undefined {
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
            const file = createFile({uri: 'file-1'});
            let resolvePendingValidation: ((value: ValidateAttachmentResult) => void) | undefined;
            mockValidateAttachmentFile.mockImplementation(
                () =>
                    new Promise<ValidateAttachmentResult>((resolve) => {
                        resolvePendingValidation = resolve;
                    }),
            );

            const {result, onFilesValidated} = setup();
            triggerValidation(result, [file]);

            await waitFor(() => expect(mockValidateAttachmentFile).toHaveBeenCalledTimes(1));

            triggerValidation(result, [file]);

            // The second call was rejected because validation was already in progress.
            expect(mockValidateAttachmentFile).toHaveBeenCalledTimes(1);

            await act(async () => {
                resolvePendingValidation?.({isValid: true, file});
            });

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledTimes(1));
        });

        // TODO: bug — an empty list should be a no-op, not brick the hook. Out of scope for this refactor.
        it('an empty file list blocks all future validation calls', () => {
            const {result, onFilesValidated} = setup();
            triggerValidation(result, []);

            // `validateAndResizeFiles` returns immediately for an empty list without ever calling `reset()`,
            // so `isValidatingFiles` is stuck `true` and every future call is silently ignored.
            const file = createFile({uri: 'file-1'});
            mockValid(file);
            triggerValidation(result, [file]);

            expect(mockValidateAttachmentFile).not.toHaveBeenCalled();
            expect(onFilesValidated).not.toHaveBeenCalled();
        });
    });

    describe('successful validation', () => {
        it('validates and returns a single valid file without showing a modal', async () => {
            const validFile = createFile({uri: 'file-1'});
            mockValid(validFile);

            const {result, onFilesValidated} = setup();
            triggerValidation(result, [validFile]);

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([validFile], []));
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('sorts multiple valid files back into their original selection order', async () => {
            const fileA = createFile({uri: 'file-a'});
            const fileB = createFile({uri: 'file-b'});
            mockValidateAttachmentFile.mockImplementation(async (file) => ({isValid: true, file}) as ValidateAttachmentResult);

            const {result, onFilesValidated} = setup();
            triggerValidation(result, [fileA, fileB]);

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([fileA, fileB], []));
        });
    });

    describe('single error modal', () => {
        it('shows a confirm modal for an invalid file and does not proceed when cancelled', async () => {
            const invalidFile = createFile({uri: 'file-1'});
            mockInvalid(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);

            const {result, onFilesValidated} = setup();
            triggerValidation(result, [invalidFile]);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('title')).toBe('attachmentPicker.wrongFileType');
            expect(getShowConfirmModalOption('confirmText')).toBe('common.close');
            expect(getShowConfirmModalOption('shouldShowCancelButton')).toBe(false);

            await resolveModal('CLOSE');

            expect(onFilesValidated).not.toHaveBeenCalled();
        });

        it('skips the invalid file and proceeds with the remaining valid files when confirmed', async () => {
            const validFile = createFile({uri: 'file-valid'});
            const invalidFile = createFile({uri: 'file-invalid'});
            mockValidateAttachmentFile.mockImplementation(async (file) =>
                file === invalidFile ? {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE} : {isValid: true, file},
            );

            const {result, onFilesValidated} = setup();
            triggerValidation(result, [validFile, invalidFile]);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('confirmText')).toBe('common.continue');
            expect(getShowConfirmModalOption('shouldShowCancelButton')).toBe(true);

            await resolveModal('CONFIRM');

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([validFile], []));
        });

        it('discards the entire batch on cancel, even files that already passed validation', async () => {
            const validFile = createFile({uri: 'file-valid'});
            const invalidFile = createFile({uri: 'file-invalid'});
            mockValidateAttachmentFile.mockImplementation(async (file) =>
                file === invalidFile ? {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE} : {isValid: true, file},
            );

            const {result, onFilesValidated} = setup();
            triggerValidation(result, [validFile, invalidFile]);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            await resolveModal('CLOSE');

            expect(onFilesValidated).not.toHaveBeenCalled();

            // Confirms the batch was fully discarded and the hook reset (not stuck on the valid file).
            const nextFile = createFile({uri: 'file-next'});
            mockValid(nextFile);
            triggerValidation(result, [nextFile]);
            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([nextFile], []));
        });
    });

    describe('multiple sequential error modals', () => {
        it('walks through multiple errors one at a time, switching to non-cancellable wording on the last one, and resets without proceeding once all files are invalid', async () => {
            const firstInvalidFile = createFile({uri: 'file-1'});
            const secondInvalidFile = createFile({uri: 'file-2'});
            mockValidateAttachmentFile.mockImplementation(async (file) =>
                file === firstInvalidFile ? {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE} : {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED},
            );

            const {result, onFilesValidated} = setup();
            triggerValidation(result, [firstInvalidFile, secondInvalidFile]);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('title')).toBe('attachmentPicker.someFilesCantBeUploaded');

            await resolveModal('CONFIRM');

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(2));
            expect(getShowConfirmModalOption('title')).toBe('attachmentPicker.attachmentError');
            // No valid files survived, so the final modal drops the "Continue" wording and cancel button.
            expect(getShowConfirmModalOption('confirmText')).toBe('common.close');
            expect(getShowConfirmModalOption('shouldShowCancelButton')).toBe(false);

            await resolveModal('CONFIRM');

            // No valid files survived, so validation should complete without ever calling onFilesValidated.
            await waitFor(() => expect(mockValidateAttachmentFile).toHaveBeenCalledTimes(2));
            expect(onFilesValidated).not.toHaveBeenCalled();

            // Confirms the hook reset itself (a stuck `isValidatingFiles` flag would make this call a no-op).
            const nextValidFile = createFile({uri: 'file-3'});
            mockValid(nextValidFile);
            triggerValidation(result, [nextValidFile]);
            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([nextValidFile], []));
        });
    });

    describe('max file limit', () => {
        function createOverLimitFiles() {
            const maxFileLimit = CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT;
            return {maxFileLimit, files: Array.from({length: maxFileLimit + 1}, (_, index) => createFile({uri: `file-${index}`}))};
        }

        it('shows the max file limit modal immediately and validates only the truncated list once confirmed', async () => {
            const {maxFileLimit, files} = createOverLimitFiles();
            mockValidateAttachmentFile.mockImplementation(async (file) => ({isValid: true, file}) as ValidateAttachmentResult);

            const {result, onFilesValidated} = setup();
            triggerValidation(result, files);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('title')).toBe('attachmentPicker.someFilesCantBeUploaded');
            // The limit is enforced up front, so no file is validated until the user confirms.
            expect(mockValidateAttachmentFile).not.toHaveBeenCalled();

            await resolveModal('CONFIRM');

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith(files.slice(0, maxFileLimit), []));
            expect(mockValidateAttachmentFile).toHaveBeenCalledTimes(maxFileLimit);
        });

        it('discards the entire selection when the max-file-limit modal is cancelled', async () => {
            const {files} = createOverLimitFiles();
            mockValidateAttachmentFile.mockImplementation(async (file) => ({isValid: true, file}) as ValidateAttachmentResult);

            const {result, onFilesValidated} = setup();
            triggerValidation(result, files);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            await resolveModal('CLOSE');

            // Cancelling means none of the files are ever validated, not even the first 30.
            expect(mockValidateAttachmentFile).not.toHaveBeenCalled();
            expect(onFilesValidated).not.toHaveBeenCalled();

            // Hook reset itself and accepts a new call.
            const nextFile = createFile({uri: 'file-next'});
            triggerValidation(result, [nextFile]);
            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([nextFile], []));
        });
    });

    describe('HEIC/HEIF conversion', () => {
        it('converts a HEIC file and includes the converted result', async () => {
            const heicFile = createFile({uri: 'file-heic', name: 'photo.heic'});
            const convertedFile = createFile({uri: 'file-heic-converted', name: 'photo.jpg', size: 2048});
            mockInvalid(CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE);
            mockConvertHeicImage.mockImplementation((file, callbacks) => callbacks?.onSuccess?.(convertedFile));

            const {result, onFilesValidated} = setup();
            triggerValidation(result, [heicFile]);

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([convertedFile], []));
        });

        it('[gap] silently falls back to the original, unconverted file when HEIC conversion fails', async () => {
            const heicFile = createFile({uri: 'file-heic', name: 'photo.heic'});
            mockInvalid(CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE);
            mockConvertHeicImage.mockImplementation((file, callbacks) => callbacks?.onError?.(new Error('conversion failed'), file));

            const {result, onFilesValidated} = setup();
            triggerValidation(result, [heicFile]);

            // The conversion error is swallowed: the original file is passed through as if it were valid.
            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([heicFile], []));
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });

        it('routes an oversized converted receipt image to resizing, then includes the resized result', async () => {
            const heicFile = createFile({uri: 'file-heic', name: 'photo.heic'});
            const oversizedConvertedFile = createFile({uri: 'file-heic-converted', name: 'photo.jpg', size: CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 1});
            const resizedFile = createFile({uri: 'file-heic-resized', name: 'photo.jpg', size: 1024});
            mockInvalid(CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE);
            mockConvertHeicImage.mockImplementation((file, callbacks) => callbacks?.onSuccess?.(oversizedConvertedFile));
            mockResizeImageIfNeeded.mockResolvedValue(resizedFile);

            const {result, onFilesValidated} = setup();
            triggerValidation(result, [heicFile], [], {isValidatingReceipts: true});

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([resizedFile], []));
            expect(mockResizeImageIfNeeded).toHaveBeenCalledWith(oversizedConvertedFile);
        });
    });

    describe('image resizing', () => {
        it('resizes an oversized image and includes the resized result', async () => {
            const largeImage = createFile({uri: 'file-large', name: 'photo.jpg'});
            const resizedFile = createFile({uri: 'file-resized', name: 'photo.jpg', size: 1024});
            mockInvalid(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
            mockResizeImageIfNeeded.mockResolvedValue(resizedFile);

            const {result, onFilesValidated} = setup();
            triggerValidation(result, [largeImage]);

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([resizedFile], []));
        });

        it('surfaces a dimensions-too-large error when resizing rejects with that specific reason', async () => {
            const largeImage = createFile({uri: 'file-large', name: 'photo.jpg'});
            mockInvalid(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
            mockResizeImageIfNeeded.mockRejectedValue(new Error(CONST.FILE_VALIDATION_ERRORS.IMAGE_DIMENSIONS_TOO_LARGE));

            const {result} = setup();
            triggerValidation(result, [largeImage]);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('prompt')).toBe('attachmentPicker.imageDimensionsTooLarge');
        });

        it('[gap] masks any other resize failure reason behind a generic file-corrupted error', async () => {
            const largeImage = createFile({uri: 'file-large', name: 'photo.jpg'});
            mockInvalid(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE);
            mockResizeImageIfNeeded.mockRejectedValue(new Error('some unrelated network failure'));

            const {result} = setup();
            triggerValidation(result, [largeImage]);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            // The real failure reason never reaches the user — it's always shown as a generic corruption error.
            expect(getShowConfirmModalOption('prompt')).toBe('attachmentPicker.errorWhileSelectingCorruptedAttachment');
        });
    });

    describe('PDF validation', () => {
        async function triggerPDFCallback(
            result: {current: UseFilesValidationResult},
            pdfFile: FileObject,
            callback: 'onLoadSuccess' | 'onLoadError' | 'onPassword',
            validationOptions?: Parameters<UseFilesValidationResult['validateFiles']>[2],
        ) {
            mockValid(pdfFile);
            triggerValidation(result, [pdfFile], [], validationOptions);
            await waitFor(() => expect(result.current.PDFValidationComponent).toBeDefined());
            act(() => {
                getPDFValidationProps(result.current.PDFValidationComponent)?.[callback]?.();
            });
        }

        it('validates a PDF thumbnail and proceeds once it loads successfully', async () => {
            const pdfFile = createFile({uri: 'file-pdf', name: 'document.pdf'});
            const {result, onFilesValidated} = setup();

            await triggerPDFCallback(result, pdfFile, 'onLoadSuccess');

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([pdfFile], []));
        });

        it('shows a corrupted-file error when the PDF thumbnail fails to load', async () => {
            const pdfFile = createFile({uri: 'file-pdf', name: 'document.pdf'});
            const {result, onFilesValidated} = setup();

            await triggerPDFCallback(result, pdfFile, 'onLoadError');

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('title')).toBe('attachmentPicker.attachmentError');

            await resolveModal('CONFIRM');

            expect(onFilesValidated).not.toHaveBeenCalled();
        });

        it('treats a password-protected PDF as an error when validating receipts', async () => {
            const pdfFile = createFile({uri: 'file-pdf', name: 'document.pdf'});
            const {result} = setup();

            await triggerPDFCallback(result, pdfFile, 'onPassword', {isValidatingReceipts: true});

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('title')).toBe('attachmentPicker.attachmentError');
            expect(getShowConfirmModalOption('prompt')).toBe('attachmentPicker.protectedPDFNotSupported');
        });

        it('treats a password-protected PDF as valid when not validating receipts', async () => {
            const pdfFile = createFile({uri: 'file-pdf', name: 'document.pdf'});
            const {result, onFilesValidated} = setup();

            await triggerPDFCallback(result, pdfFile, 'onPassword', {isValidatingReceipts: false});

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([pdfFile], []));
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
        });
    });

    describe('unmount safety', () => {
        it('does not call onFilesValidated once a pending HEIC conversion resolves after unmount', async () => {
            const heicFile = createFile({uri: 'file-heic', name: 'photo.heic'});
            let resolveConversion: (() => void) | undefined;
            mockInvalid(CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE);
            mockConvertHeicImage.mockImplementation((file, callbacks) => {
                resolveConversion = () => callbacks?.onSuccess?.(file);
            });

            const {result, unmount, onFilesValidated} = setup();
            triggerValidation(result, [heicFile]);

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

/// <reference types="node" />

import {act, renderHook, waitFor} from '@testing-library/react-native';

import type PDFThumbnailProps from '@components/PDFThumbnail/types';

import useFilesValidation from '@hooks/useFilesValidation';

import type * as FileUtilsModule from '@libs/fileDownload/FileUtils';
import {cleanFileObject, cleanFileObjectName, resizeImageIfNeeded} from '@libs/fileDownload/FileUtils';
import convertHeicImage from '@libs/fileDownload/heicConverter';
import validateAttachmentFile from '@libs/validateAttachmentFile';

import Navigation from '@navigation/Navigation';

import useConciergeAttachmentPicker from '@pages/home/ForYouSection/useConciergeAttachmentPicker';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';

import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

import type {ValueOf} from 'type-fest';

import {readFileSync} from 'node:fs';
import {nextTick} from 'node:process';
import {promiseHooks} from 'node:v8';
import React from 'react';

import type * as MockUseConfirmModalUtil from '../../utils/mockUseConfirmModal';

import createMock from '../../utils/createMock';
import {getShowConfirmModalOption, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../../utils/mockUseConfirmModal';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

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
jest.mock('@navigation/Navigation', () => ({navigate: jest.fn()}));

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
    const onFilesValidated = jest.fn<ReturnType<Parameters<typeof useFilesValidation>[0]>, Parameters<Parameters<typeof useFilesValidation>[0]>>();
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
            // Given two valid files whose selection order must survive validation.
            const fileA = createFile({uri: 'file-a'});
            const fileB = createFile({uri: 'file-b'});
            mockValidateAttachmentFile.mockImplementation(async (file) => {
                if (file === null) {
                    throw new Error('Unexpected null in the nonnull fixture');
                }
                return {isValid: true, file};
            });

            const {result, onFilesValidated} = setup();
            // When the selected files are validated together.
            triggerValidation(result, [fileA, fileB]);

            // Then the callback receives the files in their original selection order.
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
            // Given a batch with one valid file and one unsupported file.
            const validFile = createFile({uri: 'file-valid'});
            const invalidFile = createFile({uri: 'file-invalid'});
            mockValidateAttachmentFile.mockImplementation(async (file) => {
                if (file === null) {
                    throw new Error('Unexpected null in the nonnull fixture');
                }
                return file === invalidFile ? {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE} : {isValid: true, file};
            });

            const {result, onFilesValidated} = setup();
            // When validation reports the unsupported file and the user chooses to continue.
            triggerValidation(result, [validFile, invalidFile]);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('confirmText')).toBe('common.continue');
            expect(getShowConfirmModalOption('shouldShowCancelButton')).toBe(true);

            await resolveModal('CONFIRM');

            // Then only the valid file survives in the callback.
            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([validFile], []));
        });

        it('discards the entire batch on cancel, even files that already passed validation', async () => {
            // Given a batch with a valid file that must also be discarded on cancellation.
            const validFile = createFile({uri: 'file-valid'});
            const invalidFile = createFile({uri: 'file-invalid'});
            mockValidateAttachmentFile.mockImplementation(async (file) => {
                if (file === null) {
                    throw new Error('Unexpected null in the nonnull fixture');
                }
                return file === invalidFile ? {isValid: false, error: CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE} : {isValid: true, file};
            });

            const {result, onFilesValidated} = setup();
            // When validation reports an unsupported file and the user cancels the batch.
            triggerValidation(result, [validFile, invalidFile]);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            await resolveModal('CLOSE');

            // Then no file is delivered and the hook can accept a new batch.
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
            // Given a valid selection that exceeds the attachment limit.
            const {maxFileLimit, files} = createOverLimitFiles();
            mockValidateAttachmentFile.mockImplementation(async (file) => {
                if (file === null) {
                    throw new Error('Unexpected null in the nonnull fixture');
                }
                return {isValid: true, file};
            });

            const {result, onFilesValidated} = setup();
            // When the oversized selection is submitted and the user confirms the limit.
            triggerValidation(result, files);

            // Then validation waits for confirmation and delivers only the allowed slice.
            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('title')).toBe('attachmentPicker.someFilesCantBeUploaded');
            // The limit is enforced up front, so no file is validated until the user confirms.
            expect(mockValidateAttachmentFile).not.toHaveBeenCalled();

            await resolveModal('CONFIRM');

            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith(files.slice(0, maxFileLimit), []));
            expect(mockValidateAttachmentFile).toHaveBeenCalledTimes(maxFileLimit);
        });

        it('discards the entire selection when the max-file-limit modal is cancelled', async () => {
            // Given a valid selection that exceeds the attachment limit.
            const {files} = createOverLimitFiles();
            mockValidateAttachmentFile.mockImplementation(async (file) => {
                if (file === null) {
                    throw new Error('Unexpected null in the nonnull fixture');
                }
                return {isValid: true, file};
            });

            const {result, onFilesValidated} = setup();
            // When the user cancels the oversized selection at the limit modal.
            triggerValidation(result, files);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));

            await resolveModal('CLOSE');

            // Then no selected file is validated or delivered and a new batch can proceed.
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

        it('blocks the file and shows an error when HEIC conversion fails', async () => {
            const heicFile = createFile({uri: 'file-heic', name: 'photo.heic'});
            mockInvalid(CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE);
            mockConvertHeicImage.mockImplementation((file, callbacks) => callbacks?.onError?.(new Error('conversion failed'), file));

            const {result} = setup();
            triggerValidation(result, [heicFile]);

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('title')).toBe('attachmentPicker.attachmentError');
            expect(getShowConfirmModalOption('prompt')).toBe('attachmentPicker.errorWhileConvertingImage');
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

    describe('DNG conversion', () => {
        it('converts a DNG file and includes the converted JPEG', async () => {
            // Given a DNG that validation flags for conversion, as it does on native (e.g. a ProRAW shared into the app)
            const dngFile = createFile({uri: 'file-dng', name: 'IMG_0001.DNG'});
            const convertedFile = createFile({uri: 'file-dng-converted', name: 'IMG_0001.jpg', size: 2048});
            mockInvalid(CONST.FILE_VALIDATION_ERRORS.DNG_IMAGE);
            mockConvertHeicImage.mockImplementation((file, callbacks) => callbacks?.onSuccess?.(convertedFile));

            // When the file is validated
            const {result, onFilesValidated} = setup();
            triggerValidation(result, [dngFile]);

            // Then the JPEG is what gets passed on, never the DNG the backend would reject
            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([convertedFile], []));
            expect(mockConvertHeicImage).toHaveBeenCalledWith(dngFile, expect.anything());
        });

        it('blocks the file and shows an error when DNG conversion fails', async () => {
            // Given a DNG the OS can't decode
            const dngFile = createFile({uri: 'file-dng', name: 'IMG_0001.DNG'});
            mockInvalid(CONST.FILE_VALIDATION_ERRORS.DNG_IMAGE);
            mockConvertHeicImage.mockImplementation((file, callbacks) => callbacks?.onError?.(new Error('conversion failed'), file));

            // When the file is validated
            const {result, onFilesValidated} = setup();
            triggerValidation(result, [dngFile]);

            // Then the user sees the conversion error and the unconverted DNG is not uploaded
            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
            expect(getShowConfirmModalOption('prompt')).toBe('attachmentPicker.errorWhileConvertingImage');
            expect(onFilesValidated).not.toHaveBeenCalled();
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

/** Observes only the native root created by the real attachment validation function. */
function observeAttachmentValidationRejection(message: string) {
    const validationSourcePath = require.resolve('@hooks/useFilesValidation');
    const validationSource = readFileSync(validationSourcePath, 'utf8');
    const rootDeclaration = '    const validateAndResizeFiles = async ';
    const rootOffset = validationSource.indexOf(rootDeclaration);
    if (rootOffset < 0 || validationSource.indexOf(rootDeclaration, rootOffset + 1) !== -1) {
        throw new Error('Expected one real attachment validation root');
    }
    const rootLine = validationSource.slice(0, rootOffset).split('\n').length;
    const throwSourcePath = message === 'Cannot validate a null attachment' ? require.resolve('@libs/validateAttachmentFile') : validationSourcePath;
    const throwSource = throwSourcePath === validationSourcePath ? validationSource : readFileSync(throwSourcePath, 'utf8');
    const literalThrow = `throw new TypeError('${message}');`;
    const throwOffset = throwSource.indexOf(literalThrow);
    if (throwOffset < 0 || throwSource.indexOf(literalThrow, throwOffset + 1) !== -1) {
        throw new Error('Expected one selected attachment null guard throw');
    }
    const newTypeErrorOffset = throwOffset + 'throw '.length;
    const throwLine = throwSource.slice(0, newTypeErrorOffset).split('\n').length;
    const throwColumn = newTypeErrorOffset - throwSource.lastIndexOf('\n', newTypeErrorOffset);
    let rejectObserved: (reason: unknown) => void = () => {};
    let resolveObserved: (value: unknown) => void = () => {};
    const observed = new Promise<unknown>((resolve, reject) => {
        resolveObserved = resolve;
        rejectObserved = reject;
    });
    const assertion = observed.then(
        () => {
            throw new Error('Expected the real attachment validation root to reject');
        },
        (reason: unknown) => {
            expect(reason).toBeInstanceOf(TypeError);
            if (!(reason instanceof TypeError)) {
                throw new Error('Expected the attachment null guard TypeError');
            }
            expect(reason.name).toBe('TypeError');
            expect(reason.message).toBe(message);
            const firstThrowFrame = reason.stack?.split('\n').at(1);
            if (!firstThrowFrame) {
                throw new Error('Expected the first attachment throw frame');
            }
            expect(firstThrowFrame.trim().replace(/\)$/, '')).toMatch(new RegExp(`(?:^at |\\()${throwSourcePath.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')}:${throwLine}:${throwColumn}$`));
        },
    );
    // Handle only this owned assertion immediately. Tests still await its original rejection.
    const settledAssertion = Promise.allSettled([assertion]);
    let creationFrame: string | undefined;
    let rootPromise: Promise<unknown> | undefined;
    let captureCount = 0;
    const stop = promiseHooks.onInit((promise, parent) => {
        if (parent !== undefined) {
            return;
        }
        const frame = new Error().stack
            ?.split('\n')
            .slice(1)
            .find((line) => line.includes(`${validationSourcePath}:${rootLine}:`));
        if (!frame) {
            return;
        }
        creationFrame = frame;
        rootPromise = promise;
        captureCount += 1;
        stop();
        // Native nextTick attaches after initialization but before Node reports an unhandled rejection.
        nextTick(() => {
            promise.then(resolveObserved, rejectObserved);
        });
    });
    const cleanup = async () => {
        stop();
        if (!rootPromise) {
            rejectObserved(new Error('Expected capture of the actual validation root'));
        }
        await settledAssertion;
    };
    return {assertion, stop, cleanup, getCreationFrame: () => creationFrame, getCaptureCount: () => captureCount, getRootPromise: () => rootPromise};
}

const registeredFileUtils = jest.requireMock<typeof FileUtilsModule>('@libs/fileDownload/FileUtils');

const actualAttachmentValidator = jest.requireActual<{default: typeof validateAttachmentFile}>('@libs/validateAttachmentFile').default;

describe('real nullable attachment validation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetMockConfirmModal();
        mockValidateAttachmentFile.mockImplementation(actualAttachmentValidator);
    });

    it.each([0, 1, 2])('rejects static null at position %s after exactly its URI prefix', async (nullIndex) => {
        // Given the declared getAsFile producer returns null without throwing during extraction or name cleaning.
        const getter: FileObject = {getAsFile: () => null};
        const files: Array<FileObject | null> = [
            {uri: 'static-first', name: 'first.text', type: 'text/plain', size: 240},
            {uri: 'static-middle', name: 'middle.text', type: 'text/plain', size: 240},
            {uri: 'static-last', name: 'last.text', type: 'text/plain', size: 240},
        ];
        files[nullIndex] = cleanFileObjectName(cleanFileObject(getter));
        const {result, onFilesValidated} = setup();
        const writes = jest.spyOn(Map.prototype, 'set');
        const observation = observeAttachmentValidationRejection('Cannot record URI order for a null attachment');
        try {
            // When the public hook starts its original unfiltered batch and returns void.
            act(() => {
                expect(result.current.validateFiles(files)).toBeUndefined();
            });
            await act(async () => {
                await observation.assertion;
            });
            // Then no validator or callback runs and the failed hook remains busy after rerender.
            expect(observation.getCaptureCount()).toBe(1);
            expect(observation.getRootPromise()).toBeInstanceOf(Promise);
            expect(observation.getCreationFrame()).toBeDefined();
            const prefix = files.slice(0, nullIndex).map((file, index) => [file?.uri, index]);
            const scenarioWrites = writes.mock.calls.filter(([key]) => typeof key === 'string' && key.startsWith('static-'));
            expect(scenarioWrites).toEqual(prefix);
            if (nullIndex > 0) {
                const selected = writes.mock.calls.findIndex(([key]) => key === 'static-first');
                expect(selected).toBeGreaterThanOrEqual(0);
                const receiver: unknown = writes.mock.contexts.at(selected);
                if (!(receiver instanceof Map)) {
                    throw new Error('Expected the original static URI-order Map receiver');
                }
                expect(Array.from(receiver.entries())).toEqual(prefix);
            }
            expect(mockValidateAttachmentFile).not.toHaveBeenCalled();
            expect(onFilesValidated).not.toHaveBeenCalled();
            triggerValidation(result, [{uri: 'next', name: 'next.text', type: 'text/plain', size: 240}]);
            expect(mockValidateAttachmentFile).not.toHaveBeenCalled();
        } finally {
            observation.stop();
            await observation.cleanup();
            writes.mockRestore();
        }
    });

    it.each([false, true])('executes the actual inner null await after mutable input changes with receipt=%s', async (isValidatingReceipts) => {
        // Given the first real validator can pause below its normalization boundary.
        const first: FileObject = {uri: 'mutable-first', name: 'first.text', type: 'text/plain', size: 240};
        const second: FileObject = {uri: 'mutable-second', name: 'second.text', type: 'text/plain', size: 240};
        const files: Array<FileObject | null> = [first, second];
        const items = [createMock<DataTransferItem>({kind: 'file', type: 'text/plain'}), createMock<DataTransferItem>({kind: 'file', type: 'text/plain'})];
        let release: ((file: FileObject) => void) | undefined;
        const pending = new Promise<FileObject>((resolve) => {
            release = resolve;
        });
        const normalize = jest.spyOn(registeredFileUtils, 'normalizeFileObject').mockImplementationOnce(() => pending);
        const writes = jest.spyOn(Map.prototype, 'set');
        const {result, onFilesValidated} = setup();
        const observation = observeAttachmentValidationRejection('Cannot validate a null attachment');
        try {
            // When ordinary typed mutation changes the same array while the first file is awaited.
            triggerValidation(result, files, items, {isValidatingReceipts});
            await waitFor(() => expect(normalize).toHaveBeenCalledWith(first));
            files[1] = null;
            if (!release) {
                throw new Error('Expected the first normalization gate');
            }
            const releaseFirst = release;
            await act(async () => {
                releaseFirst(first);
                await observation.assertion;
            });
            // Then the real second validator receives null and rejects through the actual outer await.
            expect(mockValidateAttachmentFile.mock.calls).toEqual([
                [first, items.at(0), isValidatingReceipts],
                [null, items.at(1), isValidatingReceipts],
            ]);
            expect(observation.getCaptureCount()).toBe(1);
            expect(observation.getRootPromise()).toBeInstanceOf(Promise);
            const selected = writes.mock.calls.findIndex(([key]) => key === 'mutable-first');
            expect(selected).toBeGreaterThanOrEqual(0);
            const receiver: unknown = writes.mock.contexts.at(selected);
            if (!(receiver instanceof Map)) {
                throw new Error('Expected the original mutable URI-order Map receiver');
            }
            expect(Array.from(receiver.entries())).toEqual([
                ['mutable-first', 0],
                ['mutable-second', 1],
            ]);
            expect(onFilesValidated).not.toHaveBeenCalled();
        } finally {
            release?.(first);
            observation.stop();
            await observation.cleanup();
            writes.mockRestore();
            normalize.mockRestore();
        }
    });

    it('ignores a null batch while a real earlier validation is busy', async () => {
        // Given a real first validator is held below normalization and the hook has rerendered busy.
        const file: FileObject = {uri: 'busy-first', name: 'busy.text', type: 'text/plain', size: 240};
        let release: ((value: FileObject) => void) | undefined;
        const pending = new Promise<FileObject>((resolve) => {
            release = resolve;
        });
        const normalize = jest.spyOn(registeredFileUtils, 'normalizeFileObject').mockImplementationOnce(() => pending);
        const {result, onFilesValidated} = setup();
        try {
            triggerValidation(result, [file], undefined, {isValidatingReceipts: false});
            await waitFor(() => expect(normalize).toHaveBeenCalledTimes(1));
            // When null arrives through the public busy guard.
            triggerValidation(result, [null]);
            // Then the null creates no validator work or modal and the original call still finishes.
            expect(mockValidateAttachmentFile).toHaveBeenCalledTimes(1);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
            if (!release) {
                throw new Error('Expected the busy normalization gate');
            }
            const releaseBusy = release;
            await act(async () => {
                releaseBusy(file);
            });
            await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([file], []));
        } finally {
            await act(async () => {
                release?.(file);
                await pending;
            });
            normalize.mockRestore();
        }
    });

    it.each([
        {isValidatingReceipts: false, nullIndex: 0},
        {isValidatingReceipts: false, nullIndex: 15},
        {isValidatingReceipts: false, nullIndex: 29},
        {isValidatingReceipts: true, nullIndex: 0},
        {isValidatingReceipts: true, nullIndex: 15},
        {isValidatingReceipts: true, nullIndex: 29},
    ])('keeps the exact 30-item gate with receipt=$isValidatingReceipts and null=$nullIndex', async ({isValidatingReceipts, nullIndex}) => {
        // Given the existing limit is strict greater-than and null counts as an original item.
        const files: Array<FileObject | null> = Array.from({length: CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT}, (_, index) => ({
            uri: `exact-${index}`,
            name: 'limit.text',
            type: 'text/plain',
            size: 240,
        }));
        files[nullIndex] = null;
        const {result, onFilesValidated} = setup();
        const observation = observeAttachmentValidationRejection('Cannot record URI order for a null attachment');
        try {
            // When the real hook starts exactly the limit rather than presenting the max modal.
            triggerValidation(result, files, undefined, {isValidatingReceipts});
            await act(async () => {
                await observation.assertion;
            });
            // Then null rejects at URI recording without validation or limit UI.
            expect(observation.getCaptureCount()).toBe(1);
            expect(observation.getRootPromise()).toBeInstanceOf(Promise);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();
            expect(mockValidateAttachmentFile).not.toHaveBeenCalled();
            expect(onFilesValidated).not.toHaveBeenCalled();
        } finally {
            observation.stop();
            await observation.cleanup();
        }
    });

    it('defers an over-limit null batch until confirmation and cancels without failure', async () => {
        // Given 31 original entries include null and must await the existing limit modal.
        const files: Array<FileObject | null> = Array.from({length: 31}, (_, index) => ({uri: `cancel-${index}`, name: 'limit.text', type: 'text/plain', size: 240}));
        files[0] = null;
        const {result, onFilesValidated} = setup();
        // When the real modal stays pending and is then cancelled.
        triggerValidation(result, files);
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(getShowConfirmModalOption('title')).toBe('attachmentPicker.someFilesCantBeUploaded');
        expect(getShowConfirmModalOption('shouldShowCancelButton')).toBe(true);
        expect(mockValidateAttachmentFile).not.toHaveBeenCalled();
        await resolveModal('CLOSE');
        // Then reset permits a subsequent real valid batch and no cancelled callback occurs.
        expect(onFilesValidated).not.toHaveBeenCalled();
        const next: FileObject = {uri: 'after-cancel', name: 'next.text', type: 'text/plain', size: 240};
        triggerValidation(result, [next], undefined, {isValidatingReceipts: false});
        await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith([next], []));
    });

    it('rejects a retained null only after the over-limit modal confirms', async () => {
        // Given the retained slice includes null but no URI scan starts before confirmation.
        const files: Array<FileObject | null> = Array.from({length: 31}, (_, index) => ({uri: `confirm-${index}`, name: 'limit.text', type: 'text/plain', size: 240}));
        files[1] = null;
        const {result, onFilesValidated} = setup();
        triggerValidation(result, files);
        expect(mockValidateAttachmentFile).not.toHaveBeenCalled();
        const writes = jest.spyOn(Map.prototype, 'set');
        const observation = observeAttachmentValidationRejection('Cannot record URI order for a null attachment');
        try {
            // When the real modal continuation starts the same async root.
            await act(async () => {
                resolveShowConfirmModal({action: 'CONFIRM'});
                await observation.assertion;
            });
            // Then only the prefix URI is written and no callback or failure reset occurs.
            expect(observation.getCaptureCount()).toBe(1);
            expect(observation.getRootPromise()).toBeInstanceOf(Promise);
            expect(writes.mock.calls.filter(([key]) => typeof key === 'string' && key.startsWith('confirm-'))).toEqual([['confirm-0', 0]]);
            expect(onFilesValidated).not.toHaveBeenCalled();
            expect(mockValidateAttachmentFile).not.toHaveBeenCalled();
            const first = files.at(0);
            if (!first) {
                throw new Error('Expected the retained first confirmation file');
            }
            triggerValidation(result, [first]);
            expect(mockValidateAttachmentFile).not.toHaveBeenCalled();
        } finally {
            observation.stop();
            await observation.cleanup();
            writes.mockRestore();
        }
    });

    it.each([false, true])('discards only the original 31st null with receipt=%s', async (isValidatingReceipts) => {
        // Given slicing must precede processing and keep the first 30 item associations.
        const files: Array<FileObject | null> = Array.from({length: 30}, (_, index) => ({uri: `truncated-${index}`, name: 'limit.text', type: 'text/plain', size: 240}));
        files.push(null);
        const items = Array.from({length: 31}, () => createMock<DataTransferItem>({kind: 'file', type: 'text/plain'}));
        const {result, onFilesValidated} = setup();
        // When the real confirmation resumes the stored files and items slice.
        triggerValidation(result, files, items, {isValidatingReceipts});
        await resolveModal();
        // Then all retained nonnull files validate in order and the discarded null never reaches the validator.
        await waitFor(() => expect(onFilesValidated).toHaveBeenCalledWith(files.slice(0, 30), items.slice(0, 30)));
        expect(mockValidateAttachmentFile.mock.calls).toEqual(files.slice(0, 30).map((file, index) => [file, items.at(index), isValidatingReceipts]));
        const next: FileObject = {uri: 'after-truncation', name: 'next.text', type: 'text/plain', size: 240};
        triggerValidation(result, [next], undefined, {isValidatingReceipts});
        await waitFor(() => expect(onFilesValidated).toHaveBeenCalledTimes(2));
    });

    it('executes the real Concierge picker, cleaning, shared hook and validator null boundary', async () => {
        // Given the public getter returns null while all preview/navigation dependencies are observed below the picker.
        const context = createMock<React.ContextType<typeof AttachmentModalContext>>({setCurrentAttachment: jest.fn()});
        const getter: FileObject = {getAsFile: () => null};
        const wrapper = ({children}: {children: React.ReactNode}) => React.createElement(AttachmentModalContext.Provider, {value: context}, children);
        const {result} = renderHook(() => useConciergeAttachmentPicker('100', jest.fn()), {wrapper});
        const observation = observeAttachmentValidationRejection('Cannot record URI order for a null attachment');
        try {
            // When the actual picker retains the scalar null and returns normally.
            act(() => {
                expect(result.current.pickAttachments(getter)).toBeUndefined();
            });
            await act(async () => {
                await observation.assertion;
            });
            // Then failure never reaches preview, navigation or a validated callback.
            expect(observation.getCaptureCount()).toBe(1);
            expect(observation.getRootPromise()).toBeInstanceOf(Promise);
            expect(context.setCurrentAttachment).not.toHaveBeenCalled();
            expect(Navigation.navigate).not.toHaveBeenCalled();
            expect(mockValidateAttachmentFile).not.toHaveBeenCalled();
        } finally {
            observation.stop();
            await observation.cleanup();
        }
    });
    it('keeps a single extracted null on the ignored outer async failure boundary', async () => {
        // Given a scalar getter has the same declared nullable result as the array cases.
        const file = cleanFileObjectName(cleanFileObject({getAsFile: () => null}));
        const {result, onFilesValidated} = setup();
        const observation = observeAttachmentValidationRejection('Cannot record URI order for a null attachment');
        try {
            // When the public hook starts exactly one null without throwing synchronously.
            act(() => {
                expect(result.current.validateFiles([file])).toBeUndefined();
            });
            await act(async () => {
                await observation.assertion;
            });
            // Then the actual root rejects before the validator or callback, without manufacturing a successful null result.
            expect(observation.getCaptureCount()).toBe(1);
            expect(observation.getRootPromise()).toBeInstanceOf(Promise);
            expect(mockValidateAttachmentFile).not.toHaveBeenCalled();
            expect(onFilesValidated).not.toHaveBeenCalled();
        } finally {
            observation.stop();
            await observation.cleanup();
        }
    });

    it('preserves ordered nonnull metadata, items and reset through the real validator', async () => {
        // Given source-supported text metadata avoids browser decoding while retaining two distinct URI identities.
        const first: FileObject = {uri: 'normal-first', name: 'first.text', type: 'text/plain', size: 240};
        const second: FileObject = {uri: 'normal-second', name: 'second.text', type: 'text/plain', size: 240};
        const items = [createMock<DataTransferItem>({kind: 'file', type: 'text/plain'}), createMock<DataTransferItem>({kind: 'file', type: 'text/plain'})];
        const {result, onFilesValidated} = setup();
        // When the actual validator succeeds for the original ordered array.
        triggerValidation(result, [first, second], items);
        await waitFor(() => expect(onFilesValidated).toHaveBeenCalledTimes(1));
        // Then output identity and item alignment remain nonnull and reset permits a subsequent batch.
        expect(onFilesValidated.mock.calls).toEqual([[[first, second], []]]);
        const selected = onFilesValidated.mock.calls.at(0);
        if (!selected) {
            throw new Error('Expected the ordered nonnull callback');
        }
        expect(selected[0].at(0)).toBe(first);
        expect(selected[0].at(1)).toBe(second);
        expect(mockValidateAttachmentFile.mock.calls).toEqual([
            [first, items.at(0), true],
            [second, items.at(1), true],
        ]);
        triggerValidation(result, [second], undefined, {isValidatingReceipts: false});
        await waitFor(() => expect(onFilesValidated).toHaveBeenCalledTimes(2));
        expect(onFilesValidated.mock.calls.at(1)).toEqual([[second], []]);
    });

    it('keeps the original empty-input busy state through the real hook', async () => {
        // Given empty input reaches the existing async early return after the public busy-state write.
        const {result, onFilesValidated} = setup();
        // When an empty batch is followed by a valid batch after React has rendered the busy state.
        triggerValidation(result, []);
        await waitForBatchedUpdatesWithAct();
        triggerValidation(result, [{uri: 'after-empty', name: 'next.text', type: 'text/plain', size: 240}]);
        // Then the existing empty behavior has no callback or reset, so the second call stays busy.
        expect(mockValidateAttachmentFile).not.toHaveBeenCalled();
        expect(onFilesValidated).not.toHaveBeenCalled();
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
    });

    it('does not accept an unrelated normalization error as the expected null guard rejection', async () => {
        // Given the actual validator can reject for an unrelated below-subject normalization failure.
        const file: FileObject = {uri: 'unexpected', name: 'unexpected.text', type: 'text/plain', size: 240};
        const unrelated = new Error('Unrelated normalization failure');
        const normalize = jest.spyOn(registeredFileUtils, 'normalizeFileObject').mockRejectedValueOnce(unrelated);
        const {result, onFilesValidated} = setup();
        const observation = observeAttachmentValidationRejection('Cannot validate a null attachment');
        const matcherFailure = expect(observation.assertion).rejects.toThrow();
        try {
            // When real validation delivers that Error through the same observed native root.
            triggerValidation(result, [file]);
            await act(async () => {
                await matcherFailure;
            });
            // Then the exact TypeError/message assertion fails instead of counting an arbitrary rejection as success.
            expect(observation.getCaptureCount()).toBe(1);
            expect(observation.getRootPromise()).toBeInstanceOf(Promise);
            expect(normalize).toHaveBeenCalledWith(file);
            const normalization = normalize.mock.results.at(0);
            if (!normalization || normalization.type !== 'return') {
                throw new Error('Expected the actual normalization Promise');
            }
            await expect(normalization.value).rejects.toBe(unrelated);
            expect(onFilesValidated).not.toHaveBeenCalled();
        } finally {
            observation.stop();
            await observation.cleanup();
            normalize.mockRestore();
        }
    });
});

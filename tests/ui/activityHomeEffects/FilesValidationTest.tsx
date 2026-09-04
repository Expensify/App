/**
 * Cover/reveal contract of `useFilesValidation`, the hook behind the Home receipt drop zone.
 *
 * The hook gates every async continuation of a validation run on an `isMountedRef` latch, and it completes a run whose
 * loader is still inside its minimum visible window from a timeout. A cover runs the cleanup that flips the latch and
 * cancels that timeout while the hook stays alive, so this suite proves that a revealed hook still finishes a run, and
 * that a real unmount still drops both.
 */
import {act, screen, waitFor} from '@testing-library/react-native';

import useFilesValidation from '@hooks/useFilesValidation';

import type * as FileUtilsModule from '@libs/fileDownload/FileUtils';
import convertHeicImage from '@libs/fileDownload/heicConverter';
import validateAttachmentFile from '@libs/validateAttachmentFile';

import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import type * as MockUseConfirmModalUtil from '../../utils/mockUseConfirmModal';

import {mockShowConfirmModal, resetMockConfirmModal} from '../../utils/mockUseConfirmModal';
import renderScreenWithCover from '../../utils/ScreenCoverHarness';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockSetIsLoaderVisible = jest.fn();

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
    useFullScreenLoaderActions: () => ({setIsLoaderVisible: mockSetIsLoaderVisible}),
}));

// The hook logs a warning on a failed conversion, and the real logger flushes to the server on a timer the suite outlasts.
jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {
        alert: jest.fn(),
        client: jest.fn(),
        hmmm: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
    },
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

const mockedValidateAttachmentFile = jest.mocked(validateAttachmentFile);
const mockedConvertHeicImage = jest.mocked(convertHeicImage);

// Kept in step with MIN_LOADER_VISIBLE_DURATION_MS in the hook, which is private to it.
const MIN_LOADER_VISIBLE_DURATION_MS = 200;
const LONGER_THAN_THE_LOADER_WINDOW_MS = MIN_LOADER_VISIBLE_DURATION_MS * 3;

const DROP_ZONE_TEST_ID = 'receipt-drop-zone';

const IMAGE_FILE: FileObject = {name: 'receipt.jpg', size: 1024, type: 'image/jpeg', uri: 'file-image'};
const HEIC_FILE: FileObject = {name: 'receipt.heic', size: 1024, type: 'image/heic', uri: 'file-heic'};

type ValidateAttachmentResult = Awaited<ReturnType<typeof validateAttachmentFile>>;
type ValidateFiles = ReturnType<typeof useFilesValidation>['validateFiles'];
type FileDropProbeProps = {
    onFilesValidated: (files: FileObject[], dataTransferItems: DataTransferItem[]) => void;
};

/** The `validateFiles` of the last commit whose effects ran, which is how the drop zone reaches the hook. */
let validateFilesFromTheLastCommit: ValidateFiles | undefined;

/** Stands in for the Home receipt drop zone: it owns the hook and renders whatever the hook asks it to render. */
function FileDropProbe({onFilesValidated}: FileDropProbeProps) {
    const {validateFiles, PDFValidationComponent} = useFilesValidation(onFilesValidated);

    useEffect(() => {
        validateFilesFromTheLastCommit = validateFiles;
    });

    return <View testID={DROP_ZONE_TEST_ID}>{PDFValidationComponent}</View>;
}

async function dropFiles(files: FileObject[]) {
    act(() => {
        validateFilesFromTheLastCommit?.(files);
    });
    await waitForBatchedUpdatesWithAct();
}

/** Waits on the real clock, which is what the suite runs on, so the loader timeout can expire on its own. */
async function waitOutTheLoaderWindow() {
    await act(async () => {
        await new Promise((resolve) => {
            setTimeout(resolve, LONGER_THAN_THE_LOADER_WINDOW_MS);
        });
    });
}

/** Fails every file with a HEIC conversion error, the shortest path to a run that waits out the loader window. */
function failEveryConversion() {
    mockedValidateAttachmentFile.mockResolvedValue({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE});
    mockedConvertHeicImage.mockImplementation((file, callbacks) => callbacks?.onError?.(new Error('conversion failed'), file));
}

describe('useFilesValidation under a screen cover', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        resetMockConfirmModal();
        validateFilesFromTheLastCommit = undefined;
        mockedValidateAttachmentFile.mockResolvedValue({isValid: true, file: IMAGE_FILE});
    });

    it('validates a file dropped after the screen was covered and revealed', async () => {
        const onFilesValidated = jest.fn();
        const home = renderScreenWithCover(<FileDropProbe onFilesValidated={onFilesValidated} />);

        await home.hide();
        await home.reveal();
        await dropFiles([IMAGE_FILE]);

        expect(screen.getByTestId(DROP_ZONE_TEST_ID)).toBeOnTheScreen();
        expect(onFilesValidated).toHaveBeenCalledWith([IMAGE_FILE], []);
    });

    it('finishes a run whose validation resolves after the reveal', async () => {
        let resolvePendingValidation: ((value: ValidateAttachmentResult) => void) | undefined;
        mockedValidateAttachmentFile.mockImplementation(
            () =>
                new Promise<ValidateAttachmentResult>((resolve) => {
                    resolvePendingValidation = resolve;
                }),
        );
        const onFilesValidated = jest.fn();
        const home = renderScreenWithCover(<FileDropProbe onFilesValidated={onFilesValidated} />);

        await dropFiles([IMAGE_FILE]);
        await home.hide();
        await home.reveal();
        await act(async () => {
            resolvePendingValidation?.({isValid: true, file: IMAGE_FILE});
        });

        expect(onFilesValidated).toHaveBeenCalledWith([IMAGE_FILE], []);
    });

    it('drops a run whose validation resolves after a real unmount', async () => {
        let resolvePendingValidation: ((value: ValidateAttachmentResult) => void) | undefined;
        mockedValidateAttachmentFile.mockImplementation(
            () =>
                new Promise<ValidateAttachmentResult>((resolve) => {
                    resolvePendingValidation = resolve;
                }),
        );
        const onFilesValidated = jest.fn();
        const home = renderScreenWithCover(<FileDropProbe onFilesValidated={onFilesValidated} />);

        await dropFiles([IMAGE_FILE]);
        home.unmount();
        await act(async () => {
            resolvePendingValidation?.({isValid: true, file: IMAGE_FILE});
        });

        expect(onFilesValidated).not.toHaveBeenCalled();
    });

    it('reports the validated files exactly once across a cover', async () => {
        const onFilesValidated = jest.fn();
        const home = renderScreenWithCover(<FileDropProbe onFilesValidated={onFilesValidated} />);

        await dropFiles([IMAGE_FILE]);
        await home.hide();
        await home.reveal();

        expect(onFilesValidated).toHaveBeenCalledTimes(1);
    });

    describe('with the loader waiting out its minimum visible window', () => {
        beforeEach(failEveryConversion);

        it('hides the loader and reports the error after a cover cancelled the pending hide', async () => {
            const home = renderScreenWithCover(<FileDropProbe onFilesValidated={jest.fn()} />);

            await dropFiles([HEIC_FILE]);

            // The run is parked on its minimum visible window, so the loader is still up and nothing has been reported.
            expect(mockSetIsLoaderVisible).toHaveBeenCalledWith(true);
            expect(mockShowConfirmModal).not.toHaveBeenCalled();

            await home.hide();
            await home.reveal();
            await waitOutTheLoaderWindow();

            expect(mockSetIsLoaderVisible).toHaveBeenLastCalledWith(false);
            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('completes the run once even when the cover outlasted the window', async () => {
            const home = renderScreenWithCover(<FileDropProbe onFilesValidated={jest.fn()} />);

            await dropFiles([HEIC_FILE]);
            await home.hide();
            await waitOutTheLoaderWindow();
            await home.reveal();

            await waitFor(() => expect(mockShowConfirmModal).toHaveBeenCalledTimes(1));
        });

        it('completes the run once across repeated covers', async () => {
            const home = renderScreenWithCover(<FileDropProbe onFilesValidated={jest.fn()} />);

            await dropFiles([HEIC_FILE]);
            await home.hide();
            await home.reveal();
            await home.hide();
            await home.reveal();
            await waitOutTheLoaderWindow();

            expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        });

        it('leaves the pending hide cancelled after a real unmount', async () => {
            const home = renderScreenWithCover(<FileDropProbe onFilesValidated={jest.fn()} />);

            await dropFiles([HEIC_FILE]);
            home.unmount();
            await waitOutTheLoaderWindow();

            expect(mockShowConfirmModal).not.toHaveBeenCalled();
            expect(mockSetIsLoaderVisible).not.toHaveBeenCalledWith(false);
        });
    });
});

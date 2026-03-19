import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';
import React from 'react';
import {InteractionManager, View} from 'react-native';
import type {ConfirmModalProps} from '@components/ConfirmModal';
import useFilesValidation from '@hooks/useFilesValidation';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import validateAttachmentFile from '@libs/validateAttachmentFile';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

type ValidateFiles = (files: FileObject[], items?: DataTransferItem[], validationOptions?: {isValidatingReceipts?: boolean}) => void;

let mockPDFValidationMode: 'success' | 'password' | 'error' = 'success';
const mockCaptureConfirmModalProps = jest.fn();

const mockValidateAttachmentFile = validateAttachmentFile as jest.MockedFunction<typeof validateAttachmentFile>;
const mockGetFileValidationErrorText = FileUtils.getFileValidationErrorText as jest.MockedFunction<typeof FileUtils.getFileValidationErrorText>;
const mockResizeImageIfNeeded = FileUtils.resizeImageIfNeeded as jest.MockedFunction<typeof FileUtils.resizeImageIfNeeded>;

jest.mock('@hooks/useThemeStyles', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () =>
        new Proxy(
            {},
            {
                get: () => ({}),
            },
        ),
}));

jest.mock('@hooks/useLocalize', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        translate: (key: string) => key,
    }),
}));

jest.mock('@components/FullScreenLoaderContext', () => ({
    useFullScreenLoaderActions: () => ({
        setIsLoaderVisible: jest.fn(),
    }),
}));

jest.mock('@libs/validateAttachmentFile', () => jest.fn());

jest.mock('@libs/fileDownload/FileUtils', () => {
    const actual = jest.requireActual<typeof FileUtils>('@libs/fileDownload/FileUtils');

    return {
        ...actual,
        getFileValidationErrorText: jest.fn((_translate: unknown, fileError: {error?: string} | undefined | null) => ({
            title: fileError?.error ?? 'error.title',
            reason: fileError?.error ?? 'error.reason',
        })),
        hasHeicOrHeifExtension: jest.fn((file: FileObject) => !!(file.name?.toLowerCase().endsWith('.heic') ?? file.name?.toLowerCase().endsWith('.heif'))),
        splitExtensionFromFileName: jest.fn((fileName: string) => {
            const splitFileName = fileName.split('.');
            return {fileExtension: splitFileName.at(-1) ?? ''};
        }),
        resizeImageIfNeeded: jest.fn(async (file: FileObject) => file),
    };
});

jest.mock('@components/Text', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const {Text: RNText} = require('react-native');
    function MockText({children}: {children: React.ReactNode}) {
        return <RNText>{children}</RNText>;
    }
    MockText.displayName = 'Text';
    return MockText;
});

jest.mock('@components/TextLink', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const {Text: RNText} = require('react-native');
    function MockTextLink({children, href}: {children: React.ReactNode; href: string}) {
        return (
            <RNText
                testID="text-link"
                accessibilityLabel={href}
            >
                {children}
            </RNText>
        );
    }
    MockTextLink.displayName = 'TextLink';
    return MockTextLink;
});

jest.mock('@components/ConfirmModal', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mockReact = require('react') as {useEffect: (effect: () => void, deps: unknown[]) => void};
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const {Text: RNText, View: RNView} = require('react-native');
    function MockConfirmModal(props: ConfirmModalProps) {
        mockReact.useEffect(() => {
            mockCaptureConfirmModalProps(props);
        }, [props]);

        if (!props.isVisible) {
            return null;
        }

        return (
            <RNView testID="error-modal">
                <RNText testID="modal-title">{props.title}</RNText>
                <RNView testID="modal-prompt">{props.prompt}</RNView>
                <RNText
                    testID="modal-confirm"
                    onPress={props.onConfirm}
                >
                    confirm
                </RNText>
                <RNText
                    testID="modal-cancel"
                    onPress={props.onCancel}
                >
                    cancel
                </RNText>
            </RNView>
        );
    }

    MockConfirmModal.displayName = 'ConfirmModal';
    return MockConfirmModal;
});

jest.mock('@components/PDFThumbnail', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mockReact = require('react') as {useEffect: (effect: () => void, deps: unknown[]) => void};
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const {View: RNView} = require('react-native');
    function MockPDFThumbnail({onLoadSuccess, onPassword, onLoadError}: {onLoadSuccess: () => void; onPassword: () => void; onLoadError: () => void}) {
        mockReact.useEffect(() => {
            if (mockPDFValidationMode === 'success') {
                onLoadSuccess();
                return;
            }

            if (mockPDFValidationMode === 'password') {
                onPassword();
                return;
            }

            onLoadError();
        }, [onLoadError, onLoadSuccess, onPassword]);

        return <RNView testID="pdf-thumbnail" />;
    }

    MockPDFThumbnail.displayName = 'PDFThumbnail';
    return MockPDFThumbnail;
});

function HookHarness({onFilesValidated, onReady}: {onFilesValidated: (files: FileObject[], items: DataTransferItem[]) => void; onReady: (validateFiles: ValidateFiles) => void}) {
    const {validateFiles, ErrorModal, PDFValidationComponent} = useFilesValidation(onFilesValidated);

    React.useEffect(() => {
        onReady(validateFiles);
    }, [onReady, validateFiles]);

    return (
        <View>
            {ErrorModal}
            {PDFValidationComponent}
        </View>
    );
}

HookHarness.displayName = 'HookHarness';

function createFile(overrides?: Partial<FileObject>): FileObject {
    return {
        name: 'receipt.jpg',
        uri: 'file://receipt.jpg',
        size: 1000,
        ...overrides,
    };
}

describe('useFilesValidation UI behavior', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPDFValidationMode = 'success';
        mockCaptureConfirmModalProps.mockReset();

        jest.spyOn(InteractionManager, 'runAfterInteractions').mockImplementation((task?: unknown) => {
            if (typeof task === 'function') {
                (task as () => void)();
            }

            return {
                then: jest.fn().mockResolvedValue(undefined),
                done: jest.fn(),
                cancel: jest.fn(),
            } as unknown as ReturnType<typeof InteractionManager.runAfterInteractions>;
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders visible error modal and advances through queued errors on confirm', async () => {
        let validateFilesRef: ValidateFiles | undefined;

        mockValidateAttachmentFile
            .mockResolvedValueOnce({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE})
            .mockResolvedValueOnce({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL});

        render(
            <HookHarness
                onFilesValidated={jest.fn()}
                onReady={(validateFiles) => {
                    validateFilesRef = validateFiles;
                }}
            />,
        );

        await act(async () => {
            validateFilesRef?.([createFile({name: 'bad.exe'}), createFile({name: 'tiny.jpg'})], undefined, {isValidatingReceipts: true});
        });

        await waitFor(() => {
            expect(screen.getByTestId('error-modal')).toBeTruthy();
            expect(screen.getByTestId('modal-title').props.children).toBe(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);
        });

        fireEvent.press(screen.getByTestId('modal-confirm'));

        expect(screen.getByTestId('modal-title').props.children).toBe(CONST.FILE_VALIDATION_ERRORS.FILE_TOO_SMALL);
    });

    it('renders wrong-file-type prompt with learn-more link', async () => {
        let validateFilesRef: ValidateFiles | undefined;
        mockValidateAttachmentFile.mockResolvedValueOnce({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE});

        render(
            <HookHarness
                onFilesValidated={jest.fn()}
                onReady={(validateFiles) => {
                    validateFilesRef = validateFiles;
                }}
            />,
        );

        await act(async () => {
            validateFilesRef?.([createFile({name: 'bad.xyz'})], undefined, {isValidatingReceipts: true});
        });

        await waitFor(() => {
            expect(screen.getByTestId('text-link')).toBeTruthy();
        });
        expect(screen.getByTestId('text-link').props.accessibilityLabel).toBe(CONST.BULK_UPLOAD_HELP_URL);
    });

    it('renders PDFValidationComponent and opens protected-file error for password-protected PDFs in receipt mode', async () => {
        let validateFilesRef: ValidateFiles | undefined;
        const pdfFile = createFile({name: 'receipt.pdf', uri: 'file://receipt.pdf'});

        mockPDFValidationMode = 'password';
        mockValidateAttachmentFile.mockResolvedValueOnce({isValid: true, file: pdfFile});
        mockGetFileValidationErrorText.mockImplementation((_translate: unknown, fileError: {error?: string} | undefined | null) => ({
            title: fileError?.error ?? 'unknown',
            reason: fileError?.error ?? 'unknown',
        }));

        render(
            <HookHarness
                onFilesValidated={jest.fn()}
                onReady={(validateFiles) => {
                    validateFilesRef = validateFiles;
                }}
            />,
        );

        await act(async () => {
            validateFilesRef?.([pdfFile], undefined, {isValidatingReceipts: true});
        });

        await waitFor(() => {
            expect(screen.getByTestId('pdf-thumbnail')).toBeTruthy();
            expect(screen.getByTestId('modal-title').props.children).toBe(CONST.FILE_VALIDATION_ERRORS.PROTECTED_FILE);
        });

        const lastCall = mockCaptureConfirmModalProps.mock.calls.at(-1) as [ConfirmModalProps] | undefined;
        expect(lastCall?.[0].isVisible).toBe(true);
    });

    it('shows max file limit error and validates truncated list after confirm', async () => {
        let validateFilesRef: ValidateFiles | undefined;
        const onFilesValidated = jest.fn();

        const maxAllowed = CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT;
        const files = Array.from({length: maxAllowed + 1}, (_, index) => createFile({name: `file-${index}.jpg`, uri: `file://${index}.jpg`}));

        mockValidateAttachmentFile.mockImplementation(async (file: FileObject) => ({isValid: true, file}));

        render(
            <HookHarness
                onFilesValidated={onFilesValidated}
                onReady={(validateFiles) => {
                    validateFilesRef = validateFiles;
                }}
            />,
        );

        await act(async () => {
            validateFilesRef?.(files);
        });

        expect(mockValidateAttachmentFile).not.toHaveBeenCalled();
        expect(screen.getByTestId('modal-title').props.children).toBe(CONST.FILE_VALIDATION_ERRORS.MAX_FILE_LIMIT_EXCEEDED);

        fireEvent.press(screen.getByTestId('modal-confirm'));

        await waitFor(() => {
            expect(mockValidateAttachmentFile).toHaveBeenCalledTimes(maxAllowed);
            expect(onFilesValidated).toHaveBeenCalledWith(files.slice(0, maxAllowed), []);
        });
    });

    it('maps resize failures to IMAGE_DIMENSIONS_TOO_LARGE and FILE_CORRUPTED errors', async () => {
        let validateFilesRef: ValidateFiles | undefined;
        const onFilesValidated = jest.fn();

        const firstImage = createFile({name: 'first.jpg', uri: 'file://first.jpg', size: 3000});
        const secondImage = createFile({name: 'second.jpg', uri: 'file://second.jpg', size: 3000});

        mockValidateAttachmentFile.mockImplementation(async () => ({
            isValid: false,
            error: CONST.FILE_VALIDATION_ERRORS.FILE_TOO_LARGE,
        }));
        mockResizeImageIfNeeded.mockRejectedValueOnce(new Error(CONST.FILE_VALIDATION_ERRORS.IMAGE_DIMENSIONS_TOO_LARGE)).mockRejectedValueOnce(new Error('unknown'));

        render(
            <HookHarness
                onFilesValidated={onFilesValidated}
                onReady={(validateFiles) => {
                    validateFilesRef = validateFiles;
                }}
            />,
        );

        await act(async () => {
            validateFilesRef?.([firstImage, secondImage], undefined, {isValidatingReceipts: true});
        });

        await waitFor(() => {
            expect(screen.getByTestId('modal-title').props.children).toBe(CONST.FILE_VALIDATION_ERRORS.IMAGE_DIMENSIONS_TOO_LARGE);
        });

        fireEvent.press(screen.getByTestId('modal-confirm'));

        await waitFor(() => {
            expect(screen.getByTestId('modal-title').props.children).toBe(CONST.FILE_VALIDATION_ERRORS.FILE_CORRUPTED);
            expect(onFilesValidated).not.toHaveBeenCalled();
        });
    });

    it('dismisses the error modal on cancel without uploading files', async () => {
        let validateFilesRef: ValidateFiles | undefined;
        const onFilesValidated = jest.fn();

        const validFile = createFile({name: 'valid.jpg', uri: 'file://valid.jpg'});
        const invalidFile = createFile({name: 'invalid.xyz', uri: 'file://invalid.xyz'});

        mockValidateAttachmentFile.mockResolvedValueOnce({isValid: true, file: validFile}).mockResolvedValueOnce({isValid: false, error: CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE});

        render(
            <HookHarness
                onFilesValidated={onFilesValidated}
                onReady={(validateFiles) => {
                    validateFilesRef = validateFiles;
                }}
            />,
        );

        await act(async () => {
            validateFilesRef?.([validFile, invalidFile], undefined, {isValidatingReceipts: false});
        });

        await waitFor(() => {
            expect(screen.getByTestId('modal-title').props.children).toBe(CONST.FILE_VALIDATION_ERRORS.WRONG_FILE_TYPE);
        });

        fireEvent.press(screen.getByTestId('modal-cancel'));

        await waitFor(() => {
            expect(screen.queryByTestId('modal-title')).toBeNull();
        });

        expect(onFilesValidated).not.toHaveBeenCalled();
    });
});

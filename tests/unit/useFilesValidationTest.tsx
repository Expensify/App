import {act, render, waitFor} from '@testing-library/react-native';
import React from 'react';
import {InteractionManager, View} from 'react-native';
import type {ConfirmModalProps} from '@components/ConfirmModal';
import * as FullScreenLoaderContext from '@components/FullScreenLoaderContext';
import useFilesValidation from '@hooks/useFilesValidation';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import convertHeicImage from '@libs/fileDownload/heicConverter';
import Log from '@libs/Log';
import validateAttachmentFile from '@libs/validateAttachmentFile';
import type {ValidateAttachmentResult} from '@libs/validateAttachmentFile';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

type ValidateFiles = (files: FileObject[], items?: DataTransferItem[], validationOptions?: {isValidatingReceipts?: boolean}) => void;

const mockCaptureConfirmModalProps = jest.fn();
let mockPDFValidationMode: 'success' | 'password' | 'error' = 'success';

const mockSetIsLoaderVisible = jest.fn();
const mockWarn = jest.fn();
const mockValidateAttachmentFile = validateAttachmentFile as jest.MockedFunction<typeof validateAttachmentFile>;
const mockConvertHeicImage = convertHeicImage as jest.MockedFunction<typeof convertHeicImage>;
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
    useFullScreenLoaderActions: jest.fn(),
}));

jest.mock('@libs/validateAttachmentFile', () => jest.fn());
jest.mock('@libs/fileDownload/heicConverter', () => jest.fn());

jest.mock('@libs/fileDownload/FileUtils', () => {
    const actual = jest.requireActual<typeof FileUtils>('@libs/fileDownload/FileUtils');

    return {
        ...actual,
        getFileValidationErrorText: jest.fn((_translate: unknown, fileError: {error?: string} | undefined | null) => ({
            title: fileError?.error ?? 'error.title',
            reason: fileError?.error ? `reason:${fileError.error}` : 'reason:unknown',
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
            <RNView>
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
        name: 'test.jpg',
        uri: `file://${Math.random().toString(16).slice(2)}.jpg`,
        size: 1024,
        ...overrides,
    };
}

function getHarness(onFilesValidated: (files: FileObject[], items: DataTransferItem[]) => void) {
    let validateFilesRef: ValidateFiles | undefined;
    render(
        <HookHarness
            onFilesValidated={onFilesValidated}
            onReady={(validateFiles) => {
                validateFilesRef = validateFiles;
            }}
        />,
    );

    return {
        validateFiles(files: FileObject[], items?: DataTransferItem[], validationOptions?: {isValidatingReceipts?: boolean}) {
            validateFilesRef?.(files, items, validationOptions);
        },
    };
}

describe('useFilesValidation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockPDFValidationMode = 'success';
        jest.spyOn(Log, 'warn').mockImplementation((...args: Parameters<typeof Log.warn>) => {
            mockWarn(...args);
        });

        jest.mocked(FullScreenLoaderContext.useFullScreenLoaderActions).mockReturnValue({
            setIsLoaderVisible: mockSetIsLoaderVisible,
        });

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

    it('calls onFilesValidated for valid non-pdf files and keeps original order', async () => {
        const onFilesValidated = jest.fn();
        const harnessRef = getHarness(onFilesValidated);
        const firstFile = createFile({name: 'z.png', uri: 'file://z.png'});
        const secondFile = createFile({name: 'a.png', uri: 'file://a.png'});

        mockValidateAttachmentFile.mockResolvedValueOnce({isValid: true, file: firstFile}).mockResolvedValueOnce({isValid: true, file: secondFile});

        await act(async () => {
            harnessRef.validateFiles([firstFile, secondFile], [] as DataTransferItem[]);
        });

        await waitFor(() => {
            expect(onFilesValidated).toHaveBeenCalledWith([firstFile, secondFile], []);
        });
    });

    it('converts heic and resizes when validating receipts', async () => {
        const onFilesValidated = jest.fn();
        const harnessRef = getHarness(onFilesValidated);

        const heicFile = createFile({name: 'receipt.heic', uri: 'file://receipt.heic', size: 4000});
        const convertedFile = createFile({name: 'receipt.jpg', uri: 'file://converted.jpg', size: CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE + 10});
        const resizedFile = createFile({name: 'receipt-resized.jpg', uri: 'file://resized.jpg', size: CONST.API_ATTACHMENT_VALIDATIONS.RECEIPT_MAX_SIZE - 1});

        const heicInvalidResult: ValidateAttachmentResult = {
            isValid: false,
            error: CONST.FILE_VALIDATION_ERRORS.HEIC_OR_HEIF_IMAGE,
        };

        mockValidateAttachmentFile.mockResolvedValueOnce(heicInvalidResult);
        mockConvertHeicImage.mockImplementation((_file, callbacks) => {
            callbacks?.onSuccess?.(convertedFile);
        });
        mockResizeImageIfNeeded.mockResolvedValueOnce(resizedFile);

        await act(async () => {
            harnessRef.validateFiles([heicFile], undefined, {isValidatingReceipts: true});
        });

        await waitFor(() => {
            expect(onFilesValidated).toHaveBeenCalledWith([resizedFile], []);
        });

        expect(mockSetIsLoaderVisible).toHaveBeenNthCalledWith(1, true);
        expect(mockSetIsLoaderVisible).toHaveBeenLastCalledWith(false);
    });

    it('handles pdf thumbnail callbacks for password-protected PDFs in receipts mode', async () => {
        const onFilesValidated = jest.fn();
        const harnessRef = getHarness(onFilesValidated);

        const pdfFile = createFile({name: 'receipt.pdf', uri: 'file://receipt.pdf'});
        mockValidateAttachmentFile.mockResolvedValueOnce({isValid: true, file: pdfFile});
        mockPDFValidationMode = 'password';

        await act(async () => {
            harnessRef.validateFiles([pdfFile], undefined, {isValidatingReceipts: true});
        });

        await waitFor(() => expect(mockValidateAttachmentFile).toHaveBeenCalledTimes(1));
        expect(onFilesValidated).not.toHaveBeenCalled();
    });

    it('warns and skips duplicate validation calls when already validating', async () => {
        const onFilesValidated = jest.fn();
        const harnessRef = getHarness(onFilesValidated);
        const firstFile = createFile({name: 'first.jpg'});
        const secondFile = createFile({name: 'second.jpg'});

        let resolveFirstValidation: (() => void) | undefined;
        const pendingValidation = new Promise<void>((resolve) => {
            resolveFirstValidation = resolve;
        });
        mockValidateAttachmentFile.mockImplementation(async () => {
            await pendingValidation;
            return {isValid: true, file: firstFile};
        });

        act(() => {
            harnessRef.validateFiles([firstFile]);
        });

        act(() => {
            harnessRef.validateFiles([secondFile]);
        });

        expect(mockWarn).toHaveBeenCalledWith('Files are already being validated. Please wait for the current validation to complete before calling `validateFiles` again.');

        await act(async () => {
            resolveFirstValidation?.();
        });
    });
});

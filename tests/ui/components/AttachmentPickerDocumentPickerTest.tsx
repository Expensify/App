import {fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import AttachmentPicker from '@components/AttachmentPicker';
import Button from '@components/Button';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import processPickedAssetsSequentially from '@libs/fileDownload/processPickedAssets';

import type {FileObject} from '@src/types/utils/Attachment';

import type {DocumentPickerResponse, KeepLocalCopyResponse, NonEmptyArray} from '@react-native-documents/picker';
import type {Asset} from 'react-native-image-picker';

import {keepLocalCopy, pick} from '@react-native-documents/picker';
import React from 'react';
import {Alert} from 'react-native';
import Onyx from 'react-native-onyx';

import {translateLocal} from '../../utils/TestHelper';

// Jest resolves the bare specifier to the web no-op, so mock the shape and let each test opt into the native move.
jest.mock('@libs/ReceiptStorage', () => ({
    __esModule: true,
    default: {
        adopt: jest.fn((uriOrPath: string) => Promise.resolve(uriOrPath.split('/').pop())),
        toLocalUri: jest.fn((durableName: string) => `file:///receipts/${durableName}`),
        resolve: jest.fn((source: string) => source),
    },
}));

// The transcode itself is covered by AttachmentPickerAssetProcessingTest; here it is stubbed so each test can dictate
// whether the DNG converts, fails, or comes back without a URI.
jest.mock('@libs/fileDownload/processPickedAssets', () => jest.fn());

jest.mock('react-native-image-size', () => ({
    __esModule: true,
    default: {getSize: jest.fn(() => Promise.resolve({width: 4032, height: 3024}))},
}));

// A converted JPEG has no size in the picker result, so `getDataForUpload` stats it on disk.
const CONVERTED_FILE_SIZE = 2_048;
jest.mock('react-native-blob-util', () => ({
    __esModule: true,
    default: {fs: {stat: jest.fn(() => Promise.resolve({size: CONVERTED_FILE_SIZE}))}},
}));

const mockPick = jest.mocked(pick);
const mockKeepLocalCopy = jest.mocked(keepLocalCopy);
const mockProcessPickedAssetsSequentially = jest.mocked(processPickedAssetsSequentially);

type PickedDocument = {uri: string; name: string | null; size: number | null; type: string | null};

const PDF_DOCUMENT: PickedDocument = {uri: 'content://docs/invoice.pdf', name: 'invoice.pdf', size: 512, type: 'application/pdf'};
const TIFF_DOCUMENT: PickedDocument = {uri: 'content://docs/scan.tiff', name: 'scan.tiff', size: 4_096, type: 'image/tiff'};
const DNG_DOCUMENT: PickedDocument = {uri: 'content://docs/IMG_0001.DNG', name: 'IMG_0001.DNG', size: 40_000_000, type: 'image/x-adobe-dng'};
// Android's MIME map doesn't know DNG on every device, so the picker may hand over a `.dng` with no type at all.
const UNTYPED_DNG_DOCUMENT: PickedDocument = {uri: 'content://docs/IMG_0002.dng', name: 'IMG_0002.dng', size: 41_000_000, type: null};

const localUriFor = (document: PickedDocument) => `file:///caches/${document.name}`;

const CONVERTED_ASSET: Asset = {uri: 'file:///caches/IMG_0001.jpg', fileName: 'IMG_0001.jpg', type: 'image/jpeg', width: 4032, height: 3024};

const toPickerResponse = (document: PickedDocument): DocumentPickerResponse => ({
    ...document,
    nativeType: null,
    isVirtual: null,
    convertibleToMimeTypes: null,
    hasRequestedType: true,
    error: null,
});

const toSuccessfulLocalCopy = (document: PickedDocument): KeepLocalCopyResponse[number] => ({status: 'success', sourceUri: document.uri, localUri: localUriFor(document)});

/** Makes the document picker return the given files with a successful local copy of each. The picker never resolves with an empty selection. */
function pickDocuments(documents: NonEmptyArray<PickedDocument>) {
    const [first, ...rest] = documents;
    mockPick.mockResolvedValue([toPickerResponse(first), ...rest.map(toPickerResponse)]);
    mockKeepLocalCopy.mockResolvedValue([toSuccessfulLocalCopy(first), ...rest.map(toSuccessfulLocalCopy)]);
}

function renderPicker() {
    const onPicked = jest.fn<void, [FileObject[]]>();
    const onCanceled = jest.fn();
    const onClosed = jest.fn();

    render(
        <OnyxListItemProvider>
            <LocaleContextProvider>
                <AttachmentPicker shouldSkipAttachmentTypeModal>
                    {({openPicker}) => (
                        <Button
                            text="Choose file"
                            onPress={() => openPicker({onPicked, onCanceled, onClosed})}
                        />
                    )}
                </AttachmentPicker>
            </LocaleContextProvider>
        </OnyxListItemProvider>,
    );

    return {onPicked, onCanceled, onClosed};
}

async function openDocumentPicker() {
    const result = renderPicker();
    fireEvent.press(screen.getByRole('button'));
    await waitFor(() => expect(result.onClosed).toHaveBeenCalled());
    return result;
}

describe('AttachmentPicker document picker DNG transcoding', () => {
    let alertSpy: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({keys: {}});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
        mockProcessPickedAssetsSequentially.mockResolvedValue([CONVERTED_ASSET]);
    });

    afterEach(() => {
        alertSpy.mockRestore();
    });

    it('passes a selection with no DNG through without attempting a transcode', async () => {
        // Given a PDF and a plain TIFF picked via "Choose file". TIFF is an accepted receipt format, so unlike a DNG it must be uploaded as-is.
        pickDocuments([PDF_DOCUMENT, TIFF_DOCUMENT]);

        // When the picker resolves
        const {onPicked, onCanceled} = await openDocumentPicker();

        // Then nothing is transcoded and both files reach the caller with their picked metadata
        expect(mockProcessPickedAssetsSequentially).not.toHaveBeenCalled();
        expect(onCanceled).not.toHaveBeenCalled();
        expect(alertSpy).not.toHaveBeenCalled();
        expect(onPicked).toHaveBeenCalledTimes(1);
        const [files] = onPicked.mock.calls.at(0) ?? [];
        expect(files).toHaveLength(2);
        expect(files?.at(0)).toMatchObject({name: PDF_DOCUMENT.name, type: PDF_DOCUMENT.type, size: PDF_DOCUMENT.size});
        expect(files?.at(1)).toMatchObject({name: TIFF_DOCUMENT.name, type: TIFF_DOCUMENT.type, size: TIFF_DOCUMENT.size});
    });

    it('transcodes a document-picked DNG to JPEG and reads the converted size from disk', async () => {
        // Given a ProRAW picked via "Choose file", which the backend rejects unless it is converted first
        pickDocuments([DNG_DOCUMENT]);

        // When the picker resolves and the transcode succeeds
        const {onPicked, onCanceled} = await openDocumentPicker();

        // Then the local copy is handed to the same transcoder the gallery uses, as a single-asset batch
        expect(mockProcessPickedAssetsSequentially).toHaveBeenCalledTimes(1);
        const [assets] = mockProcessPickedAssetsSequentially.mock.calls.at(0) ?? [];
        expect(assets).toEqual([{uri: localUriFor(DNG_DOCUMENT), fileName: DNG_DOCUMENT.name, type: DNG_DOCUMENT.type, fileSize: DNG_DOCUMENT.size}]);

        // Then the caller receives the JPEG, not the DNG. Its size comes from disk because the 40 MB RAW size would trip the upload limit.
        expect(alertSpy).not.toHaveBeenCalled();
        expect(onCanceled).not.toHaveBeenCalled();
        expect(onPicked).toHaveBeenCalledTimes(1);
        const [files] = onPicked.mock.calls.at(0) ?? [];
        expect(files).toHaveLength(1);
        expect(files?.at(0)).toMatchObject({name: CONVERTED_ASSET.fileName, type: 'image/jpeg', size: CONVERTED_FILE_SIZE, width: 4032, height: 3024});
        expect(files?.at(0)?.name).not.toMatch(/dng$/i);
    });

    it('recognizes a DNG by extension when the picker reports no MIME type', async () => {
        // Given a `.dng` the picker could not type
        pickDocuments([UNTYPED_DNG_DOCUMENT]);

        // When the picker resolves
        await openDocumentPicker();

        // Then it is still routed through the transcoder rather than uploaded raw
        expect(mockProcessPickedAssetsSequentially).toHaveBeenCalledTimes(1);
        const [assets] = mockProcessPickedAssetsSequentially.mock.calls.at(0) ?? [];
        expect(assets?.at(0)).toMatchObject({uri: localUriFor(UNTYPED_DNG_DOCUMENT), fileName: UNTYPED_DNG_DOCUMENT.name, type: undefined});
    });

    it('drops a DNG that fails to convert, shows the failure once and cancels when nothing is left', async () => {
        // Given a DNG the OS image loader cannot decode, so the transcoder reports a failure and returns no asset
        pickDocuments([DNG_DOCUMENT]);
        mockProcessPickedAssetsSequentially.mockImplementation((assets, showGeneralAlert, translate) => {
            showGeneralAlert(translate('attachmentPicker.errorWhileConvertingImage'));
            return Promise.resolve([]);
        });

        // When the picker resolves
        const {onPicked, onCanceled} = await openDocumentPicker();

        // Then the unconverted DNG is never handed to the caller, the failure is surfaced, and the selection counts as cancelled
        expect(onPicked).not.toHaveBeenCalled();
        expect(onCanceled).toHaveBeenCalledTimes(1);
        expect(alertSpy).toHaveBeenCalledTimes(1);
        expect(alertSpy).toHaveBeenCalledWith(translateLocal('attachmentPicker.attachmentError'), translateLocal('attachmentPicker.errorWhileConvertingImage'));
    });

    it('drops a DNG whose transcode result has no URI without alerting', async () => {
        // Given a transcode that "succeeds" but yields an asset with nothing to upload
        pickDocuments([DNG_DOCUMENT, PDF_DOCUMENT]);
        mockProcessPickedAssetsSequentially.mockResolvedValue([{fileName: 'IMG_0001.jpg', type: 'image/jpeg'}]);

        // When the picker resolves
        const {onPicked} = await openDocumentPicker();

        // Then only the PDF is delivered; there is no alert since the transcoder reported no failure
        expect(alertSpy).not.toHaveBeenCalled();
        expect(onPicked).toHaveBeenCalledTimes(1);
        const [files] = onPicked.mock.calls.at(0) ?? [];
        expect(files).toHaveLength(1);
        expect(files?.at(0)).toMatchObject({name: PDF_DOCUMENT.name});
    });

    it('alerts and delivers nothing when the local copy of a picked file cannot be made', async () => {
        // Given a DNG whose copy into the caches directory fails, so there is no local file to transcode
        pickDocuments([DNG_DOCUMENT]);
        mockKeepLocalCopy.mockResolvedValue([{status: 'error', sourceUri: DNG_DOCUMENT.uri, copyError: 'disk full'}]);
        // The picker re-throws after alerting and logs the error via `console.error`; keep that expected log out of the test output.
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        // When the picker resolves
        const {onPicked} = await openDocumentPicker();
        consoleErrorSpy.mockRestore();

        // Then the failure is surfaced before any transcode is attempted and nothing reaches the caller
        expect(mockProcessPickedAssetsSequentially).not.toHaveBeenCalled();
        expect(onPicked).not.toHaveBeenCalled();
        expect(alertSpy).toHaveBeenCalledTimes(1);
        expect(alertSpy).toHaveBeenCalledWith(translateLocal('attachmentPicker.attachmentError'), "Couldn't create local file copy");
    });

    it('converts DNGs one at a time, keeps the other files, and collapses repeated failures into a single alert', async () => {
        // Given a multi-selection of two DNGs and a PDF, where both DNGs fail: one with the conversion message and one with
        // the default message from a failure reported without a message
        pickDocuments([DNG_DOCUMENT, PDF_DOCUMENT, UNTYPED_DNG_DOCUMENT]);
        mockProcessPickedAssetsSequentially
            .mockImplementationOnce((assets, showGeneralAlert, translate) => {
                showGeneralAlert(translate('attachmentPicker.errorWhileConvertingImage'));
                showGeneralAlert(translate('attachmentPicker.errorWhileConvertingImage'));
                return Promise.resolve([]);
            })
            .mockImplementationOnce((assets, showGeneralAlert) => {
                showGeneralAlert();
                return Promise.resolve([]);
            });

        // When the picker resolves
        const {onPicked, onCanceled} = await openDocumentPicker();

        // Then each DNG was transcoded in its own call, in selection order, so only one decoded bitmap is ever held in memory
        expect(mockProcessPickedAssetsSequentially).toHaveBeenCalledTimes(2);
        expect(mockProcessPickedAssetsSequentially.mock.calls.at(0)?.at(0)).toEqual([expect.objectContaining({fileName: DNG_DOCUMENT.name})]);
        expect(mockProcessPickedAssetsSequentially.mock.calls.at(1)?.at(0)).toEqual([expect.objectContaining({fileName: UNTYPED_DNG_DOCUMENT.name})]);

        // Then the distinct failure messages are shown in one alert, deduplicated
        expect(alertSpy).toHaveBeenCalledTimes(1);
        expect(alertSpy).toHaveBeenCalledWith(
            translateLocal('attachmentPicker.attachmentError'),
            [translateLocal('attachmentPicker.errorWhileConvertingImage'), translateLocal('attachmentPicker.errorWhileSelectingAttachment')].join('\n'),
        );

        // Then the PDF still reaches the caller
        expect(onCanceled).not.toHaveBeenCalled();
        expect(onPicked).toHaveBeenCalledTimes(1);
        const [files] = onPicked.mock.calls.at(0) ?? [];
        expect(files).toHaveLength(1);
        expect(files?.at(0)).toMatchObject({name: PDF_DOCUMENT.name});
    });
});

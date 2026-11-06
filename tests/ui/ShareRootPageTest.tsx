/** Covers the Share screen's handling of the generated native result and rejected processing. */
import {render, waitFor} from '@testing-library/react-native';

import {addTempShareFile} from '@libs/actions/Share';
import ShareActionHandler from '@libs/ShareActionHandlerModule';

import ShareRootPage from '@pages/Share/ShareRootPage';

import React from 'react';
import {Alert} from 'react-native';

jest.mock('@libs/ShareActionHandlerModule', () => ({__esModule: true, default: {processFiles: jest.fn()}}));
jest.mock('@libs/actions/Share', () => ({addTempShareFile: jest.fn(), addValidatedShareFile: jest.fn(), clearShareData: jest.fn()}));
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useFilesValidation', () => () => ({validateFiles: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@libs/Navigation/OnyxTabNavigator', () => ({__esModule: true, default: 'OnyxTabNavigator', TopTab: {Screen: 'Screen'}}));
jest.mock('@libs/actions/Modal', () => ({close: jest.fn()}));
jest.mock('@libs/actions/Tab', () => ({__esModule: true, default: {setSelectedTab: jest.fn()}}));
jest.mock('@libs/ReceiptUtils', () => ({shouldValidateFile: () => false}));
jest.mock('@libs/fileDownload/FileUtils', () => ({splitExtensionFromFileName: () => ({fileExtension: 'jpg'}), validateImageForCorruption: () => Promise.resolve()}));
jest.mock('@libs/Log', () => ({warn: jest.fn()}));
jest.mock('@components/ScreenWrapper', () => 'ScreenWrapper');
jest.mock('@components/HeaderWithBackButton', () => 'HeaderWithBackButton');
jest.mock('@components/Skeletons/TabNavigatorSkeleton', () => 'TabNavigatorSkeleton');
jest.mock('@components/TabSelector/TabSelector', () => 'TabSelector');
jest.mock('@pages/Share/ShareTab', () => 'ShareTab');
jest.mock('@pages/Share/SubmitTab', () => 'SubmitTab');

describe('ShareRootPage native processing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {id: 'receipt.jpg', content: 'file:///receipt.jpg', mimeType: 'image/jpeg', processedAt: '123', aspectRatio: 1.5},
        {id: 'text', content: 'Shared text', mimeType: 'txt', processedAt: '123'},
    ])('stores a typed $mimeType share', async (file) => {
        // Given a file or literal-text record returned by native code.
        jest.mocked(ShareActionHandler.processFiles).mockResolvedValueOnce([file]);

        // When the Share screen opens.
        render(<ShareRootPage />);

        // Then it stores the record without parsing JSON or changing timestamp/metadata types.
        await waitFor(() => expect(addTempShareFile).toHaveBeenCalledWith(file));
        expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('shows an attachment-not-found error when no files are available', async () => {
        // Given a Share route with no pending native data.
        jest.mocked(ShareActionHandler.processFiles).mockResolvedValueOnce([]);

        // When the screen opens.
        render(<ShareRootPage />);

        // Then it reports the missing attachment instead of leaving the loading skeleton indefinitely.
        await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('attachmentPicker.attachmentError', 'attachmentView.attachmentNotFound', expect.any(Array)));
        expect(addTempShareFile).not.toHaveBeenCalled();
    });

    it('shows an attachment error when native processing rejects', async () => {
        // Given an unreadable or invalid pending attachment.
        jest.mocked(ShareActionHandler.processFiles).mockRejectedValueOnce(new Error('Unreadable attachment'));

        // When the screen opens and native processing fails.
        render(<ShareRootPage />);

        // Then the rejection reaches the existing attachment-error UI.
        await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('attachmentPicker.attachmentError', 'attachmentPicker.errorWhileSelectingCorruptedAttachment', expect.any(Array)));
        expect(addTempShareFile).not.toHaveBeenCalled();
    });

    it('rejects unsupported MIME types without persisting them', async () => {
        // Given a readable file with a type the Share flow does not support.
        jest.mocked(ShareActionHandler.processFiles).mockResolvedValueOnce([{id: 'file', content: 'file:///file', mimeType: 'application/x-unsupported', processedAt: '123'}]);

        // When the screen opens.
        render(<ShareRootPage />);

        // Then the existing unsupported-file error is retained.
        await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('attachmentPicker.wrongFileType', 'attachmentPicker.notAllowedExtension', expect.any(Array)));
        expect(addTempShareFile).not.toHaveBeenCalled();
    });
});

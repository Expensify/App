import {renderHook} from '@testing-library/react-native';

import Navigation from '@navigation/Navigation';

import useConciergeAttachmentPicker from '@pages/home/ForYouSection/useConciergeAttachmentPicker';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';

import ROUTES from '@src/ROUTES';
import type {FileObject} from '@src/types/utils/Attachment';

import React from 'react';

const REPORT_ID = '100';

const mockValidateFiles = jest.fn();
const validationHandler: {onFilesValidated?: (files: FileObject[]) => void} = {};

jest.mock('@hooks/useFilesValidation', () => ({
    __esModule: true,
    default: (onFilesValidated: (files: FileObject[]) => void) => {
        validationHandler.onFilesValidated = onFilesValidated;
        return {validateFiles: mockValidateFiles, PDFValidationComponent: null};
    },
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

jest.mock('@navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

const mockNavigate = jest.mocked(Navigation.navigate);
const mockSetCurrentAttachment = jest.fn();

const FILES: FileObject[] = [{name: 'receipt.jpg', type: 'image/jpeg', uri: 'file://receipt.jpg'}];

function renderPicker(reportID: string | undefined, onConfirm: (files: FileObject | FileObject[]) => void) {
    const contextValue = {
        isAttachmentHidden: () => false,
        updateHiddenAttachments: () => {},
        setCurrentAttachment: mockSetCurrentAttachment,
        getCurrentAttachment: () => undefined,
    };

    return renderHook(() => useConciergeAttachmentPicker(reportID, onConfirm), {
        wrapper: ({children}) => <AttachmentModalContext.Provider value={contextValue}>{children}</AttachmentModalContext.Provider>,
    });
}

describe('useConciergeAttachmentPicker', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        validationHandler.onFilesValidated = undefined;
    });

    describe('pickAttachments', () => {
        it('validates picked files as plain attachments rather than receipts', () => {
            // Given the picker is mounted for a report
            const {result} = renderPicker(REPORT_ID, jest.fn());

            // When files are picked
            result.current.pickAttachments(FILES);

            // Then receipt validation is turned off
            expect(mockValidateFiles).toHaveBeenCalledWith(FILES, undefined, {isValidatingReceipts: false});
        });

        it('does nothing when the picker returns no files', () => {
            // Given the picker is mounted for a report
            const {result} = renderPicker(REPORT_ID, jest.fn());

            // When the picker returns nothing (cancelled)
            result.current.pickAttachments([]);

            // Then no validation is started
            expect(mockValidateFiles).not.toHaveBeenCalled();
        });
    });

    describe('once the files are validated', () => {
        it('opens the attachment preview modal for the report and keeps the caller onConfirm', () => {
            // Given the picker is mounted for a report
            const onConfirm = jest.fn();
            renderPicker(REPORT_ID, onConfirm);

            // When validation completes
            validationHandler.onFilesValidated?.(FILES);

            // Then the preview modal is handed the files and the caller's onConfirm, and confirming leaves the screen
            expect(mockSetCurrentAttachment).toHaveBeenCalledWith({
                reportID: REPORT_ID,
                file: FILES,
                headerTitle: 'reportActionCompose.sendAttachment',
                onConfirm,
                confirmLeavesScreen: true,
            });
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.REPORT_ADD_ATTACHMENT.getRoute(REPORT_ID));
        });

        it('does nothing when validation rejected every file', () => {
            // Given the picker is mounted for a report
            renderPicker(REPORT_ID, jest.fn());

            // When validation completes with no valid file left
            validationHandler.onFilesValidated?.([]);

            // Then no modal is opened
            expect(mockSetCurrentAttachment).not.toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });
});

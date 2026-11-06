import {act, renderHook} from '@testing-library/react-native';

import type useFilesValidation from '@hooks/useFilesValidation';

import Navigation from '@navigation/Navigation';

import type {useComposerActions, useComposerMeta, useComposerSendState} from '@pages/inbox/report/ReportActionCompose/ComposerContext';
import useAttachmentPicker from '@pages/inbox/report/ReportActionCompose/useAttachmentPicker';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';

import type * as CONSTModule from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {FileObject} from '@src/types/utils/Attachment';

import React from 'react';

import createMock from '../../utils/createMock';

type ComposerValidationCallback = Parameters<typeof useFilesValidation>[0];
const mockValidateFiles = jest.fn<ReturnType<ReturnType<typeof useFilesValidation>['validateFiles']>, Parameters<ReturnType<typeof useFilesValidation>['validateFiles']>>();
const composerValidation: {onFilesValidated?: ComposerValidationCallback} = {};
const mockSetAttachment = jest.fn<
    ReturnType<React.ContextType<typeof AttachmentModalContext>['setCurrentAttachment']>,
    Parameters<React.ContextType<typeof AttachmentModalContext>['setCurrentAttachment']>
>();
const mockComposerMeta = createMock<ReturnType<typeof useComposerMeta>>({attachmentFileRef: {current: null}, suggestionsRef: {current: null}});
const mockComposerActions = createMock<ReturnType<typeof useComposerActions>>({clearComposer: jest.fn()});
const mockComposerSendState = createMock<ReturnType<typeof useComposerSendState>>({exceededMaxLength: null});

jest.mock('@hooks/useFilesValidation', () => ({
    __esModule: true,
    default: (onFilesValidated: ComposerValidationCallback) => {
        composerValidation.onFilesValidated = onFilesValidated;
        return {validateFiles: mockValidateFiles, PDFValidationComponent: null};
    },
}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@libs/getPlatform', () => {
    const {default: actualCONST} = jest.requireActual<typeof CONSTModule>('@src/CONST');
    return () => actualCONST.PLATFORM.WEB;
});
jest.mock('@libs/ComposerFocusManager', () => ({setReadyToFocus: jest.fn()}));
jest.mock('@navigation/Navigation', () => ({navigate: jest.fn()}));
jest.mock('@pages/inbox/report/ReportActionCompose/ComposerContext', () => ({
    useComposerMeta: () => mockComposerMeta,
    useComposerActions: () => mockComposerActions,
    useComposerSendState: () => mockComposerSendState,
}));

function renderComposerPicker() {
    const attachmentContext = createMock<React.ContextType<typeof AttachmentModalContext>>({setCurrentAttachment: mockSetAttachment});
    return renderHook(() => useAttachmentPicker('100'), {
        wrapper: ({children}) => <AttachmentModalContext.Provider value={attachmentContext}>{children}</AttachmentModalContext.Provider>,
    });
}

describe('composer attachment extraction', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        composerValidation.onFilesValidated = undefined;
    });

    it('keeps its existing null filter and pairs survivors with original item indices', () => {
        // Given failed extraction precedes and separates valid files in one drop.
        const firstFile = Object.assign(new File(['first'], 'first.txt', {type: 'text/plain'}), {uri: 'blob:first'});
        const secondFile = Object.assign(new File(['second'], 'second.txt', {type: 'text/plain'}), {uri: 'blob:second'});
        const items = [
            createMock<DataTransferItem>({kind: 'file', getAsFile: () => null}),
            createMock<DataTransferItem>({kind: 'file', getAsFile: () => firstFile}),
            createMock<DataTransferItem>({kind: 'file', getAsFile: () => null}),
            createMock<DataTransferItem>({kind: 'file', getAsFile: () => secondFile}),
        ];
        const dragEvent = createMock<DragEvent>({dataTransfer: {items: createMock<DataTransferItemList>({length: items.length, [Symbol.iterator]: () => items[Symbol.iterator]()})}});
        const {result} = renderComposerPicker();

        // When the real picker executes the actual extraction and name cleaning.
        act(() => result.current.pickAttachments({files: items, dragEvent}));

        // Then filtering keeps survivor order and each survivor's original transfer item.
        expect(mockValidateFiles).toHaveBeenCalledWith([firstFile, secondFile], [items.at(1), items.at(3)], {isValidatingReceipts: false});
        expect(mockValidateFiles.mock.calls.at(0)?.[0].at(0)).toBe(firstFile);
        expect(mockValidateFiles.mock.calls.at(0)?.[1]?.[1]).toBe(items.at(3));
    });

    it('does not validate when every extraction fails or no files are supplied', () => {
        // Given an all-null picker response has no surviving attachments.
        const failedItem = {getAsFile: () => null} satisfies FileObject;
        const {result} = renderComposerPicker();

        // When the existing filter receives failed, empty and cancelled selections.
        act(() => {
            result.current.pickAttachments({files: [failedItem]});
            result.current.pickAttachments({files: []});
            result.current.pickAttachments({});
        });

        // Then the composer never manufactures a valid file or starts empty validation.
        expect(mockValidateFiles).not.toHaveBeenCalled();
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    it('preserves clipboard File identity and opens the report attachment preview', () => {
        // Given a browser drop already supplies real Files with valid names.
        const file = new File(['receipt'], 'receipt.txt', {type: 'text/plain'});
        const event = createMock<DragEvent>({
            dataTransfer: {files: createMock<FileList>({length: 1, [Symbol.iterator]: () => [file][Symbol.iterator]()}), items: createMock<DataTransferItemList>({length: 0})},
        });
        const originalCreateObjectURL = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
        const createObjectURL = jest.fn<ReturnType<typeof URL.createObjectURL>, Parameters<typeof URL.createObjectURL>>().mockReturnValue('blob:clipboard');
        Object.defineProperty(URL, 'createObjectURL', {configurable: true, value: createObjectURL});
        try {
            const {result} = renderComposerPicker();

            // When the real clipboard path validates and returns its files to the preview callback.
            act(() => result.current.pickAttachments({dragEvent: event}));
            expect(mockValidateFiles).toHaveBeenCalled();
            expect(mockValidateFiles.mock.calls.at(0)?.[0].at(0)).toBe(file);
            expect(composerValidation.onFilesValidated).toBeDefined();
            act(() => composerValidation.onFilesValidated?.([file], []));

            // Then URI augmentation uses the same File and report routing keeps its original ID.
            expect(createObjectURL).toHaveBeenCalledWith(file);
            expect(file.uri).toBe('blob:clipboard');
            expect(mockSetAttachment).toHaveBeenCalledWith(expect.objectContaining({reportID: '100', file: [file], dataTransferItems: []}));
            expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_ADD_ATTACHMENT.getRoute('100'));
        } finally {
            if (originalCreateObjectURL) {
                Object.defineProperty(URL, 'createObjectURL', originalCreateObjectURL);
            } else {
                Reflect.deleteProperty(URL, 'createObjectURL');
            }
        }
    });
});

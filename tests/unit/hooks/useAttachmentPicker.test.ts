/** Covers composer extraction and DataTransfer item alignment through the real picker. */
import {renderHook} from '@testing-library/react-native';

import useFilesValidation from '@hooks/useFilesValidation';

import {useComposerActions, useComposerMeta, useComposerSendState} from '@pages/inbox/report/ReportActionCompose/ComposerContext';
import useAttachmentPicker from '@pages/inbox/report/ReportActionCompose/useAttachmentPicker';

import type {FileObject} from '@src/types/utils/Attachment';

import createMock from '../../utils/createMock';

jest.mock('@hooks/useFilesValidation', () => jest.fn());
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@pages/inbox/report/ReportActionCompose/ComposerContext', () => ({useComposerActions: jest.fn(), useComposerMeta: jest.fn(), useComposerSendState: jest.fn()}));

const validateFiles = jest.fn<ReturnType<ReturnType<typeof useFilesValidation>['validateFiles']>, Parameters<ReturnType<typeof useFilesValidation>['validateFiles']>>();
const first: FileObject = {uri: 'file://first.text', name: 'first.text', type: 'text/plain', size: 240};
const last: FileObject = {uri: 'file://last.text', name: 'last.text', type: 'text/plain', size: 240};
const nullGetter: FileObject = {getAsFile: () => null};

describe('composer attachment cleaning', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(useFilesValidation).mockReturnValue({validateFiles, PDFValidationComponent: undefined});
        jest.mocked(useComposerActions).mockReturnValue(createMock<ReturnType<typeof useComposerActions>>({clearComposer: jest.fn()}));
        jest.mocked(useComposerMeta).mockReturnValue(createMock<ReturnType<typeof useComposerMeta>>({attachmentFileRef: {current: undefined}, suggestionsRef: {current: null}}));
        jest.mocked(useComposerSendState).mockReturnValue(createMock<ReturnType<typeof useComposerSendState>>({exceededMaxLength: null}));
    });

    it('omits only null extraction and keeps the original items for surviving indices', () => {
        // Given clipboard items align with the original valid/null/valid batch.
        const items = [
            createMock<DataTransferItem>({kind: 'file', type: 'text/plain'}),
            createMock<DataTransferItem>({kind: 'file', type: 'image/png'}),
            createMock<DataTransferItem>({kind: 'file', type: 'text/plain'}),
        ];
        const dragEvent = createMock<DragEvent>({dataTransfer: {items}});
        const {result} = renderHook(() => useAttachmentPicker('100'));
        // When the real composer picker cleans each original entry.
        result.current.pickAttachments({files: [first, nullGetter, last], dragEvent});
        // Then no new file objects or shifted item associations are introduced.
        expect(validateFiles).toHaveBeenCalledTimes(1);
        expect(validateFiles).toHaveBeenCalledWith([first, last], [items.at(0), items.at(2)], {isValidatingReceipts: false});
        expect(validateFiles.mock.calls.at(0)?.at(0)).toEqual([first, last]);
    });

    it('keeps scalar metadata identity and the original missing-item fallback', () => {
        // Given native and web paste can supply a single URI metadata object.
        const {result} = renderHook(() => useAttachmentPicker('100'));
        // When the scalar input is picked without a drag event.
        result.current.pickAttachments({files: first});
        // Then the original fallback item and nonreceipt option reach validation.
        expect(validateFiles).toHaveBeenCalledWith([first], [{}], {isValidatingReceipts: false});
        expect(validateFiles.mock.calls.at(0)?.[0].at(0)).toBe(first);
    });

    it.each([{files: [nullGetter]}, {files: [nullGetter, nullGetter]}, {files: []}])('does not validate an empty survivor batch $files', ({files}) => {
        // Given cancellation or getter nulls leave the composer with no attachment.
        const {result} = renderHook(() => useAttachmentPicker('100'));
        // When the actual cleaning and existing null filter run.
        result.current.pickAttachments({files});
        // Then shared validation is never invoked for an empty survivor list.
        expect(validateFiles).not.toHaveBeenCalled();
    });
});

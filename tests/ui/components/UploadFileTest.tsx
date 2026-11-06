import {fireEvent, render, screen} from '@testing-library/react-native';

import UploadFile from '@components/UploadFile';

import type {FileObject} from '@src/types/utils/Attachment';

import React from 'react';

const mockOpenPicker = jest.fn<void, [{onPicked: (files: FileObject[]) => void}]>();
jest.mock('@components/AttachmentPicker', () => ({children}: {children: (props: {openPicker: typeof mockOpenPicker}) => React.ReactNode}) => <>{children({openPicker: mockOpenPicker})}</>);
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({Close: '', Paperclip: ''}),
}));
jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));
jest.mock('@hooks/useTheme', () => () => ({icon: ''}));
jest.mock('@hooks/useThemeStyles', () => () => ({}));
const file = (name: string, size = 1): FileObject => ({
    name,
    size,
    uri: `file://${name}`,
});
function openUpload(props: Partial<React.ComponentProps<typeof UploadFile>> = {}) {
    const calls: string[] = [];
    const onInputChange = jest.fn(() => calls.push('input'));
    const onUpload = jest.fn(() => calls.push('upload'));
    const setError = jest.fn((error: string) => calls.push(`error:${error}`));
    render(
        <UploadFile
            buttonText="Upload"
            uploadedFiles={[]}
            acceptedFileTypes={['pdf']}
            onRemove={jest.fn()}
            {...props}
            onInputChange={onInputChange}
            onUpload={onUpload}
            setError={setError}
        />,
    );
    fireEvent.press(screen.getByLabelText('Upload'));
    const picked = mockOpenPicker.mock.lastCall?.at(0);
    expect(picked).toBeDefined();
    return {picked: picked?.onPicked, calls, onInputChange, onUpload, setError};
}
describe('UploadFile', () => {
    beforeEach(() => mockOpenPicker.mockClear());
    it('accepts a mixed batch when any extension matches and keeps callback order', () => {
        // Given the current string extension producer and a mixed picked batch
        const upload = openUpload();
        // When one picked file has the accepted extension
        upload.picked?.([file('one.txt'), file('two.pdf')]);
        // Then the real upload handler passes both files through in the original callback order
        expect(upload.onUpload).toHaveBeenCalledWith([file('one.txt'), file('two.pdf')]);
        expect(upload.calls).toEqual(['input', 'upload', 'error:']);
    });
    it('rejects a batch without a matching extension', () => {
        // Given a file outside the accepted extensions
        const upload = openUpload();
        // When it is picked
        upload.picked?.([file('one.txt')]);
        // Then the upload callbacks are skipped
        expect(upload.calls).toEqual(['error:attachmentPicker.notAllowedExtension']);
    });
    it('filters existing names after extension validation and checks size before count', () => {
        // Given an existing same-name file and configured size and count limits
        const upload = openUpload({
            uploadedFiles: [file('one.pdf')],
            fileLimit: 2,
            maxFileSize: 2,
        });
        // When a duplicate, over-count batch, and oversized batch are picked in order
        upload.picked?.([file('one.pdf')]);
        expect(upload.onUpload).toHaveBeenCalledWith([]);
        upload.picked?.([file('one.pdf'), file('two.pdf')]);
        // Then the count limit rejects the batch before duplicate filtering
        expect(upload.calls.at(-1)).toBe('error:attachmentPicker.tooManyFiles');
        upload.picked?.([file('large.pdf', 3), file('extra.pdf')]);
        expect(upload.calls.at(-1)).toBe('error:attachmentPicker.sizeExceededWithLimit');
        expect(upload.onUpload).toHaveBeenCalledTimes(1);
    });
});

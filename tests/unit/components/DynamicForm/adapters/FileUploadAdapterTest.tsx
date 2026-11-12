import {act, render, screen} from '@testing-library/react-native';

import FileUploadAdapter from '@components/DynamicForm/adapters/FileUploadAdapter';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';

import React from 'react';

type CapturedUploadFileProps = {
    uploadedFiles: FileObject[];
    onUpload: (files: FileObject[]) => void;
    onRemove: (fileName: string) => void;
    setError: (error: string) => void;
    errorText: string;
};

const mockUploadFile = jest.fn<null, [CapturedUploadFileProps]>(() => null);

jest.mock('@components/UploadFile', () => ({
    __esModule: true,
    default: (props: CapturedUploadFileProps) => mockUploadFile(props),
}));

const passport: FileObject = {name: 'passport.pdf', uri: 'file://passport.pdf'};
const bankStatement: FileObject = {name: 'statement.pdf', uri: 'file://statement.pdf'};

function getUploadFileProps() {
    const props = mockUploadFile.mock.lastCall?.[0];
    if (!props) {
        throw new Error('UploadFile did not render');
    }
    return props;
}

function renderAdapter(value: FileObject[], onInputChange: (files: FileObject[]) => void, {forwardedFSClass}: ForwardedFSClassProps = {}) {
    render(
        <FileUploadAdapter
            value={value}
            onInputChange={onInputChange}
            buttonText="Choose files"
            acceptedFileTypes={['pdf']}
            forwardedFSClass={forwardedFSClass}
        />,
    );
    return getUploadFileProps();
}

describe('FileUploadAdapter', () => {
    it('reports the whole list when a file is added', () => {
        // Given one uploaded file, since UploadFile itself reports only the newly picked files
        const onInputChange = jest.fn();
        const uploadFileProps = renderAdapter([passport], onInputChange);

        // When the user adds a second file
        uploadFileProps.onUpload([bankStatement]);

        // Then FormProvider receives both files
        expect(onInputChange).toHaveBeenCalledWith([passport, bankStatement]);
    });

    it('reports the remaining files when one is removed', () => {
        // Given two uploaded files, since UploadFile never reports removals to FormProvider
        const onInputChange = jest.fn();
        const uploadFileProps = renderAdapter([passport, bankStatement], onInputChange);

        // When the user removes the passport
        uploadFileProps.onRemove('passport.pdf');

        // Then FormProvider receives the bank statement alone
        expect(onInputChange).toHaveBeenCalledWith([bankStatement]);
    });

    it('clears an upload error when the user removes a file', () => {
        // Given an upload the picker rejected, shown as an error under the files
        const uploadFileProps = renderAdapter([passport, bankStatement], jest.fn());
        act(() => uploadFileProps.setError('Too many files'));
        expect(getUploadFileProps().errorText).toBe('Too many files');

        // When the user removes a file to make room
        act(() => getUploadFileProps().onRemove('passport.pdf'));

        // Then the error is gone, since it described the rejected upload and not the files left
        expect(getUploadFileProps().errorText).toBe('');
    });

    it('masks the uploaded files in session recordings', () => {
        // Given a document field whose files must stay out of session recordings
        const forwardedFSClass = CONST.FULLSTORY.CLASS.MASK;

        // When it renders
        renderAdapter([passport], jest.fn(), {forwardedFSClass});

        // Then the view around UploadFile carries the mask, since UploadFile takes no FullStory class itself
        expect(screen.toJSON()).toMatchObject({props: {fsClass: forwardedFSClass}});
    });
});

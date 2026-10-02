import {render} from '@testing-library/react-native';

import FileUploadAdapter from '@components/DynamicForm/adapters/FileUploadAdapter';

import type {FileObject} from '@src/types/utils/Attachment';

import React from 'react';

type CapturedUploadFileProps = {
    uploadedFiles: FileObject[];
    onUpload: (files: FileObject[]) => void;
    onRemove: (fileName: string) => void;
};

const mockUploadFile = jest.fn<null, [CapturedUploadFileProps]>(() => null);

jest.mock('@components/UploadFile', () => ({
    __esModule: true,
    default: (props: CapturedUploadFileProps) => mockUploadFile(props),
}));

const passport: FileObject = {name: 'passport.pdf', uri: 'file://passport.pdf'};
const bankStatement: FileObject = {name: 'statement.pdf', uri: 'file://statement.pdf'};

function renderAdapter(value: FileObject[], onInputChange: (files: FileObject[]) => void) {
    render(
        <FileUploadAdapter
            value={value}
            onInputChange={onInputChange}
            buttonText="Choose files"
            acceptedFileTypes={['pdf']}
        />,
    );
    const props = mockUploadFile.mock.lastCall?.[0];
    if (!props) {
        throw new Error('UploadFile did not render');
    }
    return props;
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
});

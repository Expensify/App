import UploadFile from '@components/UploadFile';

import type {FileObject} from '@src/types/utils/Attachment';

import type {ComponentProps} from 'react';

import React, {useState} from 'react';

type FileUploadAdapterProps = Pick<ComponentProps<typeof UploadFile>, 'buttonText' | 'acceptedFileTypes' | 'fileLimit' | 'maxFileSize'> & {
    /** Files added so far */
    value?: FileObject[];

    /** Called with every file after each add or remove */
    onInputChange?: (value: FileObject[]) => void;

    /** Validation error, shown unless an upload error takes its place */
    errorText?: string;
};

/** UploadFile reports each upload and removal on its own, so this keeps FormProvider's value as the whole list */
function FileUploadAdapter({value, onInputChange = () => {}, errorText = '', ...uploadFileProps}: FileUploadAdapterProps) {
    const [uploadError, setUploadError] = useState('');
    const files = Array.isArray(value) ? value : [];

    return (
        <UploadFile
            {...uploadFileProps}
            uploadedFiles={files}
            onUpload={(newFiles) => onInputChange([...files, ...newFiles])}
            onRemove={(fileName) => onInputChange(files.filter((file) => file.name !== fileName))}
            setError={setUploadError}
            errorText={uploadError || errorText}
        />
    );
}

export default FileUploadAdapter;

import UploadFile from '@components/UploadFile';
import type {UploadFileProps} from '@components/UploadFile';

import type {FileObject} from '@src/types/utils/Attachment';

import React, {useState} from 'react';

type FileUploadAdapterProps = Pick<UploadFileProps, 'buttonText' | 'acceptedFileTypes' | 'fileLimit' | 'maxFileSize' | 'style'> & {
    /** Files supplied by the FormProvider */
    value?: FileObject[];

    /** Callback to update the files in the FormProvider */
    onInputChange?: (value: FileObject[]) => void;

    errorText?: string;
};

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

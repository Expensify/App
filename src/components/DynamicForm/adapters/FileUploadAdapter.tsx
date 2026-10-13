import UploadFile from '@components/UploadFile';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import type {FileObject} from '@src/types/utils/Attachment';

import type {ComponentProps} from 'react';

import React, {useState} from 'react';
import {View} from 'react-native';

/** UploadFile settings the adapter passes through unchanged */
type UploadFileSettings = Pick<ComponentProps<typeof UploadFile>, 'buttonText' | 'acceptedFileTypes' | 'fileLimit' | 'maxFileSize' | 'accessibilityLabel'>;

type FileUploadAdapterProps = UploadFileSettings &
    ForwardedFSClassProps & {
        /** Files added so far */
        value?: FileObject[];

        /** Called with every file after each add or remove */
        onInputChange?: (value: FileObject[]) => void;

        /** Validation error, shown unless an upload error takes its place */
        errorText?: string;
    };

/** UploadFile reports each upload and removal on its own, so this keeps FormProvider's value as the whole list */
function FileUploadAdapter({value, onInputChange = () => {}, errorText = '', forwardedFSClass, ...uploadFileProps}: FileUploadAdapterProps) {
    const [uploadError, setUploadError] = useState('');
    const files = Array.isArray(value) ? value : [];

    // UploadFile takes no FullStory class, so the mask goes on a View around it
    return (
        <View fsClass={forwardedFSClass}>
            <UploadFile
                {...uploadFileProps}
                uploadedFiles={files}
                onUpload={(newFiles) => onInputChange([...files, ...newFiles])}
                onRemove={(fileName) => {
                    setUploadError('');
                    onInputChange(files.filter((file) => file.name !== fileName));
                }}
                setError={setUploadError}
                errorText={uploadError || errorText}
            />
        </View>
    );
}

export default FileUploadAdapter;

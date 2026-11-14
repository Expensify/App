import useUploadErrorAnnouncement from '@components/DynamicForm/hooks/useUploadErrorAnnouncement';
import FSClassView from '@components/FSClassView';
import UploadFile from '@components/UploadFile';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import type {FileObject} from '@src/types/utils/Attachment';

import type {ComponentProps, ComponentRef, Ref} from 'react';
import type {View} from 'react-native';

import React, {useState} from 'react';

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

        /** Lets FormProvider scroll to the field when the user asks to fix the errors */
        ref?: Ref<ComponentRef<typeof View>>;
    };

/** UploadFile reports each upload and removal on its own, so this keeps FormProvider's value as the whole list */
function FileUploadAdapter({value, onInputChange = () => {}, errorText = '', forwardedFSClass, ref, ...uploadFileProps}: FileUploadAdapterProps) {
    const [uploadError, setUploadError] = useState('');
    const files = Array.isArray(value) ? value : [];

    const shownError = useUploadErrorAnnouncement(uploadError, errorText);

    // UploadFile takes no FullStory class, so the mask goes on a View around it
    return (
        <FSClassView
            ref={ref}
            forwardedFSClass={forwardedFSClass}
        >
            <UploadFile
                {...uploadFileProps}
                uploadedFiles={files}
                onUpload={(newFiles) => onInputChange([...files, ...newFiles])}
                onRemove={(fileName) => {
                    setUploadError('');
                    onInputChange(files.filter((file) => file.name !== fileName));
                }}
                setError={setUploadError}
                errorText={shownError}
                shouldExtendRemoveTouchArea
            />
        </FSClassView>
    );
}

export default FileUploadAdapter;
export type {UploadFileSettings};

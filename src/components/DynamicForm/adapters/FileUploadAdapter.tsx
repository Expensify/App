import FormContext from '@components/Form/FormContext';
import UploadFile from '@components/UploadFile';

import useAccessibilityAnnouncement from '@hooks/useAccessibilityAnnouncement';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import type {FileObject} from '@src/types/utils/Attachment';

import type {ComponentProps, ComponentRef, Ref} from 'react';

import React, {useContext, useState} from 'react';
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

        /** Lets FormProvider scroll to the field when the user asks to fix the errors */
        ref?: Ref<ComponentRef<typeof View>>;
    };

/** UploadFile reports each upload and removal on its own, so this keeps FormProvider's value as the whole list */
function FileUploadAdapter({value, onInputChange = () => {}, errorText = '', forwardedFSClass, ref, ...uploadFileProps}: FileUploadAdapterProps) {
    const [uploadError, setUploadError] = useState('');
    const files = Array.isArray(value) ? value : [];

    const shownError = uploadError || errorText;
    const {getErrorAnnouncementKey} = useContext(FormContext);
    const errorAnnouncementKey = getErrorAnnouncementKey();
    // UploadFile shows the error through a live region, which VoiceOver ignores, so it is announced as it appears and again on each submit
    useAccessibilityAnnouncement(shownError, !!shownError, {shouldAnnounceOnNative: true, announcementKey: errorAnnouncementKey});

    // UploadFile takes no FullStory class, so the mask goes on a View around it
    return (
        <View
            ref={ref}
            fsClass={forwardedFSClass}
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
        </View>
    );
}

export default FileUploadAdapter;

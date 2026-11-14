import Button from '@components/Button';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import FileTypeMenuButton from '@components/DynamicForm/components/FileTypeMenuButton';
import type {FileTypeOption} from '@components/DynamicForm/components/FileTypeMenuButton';
import useUploadErrorAnnouncement from '@components/DynamicForm/hooks/useUploadErrorAnnouncement';
import {getListItemFiles, getListItems} from '@components/DynamicForm/utils/listItems';
import FSClassView from '@components/FSClassView';
import Text from '@components/Text';
import UploadedFileChip from '@components/UploadFile/components/UploadedFileChip';
import UploadFilePicker from '@components/UploadFile/components/UploadFilePicker';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import CONST from '@src/CONST';
import type {DynamicFormListItem} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import type {ComponentRef, Ref} from 'react';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {UploadFileSettings} from './FileUploadAdapter';

/** One upload button and the kinds of document it takes */
type LabelledUpload = {
    /** The kinds of document the button takes */
    types: FileTypeOption[];

    /** Text of the button */
    buttonText: string;

    /** Hint under the button, such as what the document must show */
    description?: string;
};

type LabelledFileUploadAdapterProps = Omit<UploadFileSettings, 'buttonText'> &
    ForwardedFSClassProps & {
        /** One entry per kind of document used so far: `{id, fileType, files}` */
        value?: DynamicFormListItem[];

        /** Called with every entry after each add or remove */
        onInputChange?: (value: DynamicFormListItem[]) => void;

        /** Validation error, shown under each button that has no file yet */
        errorText?: string;

        /** The upload buttons, in order */
        uploads: LabelledUpload[];

        /** Lets FormProvider scroll to the field when the user asks to fix the errors */
        ref?: Ref<ComponentRef<typeof View>>;
    };

/**
 * Upload buttons, each labelling its files with a kind of document it takes. A button with one kind opens the file picker, and a button with more asks which kind first.
 * Files list under their button. The file limit and the check for a file with the same name count only the button's own files, since one file can prove two documents.
 */
function LabelledFileUploadAdapter({
    value,
    onInputChange = () => {},
    errorText = '',
    uploads,
    forwardedFSClass,
    ref,
    accessibilityLabel,
    acceptedFileTypes,
    fileLimit,
    maxFileSize,
}: LabelledFileUploadAdapterProps) {
    const styles = useThemeStyles();
    const [uploadError, setUploadError] = useState('');
    const [uploadErrorIndex, setUploadErrorIndex] = useState<number>();
    const entries = getListItems(value);
    // Announces the upload error, else the validation error, as it appears
    useUploadErrorAnnouncement(uploadError, errorText);

    const getFiles = (upload: LabelledUpload) => entries.filter((entry) => upload.types.some((type) => type.value === entry.fileType));
    const getTypeLabel = (fileType: unknown) => uploads.flatMap((upload) => upload.types).find((type) => type.value === fileType)?.label ?? '';

    const addFiles = (fileType: string, newFiles: FileObject[]) => {
        if (newFiles.length === 0) {
            return;
        }
        const typeEntry = entries.find((entry) => entry.fileType === fileType);
        const updatedEntry: DynamicFormListItem = {id: fileType, fileType, files: [...(typeEntry ? getListItemFiles(typeEntry) : []), ...newFiles]};
        onInputChange(typeEntry ? entries.map((entry) => (entry === typeEntry ? updatedEntry : entry)) : [...entries, updatedEntry]);
    };

    const removeFile = (removedEntry: DynamicFormListItem, fileName: string) => {
        setUploadError('');
        const files = getListItemFiles(removedEntry).filter((file) => file.name !== fileName);
        onInputChange(files.length > 0 ? entries.map((entry) => (entry === removedEntry ? {...entry, files} : entry)) : entries.filter((entry) => entry !== removedEntry));
    };

    return (
        <FSClassView
            ref={ref}
            forwardedFSClass={forwardedFSClass}
        >
            {uploads.map((upload, index) => {
                const uploadEntries = getFiles(upload);
                const buttonAccessibilityLabel = accessibilityLabel ? `${upload.buttonText}, ${accessibilityLabel}` : upload.buttonText;
                let shownError = '';
                if (uploadErrorIndex === index && uploadError) {
                    shownError = uploadError;
                } else if (uploadEntries.length === 0) {
                    shownError = errorText;
                }
                return (
                    <View
                        // The buttons are fixed by the schema, so their order keys them
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        style={[index > 0 && styles.mt5, styles.alignItemsStart]}
                    >
                        <UploadFilePicker
                            buttonText={upload.buttonText}
                            existingFiles={uploadEntries.flatMap(getListItemFiles)}
                            setError={(error) => {
                                setUploadErrorIndex(index);
                                setUploadError(error);
                            }}
                            fileLimit={fileLimit}
                            acceptedFileTypes={acceptedFileTypes}
                            maxFileSize={maxFileSize}
                        >
                            {(openPicker) => {
                                const [onlyType] = upload.types;
                                if (upload.types.length === 1 && onlyType) {
                                    return (
                                        <Button
                                            sentryLabel={CONST.SENTRY_LABEL.UPLOAD_FILE.UPLOAD_BUTTON}
                                            accessibilityLabel={buttonAccessibilityLabel}
                                            onPress={() => openPicker((files) => addFiles(onlyType.value, files))}
                                        >
                                            <Button.Text>{upload.buttonText}</Button.Text>
                                        </Button>
                                    );
                                }
                                return (
                                    <FileTypeMenuButton
                                        buttonText={upload.buttonText}
                                        accessibilityLabel={buttonAccessibilityLabel}
                                        types={upload.types}
                                        onSelect={(fileType) => openPicker((files) => addFiles(fileType, files))}
                                    />
                                );
                            }}
                        </UploadFilePicker>
                        {uploadEntries.map((entry) => (
                            // Full width, so a long file name is cut short instead of pushing the remove button out of view
                            <View
                                key={entry.id}
                                style={[styles.mt3, styles.w100, styles.alignItemsStart]}
                            >
                                {upload.types.length > 1 && <Text style={styles.textLabelSupporting}>{getTypeLabel(entry.fileType)}</Text>}
                                {getListItemFiles(entry).map((file) => (
                                    <UploadedFileChip
                                        key={file.name}
                                        file={file}
                                        onRemove={(fileName) => removeFile(entry, fileName)}
                                        shouldExtendRemoveTouchArea
                                    />
                                ))}
                            </View>
                        ))}
                        {!!upload.description && <Text style={[styles.textLabelSupporting, styles.mt2]}>{upload.description}</Text>}
                        {!!shownError && (
                            <DotIndicatorMessage
                                style={[styles.formError, styles.mt3]}
                                type="error"
                                messages={{shownError}}
                            />
                        )}
                    </View>
                );
            })}
        </FSClassView>
    );
}

export default LabelledFileUploadAdapter;

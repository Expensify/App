import DotIndicatorMessage from '@components/DotIndicatorMessage';
import useUploadErrorAnnouncement from '@components/DynamicForm/hooks/useUploadErrorAnnouncement';
import {getListItemFiles, getListItems} from '@components/DynamicForm/utils/listItems';
import Text from '@components/Text';
import {UploadedFileChip, UploadFilePicker} from '@components/UploadFile';
import type {ValuePickerItem} from '@components/ValuePicker/types';

import useThemeStyles from '@hooks/useThemeStyles';

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import type {DynamicFormListItem} from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

import type {ComponentRef, Ref} from 'react';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {UploadFileSettings} from './FileUploadAdapter';

import DropdownPickerAdapter from './DropdownPickerAdapter';

/** Form adapter for a file field whose uploads are labelled by a document type picked before each upload */
type LabelledFileUploadAdapterProps = Omit<UploadFileSettings, 'accessibilityLabel'> &
    ForwardedFSClassProps & {
        /** One entry per file type used so far: `{id, fileType, files}` */
        value?: DynamicFormListItem[];

        /** Called with every entry after each add or remove */
        onInputChange?: (value: DynamicFormListItem[]) => void;

        /** Validation error, shown unless an upload error takes its place */
        errorText?: string;

        /** Label of the dropdown that picks the type of the next upload */
        typeLabel: string;

        /** The types a file can be labelled with */
        types: ValuePickerItem[];

        /** Lets FormProvider scroll to the field when the user asks to fix the errors */
        ref?: Ref<ComponentRef<typeof View>>;
    };

/** Uploads labelled by a type picked first, listed under their type. The chosen type stays on the device, since it only says what the next upload is. */
function LabelledFileUploadAdapter({
    value,
    onInputChange = () => {},
    errorText = '',
    typeLabel,
    types,
    forwardedFSClass,
    ref,
    buttonText,
    acceptedFileTypes,
    fileLimit,
    maxFileSize,
}: LabelledFileUploadAdapterProps) {
    const styles = useThemeStyles();
    const [selectedType, setSelectedType] = useState<string>();
    const [uploadError, setUploadError] = useState('');
    const entries = getListItems(value);
    const shownError = useUploadErrorAnnouncement(uploadError, errorText);
    const getTypeLabel = (fileType: unknown) => types.find((type) => type.value === fileType)?.label ?? '';
    const selectedTypeLabel = getTypeLabel(selectedType);
    const selectedEntry = entries.find((candidate) => candidate.fileType === selectedType);
    const selectedFiles = selectedEntry ? getListItemFiles(selectedEntry) : [];

    const addFiles = (newFiles: FileObject[]) => {
        if (!selectedType) {
            return;
        }
        const updatedEntry: DynamicFormListItem = {id: selectedType, fileType: selectedType, files: [...selectedFiles, ...newFiles]};
        onInputChange(selectedEntry ? entries.map((candidate) => (candidate.id === selectedEntry.id ? updatedEntry : candidate)) : [...entries, updatedEntry]);
    };

    const removeFile = (entry: DynamicFormListItem, fileName: string) => {
        setUploadError('');
        const files = getListItemFiles(entry).filter((file) => file.name !== fileName);
        onInputChange(files.length > 0 ? entries.map((candidate) => (candidate.id === entry.id ? {...entry, files} : candidate)) : entries.filter((candidate) => candidate.id !== entry.id));
    };

    return (
        <View
            ref={ref}
            fsClass={forwardedFSClass}
        >
            {/* The type picker is a push row, so it pulls into the field row's padding to line up with other push rows */}
            <View style={styles.mhn5}>
                <DropdownPickerAdapter
                    label={typeLabel}
                    items={types}
                    value={selectedType}
                    onInputChange={setSelectedType}
                />
            </View>
            {!!selectedType && (
                <View style={[styles.mt3, styles.alignItemsStart]}>
                    <UploadFilePicker
                        buttonText={buttonText}
                        accessibilityLabel={`${buttonText}, ${selectedTypeLabel}`}
                        existingFiles={selectedFiles}
                        onUpload={addFiles}
                        setError={setUploadError}
                        fileLimit={fileLimit}
                        acceptedFileTypes={acceptedFileTypes}
                        maxFileSize={maxFileSize}
                    />
                </View>
            )}
            {!!shownError && (
                <DotIndicatorMessage
                    style={[styles.formError, styles.mt3]}
                    type="error"
                    messages={{shownError}}
                />
            )}
            {entries.map((entry) => (
                <View
                    key={entry.id}
                    style={[styles.mt3, styles.alignItemsStart]}
                >
                    <Text style={styles.textLabelSupporting}>{getTypeLabel(entry.fileType)}</Text>
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
        </View>
    );
}

export default LabelledFileUploadAdapter;

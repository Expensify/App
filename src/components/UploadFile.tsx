import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {splitExtensionFromFileName} from '@libs/fileDownload/FileUtils';
import CONST from '@src/CONST';
import type {FileObject} from '@src/types/utils/Attachment';
import AttachmentPicker from './AttachmentPicker';
import Button from './Button';
import DotIndicatorMessage from './DotIndicatorMessage';
import Icon from './Icon';
// eslint-disable-next-line no-restricted-imports
import {Close} from './Icon/Expensicons';
import {PressableWithFeedback} from './Pressable';
import TextWithMiddleEllipsis from './TextWithMiddleEllipsis';

type UploadFileProps = {
    /** Text displayed on button when no file is uploaded */
    buttonText: string;

    /** Name of currently uploaded file */
    uploadedFiles: FileObject[];

    /** Handler that fires when file is selected for upload */
    onUpload: (files: FileObject[]) => void;

    /** Handler that fires when file is removed */
    onRemove: (fileUri: string) => void;

    /** Array containing accepted file types */
    acceptedFileTypes: Array<ValueOf<typeof CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS>>;

    /** Styles to be assigned to Container */
    style?: StyleProp<ViewStyle>;

    /** Text to display on error message */
    errorText?: string;

    /** Function called whenever option changes */
    onInputChange?: (value: FileObject[]) => void;

    /** Function to set error message */
    setError: (error: string) => void;

    /** Whether to allow multiple files to be selected. */
    fileLimit?: number;

    /** The total size limit of the files that can be selected. */
    totalFilesSizeLimit?: number;
};

function UploadFile({
    buttonText,
    uploadedFiles,
    onUpload,
    onRemove,
    acceptedFileTypes,
    style,
    errorText = '',
    setError,
    onInputChange = () => {},
    totalFilesSizeLimit = 0,
    fileLimit = 0,
}: UploadFileProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Paperclip']);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const handleFileUpload = (files: FileObject[]) => {
        const resultedFiles = [...uploadedFiles, ...files];

        const totalSize = resultedFiles.reduce((sum, file) => sum + (file.size ?? 0), 0);

        if (totalFilesSizeLimit) {
            if (totalSize > totalFilesSizeLimit) {
                setError(translate('attachmentPicker.sizeExceededWithValue', {maxUploadSizeInMB: totalFilesSizeLimit / (1024 * 1024)}));
                return;
            }
        }

        if (fileLimit && resultedFiles.length > 0 && resultedFiles.length > fileLimit) {
            setError(translate('attachmentPicker.tooManyFiles', fileLimit));
            return;
        }

        if (acceptedFileTypes.length > 0) {
            const filesExtensions = new Set(files.map((file) => splitExtensionFromFileName(file?.name ?? '').fileExtension.toLowerCase()));

            if (acceptedFileTypes.every((element) => !filesExtensions.has(element as string))) {
                setError(translate('attachmentPicker.notAllowedExtension'));
                return;
            }
        }

        const uploadedFilesNames = new Set(uploadedFiles.map((uploadedFile) => uploadedFile.name));

        const newFilesToUpload = files.filter((file) => !uploadedFilesNames.has(file.name));

        onInputChange(newFilesToUpload);
        onUpload(newFilesToUpload);
        setError('');
    };

    return (
        <View style={[styles.alignItemsStart, style]}>
            <AttachmentPicker
                acceptedFileTypes={acceptedFileTypes}
                fileLimit={fileLimit}
                allowMultiple={fileLimit > 1}
            >
                {({openPicker}) => (
                    <Button
                        medium
                        text={buttonText}
                        accessibilityLabel={buttonText}
                        onPress={() => {
                            openPicker({
                                onPicked: handleFileUpload,
                            });
                        }}
                    />
                )}
            </AttachmentPicker>
            {uploadedFiles.map((file) => (
                <View
                    style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.border, styles.p5, styles.mt3, styles.mw100]}
                    key={file.name}
                >
                    <Icon
                        src={icons.Paperclip}
                        fill={theme.icon}
                        medium
                    />
                    <TextWithMiddleEllipsis
                        text={file.name ?? ''}
                        style={[styles.ml2, styles.mr2, styles.w100, styles.flexShrink1]}
                        textStyle={styles.textBold}
                    />
                    <PressableWithFeedback
                        onPress={() => onRemove(file?.name ?? '')}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.remove')}
                    >
                        <Icon
                            src={Close}
                            fill={theme.icon}
                            medium
                        />
                    </PressableWithFeedback>
                </View>
            ))}
            {errorText !== '' && (
                <DotIndicatorMessage
                    style={[styles.formError, styles.mt3]}
                    type="error"
                    messages={{errorText}}
                />
            )}
        </View>
    );
}

export default UploadFile;

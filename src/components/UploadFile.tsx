import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {FileObject} from './AttachmentModal';
import AttachmentPicker from './AttachmentPicker';
import Button from './Button';
import DotIndicatorMessage from './DotIndicatorMessage';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

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
};

function UploadFile({buttonText, uploadedFiles, onUpload, onRemove, acceptedFileTypes, style, errorText = '', onInputChange = () => {}}: UploadFileProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();

    const handleFileUpload = (files: FileObject[]) => {
        onInputChange(files);
        onUpload(files);
    };

    return (
        <View style={[styles.alignItemsStart, style]}>
            <AttachmentPicker
                acceptedFileTypes={acceptedFileTypes}
                fileLimit={CONST.NON_USD_BANK_ACCOUNT.FILE_LIMIT}
                totalFilesSizeLimitInMB={CONST.NON_USD_BANK_ACCOUNT.TOTAL_FILES_SIZE_LIMIT_IN_MB}
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
                    style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.border, styles.p4, styles.mt3]}
                    key={file.uri}
                >
                    <Icon
                        height={variables.iconSizeNormal}
                        width={variables.iconSizeSemiSmall}
                        src={Expensicons.Paperclip}
                        fill={theme.textSupporting}
                    />
                    <Text style={[styles.ml4, styles.mr3, styles.textBold]}>{file.name}</Text>
                    <PressableWithFeedback
                        onPress={() => onRemove(file?.uri ?? '')}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.remove')}
                    >
                        <Icon
                            src={Expensicons.Close}
                            fill={theme.textSupporting}
                            small
                        />
                    </PressableWithFeedback>
                </View>
            ))}
            {errorText !== '' && (
                <DotIndicatorMessage
                    textStyles={[styles.formError]}
                    type="error"
                    messages={{errorText}}
                />
            )}
        </View>
    );
}

UploadFile.displayName = 'UploadFile';

export default UploadFile;

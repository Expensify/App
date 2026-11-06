import DotIndicatorMessage from '@components/DotIndicatorMessage';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type UploadFileProps from './types';

import UploadedFileChip from './components/UploadedFileChip';
import UploadFilePicker from './components/UploadFilePicker';

function UploadFile({uploadedFiles, onRemove, style, errorText = '', shouldExtendRemoveTouchArea = false, ...pickerProps}: UploadFileProps) {
    const styles = useThemeStyles();

    return (
        <View style={[styles.alignItemsStart, style]}>
            <UploadFilePicker
                {...pickerProps}
                existingFiles={uploadedFiles}
            />
            {uploadedFiles.map((file) => (
                <UploadedFileChip
                    key={file.name}
                    file={file}
                    onRemove={onRemove}
                    shouldExtendRemoveTouchArea={shouldExtendRemoveTouchArea}
                />
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

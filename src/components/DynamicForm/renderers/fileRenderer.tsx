import FileUploadAdapter from '@components/DynamicForm/adapters/FileUploadAdapter';
import LabelledFileUploadAdapter from '@components/DynamicForm/adapters/LabelledFileUploadAdapter';
import {getOptionLabel} from '@components/DynamicForm/utils/getFieldOptions';
import getLocalizedText, {getInputLabel} from '@components/DynamicForm/utils/getLocalizedText';
import {getListItems} from '@components/DynamicForm/utils/listItems';
import InputWrapper from '@components/Form/InputWrapper';

import CONST from '@src/CONST';

import React from 'react';

import type {DynamicFieldRenderer} from './types';

/** Uploaded documents, one file unless the schema allows more */
const renderFile: DynamicFieldRenderer<'file'> = (field, {translate, maxFileSize}, inputProps) => {
    const fileLimit = field.maxFiles ?? CONST.DYNAMIC_FORM_DOCUMENT.FILE_LIMIT;
    const buttonText = translate(fileLimit > 1 ? 'common.chooseFiles' : 'common.chooseFile');
    const uploadFileProps = {buttonText, fileLimit, acceptedFileTypes: [...CONST.DYNAMIC_FORM_DOCUMENT.ALLOWED_FILE_TYPES], maxFileSize: field.maxFileSize ?? maxFileSize};
    if (field.uploads) {
        const {defaultValue, ...labelledInputProps} = inputProps;
        return {
            isMenuRow: false,
            input: (
                <InputWrapper
                    InputComponent={LabelledFileUploadAdapter}
                    {...labelledInputProps}
                    // A labelled field's answer is its entries by file type, not a plain list of files
                    defaultValue={defaultValue && getListItems(defaultValue)}
                    valueType="listItems"
                    uploads={field.uploads.map((upload) => ({
                        types: upload.fileTypes.map((option) => ({value: option.key, label: getOptionLabel(option, translate)})),
                        buttonText: getLocalizedText(translate, upload.labelKey, upload.label) ?? translate('dynamicForm.uploadFile'),
                        description: getLocalizedText(translate, upload.descriptionKey, upload.description),
                    }))}
                    accessibilityLabel={getInputLabel(field, translate)}
                    fileLimit={fileLimit}
                    acceptedFileTypes={uploadFileProps.acceptedFileTypes}
                    maxFileSize={uploadFileProps.maxFileSize}
                />
            ),
        };
    }
    return {
        isMenuRow: false,
        labelAbove: 'heading',
        input: (
            <InputWrapper
                InputComponent={FileUploadAdapter}
                {...inputProps}
                valueType="files"
                accessibilityLabel={`${buttonText}, ${getInputLabel(field, translate)}`}
                {...uploadFileProps}
            />
        ),
    };
};

export default renderFile;

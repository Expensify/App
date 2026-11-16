import FileUploadAdapter from '@components/DynamicForm/adapters/FileUploadAdapter';
import {getInputLabel} from '@components/DynamicForm/utils/getLocalizedText';
import InputWrapper from '@components/Form/InputWrapper';

import CONST from '@src/CONST';

import React from 'react';

import type {DynamicFieldRenderer} from './types';

/** Uploaded documents, one file unless the schema allows more */
const renderFile: DynamicFieldRenderer<'file'> = (field, {translate, maxFileSize}, inputProps) => {
    const fileLimit = field.maxFiles ?? CONST.DYNAMIC_FORM_DOCUMENT.FILE_LIMIT;
    const buttonText = translate(fileLimit > 1 ? 'common.chooseFiles' : 'common.chooseFile');
    return {
        isMenuRow: false,
        labelAbove: 'heading',
        input: (
            <InputWrapper
                InputComponent={FileUploadAdapter}
                {...inputProps}
                valueType="files"
                buttonText={buttonText}
                accessibilityLabel={`${buttonText}, ${getInputLabel(field, translate)}`}
                fileLimit={fileLimit}
                acceptedFileTypes={[...CONST.DYNAMIC_FORM_DOCUMENT.ALLOWED_FILE_TYPES]}
                maxFileSize={field.maxFileSize ?? maxFileSize}
            />
        ),
    };
};

export default renderFile;

import FileUploadAdapter from '@components/DynamicForm/adapters/FileUploadAdapter';
import InputWrapper from '@components/Form/InputWrapper';

import CONST from '@src/CONST';

import React from 'react';

import type {DynamicFieldRenderer} from './types';

/** Uploaded documents, one file unless the schema allows more */
const renderFile: DynamicFieldRenderer<'file'> = (field, {translate}, inputProps) => {
    const fileLimit = field.maxFiles ?? CONST.DYNAMIC_FORM_DOCUMENT.FILE_LIMIT;
    return {
        isMenuRow: false,
        labelAbove: 'heading',
        input: (
            <InputWrapper
                InputComponent={FileUploadAdapter}
                {...inputProps}
                valueType="files"
                buttonText={translate(fileLimit > 1 ? 'common.chooseFiles' : 'common.chooseFile')}
                fileLimit={fileLimit}
                acceptedFileTypes={[...CONST.DYNAMIC_FORM_DOCUMENT.ALLOWED_FILE_TYPES]}
                maxFileSize={CONST.DYNAMIC_FORM_DOCUMENT.MAX_FILE_SIZE}
            />
        ),
    };
};

export default renderFile;

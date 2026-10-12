import FileUploadAdapter from '@components/DynamicForm/adapters/FileUploadAdapter';
import InputWrapper from '@components/Form/InputWrapper';

import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React from 'react';

import type {DynamicFieldRenderer} from './types';

const ACCEPTED_FILE_TYPES: Array<ValueOf<typeof CONST.API_ATTACHMENT_VALIDATIONS.ALLOWED_RECEIPT_EXTENSIONS>> = ['png', 'jpg', 'jpeg', 'pdf'];

/** Uploaded documents, one file unless the schema allows more */
const renderFile: DynamicFieldRenderer<'file'> = (field, {translate}, inputProps) => {
    const fileLimit = field.maxFiles ?? 1;
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
                acceptedFileTypes={ACCEPTED_FILE_TYPES}
            />
        ),
    };
};

export default renderFile;

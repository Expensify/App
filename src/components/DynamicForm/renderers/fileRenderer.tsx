import FileUploadAdapter from '@components/DynamicForm/adapters/FileUploadAdapter';
import InputWrapper from '@components/Form/InputWrapper';

import CONST from '@src/CONST';

import React from 'react';

import type {DynamicFieldRenderer} from './types';

const renderFile: DynamicFieldRenderer<'file'> = (field, {translate}, inputProps) => {
    const fileLimit = field.maxFiles ?? CONST.API_ATTACHMENT_VALIDATIONS.MAX_FILE_LIMIT;
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
                // Wise publishes no document limits, so these are the bank document limits the App already applies
                acceptedFileTypes={[...CONST.CORPAY_DOCUMENT.ALLOWED_FILE_TYPES]}
                maxFileSize={CONST.CORPAY_DOCUMENT.MAX_FILE_SIZE}
            />
        ),
    };
};

export default renderFile;

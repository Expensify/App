/** A text input that lays its answer out in the field's display format once the user leaves it, so typing and pasting are never interrupted */
import formatWithDisplayFormat from '@components/DynamicForm/utils/formatWithDisplayFormat';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps} from '@components/TextInput/BaseTextInput/types';

import type {DynamicFormTextField} from '@src/types/onyx';

import React from 'react';

type DynamicFormFormattedTextInputProps = BaseTextInputProps & {
    /** The field whose display format the answer is laid out in */
    field: DynamicFormTextField;
};

function DynamicFormFormattedTextInput({field, value, onBlur, onInputChange, ...props}: DynamicFormFormattedTextInputProps) {
    const formatAnswer: BaseTextInputProps['onBlur'] = (event) => {
        onBlur?.(event);
        const formatted = formatWithDisplayFormat(value ?? '', field);
        if (formatted !== value) {
            onInputChange?.(formatted);
        }
    };

    return (
        <TextInput
            {...props}
            value={value}
            onBlur={formatAnswer}
            onInputChange={onInputChange}
        />
    );
}

export default DynamicFormFormattedTextInput;

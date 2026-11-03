import InputWrapper from '@components/Form/InputWrapper';
import TextInput from '@components/TextInput';

import useLocalize from '@hooks/useLocalize';

import type {ComponentProps} from 'react';

import React, {useState} from 'react';

/** Stands in for a sensitive answer the server holds, which it never sends back. It is shaped like an SSN, the only such answer so far. */
const ON_FILE_MASK = '•••-••-••••';

type DynamicFormOnFileTextInputProps = Omit<ComponentProps<typeof InputWrapper<typeof TextInput, 'string'>>, 'InputComponent'>;

/**
 * A text input for a sensitive answer the server already holds, such as an SSN saved on an earlier visit.
 * The answer is replaced, never edited, so it shows as a mask the user cannot type into. Clearing the mask asks for a new answer, which is then required.
 * The mask is not a form value, so a page saved with it sends no answer and the server keeps the one it holds.
 */
function DynamicFormOnFileTextInput(props: DynamicFormOnFileTextInputProps) {
    const {translate} = useLocalize();
    const [isCleared, setIsCleared] = useState(false);

    // An answer typed on this visit is the user's own, so it is shown and edited as usual
    if (isCleared || props.defaultValue !== undefined) {
        return (
            <InputWrapper
                InputComponent={TextInput}
                {...props}
                autoFocus={isCleared}
            />
        );
    }

    return (
        <TextInput
            label={props.label}
            hint={props.hint}
            value={ON_FILE_MASK}
            // The mask reads as a row of dots, so screen readers hear that the answer is on file instead
            accessibilityLabel={props.label}
            accessibilityHint={translate('dynamicForm.onFile')}
            readOnly
            shouldHideClearButton={false}
            onClearInput={() => setIsCleared(true)}
            forwardedFSClass={props.forwardedFSClass}
        />
    );
}

export default DynamicFormOnFileTextInput;
export {ON_FILE_MASK};

import type {Ref} from 'react';

type MarkdownTextInputProps = {
    ref?: Ref<unknown>;
};

function MarkdownTextInput({ref}: MarkdownTextInputProps) {
    if (ref) {
        // no-op to mark ref as used
    }
    return null;
}

const parseExpensiMark = () => [];

const getWorkletRuntime = () => ({});

export {MarkdownTextInput, parseExpensiMark, getWorkletRuntime};

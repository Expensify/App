import type {Ref} from 'react';
import React from 'react';
import {TextInput} from 'react-native';
import type {TextInputProps} from 'react-native';

type MarkdownTextInputProps = TextInputProps & {
    ref?: Ref<TextInput>;
    parser?: (value: string) => unknown[];
    markdownStyle?: unknown;
    formatSelection?: unknown;
};

function MarkdownTextInput({ref, parser, markdownStyle, formatSelection, ...textInputProps}: MarkdownTextInputProps) {
    if (parser || markdownStyle || formatSelection) {
        // no-op to mark unsupported mock props as used
    }
    return React.createElement(TextInput, {
        ...textInputProps,
        ref,
    });
}

const parseExpensiMark = () => [];

const getWorkletRuntime = () => ({});

export {MarkdownTextInput, parseExpensiMark, getWorkletRuntime};

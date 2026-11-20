/** Sends submit and keypress events to the viewport that has actually committed. */
import {SelectionListTextField} from '@components/SelectionList/components/TextInput';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';

import type {Ref} from 'react';
import type {TextInputKeyPressEvent} from 'react-native';

import React, {useEffect} from 'react';

import {useSelectionListInteractionRefs} from './SelectionListRoot';

type SelectionListSearchInputProps = {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    autoFocus?: boolean;
    isLoading?: boolean;
    ref?: Ref<BaseTextInputRef | null>;
};

function SelectionListSearchInput({label, value, onChangeText, autoFocus = false, isLoading, ref}: SelectionListSearchInputProps) {
    const {inputRef, isTextInputFocusedRef, viewportRef} = useSelectionListInteractionRefs();

    const focusInput = () => inputRef.current?.focus();
    const handleKeyPress = (event: TextInputKeyPressEvent) => viewportRef.current?.handleSearchKeyPress(event);
    const updateInputFocus = (isFocused: boolean) => {
        isTextInputFocusedRef.current = isFocused;
    };

    useEffect(
        () => () => {
            isTextInputFocusedRef.current = false;
        },
        [isTextInputFocusedRef],
    );

    const submitFocusedRow = () => {
        const viewport = viewportRef.current;
        // Keep the keyboard up on an empty list, just as the built-in list input does.
        if (viewport?.hasItems()) {
            inputRef.current?.blur();
        }
        viewport?.submitFocusedRow();
    };

    return (
        <SelectionListTextField
            ref={inputRef}
            options={{label, value, onChangeText, disableAutoFocus: !autoFocus, ref}}
            focusTextInput={focusInput}
            onFocusChange={updateInputFocus}
            onKeyPress={handleKeyPress}
            onSubmit={submitFocusedRow}
            isLoading={isLoading}
            shouldShowTextInput
        />
    );
}

export default SelectionListSearchInput;

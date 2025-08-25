import React, { useRef, useState, useCallback } from "react";
import type { SelectionListHandle  } from "@components/SelectionList/types";
import type { NativeSyntheticEvent, TextInputFocusEventData, View } from "react-native";
import SplitListItemFocus from "@components/SelectionList/SplitListItem";
import type UseDisplayFocusedInputUnderKeyboardType from "./types";

type SplitListItemProps = React.ComponentProps<typeof SplitListItemFocus>;



const useDisplayFocusedInputUnderKeyboard = () => {
    const listRef = useRef<SelectionListHandle>(null);
    const [inputIndexIsFocused, setInputIndexIsFocused] = useState(-1);
    const viewRef = useRef<View>(null);
    const footerHeight = useRef(0);
    const bottomOffset = useRef(0);
    
    const handleInputFocus = useCallback((index: number) => {
            setInputIndexIsFocused(index);
        }, []);
    
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleInputBlur = useCallback((e: NativeSyntheticEvent<TextInputFocusEventData>) => {
            setInputIndexIsFocused(-1);
        }, []);
    

    const scrollToFocusedInput = () => {
        setTimeout(() => {
            listRef.current?.scrollToFocusedInput(inputIndexIsFocused);
        }, 100);
    };

     const SplitListItemWithFocus = useCallback(
            // eslint-disable-next-line react/jsx-props-no-spreading
            (props: SplitListItemProps) => <SplitListItemFocus onInputFocus={handleInputFocus} onInputBlur={handleInputBlur} {...props} />,
        [handleInputFocus, handleInputBlur]
    );

    return {
        viewRef,
        footerHeight,
        bottomOffset,
        listRef,
        inputIndexIsFocused,
        scrollToFocusedInput,
        SplitListItem: SplitListItemWithFocus
    } as UseDisplayFocusedInputUnderKeyboardType;
};

export default useDisplayFocusedInputUnderKeyboard;


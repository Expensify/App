import React, { useRef, useState, useCallback, useEffect } from "react";
import type { SelectionListHandle  } from "@components/SelectionList/types";
import type { NativeSyntheticEvent, TextInputFocusEventData, View } from "react-native";
import SplitListItemFocus from "@components/SelectionList/SplitListItem";
import useDebouncedState from "@hooks/useDebouncedState";
import type UseDisplayFocusedInputUnderKeyboardType from "./types";

type SplitListItemProps = React.ComponentProps<typeof SplitListItemFocus>;



const useDisplayFocusedInputUnderKeyboard = () => {
    const listRef = useRef<SelectionListHandle>(null);
    const [inputIndexIsFocused, setInputIndexIsFocused] = useState(-1);
    const viewRef = useRef<View>(null);
    const footerHeight = useRef(0);
    const bottomOffset = useRef(0);
    const [scrollTrigger, debouncedScrollTrigger, setScrollTrigger] = useDebouncedState(0);
    
    const handleInputFocus = useCallback((index: number) => {
            setInputIndexIsFocused(index);
        }, []);
    
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleInputBlur = useCallback((e: NativeSyntheticEvent<TextInputFocusEventData>) => {
            setInputIndexIsFocused(-1);
        }, []);
    

    const performScroll = () => {
            listRef.current?.scrollToFocusedInput(inputIndexIsFocused);
    };

    useEffect(() => {
        if (debouncedScrollTrigger <= 0) {
            return;
        }
        performScroll();
    }, [debouncedScrollTrigger]);

    useEffect(() => {
        setScrollTrigger(scrollTrigger + 1);
    }, [inputIndexIsFocused, setScrollTrigger, scrollTrigger]);

    const scrollToFocusedInput = useCallback(() => {
        setScrollTrigger(scrollTrigger + 1);
    }, [setScrollTrigger, scrollTrigger]);

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
        scrollToFocusedInput,
        SplitListItem: SplitListItemWithFocus
    } as UseDisplayFocusedInputUnderKeyboardType;
};

export default useDisplayFocusedInputUnderKeyboard;


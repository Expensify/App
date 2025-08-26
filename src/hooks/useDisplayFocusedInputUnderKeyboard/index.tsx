import React, { useRef, useState, useCallback, useEffect } from "react";
import type { SelectionListHandle  } from "@components/SelectionList/types";
import type { View } from "react-native";
import SplitListItemFocus from "@components/SelectionList/SplitListItem";
import useDebouncedState from "@hooks/useDebouncedState";
import type UseDisplayFocusedInputUnderKeyboardType from "./types";

type SplitListItemProps = React.ComponentProps<typeof SplitListItemFocus>;



const useDisplayFocusedInputUnderKeyboard = (): UseDisplayFocusedInputUnderKeyboardType => {
    const listRef = useRef<SelectionListHandle>(null);
    const [inputIndexIsFocused, setInputIndexIsFocused] = useState(-1);
    const viewRef = useRef<View>(null);
    const footerRef = useRef<View>(null);
    const bottomOffset = useRef(0);
    const [scrollTrigger, debouncedScrollTrigger, setScrollTrigger] = useDebouncedState(0);
    
    const handleInputFocus = useCallback((index: number) => {
            setInputIndexIsFocused(index);
        }, []);
    
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleInputBlur = useCallback(() => {
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
    }, [inputIndexIsFocused]);

    const scrollToFocusedInput = () => {
            setScrollTrigger(scrollTrigger + 1);
        };

     const SplitListItemWithFocus = useCallback(
    // eslint-disable-next-line react-compiler/react-compiler
    ((props: SplitListItemProps) => (
        <SplitListItemFocus
            onInputFocus={handleInputFocus}
            onInputBlur={handleInputBlur}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    )) as typeof SplitListItemFocus, 
    [handleInputFocus, handleInputBlur]
);
SplitListItemFocus.displayName = "SplitListItemWithFocus";

    return {
        viewRef,
        footerRef,
        bottomOffset,
        listRef,
        scrollToFocusedInput,
        SplitListItem: SplitListItemWithFocus
    };
};


export default useDisplayFocusedInputUnderKeyboard;


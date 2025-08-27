import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {View} from 'react-native';
import SplitListItemFocus from '@components/SelectionList/SplitListItem';
import type {SelectionListHandle} from '@components/SelectionList/types';
import useDebouncedState from '@hooks/useDebouncedState';
import type UseDisplayFocusedInputUnderKeyboardType from './types';

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

    const handleInputBlur = useCallback(() => {
        setInputIndexIsFocused(-1);
    }, []);

    useEffect(() => {
        if (debouncedScrollTrigger <= 0) {
            return;
        }

        listRef.current?.scrollToFocusedInput(inputIndexIsFocused);

        // We only want this effect to run when debouncedScrollTrigger changes, not when inputIndexIsFocused changes
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedScrollTrigger]);

    useEffect(() => {
        setScrollTrigger(scrollTrigger + 1);

        // we doesn't need scrollTrigger and setScrollTrigger in deps, because it will cause infinite loop
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputIndexIsFocused]);

    const scrollToFocusedInput = () => {
        setScrollTrigger(scrollTrigger + 1);
    };

    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        [handleInputFocus, handleInputBlur],
    );
    SplitListItemFocus.displayName = 'SplitListItemWithFocus';

    return {
        viewRef,
        footerRef,
        bottomOffset,
        listRef,
        scrollToFocusedInput,
        SplitListItem: SplitListItemWithFocus,
    };
};

export default useDisplayFocusedInputUnderKeyboard;

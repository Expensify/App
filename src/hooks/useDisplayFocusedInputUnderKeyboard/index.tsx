import React, {useCallback, useEffect, useRef, useState} from 'react';
import type {View} from 'react-native';
import SplitListItemFocus from '@components/SelectionListWithSections/SplitListItem';
import type {SelectionListHandle} from '@components/SelectionListWithSections/types';
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

    useEffect(() => {
        if (debouncedScrollTrigger <= 0) {
            return;
        }

        listRef.current?.scrollToFocusedInput(inputIndexIsFocused);

        // We only want this effect to run when debouncedScrollTrigger changes, not when inputIndexIsFocused changes
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedScrollTrigger]);

    const scrollToFocusedInput = () => {
        setScrollTrigger(scrollTrigger + 1);
    };

    useEffect(() => {
        scrollToFocusedInput();

        // we doesn't need scrollToFocusedInput in deps, because we want it to run only after inputIndexIsFocused changes
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inputIndexIsFocused]);

    // eslint-disable-next-line react-compiler/react-compiler
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const SplitListItemWithFocus = useCallback(
        ((props: SplitListItemProps) => (
            <SplitListItemFocus
                onInputFocus={setInputIndexIsFocused}
                onInputBlur={() => setInputIndexIsFocused(-1)}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            />
        )) as typeof SplitListItemFocus,
        [],
    );

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

import {useId, useLayoutEffect, useRef} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import {useContent} from '@components/PopoverMenu/v2/content/ContentContext';
import useSyncFocus from '@hooks/useSyncFocus';

type FocusableRow = {
    ref: RefObject<View | null>;
    focused: boolean;
    onPress: () => void;
    onFocus: () => void;
};

function useFocusableRow({
    componentName,
    visible,
    onActivate,
    isDisabled = false,
    text,
}: {
    componentName: string;
    visible: boolean;
    onActivate: () => void;
    isDisabled?: boolean;
    text?: string;
}): FocusableRow {
    const id = useId();
    const ref = useRef<View>(null);
    const content = useContent(componentName);
    const {focusedID} = content.state;
    const {registerItem, unregisterItem, setFocusedID} = content.actions;

    const onActivateRef = useRef(onActivate);
    useLayoutEffect(() => {
        onActivateRef.current = onActivate;
    });

    useLayoutEffect(() => {
        if (!visible) {
            return;
        }
        registerItem(id, {ref, isDisabled, onActivate: () => onActivateRef.current(), text});
        return () => unregisterItem(id);
    }, [visible, id, registerItem, unregisterItem, isDisabled, text]);

    const focused = focusedID === id;
    useSyncFocus(ref, focused);

    return {
        ref,
        focused,
        onPress: () => onActivateRef.current(),
        onFocus: () => setFocusedID(id),
    };
}

export default useFocusableRow;
export type {FocusableRow};

import {useId, useLayoutEffect, useRef} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import {useContentActions, useContentFocus} from '@components/PopoverMenu/v2/content/ContentContext';
import useSyncFocus from '@hooks/useSyncFocus';

type FocusableRow = {
    ref: RefObject<View | null>;
    focused: boolean;
    onPress: () => void;
    onFocus: () => void;
};

/** For close-on-select rows, prefer `useSelectableRow`. */
function useFocusableRow({componentName, visible, onActivate, isDisabled = false}: {componentName: string; visible: boolean; onActivate: () => void; isDisabled?: boolean}): FocusableRow {
    const id = useId();
    const ref = useRef<View>(null);
    const {focusedID} = useContentFocus(componentName);
    const {registerItem, unregisterItem, setFocusedID} = useContentActions(componentName);

    // Mirror so registered onActivate stays stable across renders.
    const onActivateRef = useRef(onActivate);
    useLayoutEffect(() => {
        onActivateRef.current = onActivate;
    });

    useLayoutEffect(() => {
        if (!visible) {
            return;
        }
        registerItem(id, {ref, isDisabled, onActivate: () => onActivateRef.current()});
        return () => unregisterItem(id);
    }, [visible, id, registerItem, unregisterItem, isDisabled]);

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

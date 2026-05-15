import type {RefObject} from 'react';
import type {View} from 'react-native';
import {useContentClose} from '@components/PopoverMenu/v2/content/ContentContext';
import {useIsAtActiveLevel} from '@components/PopoverMenu/v2/sub/SubContext';
import {createCustomEvent} from '@libs/CustomEventUtils';
import type {CustomEvent} from '@libs/CustomEventUtils';
import useFocusableRow from './useFocusableRow';

const HOOK_NAME = 'useSelectableRow';

type ItemSelectEvent = CustomEvent;

type UseSelectableRowResult = {
    ref: RefObject<View | null>;
    onPress: () => void;
    onFocus: () => void;
    focused: boolean;
    isAtActiveLevel: boolean;
};

/** Closes after `onSelect`; call `event.preventDefault()` inside `onSelect` to keep the menu open. */
function useSelectableRow({onSelect, disabled = false, text}: {onSelect?: (event: ItemSelectEvent) => void; disabled?: boolean; text?: string} = {}): UseSelectableRowResult {
    const close = useContentClose(HOOK_NAME);
    const isAtActiveLevel = useIsAtActiveLevel(HOOK_NAME);

    const row = useFocusableRow({
        componentName: HOOK_NAME,
        visible: isAtActiveLevel,
        isDisabled: disabled,
        text,
        onActivate: () => {
            if (disabled) {
                return;
            }
            const event = createCustomEvent();
            onSelect?.(event);
            if (!event.isDefaultPrevented()) {
                close();
            }
        },
    });

    return {...row, isAtActiveLevel};
}

export default useSelectableRow;
export type {ItemSelectEvent, UseSelectableRowResult};

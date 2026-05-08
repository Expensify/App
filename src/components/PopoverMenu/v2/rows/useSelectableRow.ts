import {use} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import {ContentCloseContext} from '@components/PopoverMenu/v2/content/ContentContext';
import {useIsAtActiveLevel} from '@components/PopoverMenu/v2/sub/SubContext';
import useFocusableRow from './useFocusableRow';

type ItemSelectEvent = {
    defaultPrevented: boolean;
    preventDefault: () => void;
};

function createSelectEvent(): ItemSelectEvent {
    const event: ItemSelectEvent = {
        defaultPrevented: false,
        preventDefault() {
            event.defaultPrevented = true;
        },
    };
    return event;
}

type UseSelectableRowResult = {
    ref: RefObject<View | null>;
    onPress: () => void;
    onFocus: () => void;
    focused: boolean;
    isAtActiveLevel: boolean;
};

/** Closes after `onSelect`; call `event.preventDefault()` inside `onSelect` to keep the menu open. */
function useSelectableRow({onSelect, disabled = false}: {onSelect?: (event: ItemSelectEvent) => void; disabled?: boolean} = {}): UseSelectableRowResult {
    const close = use(ContentCloseContext);
    if (close === null) {
        throw new Error('useSelectableRow() must be called inside <PopoverMenu.Content>.');
    }
    const isAtActiveLevel = useIsAtActiveLevel('useSelectableRow');

    const row = useFocusableRow({
        componentName: 'useSelectableRow',
        visible: isAtActiveLevel,
        isDisabled: disabled,
        onActivate: () => {
            if (disabled) {
                return;
            }
            const event = createSelectEvent();
            onSelect?.(event);
            if (event.defaultPrevented) {
                return;
            }
            close();
        },
    });

    return {...row, isAtActiveLevel};
}

export default useSelectableRow;
export type {ItemSelectEvent, UseSelectableRowResult};

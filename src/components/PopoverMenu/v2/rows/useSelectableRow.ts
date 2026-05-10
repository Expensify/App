import {use} from 'react';
import type {RefObject} from 'react';
import type {View} from 'react-native';
import composeEventHandlers from '@components/PopoverMenu/v2/composeEventHandlers';
import {ContentCloseContext} from '@components/PopoverMenu/v2/content/ContentContext';
import {useIsAtActiveLevel} from '@components/PopoverMenu/v2/sub/SubContext';
import useFocusableRow from './useFocusableRow';

const HOOK_NAME = 'useSelectableRow';

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
function useSelectableRow({onSelect, disabled = false, text}: {onSelect?: (event: ItemSelectEvent) => void; disabled?: boolean; text?: string} = {}): UseSelectableRowResult {
    const close = use(ContentCloseContext);
    if (close === null) {
        throw new Error(`${HOOK_NAME}() must be called inside <PopoverMenu.Content>.`);
    }
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
            const event = createSelectEvent();
            const handleSelect = composeEventHandlers<ItemSelectEvent>(onSelect, () => close());
            handleSelect(event);
        },
    });

    return {...row, isAtActiveLevel};
}

export default useSelectableRow;
export type {ItemSelectEvent, UseSelectableRowResult};

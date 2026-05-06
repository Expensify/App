import {useContentClose} from '@components/PopoverMenu/v2/content/ContentContext';
import {useIsAtActiveLevel} from '@components/PopoverMenu/v2/sub/SubContext';
import useFocusableRow from './useFocusableRow';
import type {FocusableRow} from './useFocusableRow';

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

type SelectableRow = FocusableRow & {isAtActiveLevel: boolean};

function useSelectableRow({componentName, onSelect, disabled}: {componentName: string; onSelect?: (event: ItemSelectEvent) => void; disabled: boolean}): SelectableRow {
    const close = useContentClose(componentName);
    const isAtActiveLevel = useIsAtActiveLevel(componentName);

    const row = useFocusableRow({
        componentName,
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
export type {ItemSelectEvent, SelectableRow};

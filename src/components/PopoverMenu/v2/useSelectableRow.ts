import {useContentActions} from './ContentContext';
import {useIsAtActiveLevel} from './SubContext';
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

/** Close-on-select wrapper around `useFocusableRow`; gated on `isAtActiveLevel`. */
function useSelectableRow({
    componentName,
    onSelect,
    disabled,
}: {
    /** Display name of the calling component, used to attribute hierarchy violations. */
    componentName: string;
    onSelect?: (event: ItemSelectEvent) => void;
    disabled: boolean;
}): SelectableRow {
    const {close} = useContentActions(componentName);
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
            // Atomically hides the popover and resets nav — same React batch, no derived-state listener.
            close();
        },
    });

    return {...row, isAtActiveLevel};
}

export default useSelectableRow;
export type {ItemSelectEvent, SelectableRow};

import type {AnchorRef} from './RootContext';
import useAnchorOpener from './useAnchorOpener';

type UseSecondaryInteractionTriggerResult = {
    ref: AnchorRef;
    /** Takes no arguments, so it stays assignable to any pressable's `onSecondaryInteraction` signature. */
    onSecondaryInteraction: () => void;
};

/** Long-press (native) / right-click (web) variant of `usePopoverTrigger`. Returns `{ref, onSecondaryInteraction}`. */
function useSecondaryInteractionTrigger(): UseSecondaryInteractionTriggerResult {
    const {ref, open} = useAnchorOpener('useSecondaryInteractionTrigger');
    return {ref, onSecondaryInteraction: open};
}

export default useSecondaryInteractionTrigger;
export type {UseSecondaryInteractionTriggerResult};

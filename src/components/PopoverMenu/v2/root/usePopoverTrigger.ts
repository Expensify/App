import type {AnchorRef} from './RootContext';
import useAnchorOpener from './useAnchorOpener';

type UsePopoverTriggerResult = {
    ref: AnchorRef;
    /** Takes no arguments, so it stays assignable to any pressable's `onPress` signature. */
    onPress: () => void;
};

/**
 * Returns `{ref, onPress}` to attach to any pressable so it opens the enclosing `<Root>`'s popover
 * and acts as its anchor. Hook rather than a `<Trigger>` slot because React Compiler rejects refs
 * passed through `cloneElement`; JSX `ref={ref}` attachment is the only compiler-clean path.
 */
function usePopoverTrigger(): UsePopoverTriggerResult {
    const {ref, open} = useAnchorOpener('usePopoverTrigger');
    return {ref, onPress: open};
}

export default usePopoverTrigger;
export type {UsePopoverTriggerResult};

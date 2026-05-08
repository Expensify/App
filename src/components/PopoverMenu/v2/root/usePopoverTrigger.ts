import type {AnchorRef} from './RootContext';
import useAnchorOpener from './useAnchorOpener';

type UsePopoverTriggerResult = {
    ref: AnchorRef;
    onPress: () => void;
};

/** Escape hatch from `<Trigger>` for non-`PressableWithFeedback` shapes; returns `{ref, onPress}` to attach to any pressable. */
function usePopoverTrigger(): UsePopoverTriggerResult {
    const {ref, open} = useAnchorOpener('usePopoverTrigger');
    return {ref, onPress: open};
}

export default usePopoverTrigger;
export type {UsePopoverTriggerResult};

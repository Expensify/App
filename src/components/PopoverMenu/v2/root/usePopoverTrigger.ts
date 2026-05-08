import type {AnchorRef} from './RootContext';
import useAnchorOpener from './useAnchorOpener';

type UsePopoverTriggerResult = {
    ref: AnchorRef;
    onPress: () => void;
};

/** Hook rather than a `<Trigger>` slot — React Compiler rejects refs passed through `cloneElement`. */
function usePopoverTrigger(): UsePopoverTriggerResult {
    const {ref, open} = useAnchorOpener('usePopoverTrigger');
    return {ref, onPress: open};
}

export default usePopoverTrigger;
export type {UsePopoverTriggerResult};

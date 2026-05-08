import type {AnchorRef} from './RootContext';
import useAnchorOpener from './useAnchorOpener';

type UseSecondaryInteractionTriggerResult = {
    ref: AnchorRef;
    onSecondaryInteraction: () => void;
};

function useSecondaryInteractionTrigger(): UseSecondaryInteractionTriggerResult {
    const {ref, open} = useAnchorOpener('useSecondaryInteractionTrigger');
    return {ref, onSecondaryInteraction: open};
}

export default useSecondaryInteractionTrigger;
export type {UseSecondaryInteractionTriggerResult};

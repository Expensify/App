import useAnchoredOpener from '@components/Overlay/hooks/useAnchoredOpener';
import type {UseAnchoredOpenerResult} from '@components/Overlay/hooks/useAnchoredOpener';
import {useRoot} from './RootContext';

function useTrigger(callerName: string): UseAnchoredOpenerResult {
    const {actions} = useRoot(callerName);
    const {open, setActiveAnchor} = actions;
    return useAnchoredOpener({
        onOpen: (node, rect) => {
            setActiveAnchor({node, rect});
            open();
        },
    });
}

export default useTrigger;
export type {UseAnchoredOpenerResult as UseTriggerResult};

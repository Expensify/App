import {useRef} from 'react';
import type {AnchorRefCallback} from '@components/Overlay/hooks/useAnchoredOpener';
import type {AnchorNode} from '@components/Overlay/libs/measureAnchor';
import useCallbackRef from '@hooks/useCallbackRef';
import {usePopover} from './state';

type UseTriggerResult = {
    ref: AnchorRefCallback;
    open: () => void;
};

function useTrigger(): UseTriggerResult {
    const {actions} = usePopover('useTrigger');
    const {setTriggerAnchor, open: openDisclosure} = actions;
    const nodeRef = useRef<AnchorNode | null>(null);

    const ref: AnchorRefCallback = useCallbackRef((instance) => {
        const node = instance ?? null;
        nodeRef.current = node;
        setTriggerAnchor(node);
    });

    const open = useCallbackRef(() => {
        if (!nodeRef.current) {
            return;
        }
        openDisclosure();
    });

    return {ref, open};
}

export default useTrigger;
export type {UseTriggerResult};

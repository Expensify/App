import {useRef, useState} from 'react';
import measureAnchor from '@components/Overlay/libs/measureAnchor';
import type {AnchorNode, AnchorRect} from '@components/Overlay/libs/measureAnchor';
import useCallbackRef from '@hooks/useCallbackRef';

type AnchorRefCallback = (instance: AnchorNode | null | undefined) => void;

type UseAnchoredOpenerInput = {
    onOpen: (node: AnchorNode, rect: AnchorRect) => void;
};

type UseAnchoredOpenerResult = {
    ref: AnchorRefCallback;
    open: () => void;
};

function useAnchoredOpener({onOpen}: UseAnchoredOpenerInput): UseAnchoredOpenerResult {
    const nodeRef = useRef<AnchorNode | null>(null);
    const onOpenStable = useCallbackRef(onOpen);
    const [stable] = useState<UseAnchoredOpenerResult>(() => ({
        ref: (instance) => {
            nodeRef.current = instance ?? null;
        },
        open: () => {
            const node = nodeRef.current;
            if (!node) {
                return;
            }
            measureAnchor(node).then(
                (rect) => {
                    if (!rect || nodeRef.current !== node) {
                        return;
                    }
                    onOpenStable(node, rect);
                },
                () => {},
            );
        },
    }));
    return stable;
}

export default useAnchoredOpener;
export type {AnchorRefCallback, UseAnchoredOpenerInput, UseAnchoredOpenerResult};

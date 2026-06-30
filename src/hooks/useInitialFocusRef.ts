import {useState} from 'react';
import isHTMLElement from '@libs/isHTMLElement';
import useScreenInitialFocus from './useScreenInitialFocus';
import type {UseScreenInitialFocusOptions} from './useScreenInitialFocus/types';

/** Returns a ref-callback for the element that should claim focus once its screen has mounted. Late attachment re-triggers the claim. */
function useInitialFocusRef(options?: UseScreenInitialFocusOptions): (node: unknown) => void {
    const [node, setNode] = useState<HTMLElement | null>(null);
    useScreenInitialFocus(node, options);
    return (newNode: unknown) => {
        const next = isHTMLElement(newNode) ? newNode : null;
        setNode((prev) => (prev === next ? prev : next));
    };
}

export default useInitialFocusRef;

import isHTMLElement from '@libs/isHTMLElement';

import {useRef, useState} from 'react';

import type {UseScreenInitialFocusOptions} from './useScreenInitialFocus/types';

import useScreenInitialFocus from './useScreenInitialFocus';

/** Returns a ref-callback for the element that should claim focus once its screen has mounted. Late attachment re-triggers the claim. */
function useInitialFocusRef(options?: UseScreenInitialFocusOptions): (node: unknown) => void {
    const [node, setNode] = useState<HTMLElement | null>(null);
    useScreenInitialFocus(node, options);
    const refCallback = useRef((newNode: unknown) => {
        const next = isHTMLElement(newNode) ? newNode : null;
        setNode((prev) => (prev === next ? prev : next));
    }).current;
    return refCallback;
}

export default useInitialFocusRef;

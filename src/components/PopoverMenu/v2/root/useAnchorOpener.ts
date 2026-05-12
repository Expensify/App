import {useRef} from 'react';
import type {View} from 'react-native';
import useAssertedContext from '@hooks/useAssertedContext';
import Log from '@libs/Log';
import {RootActionsContext} from './RootContext';
import type {AnchorRect, AnchorRef} from './RootContext';

type UseAnchorOpenerResult = {
    ref: AnchorRef;
    open: (overrideRect?: AnchorRect) => void;
};

function useAnchorOpener(callerName: string): UseAnchorOpenerResult {
    const {setIsVisible, setActiveAnchor} = useAssertedContext(RootActionsContext, callerName, '<PopoverMenu.Root>');
    const ownRef: AnchorRef = useRef<View | null>(null);

    const open = (overrideRect?: AnchorRect) => {
        if (overrideRect) {
            setActiveAnchor({ref: ownRef, rect: overrideRect});
            setIsVisible(true);
            return;
        }
        const node = ownRef.current;
        if (!node) {
            if (__DEV__) {
                Log.warn(`[${callerName}] press fired but the slotted child did not attach the anchor ref — did the child component forward \`ref\`?`);
            }
            return;
        }
        const {x, y, width, height} = node.getBoundingClientRect();
        setActiveAnchor({ref: ownRef, rect: {x, y, width, height}});
        setIsVisible(true);
    };

    return {ref: ownRef, open};
}

export default useAnchorOpener;
export type {UseAnchorOpenerResult};

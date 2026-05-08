import {use, useRef} from 'react';
import type {View} from 'react-native';
import {RootActionsContext} from './RootContext';
import type {AnchorRef} from './RootContext';

type UseAnchorOpenerResult = {
    ref: AnchorRef;
    open: () => void;
};

function useAnchorOpener(callerName: string): UseAnchorOpenerResult {
    const actions = use(RootActionsContext);
    if (!actions) {
        throw new Error(`${callerName}() must be called inside <PopoverMenu.Root>.`);
    }
    const {setIsVisible, setActiveAnchor} = actions;
    const ownRef: AnchorRef = useRef<View | null>(null);

    const open = () => {
        const node = ownRef.current;
        if (!node) {
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

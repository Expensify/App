import {use, useRef} from 'react';
import type {View} from 'react-native';
import Log from '@libs/Log';
import {RootActionsContext} from './RootContext';
import type {AnchorRef} from './RootContext';

type UsePopoverTriggerResult = {
    ref: AnchorRef;
    /** Parameterless to stay assignable to any pressable's `onPress` signature. */
    onPress: () => void;
};

/**
 * Returns `{ref, onPress}` to attach to any pressable so it opens the enclosing `<Root>`'s popover
 * and acts as its anchor. Hook rather than a `<Trigger>` slot because React Compiler rejects refs
 * passed through `cloneElement`; JSX `ref={ref}` attachment is the only compiler-clean path.
 */
function usePopoverTrigger(): UsePopoverTriggerResult {
    const actions = use(RootActionsContext);
    if (!actions) {
        throw new Error('usePopoverTrigger() must be called inside <PopoverMenu.Root>.');
    }
    const {setIsVisible, setActiveAnchor} = actions;
    const ownRef: AnchorRef = useRef<View | null>(null);

    const onPress = () => {
        const node = ownRef.current;
        if (!node) {
            return;
        }
        // Fabric: sync `getBoundingClientRect`. Old Arch / Paper / test renderer: async `measureInWindow`.
        if (typeof node.getBoundingClientRect === 'function') {
            const {x, y, width, height} = node.getBoundingClientRect();
            setActiveAnchor({ref: ownRef, rect: {x, y, width, height}});
            setIsVisible(true);
            return;
        }
        if (typeof node.measureInWindow === 'function') {
            node.measureInWindow((x, y, width, height) => {
                setActiveAnchor({ref: ownRef, rect: {x, y, width, height}});
                setIsVisible(true);
            });
            return;
        }
        // Unreachable in real runtimes (Fabric, Paper, web all expose at least one).
        Log.warn('[usePopoverTrigger] anchor node exposes neither getBoundingClientRect nor measureInWindow');
    };

    return {ref: ownRef, onPress};
}

export default usePopoverTrigger;
export type {UsePopoverTriggerResult};

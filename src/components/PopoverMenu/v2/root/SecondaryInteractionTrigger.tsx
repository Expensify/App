import React, {Children, Fragment, isValidElement} from 'react';
import type {ReactElement, Ref} from 'react';
import type {AccessibilityState, GestureResponderEvent, View} from 'react-native';
import composeEventHandlers from '@components/PopoverMenu/v2/composeEventHandlers';
import mergeRefs from '@libs/mergeRefs';
import type {AnchorRect} from './RootContext';
import {useRootState} from './RootContext';
import useAnchorOpener from './useAnchorOpener';

type SecondaryInteractionHandler = (event: GestureResponderEvent | MouseEvent) => void;

/** Web right-click anchors at cursor (Radix `<ContextMenu>` parity); native long-press falls back to element rect. */
function getCursorRect(event: GestureResponderEvent | MouseEvent): AnchorRect | undefined {
    if ('pageX' in event && 'pageY' in event && typeof event.pageX === 'number' && typeof event.pageY === 'number') {
        return {x: event.pageX, y: event.pageY, width: 1, height: 1};
    }
    return undefined;
}

/** Minimum props a `<SecondaryInteractionTrigger>` child must support so the menu can attach an anchor ref and open on long-press / right-click. */
type SecondaryInteractionTriggerSlotProps = {
    ref?: Ref<View>;
    onSecondaryInteraction: SecondaryInteractionHandler;
    accessibilityState?: AccessibilityState;
    nativeID?: string;
    accessibilityControls?: string;
};

type SecondaryInteractionTriggerProps = {
    children: ReactElement<SecondaryInteractionTriggerSlotProps>;
};

/** Long-press (native) / right-click (web) variant of `<Trigger>`. Consumer can call `event.preventDefault()` to gate the open. */
function SecondaryInteractionTrigger({children}: SecondaryInteractionTriggerProps): React.ReactElement {
    const {ref, open} = useAnchorOpener(SecondaryInteractionTrigger.displayName);
    const {
        state: {isVisible},
        meta: {triggerID, contentID},
    } = useRootState(SecondaryInteractionTrigger.displayName);

    const onlyChild = Children.only(children);

    if (!isValidElement<SecondaryInteractionTriggerSlotProps>(onlyChild)) {
        throw new Error(`<${SecondaryInteractionTrigger.displayName}> must receive a single React element as its child (got a non-element node).`);
    }

    if (onlyChild.type === Fragment) {
        throw new Error(`<${SecondaryInteractionTrigger.displayName}> cannot wrap a Fragment; pass one pressable element (e.g. <PressableWithSecondaryInteraction>).`);
    }

    const handleSecondaryInteraction = composeEventHandlers<GestureResponderEvent | MouseEvent>(onlyChild.props.onSecondaryInteraction, (event) => {
        open(getCursorRect(event));
    });

    return React.cloneElement(onlyChild as React.ReactElement<Partial<SecondaryInteractionTriggerSlotProps>>, {
        ref: mergeRefs(ref, onlyChild.props.ref),
        onSecondaryInteraction: handleSecondaryInteraction,
        accessibilityState: {...onlyChild.props.accessibilityState, expanded: isVisible},
        nativeID: triggerID,
        accessibilityControls: isVisible ? contentID : undefined,
    });
}

SecondaryInteractionTrigger.displayName = 'PopoverMenu.SecondaryInteractionTrigger';

export default SecondaryInteractionTrigger;
export type {SecondaryInteractionTriggerProps, SecondaryInteractionTriggerSlotProps};

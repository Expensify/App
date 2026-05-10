import React, {Children, Fragment, isValidElement} from 'react';
import type {ReactElement, Ref} from 'react';
import type {AccessibilityState, GestureResponderEvent, View} from 'react-native';
import composeEventHandlers from '@components/PopoverMenu/v2/composeEventHandlers';
import mergeRefs from '@libs/mergeRefs';
import {useRootState} from './RootContext';
import useAnchorOpener from './useAnchorOpener';

type SecondaryInteractionHandler = (event: GestureResponderEvent | MouseEvent) => void;

/** Minimum props a `<SecondaryInteractionTrigger>` child must support so the menu can attach an anchor ref and open on long-press / right-click. */
type SecondaryInteractionTriggerSlotProps = {
    ref?: Ref<View>;
    onSecondaryInteraction: SecondaryInteractionHandler;
    accessibilityState?: AccessibilityState;
};

type SecondaryInteractionTriggerProps = {
    children: ReactElement<SecondaryInteractionTriggerSlotProps>;
};

/** Long-press (native) / right-click (web) variant of `<Trigger>`. Consumer can call `event.preventDefault()` to gate the open. */
function SecondaryInteractionTrigger({children}: SecondaryInteractionTriggerProps): React.ReactElement {
    const {ref, open} = useAnchorOpener(SecondaryInteractionTrigger.displayName);
    const {
        state: {isVisible},
    } = useRootState(SecondaryInteractionTrigger.displayName);

    const onlyChild = Children.only(children);

    if (!isValidElement<SecondaryInteractionTriggerSlotProps>(onlyChild)) {
        throw new Error(`<${SecondaryInteractionTrigger.displayName}> must receive a single React element as its child (got a non-element node).`);
    }

    if (onlyChild.type === Fragment) {
        throw new Error(`<${SecondaryInteractionTrigger.displayName}> cannot wrap a Fragment; pass one pressable element (e.g. <PressableWithSecondaryInteraction>).`);
    }

    const handleSecondaryInteraction = composeEventHandlers<GestureResponderEvent | MouseEvent>(onlyChild.props.onSecondaryInteraction, () => {
        open();
    });

    return React.cloneElement(onlyChild as React.ReactElement<Partial<SecondaryInteractionTriggerSlotProps>>, {
        ref: mergeRefs(ref, onlyChild.props.ref),
        onSecondaryInteraction: handleSecondaryInteraction,
        accessibilityState: {...onlyChild.props.accessibilityState, expanded: isVisible},
    });
}

SecondaryInteractionTrigger.displayName = 'PopoverMenu.SecondaryInteractionTrigger';

export default SecondaryInteractionTrigger;
export type {SecondaryInteractionTriggerProps, SecondaryInteractionTriggerSlotProps};

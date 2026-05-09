import React, {Children, Fragment, isValidElement} from 'react';
import type {ReactElement, Ref} from 'react';
import type {GestureResponderEvent, View} from 'react-native';
import mergeRefs from '@libs/mergeRefs';
import useAnchorOpener from './useAnchorOpener';

type SecondaryInteractionHandler = (event: GestureResponderEvent | MouseEvent) => void;

/** Minimum props a `<SecondaryInteractionTrigger>` child must support so the menu can attach an anchor ref and open on long-press / right-click. */
type SecondaryInteractionTriggerSlotProps = {
    ref?: Ref<View>;
    onSecondaryInteraction: SecondaryInteractionHandler;
};

type SecondaryInteractionTriggerProps = {
    children: ReactElement<SecondaryInteractionTriggerSlotProps>;
};

/** Long-press (native) / right-click (web) variant of `<Trigger>`. Consumer can call `event.preventDefault()` to gate the open. */
function SecondaryInteractionTrigger({children}: SecondaryInteractionTriggerProps): React.ReactElement {
    const {ref, open} = useAnchorOpener(SecondaryInteractionTrigger.displayName);

    const onlyChild = Children.only(children);

    if (!isValidElement<SecondaryInteractionTriggerSlotProps>(onlyChild)) {
        throw new Error(`<${SecondaryInteractionTrigger.displayName}> must receive a single React element as its child (got a non-element node).`);
    }

    if (onlyChild.type === Fragment) {
        throw new Error(`<${SecondaryInteractionTrigger.displayName}> cannot wrap a Fragment; pass one pressable element (e.g. <PressableWithSecondaryInteraction>).`);
    }

    const handleSecondaryInteraction: SecondaryInteractionHandler = (event) => {
        onlyChild.props.onSecondaryInteraction(event);
        if (event.defaultPrevented) {
            return;
        }
        open();
    };

    return React.cloneElement(onlyChild as React.ReactElement<Partial<SecondaryInteractionTriggerSlotProps>>, {
        ref: mergeRefs(ref, onlyChild.props.ref),
        onSecondaryInteraction: handleSecondaryInteraction,
    });
}

SecondaryInteractionTrigger.displayName = 'PopoverMenu.SecondaryInteractionTrigger';

export default SecondaryInteractionTrigger;
export type {SecondaryInteractionTriggerProps, SecondaryInteractionTriggerSlotProps};

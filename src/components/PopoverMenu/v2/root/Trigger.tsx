import React, {Children, Fragment, isValidElement} from 'react';
import type {ReactElement, Ref} from 'react';
import type {AccessibilityState, View} from 'react-native';
import composeEventHandlers from '@components/PopoverMenu/v2/composeEventHandlers';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import mergeRefs from '@libs/mergeRefs';
import {useRootState} from './RootContext';
import useAnchorOpener from './useAnchorOpener';

/** Minimum props a `<Trigger>` child must support so the menu can attach an anchor ref and open on press. */
type TriggerSlotProps = {
    ref?: Ref<View>;
    onPress: NonNullable<PressableProps['onPress']>;
    accessibilityState?: AccessibilityState;
    nativeID?: string;
    accessibilityControls?: string;
};

type TriggerProps = {
    children: ReactElement<TriggerSlotProps>;
};

/** Slot wrapper: clones its single child with a merged ref + composed `onPress` (consumer first, then open). Consumer can call `event.preventDefault()` to gate the open. */
function Trigger({children}: TriggerProps): React.ReactElement {
    const {ref, open} = useAnchorOpener(Trigger.displayName);
    const {
        state: {isVisible},
        meta: {triggerID, contentID},
    } = useRootState(Trigger.displayName);

    const onlyChild = Children.only(children);

    if (!isValidElement<TriggerSlotProps>(onlyChild)) {
        throw new Error(`<${Trigger.displayName}> must receive a single React element as its child (got a non-element node).`);
    }

    if (onlyChild.type === Fragment) {
        throw new Error(`<${Trigger.displayName}> cannot wrap a Fragment; pass one pressable element (e.g. <PressableWithFeedback>).`);
    }

    const handlePress = composeEventHandlers(onlyChild.props.onPress, () => {
        open();
    });

    return React.cloneElement(onlyChild as React.ReactElement<Partial<TriggerSlotProps>>, {
        ref: mergeRefs(ref, onlyChild.props.ref),
        onPress: handlePress,
        accessibilityState: {...onlyChild.props.accessibilityState, expanded: isVisible},
        nativeID: triggerID,
        accessibilityControls: isVisible ? contentID : undefined,
    });
}

Trigger.displayName = 'PopoverMenu.Trigger';

export default Trigger;
export type {TriggerProps, TriggerSlotProps};

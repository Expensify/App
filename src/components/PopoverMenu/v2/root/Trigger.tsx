import React, {Children, Fragment, isValidElement} from 'react';
import type {ReactElement, Ref} from 'react';
import type {View} from 'react-native';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import mergeRefs from '@libs/mergeRefs';
import useAnchorOpener from './useAnchorOpener';

/** Minimum props a `<Trigger>` child must support so the menu can attach an anchor ref and open on press. */
type TriggerSlotProps = {
    ref?: Ref<View>;
    onPress: NonNullable<PressableProps['onPress']>;
};

type TriggerProps = {
    children: ReactElement<TriggerSlotProps>;
};

/** Slot wrapper: clones its single child with a merged ref + composed `onPress` (consumer first, then open). Consumer can call `event.preventDefault()` to gate the open. */
function Trigger({children}: TriggerProps): React.ReactElement {
    const {ref, open} = useAnchorOpener(Trigger.displayName);

    const onlyChild = Children.only(children);

    if (!isValidElement<TriggerSlotProps>(onlyChild)) {
        throw new Error(`<${Trigger.displayName}> must receive a single React element as its child (got a non-element node).`);
    }

    if (onlyChild.type === Fragment) {
        throw new Error(`<${Trigger.displayName}> cannot wrap a Fragment; pass one pressable element (e.g. <PressableWithFeedback>).`);
    }

    const handlePress: NonNullable<PressableProps['onPress']> = (event) => {
        onlyChild.props.onPress?.(event);
        if (event?.defaultPrevented) {
            return;
        }
        open();
    };

    return React.cloneElement(onlyChild as React.ReactElement<Partial<PressableProps>>, {
        ref: mergeRefs(ref, onlyChild.props.ref) as PressableProps['ref'],
        onPress: handlePress,
    });
}

Trigger.displayName = 'PopoverMenu.Trigger';

export default Trigger;
export type {TriggerProps, TriggerSlotProps};

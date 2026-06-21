import React, {useRef} from 'react';
import type {ReactNode} from 'react';
import type {GestureResponderEvent} from 'react-native';
import type {AnchorRefCallback} from '@components/Overlay/hooks/useAnchoredOpener';
import measureAnchor from '@components/Overlay/libs/measureAnchor';
import type {AnchorNode} from '@components/Overlay/libs/measureAnchor';
import {PressResponder} from '@components/Pressable/PressResponder';
import useCallbackRef from '@hooks/useCallbackRef';
import CONST from '@src/CONST';
import {useRoot} from './RootContext';

type InteractionMode = 'primary' | 'secondary';

type TriggerProps = {
    children: ReactNode;
    interaction?: InteractionMode;
};

function Trigger({children, interaction = 'primary'}: TriggerProps): React.ReactElement {
    const {state, actions, meta} = useRoot(Trigger.displayName);
    const {isOpen} = state;
    const {open, close, setActiveAnchor} = actions;
    const {triggerID, contentID} = meta;

    const nodeRef = useRef<AnchorNode | null>(null);

    const refCallback: AnchorRefCallback = useCallbackRef((instance) => {
        nodeRef.current = instance ?? null;
    });

    const openWithMeasuredRect = useCallbackRef(() => {
        const node = nodeRef.current;
        if (!node) {
            return;
        }
        measureAnchor(node)
            .then((rect) => {
                if (!rect) {
                    return;
                }
                setActiveAnchor({node, rect});
                open();
            })
            .catch(() => undefined);
    });

    const onPress = useCallbackRef((event: GestureResponderEvent | KeyboardEvent | undefined) => {
        if (event?.defaultPrevented) {
            return;
        }
        if (isOpen) {
            close();
            return;
        }
        openWithMeasuredRect();
    });

    const onSecondaryInteraction = useCallbackRef((event: GestureResponderEvent | MouseEvent) => {
        const node = nodeRef.current;
        if (!node) {
            return;
        }
        if (typeof MouseEvent !== 'undefined' && event instanceof MouseEvent) {
            const {clientX, clientY} = event;
            setActiveAnchor({node, rect: {top: clientY, bottom: clientY + 1, left: clientX, right: clientX + 1, width: 1, height: 1}});
            open();
            return;
        }
        openWithMeasuredRect();
    });

    return (
        <PressResponder
            ref={refCallback}
            onPress={interaction === 'primary' ? onPress : undefined}
            onSecondaryInteraction={interaction === 'secondary' ? onSecondaryInteraction : undefined}
            accessibilityState={{expanded: isOpen}}
            accessibilityHasPopup={CONST.ROLE.MENU}
            nativeID={triggerID}
            accessibilityControls={contentID}
        >
            {children}
        </PressResponder>
    );
}

Trigger.displayName = 'PopoverMenu.Trigger';

export default Trigger;
export type {InteractionMode, TriggerProps};

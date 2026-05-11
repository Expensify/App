import React from 'react';
import type {ReactNode} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {PressResponder} from '@components/Pressable/PressResponder';
import CONST from '@src/CONST';
import type {AnchorRect} from './RootContext';
import {useRootMeta, useRootVisibility} from './RootContext';
import useAnchorOpener from './useAnchorOpener';

/** Web right-click anchors at cursor (Radix `<ContextMenu>` parity); native long-press falls back to element rect. */
function getCursorRect(event: GestureResponderEvent | MouseEvent): AnchorRect | undefined {
    if ('pageX' in event && 'pageY' in event && typeof event.pageX === 'number' && typeof event.pageY === 'number') {
        return {x: event.pageX, y: event.pageY, width: 1, height: 1};
    }
    return undefined;
}

type SecondaryInteractionTriggerProps = {
    children: ReactNode;
};

/** Long-press (native) / right-click (web) variant of `<Trigger>`. */
function SecondaryInteractionTrigger({children}: SecondaryInteractionTriggerProps): React.ReactElement {
    const {ref, open} = useAnchorOpener(SecondaryInteractionTrigger.displayName);
    const {isVisible} = useRootVisibility(SecondaryInteractionTrigger.displayName);
    const {triggerID, contentID} = useRootMeta(SecondaryInteractionTrigger.displayName);

    return (
        <PressResponder
            ref={ref}
            onSecondaryInteraction={(event) => {
                if (event?.defaultPrevented) {
                    return;
                }
                open(getCursorRect(event));
            }}
            accessibilityState={{expanded: isVisible}}
            accessibilityHasPopup={CONST.ROLE.MENU}
            nativeID={triggerID}
            accessibilityControls={isVisible ? contentID : undefined}
        >
            {children}
        </PressResponder>
    );
}

SecondaryInteractionTrigger.displayName = 'PopoverMenu.SecondaryInteractionTrigger';

export default SecondaryInteractionTrigger;
export type {SecondaryInteractionTriggerProps};

import React from 'react';
import type {ReactNode} from 'react';
import {PressResponder} from '@components/Pressable/PressResponder';
import CONST from '@src/CONST';
import {useRootMeta, useRootVisibility} from './RootContext';
import useAnchorOpener from './useAnchorOpener';

type TriggerProps = {
    children: ReactNode;
};

/** Consumer's `onPress` can call `event.preventDefault()` to gate the open (mirrors `<Item onSelect>`'s keep-open contract). */
function Trigger({children}: TriggerProps): React.ReactElement {
    const {ref, open} = useAnchorOpener(Trigger.displayName);
    const {isVisible} = useRootVisibility(Trigger.displayName);
    const {triggerID, contentID} = useRootMeta(Trigger.displayName);

    return (
        <PressResponder
            ref={ref}
            onPress={(event) => {
                if (event?.defaultPrevented) {
                    return;
                }
                open();
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

Trigger.displayName = 'PopoverMenu.Trigger';

export default Trigger;
export type {TriggerProps};

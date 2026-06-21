import React from 'react';
import type {ReactNode} from 'react';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import CONST from '@src/CONST';
import {usePopover} from './state';
import type {PopoverContentRole} from './state';
import useTrigger from './useTrigger';

type TriggerProps = {accessibilityLabel: string; sentryLabel: string; children: ReactNode};

function toAccessibilityHasPopup(role: PopoverContentRole | null) {
    if (role === 'menu') {
        return CONST.ROLE.MENU;
    }
    return CONST.ROLE.DIALOG;
}

function Trigger({accessibilityLabel, sentryLabel, children}: TriggerProps) {
    const {ref, open} = useTrigger();
    const {state, meta} = usePopover('<Popover.Trigger>');
    const {isOpen, contentRole} = state;
    const {triggerID, contentID} = meta;
    return (
        <PressableWithFeedback
            ref={ref}
            nativeID={triggerID}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={CONST.ROLE.BUTTON}
            accessibilityState={{expanded: isOpen}}
            accessibilityHasPopup={toAccessibilityHasPopup(contentRole)}
            accessibilityControls={contentID}
            sentryLabel={sentryLabel}
            onPress={open}
        >
            {children}
        </PressableWithFeedback>
    );
}

export default Trigger;
export type {TriggerProps as PopoverTriggerProps};

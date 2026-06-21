import React from 'react';
import type {ReactNode} from 'react';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import CONST from '@src/CONST';
import {useModal} from './state';

type TriggerProps = {accessibilityLabel: string; sentryLabel: string; children: ReactNode};

function Trigger({accessibilityLabel, sentryLabel, children}: TriggerProps) {
    const modal = useModal('<Modal.Trigger>');
    const {isOpen} = modal.state;
    const {open} = modal.actions;
    const {triggerID, contentID} = modal.meta;
    return (
        <PressableWithFeedback
            nativeID={triggerID}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={CONST.ROLE.BUTTON}
            accessibilityState={{expanded: isOpen}}
            accessibilityHasPopup={CONST.ROLE.DIALOG}
            accessibilityControls={contentID}
            sentryLabel={sentryLabel}
            onPress={open}
        >
            {children}
        </PressableWithFeedback>
    );
}

export default Trigger;
export type {TriggerProps as ModalTriggerProps};

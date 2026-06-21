import React from 'react';
import type {ReactNode} from 'react';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import CONST from '@src/CONST';
import {usePopover} from './state';

type CloseProps = {accessibilityLabel: string; sentryLabel: string; children: ReactNode};

function Close({accessibilityLabel, sentryLabel, children}: CloseProps) {
    const {actions} = usePopover('<Popover.Close>');
    const {close} = actions;
    return (
        <PressableWithFeedback
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={CONST.ROLE.BUTTON}
            sentryLabel={sentryLabel}
            onPress={close}
        >
            {children}
        </PressableWithFeedback>
    );
}

export default Close;
export type {CloseProps as PopoverCloseProps};

import React from 'react';
import type {ReactNode} from 'react';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import CONST from '@src/CONST';
import {useModal} from './state';

type CloseProps = {accessibilityLabel: string; sentryLabel: string; children: ReactNode};

function Close({accessibilityLabel, sentryLabel, children}: CloseProps) {
    const {close} = useModal('<Modal.Close>').actions;
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
export type {CloseProps as ModalCloseProps};

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';

import React from 'react';

import type BaseModalProps from './types';

import BaseModal from './BaseModal';

function Modal({children, ...rest}: BaseModalProps) {
    const {isInNarrowPaneModal} = useResponsiveLayout();
    const animationInTiming = rest.animationInTiming ?? (isInNarrowPaneModal ? CONST.MODAL.ANIMATION_TIMING.DEFAULT_RIGHT_DOCKED_IOS_IN : undefined);
    const animationOutTiming = rest.animationOutTiming ?? (isInNarrowPaneModal ? CONST.MODAL.ANIMATION_TIMING.DEFAULT_RIGHT_DOCKED_IOS_OUT : undefined);

    return (
        <BaseModal
            {...rest}
            animationInTiming={animationInTiming}
            animationOutTiming={animationOutTiming}
        >
            {children}
        </BaseModal>
    );
}

export default Modal;

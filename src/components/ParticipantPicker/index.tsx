import Modal from '@components/Modal';

import CONST from '@src/CONST';

import React from 'react';

import type {ParticipantPickerProps} from './types';

import BaseParticipantPicker from './BaseParticipantPicker';

/**
 * On web/Android the picker is presented as a self-animating RIGHT_DOCKED react-native-modal. It must stay mounted while
 * hidden so it can animate out and fire `onModalHide`, so visibility is driven by the `isVisible` prop rather than by
 * conditionally mounting the component.
 */
function ParticipantPicker(props: ParticipantPickerProps) {
    const {isVisible = true, onClose, onBackdropPress} = props;

    if (!onClose) {
        return <BaseParticipantPicker {...props} />;
    }

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={onClose}
            onBackdropPress={onBackdropPress}
            onModalHide={onClose}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <BaseParticipantPicker {...props} />
        </Modal>
    );
}

ParticipantPicker.displayName = 'ParticipantPicker';

export default ParticipantPicker;

import React, {useRef} from 'react';
import {AppState} from 'react-native';
import withWindowDimensions from '@components/withWindowDimensions';
import CONST from '@src/CONST';
import BaseModal from './BaseModal';
import type BaseModalProps from './types';
import type {ModalRef} from './types';

// Only want to use useNativeDriver on Android. It has strange flashes issue on IOS
// https://github.com/react-native-modal/react-native-modal#the-modal-flashes-in-a-weird-way-when-animating
function Modal({useNativeDriver = true, restoreFocusType, onModalHide, ...rest}: BaseModalProps) {
    const modalRef = useRef<ModalRef>(null);
    const hideModal = () => {
        onModalHide?.();
        if (restoreFocusType && restoreFocusType !== CONST.MODAL.RESTORE_FOCUS_TYPE.DEFAULT) {
            modalRef?.current?.removePromise();
            return;
        }
        const listener = AppState.addEventListener('focus', () => {
            // TODO:del
            console.debug('android is ready to focus');
            listener.remove();
            modalRef?.current?.setReadyToFocus();
        });
    };

    return (
        <BaseModal
            useNativeDriver={useNativeDriver}
            onModalHide={hideModal}
            restoreFocusType={restoreFocusType}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            ref={modalRef}
        >
            {rest.children}
        </BaseModal>
    );
}

Modal.displayName = 'Modal';
export default withWindowDimensions(Modal);

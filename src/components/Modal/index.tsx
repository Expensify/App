import React, {useEffect, useRef, useState} from 'react';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import StatusBar from '@libs/StatusBar';
import CONST from '@src/CONST';
import BaseModal from './BaseModal';
import type BaseModalProps from './types';
import type {WindowState} from './types';

function Modal({fullscreen = true, onModalHide = () => {}, type, onModalShow = () => {}, children, shouldHandleNavigationBack, ...rest}: BaseModalProps) {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const [previousStatusBarColor, setPreviousStatusBarColor] = useState<string>();

    const setStatusBarColor = (color = theme.appBG) => {
        if (!fullscreen) {
            return;
        }

        StatusBar.setBackgroundColor(color);
    };

    const hideModal = () => {
        onModalHide();
        if ((window.history.state as WindowState)?.shouldGoBack && shouldHandleNavigationBack) {
            window.history.back();
        }
    };

    const handlePopStateRef = useRef(() => {
        rest.onClose?.();
    });

    const showModal = () => {
        if (shouldHandleNavigationBack) {
            window.history.pushState({shouldGoBack: true}, '', null);
            window.addEventListener('popstate', handlePopStateRef.current);
        }
        onModalShow?.();
    };

    useEffect(
        () => () => {
            window.removeEventListener('popstate', handlePopStateRef.current);
        },
        [],
    );

    const onModalWillShow = () => {
        const statusBarColor = StatusBar.getBackgroundColor() ?? theme.appBG;

        const isFullScreenModal =
            type === CONST.MODAL.MODAL_TYPE.CENTERED ||
            type === CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE ||
            type === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED ||
            type === CONST.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT;

        if (statusBarColor) {
            setPreviousStatusBarColor(statusBarColor);
            // If it is a full screen modal then match it with appBG, otherwise we use the backdrop color
            setStatusBarColor(isFullScreenModal ? theme.appBG : StyleUtils.getThemeBackgroundColor(statusBarColor));
        }
        rest.onModalWillShow?.();
    };

    const onModalWillHide = () => {
        setStatusBarColor(previousStatusBarColor);
        rest.onModalWillHide?.();
    };

    return (
        <BaseModal
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            onModalHide={hideModal}
            onModalShow={showModal}
            onModalWillShow={onModalWillShow}
            onModalWillHide={onModalWillHide}
            avoidKeyboard={false}
            fullscreen={fullscreen}
            useNativeDriver={false}
            useNativeDriverForBackdrop={false}
            type={type}
        >
            {children}
        </BaseModal>
    );
}

Modal.displayName = 'Modal';
export default Modal;

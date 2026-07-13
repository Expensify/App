import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';

import StatusBar from '@libs/StatusBar';

import CONST from '@src/CONST';

import React, {useState} from 'react';

import type BaseModalProps from './types';

import BaseModal from './BaseModal';
import useSyncModalWithHistory from './useSyncModalWithHistory';

type WebModalAnimation = Pick<BaseModalProps, 'animationIn' | 'animationOut' | 'animationInTiming' | 'animationOutTiming'>;

const CENTERED_MODAL_TYPES = new Set<BaseModalProps['type']>([
    CONST.MODAL.MODAL_TYPE.CONFIRM,
    CONST.MODAL.MODAL_TYPE.CENTERED,
    CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE,
    CONST.MODAL.MODAL_TYPE.CENTERED_SMALL,
    CONST.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT,
]);

// Faster timing and slide-and-fade are desktop-only; narrow web keeps the full-slide baseline at the original 300/200 timing.
function getWebModalAnimation(type: BaseModalProps['type'], isSmallScreenWidth: boolean): WebModalAnimation {
    const isRightDocked = type === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED;
    const isCentered = CENTERED_MODAL_TYPES.has(type);
    if (!isRightDocked && !isCentered) {
        return {};
    }
    const isFadeOnlyCentered = type === CONST.MODAL.MODAL_TYPE.CONFIRM || type === CONST.MODAL.MODAL_TYPE.CENTERED_SMALL;
    if (isSmallScreenWidth && !isFadeOnlyCentered) {
        return {
            animationInTiming: CONST.MODAL.ANIMATION_TIMING.NARROW_SLIDE_DURATION_IN_WEB,
            animationOutTiming: CONST.MODAL.ANIMATION_TIMING.NARROW_SLIDE_DURATION_OUT_WEB,
        };
    }
    if (isRightDocked) {
        return {
            animationIn: 'slideAndFadeInRight',
            animationOut: 'slideAndFadeOutRight',
            animationInTiming: CONST.MODAL.ANIMATION_TIMING.RHP_DURATION_IN_WEB,
            animationOutTiming: CONST.MODAL.ANIMATION_TIMING.RHP_DURATION_OUT_WEB,
        };
    }
    return {
        animationInTiming: CONST.MODAL.ANIMATION_TIMING.CENTERED_DURATION_IN_WEB,
        animationOutTiming: CONST.MODAL.ANIMATION_TIMING.CENTERED_DURATION_OUT_WEB,
    };
}

function Modal({fullscreen = true, onModalHide = () => {}, type, onModalShow = () => {}, children, shouldHandleNavigationBack, ...rest}: BaseModalProps) {
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    // We gate the web animation on raw screen width (desktop vs mobile web) rather than shouldUseNarrowLayout,
    // because a modal opened on top of an RHP on desktop must keep its desktop animation, not the narrow one.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [previousStatusBarColor, setPreviousStatusBarColor] = useState<string>();

    const webAnimation = getWebModalAnimation(type, isSmallScreenWidth);

    const setStatusBarColor = (color = theme.appBG) => {
        if (!fullscreen) {
            return;
        }

        StatusBar.setBackgroundColor(color);
    };

    // Back closes the modal (and forward navigation doesn't strand a phantom entry).
    useSyncModalWithHistory({isVisible: rest.isVisible, shouldHandleNavigationBack, onClose: rest.onClose});

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
            {...rest}
            animationIn={rest.animationIn ?? webAnimation.animationIn}
            animationOut={rest.animationOut ?? webAnimation.animationOut}
            animationInTiming={rest.animationInTiming ?? webAnimation.animationInTiming}
            animationOutTiming={rest.animationOutTiming ?? webAnimation.animationOutTiming}
            onModalHide={onModalHide}
            onModalShow={onModalShow}
            onModalWillShow={onModalWillShow}
            onModalWillHide={onModalWillHide}
            avoidKeyboard={false}
            fullscreen={fullscreen}
            type={type}
        >
            {children}
        </BaseModal>
    );
}

export default Modal;

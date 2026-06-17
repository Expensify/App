import React, {useCallback, useEffect, useRef, useState} from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import StatusBar from '@libs/StatusBar';
import CONST from '@src/CONST';
import BaseModal from './BaseModal';
import {withInternalPopstate} from './internalPopstateGuard';
import type BaseModalProps from './types';
import type {WindowState} from './types';

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

    const handlePopStateRef = useRef(() => {
        rest.onClose?.();
    });

    // This useEffect is needed so that when the onClose function changes, the ref contains the current value of this function.
    // More information can be found here: https://github.com/Expensify/App/issues/69781
    useEffect(() => {
        handlePopStateRef.current = () => {
            rest.onClose?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rest.onClose]);

    // We use a stable callback here to avoid issues with stale closures in event listeners.
    // If we directly passed `handlePopStateRef.current` to addEventListener, the listener would
    // capture the value of `onClose` at the time it was registered and would not update when
    // `onClose` changes. By wrapping it in a stable useCallback and referencing
    // handlePopStateRef.current inside, we ensure that the listener always calls the latest
    // version of `onClose` without needing to reattach the event listener.
    const handlePopState = useCallback(() => {
        handlePopStateRef.current();
    }, []);

    const hideModal = () => {
        window.removeEventListener('popstate', handlePopState);
        if ((window.history.state as WindowState)?.shouldGoBack && shouldHandleNavigationBack) {
            onModalHide();
            // Defer history.back() so it runs after any pending navigation
            // callbacks (from onModalDidClose) have pushed their history entries.
            // This prevents the popstate from undoing navigations triggered by
            // menu item selection callbacks.
            setTimeout(() => {
                if (!(window.history.state as WindowState)?.shouldGoBack) {
                    return;
                }
                withInternalPopstate(() => window.history.back());
            }, 0);
        } else {
            onModalHide();
        }
    };

    const showModal = () => {
        if (shouldHandleNavigationBack) {
            // Preserve React Navigation's state in the guard entry so that if
            // popstate fires for this entry, RN recognizes the current route
            // and does not perform an unexpected back navigation.
            const currentState = (window.history.state ?? {}) as WindowState;
            window.history.pushState({...currentState, shouldGoBack: true}, '', null);
            window.addEventListener('popstate', handlePopState);
        }
        onModalShow?.();
    };

    useEffect(
        () => () => {
            window.removeEventListener('popstate', handlePopState);
        },
        [handlePopState],
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
            {...rest}
            animationIn={rest.animationIn ?? webAnimation.animationIn}
            animationOut={rest.animationOut ?? webAnimation.animationOut}
            animationInTiming={rest.animationInTiming ?? webAnimation.animationInTiming}
            animationOutTiming={rest.animationOutTiming ?? webAnimation.animationOutTiming}
            onModalHide={hideModal}
            onModalShow={showModal}
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

import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import Modal from '@components/Modal';
import ScreenWrapperContainer from '@components/ScreenWrapper/ScreenWrapperContainer';
import SearchRouter from '@components/Search/SearchRouter/SearchRouter';
import {useSearchRouterActions, useSearchRouterState} from '@components/Search/SearchRouter/SearchRouterContext';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {isMobileIOS} from '@libs/Browser';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import React, {useEffect, useRef, useState} from 'react';
import {Dimensions} from 'react-native';

const isMobileWebIOS = isMobileIOS();

function SearchRouterModal() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isSearchRouterDisplayed} = useSearchRouterState();
    const {closeSearchRouter} = useSearchRouterActions();
    const actionAfterModalHideRef = useRef<() => void>(undefined);

    // On mWeb Safari, the input caret stuck for a moment while the modal is animating. So, we hide the caret until the animation is done.
    const [shouldHideInputCaret, setShouldHideInputCaret] = useState(isMobileWebIOS);

    useEffect(() => {
        if (!isSearchRouterDisplayed || shouldUseNarrowLayout) {
            return;
        }

        const subscription = Dimensions.addEventListener('change', () => closeSearchRouter());

        return () => {
            subscription.remove();
        };
    }, [isSearchRouterDisplayed, closeSearchRouter, shouldUseNarrowLayout]);

    const modalType = shouldUseNarrowLayout ? CONST.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT : CONST.MODAL.MODAL_TYPE.POPOVER;
    const closeSearchRouterAfterModalHide = (afterClose?: () => void) => {
        if (!isSearchRouterDisplayed) {
            afterClose?.();
            return;
        }

        actionAfterModalHideRef.current = afterClose;
        closeSearchRouter();
    };

    const handleModalHide = () => {
        setShouldHideInputCaret(isMobileWebIOS);
        actionAfterModalHideRef.current?.();
        actionAfterModalHideRef.current = undefined;
    };

    return (
        <Modal
            type={modalType}
            isVisible={isSearchRouterDisplayed}
            // Wide layout: horizontally center the popover and offset it from the top of the screen.
            popoverAnchorPosition={shouldUseNarrowLayout ? {right: 6, top: 6} : {left: 0, right: 0, top: variables.searchRouterPopoverTopOffset}}
            fullscreen
            swipeDirection={shouldUseNarrowLayout ? CONST.SWIPE_DIRECTION.RIGHT : undefined}
            onClose={closeSearchRouter}
            onModalHide={handleModalHide}
            onModalShow={() => setShouldHideInputCaret(false)}
            shouldApplySidePanelOffset={!shouldUseNarrowLayout}
            // Wide layout: layer a wider/lighter shadow behind the centered popover for extra separation from the background.
            innerContainerStyle={shouldUseNarrowLayout ? undefined : styles.searchRouterPopoverShadow}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <ScreenWrapperContainer
                testID="SearchRouterModal"
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
                includePaddingTop={false}
            >
                <FocusTrapForModal active={isSearchRouterDisplayed}>
                    <SearchRouter
                        onRouterClose={closeSearchRouterAfterModalHide}
                        shouldHideInputCaret={shouldHideInputCaret}
                        isSearchRouterDisplayed={isSearchRouterDisplayed}
                    />
                </FocusTrapForModal>
            </ScreenWrapperContainer>
        </Modal>
    );
}

export default SearchRouterModal;

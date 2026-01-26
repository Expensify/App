import React, {useEffect, useState} from 'react';
import {Dimensions} from 'react-native';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import Modal from '@components/Modal';
import ScreenWrapperContainer from '@components/ScreenWrapper/ScreenWrapperContainer';
import SearchRouter from '@components/Search/SearchRouter/SearchRouter';
import {useSearchRouterContext} from '@components/Search/SearchRouter/SearchRouterContext';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import {isMobileIOS} from '@libs/Browser';
import CONST from '@src/CONST';
import SearchRouter from './SearchRouter';
import {useSearchRouterActions, useSearchRouterState} from './SearchRouterContext';

const isMobileWebIOS = isMobileIOS();

function SearchRouterModal() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isSearchRouterDisplayed} = useSearchRouterState();
    const {closeSearchRouter} = useSearchRouterActions();
    const viewportOffsetTop = useViewportOffsetTop();

    // On mWeb Safari, the input caret stuck for a moment while the modal is animating. So, we hide the caret until the animation is done.
    const [shouldHideInputCaret, setShouldHideInputCaret] = useState(isMobileWebIOS);

    useEffect(() => {
        if (!isSearchRouterDisplayed || shouldUseNarrowLayout) {
            return;
        }

        const subscription = Dimensions.addEventListener('change', closeSearchRouter);

        return () => {
            subscription.remove();
        };
    }, [isSearchRouterDisplayed, closeSearchRouter, shouldUseNarrowLayout]);

    const modalType = shouldUseNarrowLayout ? CONST.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT : CONST.MODAL.MODAL_TYPE.POPOVER;
    return (
        <Modal
            type={modalType}
            isVisible={isSearchRouterDisplayed}
            innerContainerStyle={{paddingTop: viewportOffsetTop}}
            popoverAnchorPosition={{right: 6, top: 6}}
            fullscreen
            swipeDirection={shouldUseNarrowLayout ? CONST.SWIPE_DIRECTION.RIGHT : undefined}
            onClose={closeSearchRouter}
            onModalHide={() => setShouldHideInputCaret(isMobileWebIOS)}
            onModalShow={() => setShouldHideInputCaret(false)}
            shouldApplySidePanelOffset={!shouldUseNarrowLayout}
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
                        onRouterClose={closeSearchRouter}
                        shouldHideInputCaret={shouldHideInputCaret}
                        isSearchRouterDisplayed={isSearchRouterDisplayed}
                    />
                </FocusTrapForModal>
            </ScreenWrapperContainer>
        </Modal>
    );
}

export default SearchRouterModal;

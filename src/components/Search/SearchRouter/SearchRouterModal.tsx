import React, {useState} from 'react';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import Modal from '@components/Modal';
import ScreenWrapperContainer from '@components/ScreenWrapper/ScreenWrapperContainer';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import {isMobileIOS} from '@libs/Browser';
import CONST from '@src/CONST';
import SearchRouter from './SearchRouter';
import {useSearchRouterContext} from './SearchRouterContext';

const isMobileWebIOS = isMobileIOS();

function SearchRouterModal() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isSearchRouterDisplayed, closeSearchRouter} = useSearchRouterContext();
    const viewportOffsetTop = useViewportOffsetTop();

    // On mWeb Safari, the input caret stuck for a moment while the modal is animating. So, we hide the caret until the animation is done.
    const [shouldHideInputCaret, setShouldHideInputCaret] = useState(isMobileWebIOS);

    const modalType = shouldUseNarrowLayout ? CONST.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT : CONST.MODAL.MODAL_TYPE.POPOVER;

    return (
        <Modal
            type={modalType}
            isVisible={isSearchRouterDisplayed}
            innerContainerStyle={{paddingTop: viewportOffsetTop}}
            popoverAnchorPosition={{right: 6, top: 6}}
            fullscreen
            propagateSwipe
            swipeDirection={shouldUseNarrowLayout ? CONST.SWIPE_DIRECTION.RIGHT : undefined}
            onClose={closeSearchRouter}
            onModalHide={() => setShouldHideInputCaret(isMobileWebIOS)}
            onModalShow={() => setShouldHideInputCaret(false)}
            shouldApplySidePanelOffset={!shouldUseNarrowLayout}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <ScreenWrapperContainer
                testID={SearchRouterModal.displayName}
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

SearchRouterModal.displayName = 'SearchRouterModal';

export default SearchRouterModal;

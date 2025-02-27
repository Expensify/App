import React, {useState} from 'react';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import Modal from '@components/Modal';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import {isMobileChrome, isMobileSafari} from '@libs/Browser';
import CONST from '@src/CONST';
import SearchRouter from './SearchRouter';
import {useSearchRouterContext} from './SearchRouterContext';

const isMobileWebSafari = isMobileSafari();

function SearchRouterModal() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isSearchRouterDisplayed, closeSearchRouter} = useSearchRouterContext();
    const viewportOffsetTop = useViewportOffsetTop();
    const safeAreaInsets = useSafeAreaInsets();

    // On mWeb Safari, the input caret stuck for a moment while the modal is animating. So, we hide the caret until the animation is done.
    const [shouldHideInputCaret, setShouldHideInputCaret] = useState(isMobileWebSafari);

    const modalType = shouldUseNarrowLayout ? CONST.MODAL.MODAL_TYPE.CENTERED_SWIPABLE_TO_RIGHT : CONST.MODAL.MODAL_TYPE.POPOVER;

    return (
        <Modal
            type={modalType}
            isVisible={isSearchRouterDisplayed}
            innerContainerStyle={{paddingTop: safeAreaInsets.top + viewportOffsetTop}}
            popoverAnchorPosition={{right: 6, top: 6}}
            fullscreen
            propagateSwipe
            shouldHandleNavigationBack={isMobileChrome()}
            onClose={closeSearchRouter}
            onModalHide={() => setShouldHideInputCaret(isMobileWebSafari)}
            onModalShow={() => setShouldHideInputCaret(false)}
        >
            {isSearchRouterDisplayed && (
                <FocusTrapForModal active={isSearchRouterDisplayed}>
                    <SearchRouter
                        onRouterClose={closeSearchRouter}
                        shouldHideInputCaret={shouldHideInputCaret}
                    />
                </FocusTrapForModal>
            )}
        </Modal>
    );
}

SearchRouterModal.displayName = 'SearchRouterModal';

export default SearchRouterModal;

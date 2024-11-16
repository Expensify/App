import React, {useState} from 'react';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import Modal from '@components/Modal';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import * as Browser from '@libs/Browser';
import CONST from '@src/CONST';
import SearchRouter from './SearchRouter';
import {useSearchRouterContext} from './SearchRouterContext';

const isMobileSafari = Browser.isMobileSafari();

function SearchRouterModal() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isSearchRouterDisplayed, closeSearchRouter} = useSearchRouterContext();
    // On mWeb Safari, the input caret stuck for a moment while the modal is animating. So, we hide the caret until the animation is done.
    const [shouldHideInputCaret, setShouldHideInputCaret] = useState(isMobileSafari);

    const modalType = shouldUseNarrowLayout ? CONST.MODAL.MODAL_TYPE.CENTERED_SWIPABLE_TO_RIGHT : CONST.MODAL.MODAL_TYPE.POPOVER;

    return (
        <Modal
            type={modalType}
            isVisible={isSearchRouterDisplayed}
            popoverAnchorPosition={{right: 6, top: 6}}
            fullscreen
            propagateSwipe
            shouldHandleNavigationBack={Browser.isMobileChrome()}
            onClose={closeSearchRouter}
            onModalHide={() => setShouldHideInputCaret(isMobileSafari)}
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

import React, {useState} from 'react';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import Modal from '@components/Modal';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import useViewportOffsetTop from '@hooks/useViewportOffsetTop';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isMobileChrome, isMobileSafari} from '@libs/Browser';
import CONST from '@src/CONST';
import SearchRouter from './SearchRouter';
import {useSearchRouterContext} from './SearchRouterContext';

const isMobileWebSafari = isMobileSafari();

function SearchRouterModal() {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
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
            swipeDirection={shouldUseNarrowLayout ? CONST.SWIPE_DIRECTION.RIGHT : undefined}
            shouldHandleNavigationBack={isMobileChrome()}
            onClose={closeSearchRouter}
            onModalHide={() => setShouldHideInputCaret(isMobileWebSafari)}
            onModalShow={() => setShouldHideInputCaret(false)}
            shouldApplySidePanelOffset={!shouldUseNarrowLayout}
        >
            <KeyboardAvoidingView
                behavior="padding"
                style={[styles.flex1, {maxHeight: windowHeight}]}
            >
                <FocusTrapForModal active={isSearchRouterDisplayed}>
                    <SearchRouter
                        onRouterClose={closeSearchRouter}
                        shouldHideInputCaret={shouldHideInputCaret}
                        isSearchRouterDisplayed={isSearchRouterDisplayed}
                    />
                </FocusTrapForModal>
            </KeyboardAvoidingView>
        </Modal>
    );
}

SearchRouterModal.displayName = 'SearchRouterModal';

export default SearchRouterModal;

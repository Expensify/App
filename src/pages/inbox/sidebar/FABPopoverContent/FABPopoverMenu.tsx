import React, {useCallback} from 'react';
import type {RefObject} from 'react';
import {View} from 'react-native';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useThemeStyles from '@hooks/useThemeStyles';
import {close} from '@libs/actions/Modal';
import {isSafari} from '@libs/Browser';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import {FABMenuContext} from './FABMenuContext';

type FABMenuItemElement = React.ReactElement<{itemIndex?: number}>;

type FABPopoverMenuProps = {
    isVisible: boolean;
    onClose: () => void;
    onItemSelected: () => void;
    onModalHide: () => void;
    anchorPosition: AnchorPosition;
    anchorRef: RefObject<View | HTMLDivElement | null>;
    fromSidebarMediumScreen?: boolean;
    animationInTiming?: number;
    animationOutTiming?: number;
    children: React.ReactNode;
};

function FABPopoverMenu({
    isVisible,
    onClose,
    onItemSelected,
    onModalHide,
    anchorPosition,
    anchorRef,
    fromSidebarMediumScreen,
    animationInTiming,
    animationOutTiming,
    children,
}: FABPopoverMenuProps) {
    const styles = useThemeStyles();

    // React.Children.toArray filters out null/false/undefined produced by {cond && <Comp />},
    // giving us an accurate count of actually-rendered items for arrow-key focus management.
    const childrenArray = React.Children.toArray(children) as FABMenuItemElement[];
    const itemCount = childrenArray.length;

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        maxIndex: itemCount - 1,
        isActive: isVisible,
    });

    const onItemPress = useCallback(
        (onSelected: () => void, options?: {shouldCallAfterModalHide?: boolean}) => {
            onItemSelected();
            if (options?.shouldCallAfterModalHide && !isSafari()) {
                close(() => {
                    navigateAfterInteraction(onSelected);
                });
            } else {
                navigateAfterInteraction(onSelected);
            }
            setFocusedIndex(-1);
        },
        [onItemSelected, setFocusedIndex],
    );

    // Inject itemIndex into each child so it can interact with focus management via context
    const childrenWithIndex = childrenArray.map((child, index) => React.cloneElement(child, {itemIndex: index}));

    return (
        <FABMenuContext.Provider value={{focusedIndex, setFocusedIndex, onItemPress, isVisible}}>
            <PopoverWithMeasuredContent
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
                onClose={onClose}
                isVisible={isVisible}
                onModalHide={onModalHide}
                fromSidebarMediumScreen={fromSidebarMediumScreen}
                animationIn="fadeIn"
                animationOut="fadeOut"
                animationInTiming={animationInTiming}
                animationOutTiming={animationOutTiming}
                disableAnimation={false}
                innerContainerStyle={styles.pv0}
            >
                <FocusTrapForModal
                    active={isVisible}
                    shouldReturnFocus
                >
                    <View style={[styles.createMenuContainer, styles.flex1]}>{childrenWithIndex}</View>
                </FocusTrapForModal>
            </PopoverWithMeasuredContent>
        </FABMenuContext.Provider>
    );
}

export default FABPopoverMenu;

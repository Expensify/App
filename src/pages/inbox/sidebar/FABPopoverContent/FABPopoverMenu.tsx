import React, {Activity, useState} from 'react';
import type {ActivityProps, RefObject} from 'react';
import {View} from 'react-native';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {close} from '@libs/actions/Modal';
import {isSafari} from '@libs/Browser';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import CONST from '@src/CONST';
import {FABMenuContext} from './FABMenuContext';

const FAB_ITEM_ORDER = [
    CONST.FAB_MENU_ITEM_IDS.EXPENSE,
    CONST.FAB_MENU_ITEM_IDS.TRACK_DISTANCE,
    CONST.FAB_MENU_ITEM_IDS.CREATE_REPORT,
    CONST.FAB_MENU_ITEM_IDS.NEW_CHAT,
    CONST.FAB_MENU_ITEM_IDS.INVOICE,
    CONST.FAB_MENU_ITEM_IDS.TRAVEL,
    CONST.FAB_MENU_ITEM_IDS.TEST_DRIVE,
    CONST.FAB_MENU_ITEM_IDS.NEW_WORKSPACE,
    CONST.FAB_MENU_ITEM_IDS.QUICK_ACTION,
] as const;

type FABPopoverMenuProps = {
    isVisible: boolean;
    onClose: () => void;
    onItemSelected: () => void;
    anchorRef: RefObject<View | HTMLDivElement | null>;
    animationInTiming?: number;
    animationOutTiming?: number;
    children: React.ReactNode;
};

function FABPopoverMenu({isVisible, onClose, onItemSelected, anchorRef, animationInTiming, animationOutTiming, children}: FABPopoverMenuProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const anchorPosition = styles.createMenuPositionSidebar(windowHeight);
    const [contentActivityMode, setContentActivityMode] = useState<ActivityProps['mode']>(isVisible ? 'visible' : 'hidden');

    const [registeredSet, setRegisteredSet] = useState<ReadonlySet<string>>(new Set());

    const registeredItems = FAB_ITEM_ORDER.filter((id) => registeredSet.has(id));
    const itemCount = registeredItems.length;

    const registerItem = (id: string) => {
        setRegisteredSet((prev) => {
            if (prev.has(id)) {
                return prev;
            }
            const next = new Set(prev);
            next.add(id);
            return next;
        });
    };

    const unregisterItem = (id: string) => {
        setRegisteredSet((prev) => {
            if (!prev.has(id)) {
                return prev;
            }
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        maxIndex: itemCount - 1,
        isActive: isVisible,
    });

    const handleClose = () => {
        setFocusedIndex(-1);
        onClose();
    };

    const onItemPress = (onSelected: () => void, options?: {shouldCallAfterModalHide?: boolean}) => {
        onItemSelected();
        if (options?.shouldCallAfterModalHide && !isSafari()) {
            close(() => {
                navigateAfterInteraction(onSelected);
            });
        } else {
            navigateAfterInteraction(onSelected);
        }
        setFocusedIndex(-1);
    };

    return (
        <FABMenuContext.Provider
            value={{
                focusedIndex,
                setFocusedIndex,
                onItemPress,
                isVisible,
                registeredItems,
                registerItem,
                unregisterItem,
            }}
        >
            <PopoverWithMeasuredContent
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
                anchorAlignment={{
                    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
                    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
                }}
                onClose={handleClose}
                isVisible={isVisible}
                onModalWillShow={() => setContentActivityMode('visible')}
                onModalHide={() => setContentActivityMode('hidden')}
                fromSidebarMediumScreen={!shouldUseNarrowLayout}
                animationIn="fadeIn"
                animationOut="fadeOut"
                animationInTiming={animationInTiming}
                animationOutTiming={animationOutTiming}
                disableAnimation={false}
                shouldHandleNavigationBack
                innerContainerStyle={styles.pv0}
            >
                <FocusTrapForModal
                    active={isVisible}
                    shouldReturnFocus
                >
                    <Activity mode={contentActivityMode}>
                        <View style={shouldUseNarrowLayout ? styles.flexGrow1 : [styles.createMenuContainer, styles.pv0, styles.flex1]}>
                            <View style={styles.pv4}>{children}</View>
                        </View>
                    </Activity>
                </FocusTrapForModal>
            </PopoverWithMeasuredContent>
        </FABMenuContext.Provider>
    );
}

export default FABPopoverMenu;

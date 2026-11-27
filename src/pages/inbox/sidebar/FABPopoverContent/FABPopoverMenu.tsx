import CompactMenuContext from '@components/CompactMenuContext';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import PopoverWithMeasuredContent from '@components/PopoverWithMeasuredContent';

import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {close} from '@libs/actions/Modal';
import {isSafari} from '@libs/Browser';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';

import type {ActivityProps, ComponentRef, RefObject} from 'react';

import React, {Activity, useState} from 'react';
import {View} from 'react-native';

import {FABMenuContext} from './FABMenuContext';

const FAB_ITEM_ORDER = [
    CONST.FAB_MENU_ITEM_IDS.EXPENSE,
    CONST.FAB_MENU_ITEM_IDS.CREATE_REPORT,
    CONST.FAB_MENU_ITEM_IDS.TRACK_DISTANCE,
    CONST.FAB_MENU_ITEM_IDS.NEW_CHAT,
    CONST.FAB_MENU_ITEM_IDS.INVOICE,
    CONST.FAB_MENU_ITEM_IDS.TRAVEL,
    CONST.FAB_MENU_ITEM_IDS.NEW_WORKSPACE,
    CONST.FAB_MENU_ITEM_IDS.QUICK_ACTION,
] as const;

type FABPopoverMenuProps = {
    isVisible: boolean;

    /** Closes the menu, both on dismiss and after an item is picked */
    onClose: () => void;

    /** The button that opened the menu, which gets focus back when it closes */
    anchorRef: RefObject<ComponentRef<typeof View> | HTMLDivElement | null>;

    /** Replaces the default placement above a floating action button at the bottom of the sidebar */
    anchorPosition?: AnchorPosition;

    /** How the menu lines up with `anchorPosition` */
    anchorAlignment?: AnchorAlignment;

    /** Called once the menu has fully closed and its modal is gone from the screen */
    onModalHide?: () => void;

    /** Whether each row shows its icon on a colored tile, defaults to false */
    shouldShowIconTiles?: boolean;

    children: React.ReactNode;
};

const DEFAULT_ANCHOR_ALIGNMENT: AnchorAlignment = {
    horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
    vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
};

function FABPopoverMenu({
    isVisible,
    onClose,
    anchorRef,
    anchorPosition: anchorPositionOverride,
    anchorAlignment = DEFAULT_ANCHOR_ALIGNMENT,
    onModalHide,
    shouldShowIconTiles = false,
    children,
}: FABPopoverMenuProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const anchorPosition = anchorPositionOverride ?? styles.createMenuPositionSidebar(windowHeight);
    // Use paddingTop (pt*) for the top and pass the bottom via additionalPaddingBottom so it composes with the safe-area inset.
    // paddingVertical (pv*) shorthand isn't readable by the hook, so its injected paddingBottom would clobber the intended bottom padding.
    let menuPaddingTopStyle = shouldUseNarrowLayout ? styles.pt4 : styles.pt2;
    let menuPaddingBottom = shouldUseNarrowLayout ? 16 : 8;
    if (shouldShowIconTiles) {
        // The icon tile design keeps the same 12px space above and below the rows on every layout
        menuPaddingTopStyle = styles.pt3;
        menuPaddingBottom = variables.flatNavigationBarCreateMenuPaddingVertical;
    }
    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding: true,
        style: menuPaddingTopStyle,
        additionalPaddingBottom: menuPaddingBottom,
    });
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
        onClose();
        if (options?.shouldCallAfterModalHide && !isSafari()) {
            close(() => {
                onSelected();
            });
        } else {
            onSelected();
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
                shouldShowIconTiles,
            }}
        >
            <PopoverWithMeasuredContent
                anchorPosition={anchorPosition}
                anchorRef={anchorRef}
                anchorAlignment={anchorAlignment}
                onClose={handleClose}
                isVisible={isVisible}
                onModalWillShow={() => setContentActivityMode('visible')}
                onModalHide={() => {
                    setContentActivityMode('hidden');
                    onModalHide?.();
                }}
                fromSidebarMediumScreen={!shouldUseNarrowLayout}
                animationIn="fadeIn"
                animationOut="fadeOut"
                animationInTiming={CONST.MODAL.ANIMATION_TIMING.FAB_IN}
                animationOutTiming={CONST.MODAL.ANIMATION_TIMING.FAB_OUT}
                disableAnimation={false}
                shouldHandleNavigationBack
                innerContainerStyle={styles.pv0}
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <FocusTrapForModal
                    active={isVisible}
                    shouldReturnFocus
                    launcherRef={anchorRef}
                >
                    <CompactMenuContext.Provider value>
                        <Activity mode={contentActivityMode}>
                            <View
                                style={
                                    shouldUseNarrowLayout
                                        ? styles.flexGrow1
                                        : [styles.createMenuContainer, shouldShowIconTiles && StyleUtils.getWidthStyle(variables.flatNavigationBarCreateMenuWidth), styles.pv0, styles.flex1]
                                }
                            >
                                <View style={bottomSafeAreaPaddingStyle}>{children}</View>
                            </View>
                        </Activity>
                    </CompactMenuContext.Provider>
                </FocusTrapForModal>
            </PopoverWithMeasuredContent>
        </FABMenuContext.Provider>
    );
}

export default FABPopoverMenu;
export type {FABPopoverMenuProps};

import React, {useState} from 'react';
import type {RefObject} from 'react';
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

// Fixed display order for all possible menu items.
// Components self-register — this array ensures arrow-key indices always follow JSX order
// regardless of when each item becomes visible.
const FAB_ITEM_ORDER = ['quick-action', 'expense', 'track-distance', 'create-report', 'new-chat', 'invoice', 'travel', 'test-drive', 'new-workspace'] as const;

type FABPopoverMenuProps = {
    isVisible: boolean;
    onClose: () => void;
    onItemSelected: () => void;
    onModalHide: () => void;
    anchorRef: RefObject<View | HTMLDivElement | null>;
    animationInTiming?: number;
    animationOutTiming?: number;
    children: React.ReactNode;
};

function FABPopoverMenu({isVisible, onClose, onItemSelected, onModalHide, anchorRef, animationInTiming, animationOutTiming, children}: FABPopoverMenuProps) {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const anchorPosition = styles.createMenuPositionSidebar(windowHeight);

    const [registeredSet, setRegisteredSet] = useState<ReadonlySet<string>>(new Set());

    // Derive ordered list from the fixed order array so indices are stable
    // regardless of registration order.
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
        <FABMenuContext.Provider value={{focusedIndex, setFocusedIndex, onItemPress, isVisible, registeredItems, registerItem, unregisterItem}}>
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
                fromSidebarMediumScreen={!shouldUseNarrowLayout}
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
                    {/*
                     * Replicates PopoverMenu's layout:
                     * - mobile: flexGrow1 outer (no fixed width), pv4 inner for item padding
                     * - web: createMenuContainer (fixed sidebar width) + flex1 outer, pv4 inner
                     */}
                    <View style={isSmallScreenWidth ? styles.flexGrow1 : [styles.createMenuContainer, styles.flex1]}>
                        <View style={styles.pv4}>{children}</View>
                    </View>
                </FocusTrapForModal>
            </PopoverWithMeasuredContent>
        </FABMenuContext.Provider>
    );
}

export default FABPopoverMenu;

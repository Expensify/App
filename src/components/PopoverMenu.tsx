import type {ImageContentFit} from 'expo-image';
import type {RefObject} from 'react';
import React, {useRef} from 'react';
import {View} from 'react-native';
import type {ModalProps} from 'react-native-modal';
import type {ValueOf} from 'type-fest';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type IconAsset from '@src/types/utils/IconAsset';
import MenuItem from './MenuItem';
import type {AnchorAlignment} from './Popover/types';
import PopoverWithMeasuredContent from './PopoverWithMeasuredContent';
import Text from './Text';

type PopoverMenuItem = {
    /** An icon element displayed on the left side */
    icon: IconAsset;

    /** Text label */
    text: string;

    /** A callback triggered when this item is selected */
    onSelected: () => void;

    /** A description text to show under the title */
    description?: string;

    /** The fill color to pass into the icon. */
    iconFill?: string;

    /** Icon Width */
    iconWidth?: number;

    /** Icon Height */
    iconHeight?: number;

    /** Icon should be displayed in its own color */
    displayInDefaultIconColor?: boolean;

    /** Determines how the icon should be resized to fit its container */
    contentFit?: ImageContentFit;
};

type PopoverModalProps = Pick<ModalProps, 'animationIn' | 'animationOut' | 'animationInTiming'>;

type PopoverMenuProps = Partial<PopoverModalProps> & {
    /** Callback method fired when the user requests to close the modal */
    onClose: () => void;

    /** Callback method fired when the modal is shown */
    onModalShow?: () => void;

    /** Whether the modal should clear the focus record for the current business type. */
    shouldClearFocusWithType?: boolean;

    /** How to re-focus after the modal is dismissed */
    restoreFocusType?: ValueOf<typeof CONST.MODAL.RESTORE_FOCUS_TYPE>;

    /** State that determines whether to display the modal or not */
    isVisible: boolean;

    /** Callback to fire when a CreateMenu item is selected */
    onItemSelected: (selectedItem: PopoverMenuItem, index: number) => void;

    /** Menu items to be rendered on the list */
    menuItems: PopoverMenuItem[];

    /** Optional non-interactive text to display as a header for any create menu */
    headerText?: string;

    /** Whether disable the animations */
    disableAnimation?: boolean;

    /** The horizontal and vertical anchors points for the popover */
    anchorPosition: AnchorPosition;

    /** Ref of the anchor */
    anchorRef: RefObject<HTMLDivElement>;

    /** Where the popover should be positioned relative to the anchor points. */
    anchorAlignment?: AnchorAlignment;

    /** Whether we don't want to show overlay */
    withoutOverlay?: boolean;

    /** Should we announce the Modal visibility changes? */
    shouldSetModalVisibility?: boolean;

    /** Whether we want to show the popover on the right side of the screen */
    fromSidebarMediumScreen?: boolean;
};

function PopoverMenu({
    menuItems,
    onItemSelected,
    isVisible,
    anchorPosition,
    anchorRef,
    onClose,
    shouldClearFocusWithType,
    restoreFocusType,
    onModalShow = () => {},
    headerText,
    fromSidebarMediumScreen,
    anchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    animationIn = 'fadeIn',
    animationOut = 'fadeOut',
    animationInTiming = CONST.ANIMATED_TRANSITION,
    disableAnimation = true,
    withoutOverlay = false,
    shouldSetModalVisibility = true,
}: PopoverMenuProps) {
    const styles = useThemeStyles();
    const {isSmallScreenWidth} = useWindowDimensions();
    const selectedItemIndex = useRef<number | null>(null);
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({initialFocusedIndex: -1, maxIndex: menuItems.length - 1, isActive: isVisible});

    const selectItem = (index: number) => {
        const selectedItem = menuItems[index];
        onItemSelected(selectedItem, index);
        selectedItemIndex.current = index;
    };

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.ENTER,
        () => {
            if (focusedIndex === -1) {
                return;
            }
            selectItem(focusedIndex);
            setFocusedIndex(-1); // Reset the focusedIndex on selecting any menu
        },
        {isActive: isVisible},
    );

    const onModalHide = () => {
        setFocusedIndex(-1);
        if (selectedItemIndex.current !== null) {
            menuItems[selectedItemIndex.current].onSelected();
            selectedItemIndex.current = null;
        }
    };

    return (
        <PopoverWithMeasuredContent
            anchorPosition={anchorPosition}
            anchorRef={anchorRef}
            anchorAlignment={anchorAlignment}
            onClose={onClose}
            isVisible={isVisible}
            shouldClearFocusWithType={shouldClearFocusWithType}
            restoreFocusType={restoreFocusType}
            onModalShow={onModalShow}
            onModalHide={onModalHide}
            animationIn={animationIn}
            animationOut={animationOut}
            animationInTiming={animationInTiming}
            disableAnimation={disableAnimation}
            fromSidebarMediumScreen={fromSidebarMediumScreen}
            withoutOverlay={withoutOverlay}
            shouldSetModalVisibility={shouldSetModalVisibility}
        >
            <View style={isSmallScreenWidth ? {} : styles.createMenuContainer}>
                {!!headerText && <Text style={[styles.createMenuHeaderText, styles.ml3]}>{headerText}</Text>}
                {menuItems.map((item, menuIndex) => (
                    <MenuItem
                        key={item.text}
                        icon={item.icon}
                        iconWidth={item.iconWidth}
                        iconHeight={item.iconHeight}
                        iconFill={item.iconFill}
                        contentFit={item.contentFit}
                        title={item.text}
                        shouldCheckActionAllowedOnPress={false}
                        description={item.description}
                        onPress={() => selectItem(menuIndex)}
                        focused={focusedIndex === menuIndex}
                        displayInDefaultIconColor={item.displayInDefaultIconColor}
                    />
                ))}
            </View>
        </PopoverWithMeasuredContent>
    );
}

PopoverMenu.displayName = 'PopoverMenu';

export default React.memo(PopoverMenu);
export type {PopoverMenuItem};

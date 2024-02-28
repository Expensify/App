import type {ImageContentFit} from 'expo-image';
import type {RefObject} from 'react';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import type {ModalProps} from 'react-native-modal';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type IconAsset from '@src/types/utils/IconAsset';
import * as Expensicons from './Icon/Expensicons';
import MenuItem from './MenuItem';
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

    /** Sub menu items to be rendered after a menu item is selected */
    subMenuItems?: PopoverMenuItem[];

    /** Determines whether an icon should be displayed on the right side of the menu item. */
    shouldShowRightIcon?: boolean;

    /** Adds padding to the left of the text when there is no icon. */
    shouldPutLeftPaddingWhenNoIcon?: boolean;
};

type PopoverModalProps = Pick<ModalProps, 'animationIn' | 'animationOut' | 'animationInTiming'>;

type PopoverMenuProps = Partial<PopoverModalProps> & {
    /** Callback method fired when the user requests to close the modal */
    onClose: () => void;

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
    anchorRef: RefObject<View | HTMLDivElement>;

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

    const [currentMenuItems, setCurrentMenuItems] = useState(menuItems);
    const [enteredSubMenuIndexes, setEnteredSubMenuIndexes] = useState<number[]>([]);

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({initialFocusedIndex: -1, maxIndex: currentMenuItems.length - 1, isActive: isVisible});

    const selectItem = (index: number) => {
        const selectedItem = currentMenuItems[index];
        if (selectedItem?.subMenuItems) {
            setCurrentMenuItems([...selectedItem.subMenuItems]);
            setEnteredSubMenuIndexes([...enteredSubMenuIndexes, index]);
        } else {
            onItemSelected(selectedItem, index);
            selectedItemIndex.current = index;
        }
    };

    const getPreviousSubMenu = () => {
        let currentItems = menuItems;
        for (let i = 0; i < enteredSubMenuIndexes.length - 1; i++) {
            const nextItems = currentItems[enteredSubMenuIndexes[i]].subMenuItems;
            if (!nextItems) {
                return currentItems;
            }
            currentItems = nextItems;
        }
        return currentItems;
    };

    const renderBackButtonItem = () => {
        const previousMenuItems = getPreviousSubMenu();
        const previouslySelectedItem = previousMenuItems[enteredSubMenuIndexes[enteredSubMenuIndexes.length - 1]];

        return (
            <MenuItem
                key={previouslySelectedItem.text}
                icon={Expensicons.BackArrow}
                iconFill="gray"
                title={previouslySelectedItem.text}
                shouldCheckActionAllowedOnPress={false}
                description={previouslySelectedItem.description}
                onPress={() => {
                    setCurrentMenuItems(previousMenuItems);
                    enteredSubMenuIndexes.splice(-1);
                }}
            />
        );
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
            currentMenuItems[selectedItemIndex.current].onSelected();
            selectedItemIndex.current = null;
        }
    };

    useEffect(() => {
        if (menuItems.length === 0) {
            return;
        }
        setEnteredSubMenuIndexes([]);
        setCurrentMenuItems(menuItems);
    }, [menuItems]);

    return (
        <PopoverWithMeasuredContent
            anchorPosition={anchorPosition}
            anchorRef={anchorRef}
            anchorAlignment={anchorAlignment}
            onClose={() => {
                setCurrentMenuItems(menuItems);
                setEnteredSubMenuIndexes([]);
                onClose();
            }}
            isVisible={isVisible}
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
                {enteredSubMenuIndexes.length > 0 && renderBackButtonItem()}
                {currentMenuItems.map((item, menuIndex) => (
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
                        shouldShowRightIcon={item.shouldShowRightIcon}
                        shouldPutLeftPaddingWhenNoIcon={item.shouldPutLeftPaddingWhenNoIcon}
                    />
                ))}
            </View>
        </PopoverWithMeasuredContent>
    );
}

PopoverMenu.displayName = 'PopoverMenu';

export default React.memo(PopoverMenu);
export type {PopoverMenuItem};

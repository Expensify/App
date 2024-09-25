/* eslint-disable react/jsx-props-no-spreading */
import lodashIsEqual from 'lodash/isEqual';
import type {RefObject} from 'react';
import React, {Fragment, useLayoutEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {ModalProps} from 'react-native-modal';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Browser from '@libs/Browser';
import * as Modal from '@userActions/Modal';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import FocusableMenuItem from './FocusableMenuItem';
import FocusTrapForModal from './FocusTrap/FocusTrapForModal';
import * as Expensicons from './Icon/Expensicons';
import type {MenuItemProps} from './MenuItem';
import MenuItem from './MenuItem';
import type BaseModalProps from './Modal/types';
import PopoverWithMeasuredContent from './PopoverWithMeasuredContent';
import ScrollView from './ScrollView';
import Text from './Text';

type PopoverMenuItem = MenuItemProps & {
    /** Text label */
    text: string;

    /** A callback triggered when this item is selected */
    onSelected?: () => void;

    /** Sub menu items to be rendered after a menu item is selected */
    subMenuItems?: PopoverMenuItem[];

    /** Back button text to be shown if sub menu items are opened */
    backButtonText?: string;

    /** Determines whether the menu item is disabled or not */
    disabled?: boolean;

    /** Determines whether the menu item's onSelected() function is called after the modal is hidden
     *  It is meant to be used in situations where, after clicking on the modal, another one is opened.
     */
    shouldCallAfterModalHide?: boolean;

    /** Whether to close all modals */
    shouldCloseAllModals?: boolean;
};

type PopoverModalProps = Pick<ModalProps, 'animationIn' | 'animationOut' | 'animationInTiming'>;

type PopoverMenuProps = Partial<PopoverModalProps> & {
    /** Callback method fired when the user requests to close the modal */
    onClose: () => void;

    /** Callback method fired when the modal is shown */
    onModalShow?: () => void;

    /** State that determines whether to display the modal or not */
    isVisible: boolean;

    /** Callback to fire when a CreateMenu item is selected */
    onItemSelected?: (selectedItem: PopoverMenuItem, index: number) => void;

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

    /**
     * Whether the modal should enable the new focus manager.
     * We are attempting to migrate to a new refocus manager, adding this property for gradual migration.
     * */
    shouldEnableNewFocusManagement?: boolean;

    /** How to re-focus after the modal is dismissed */
    restoreFocusType?: BaseModalProps['restoreFocusType'];

    /** Whether to show the selected option checkmark */
    shouldShowSelectedItemCheck?: boolean;

    /** The style of content container which wraps all child views */
    containerStyles?: StyleProp<ViewStyle>;

    /** Used to apply styles specifically to the header text */
    headerStyles?: StyleProp<TextStyle>;

    /** Modal container styles  */
    innerContainerStyle?: ViewStyle;

    /** These styles will be applied to the scroll view content container which wraps all of the child views */
    scrollContainerStyle?: StyleProp<ViewStyle>;

    /** Whether we should wrap the list item in a scroll view */
    shouldUseScrollView?: boolean;

    /** Whether to update the focused index on a row select */
    shouldUpdateFocusedIndex?: boolean;
};

function PopoverMenu({
    menuItems,
    onItemSelected,
    isVisible,
    anchorPosition,
    anchorRef,
    onClose,
    onModalShow,
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
    shouldEnableNewFocusManagement,
    restoreFocusType,
    shouldShowSelectedItemCheck = false,
    containerStyles,
    headerStyles,
    innerContainerStyle,
    scrollContainerStyle,
    shouldUseScrollView = false,
    shouldUpdateFocusedIndex = true,
}: PopoverMenuProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply correct popover styles
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [currentMenuItems, setCurrentMenuItems] = useState(menuItems);
    const currentMenuItemsFocusedIndex = currentMenuItems?.findIndex((option) => option.isSelected);
    const [enteredSubMenuIndexes, setEnteredSubMenuIndexes] = useState<readonly number[]>(CONST.EMPTY_ARRAY);
    const {windowHeight} = useWindowDimensions();

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({initialFocusedIndex: currentMenuItemsFocusedIndex, maxIndex: currentMenuItems.length - 1, isActive: isVisible});
    const WrapComponent = shouldUseScrollView ? ScrollView : Fragment;

    const selectItem = (index: number) => {
        const selectedItem = currentMenuItems[index];
        if (selectedItem?.subMenuItems) {
            setCurrentMenuItems([...selectedItem.subMenuItems]);
            setEnteredSubMenuIndexes([...enteredSubMenuIndexes, index]);
            const selectedSubMenuItemIndex = selectedItem?.subMenuItems.findIndex((option) => option.isSelected);
            setFocusedIndex(selectedSubMenuItemIndex);
        } else if (selectedItem.shouldCallAfterModalHide && !Browser.isSafari()) {
            onItemSelected?.(selectedItem, index);
            Modal.close(
                () => {
                    selectedItem.onSelected?.();
                },
                undefined,
                selectedItem.shouldCloseAllModals,
            );
        } else {
            onItemSelected?.(selectedItem, index);
            selectedItem.onSelected?.();
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
        const hasBackButtonText = !!previouslySelectedItem.backButtonText;

        return (
            <MenuItem
                key={previouslySelectedItem.text}
                icon={Expensicons.BackArrow}
                iconFill={theme.icon}
                style={hasBackButtonText ? styles.pv0 : undefined}
                title={hasBackButtonText ? previouslySelectedItem.backButtonText : previouslySelectedItem.text}
                titleStyle={hasBackButtonText ? styles.createMenuHeaderText : undefined}
                shouldShowBasicTitle={hasBackButtonText}
                shouldCheckActionAllowedOnPress={false}
                description={previouslySelectedItem.description}
                onPress={() => {
                    setCurrentMenuItems(previousMenuItems);
                    setFocusedIndex(-1);
                    setEnteredSubMenuIndexes((prevState) => prevState.slice(0, -1));
                }}
            />
        );
    };

    const renderHeaderText = () => {
        if (!headerText || enteredSubMenuIndexes.length !== 0) {
            return;
        }
        return <Text style={[styles.createMenuHeaderText, styles.ph5, styles.pv3, headerStyles]}>{headerText}</Text>;
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
    };

    // When the menu items are changed, we want to reset the sub-menu to make sure
    // we are not accessing the wrong sub-menu parent or possibly undefined when rendering the back button.
    // We use useLayoutEffect so the reset happens before the repaint
    useLayoutEffect(() => {
        if (menuItems.length === 0) {
            return;
        }
        setEnteredSubMenuIndexes(CONST.EMPTY_ARRAY);
        setCurrentMenuItems(menuItems);
    }, [menuItems]);

    return (
        <PopoverWithMeasuredContent
            anchorPosition={anchorPosition}
            anchorRef={anchorRef}
            anchorAlignment={anchorAlignment}
            onClose={() => {
                setCurrentMenuItems(menuItems);
                setEnteredSubMenuIndexes(CONST.EMPTY_ARRAY);
                onClose();
            }}
            isVisible={isVisible}
            onModalHide={onModalHide}
            onModalShow={onModalShow}
            animationIn={animationIn}
            animationOut={animationOut}
            animationInTiming={animationInTiming}
            disableAnimation={disableAnimation}
            fromSidebarMediumScreen={fromSidebarMediumScreen}
            withoutOverlay={withoutOverlay}
            shouldSetModalVisibility={shouldSetModalVisibility}
            shouldEnableNewFocusManagement={shouldEnableNewFocusManagement}
            useNativeDriver
            restoreFocusType={restoreFocusType}
            innerContainerStyle={innerContainerStyle}
        >
            <FocusTrapForModal active={isVisible}>
                <View style={[isSmallScreenWidth ? {maxHeight: windowHeight - 250} : styles.createMenuContainer, containerStyles]}>
                    {renderHeaderText()}
                    {enteredSubMenuIndexes.length > 0 && renderBackButtonItem()}
                    {/** eslint-disable-next-line react/jsx-props-no-spreading */}
                    <WrapComponent {...(shouldUseScrollView && {contentContainerStyle: scrollContainerStyle})}>
                        {currentMenuItems.map((item, menuIndex) => {
                            const {text, onSelected, subMenuItems, shouldCallAfterModalHide, ...menuItemProps} = item;
                            return (
                                <FocusableMenuItem
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={`${item.text}_${menuIndex}`}
                                    title={text}
                                    onPress={() => selectItem(menuIndex)}
                                    focused={focusedIndex === menuIndex}
                                    shouldShowSelectedItemCheck={shouldShowSelectedItemCheck}
                                    shouldCheckActionAllowedOnPress={false}
                                    onFocus={() => {
                                        if (!shouldUpdateFocusedIndex) {
                                            return;
                                        }
                                        setFocusedIndex(menuIndex);
                                    }}
                                    style={{backgroundColor: item.isSelected ? theme.activeComponentBG : undefined}}
                                    titleStyle={StyleSheet.flatten([styles.flex1, item.titleStyle])}
                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                    {...menuItemProps}
                                />
                            );
                        })}
                    </WrapComponent>
                </View>
            </FocusTrapForModal>
        </PopoverWithMeasuredContent>
    );
}

PopoverMenu.displayName = 'PopoverMenu';

export default React.memo(
    PopoverMenu,
    (prevProps, nextProps) =>
        lodashIsEqual(prevProps.menuItems, nextProps.menuItems) &&
        prevProps.isVisible === nextProps.isVisible &&
        lodashIsEqual(prevProps.anchorPosition, nextProps.anchorPosition) &&
        prevProps.anchorRef === nextProps.anchorRef &&
        prevProps.headerText === nextProps.headerText &&
        prevProps.fromSidebarMediumScreen === nextProps.fromSidebarMediumScreen &&
        lodashIsEqual(prevProps.anchorAlignment, nextProps.anchorAlignment) &&
        prevProps.animationIn === nextProps.animationIn &&
        prevProps.animationOut === nextProps.animationOut &&
        prevProps.animationInTiming === nextProps.animationInTiming &&
        prevProps.disableAnimation === nextProps.disableAnimation &&
        prevProps.withoutOverlay === nextProps.withoutOverlay &&
        prevProps.shouldSetModalVisibility === nextProps.shouldSetModalVisibility,
);
export type {PopoverMenuItem, PopoverMenuProps};

/* eslint-disable react/jsx-props-no-spreading */
import {deepEqual} from 'fast-equals';
import type {ReactNode, RefObject} from 'react';
import React, {useCallback, useLayoutEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import type {GestureResponderEvent, LayoutChangeEvent, StyleProp, TextStyle, ViewStyle} from 'react-native';
import type {ModalProps} from 'react-native-modal';
import type {SvgProps} from 'react-native-svg';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isSafari} from '@libs/Browser';
import getPlatform from '@libs/getPlatform';
import {close} from '@userActions/Modal';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import FocusableMenuItem from './FocusableMenuItem';
import FocusTrapForModal from './FocusTrap/FocusTrapForModal';
import * as Expensicons from './Icon/Expensicons';
import type {MenuItemProps} from './MenuItem';
import MenuItem from './MenuItem';
import type ReanimatedModalProps from './Modal/ReanimatedModal/types';
import type BaseModalProps from './Modal/types';
import OfflineWithFeedback from './OfflineWithFeedback';
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

    pendingAction?: PendingAction;

    rightIcon?: React.FC<SvgProps>;

    key?: string;

    /** Whether to keep the modal open after clicking on the menu item */
    shouldKeepModalOpen?: boolean;

    /** Test identifier used to find elements in unit and e2e tests */
    testID?: string;

    /** Whether to show a loading spinner icon for the menu item */
    shouldShowLoadingSpinnerIcon?: boolean;

    /** Whether to close the modal on select */
    shouldCloseModalOnSelect?: boolean;
};

type PopoverModalProps = Pick<ModalProps, 'animationIn' | 'animationOut' | 'animationInTiming' | 'animationOutTiming'> & Pick<ReanimatedModalProps, 'animationInDelay'>;

type PopoverMenuProps = Partial<PopoverModalProps> & {
    /** Callback method fired when the user requests to close the modal */
    onClose: () => void;

    /** Optional callback passed to popover's children container */
    onLayout?: (e: LayoutChangeEvent) => void;

    /** Callback method fired when the modal is shown */
    onModalShow?: () => void;

    /** Callback method fired when the modal is hidden */
    onModalHide?: () => void;

    /** State that determines whether to display the modal or not */
    isVisible: boolean;

    /** Callback to fire when a CreateMenu item is selected */
    onItemSelected?: (selectedItem: PopoverMenuItem, index: number, event?: GestureResponderEvent | KeyboardEvent) => void;

    /** Menu items to be rendered on the list */
    menuItems: PopoverMenuItem[];

    /** Optional non-interactive text to display as a header for any create menu */
    headerText?: string;

    /** Whether disable the animations */
    disableAnimation?: boolean;

    /** The horizontal and vertical anchors points for the popover */
    anchorPosition: AnchorPosition;

    /** Ref of the anchor */
    anchorRef: RefObject<View | HTMLDivElement | null>;

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

    /** Whether we should set a max height to the popover content */
    shouldEnableMaxHeight?: boolean;

    /** Whether to update the focused index on a row select */
    shouldUpdateFocusedIndex?: boolean;

    /** Should we apply padding style in modal itself. If this value is false, we will handle it in ScreenWrapper */
    shouldUseModalPaddingStyle?: boolean;

    /** Whether we want to avoid the safari exception of ignoring shouldCallAfterModalHide  */
    shouldAvoidSafariException?: boolean;

    /** Used to locate the component in the tests */
    testID?: string;
};

const renderWithConditionalWrapper = (shouldUseScrollView: boolean, contentContainerStyle: StyleProp<ViewStyle>, children: ReactNode): React.JSX.Element => {
    if (shouldUseScrollView) {
        return <ScrollView contentContainerStyle={contentContainerStyle}>{children}</ScrollView>;
    }
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

function getSelectedItemIndex(menuItems: PopoverMenuItem[]) {
    return menuItems.findIndex((option) => option.isSelected);
}

function PopoverMenu({
    menuItems,
    onItemSelected,
    isVisible,
    anchorPosition,
    anchorRef,
    onClose,
    onLayout,
    onModalShow,
    onModalHide,
    headerText,
    fromSidebarMediumScreen,
    anchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    },
    animationIn = 'fadeIn',
    animationInDelay,
    animationOut = 'fadeOut',
    animationInTiming = CONST.ANIMATED_TRANSITION,
    animationOutTiming,
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
    shouldEnableMaxHeight = true,
    shouldUpdateFocusedIndex = true,
    shouldUseModalPaddingStyle,
    shouldAvoidSafariException = false,
    testID,
}: PopoverMenuProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply correct popover styles
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [currentMenuItems, setCurrentMenuItems] = useState(menuItems);
    const currentMenuItemsFocusedIndex = getSelectedItemIndex(currentMenuItems);
    const [enteredSubMenuIndexes, setEnteredSubMenuIndexes] = useState<readonly number[]>(CONST.EMPTY_ARRAY);
    const {windowHeight} = useWindowDimensions();
    const platform = getPlatform();
    const isWebOrDesktop = platform === CONST.PLATFORM.WEB || platform === CONST.PLATFORM.DESKTOP;
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({initialFocusedIndex: currentMenuItemsFocusedIndex, maxIndex: currentMenuItems.length - 1, isActive: isVisible});

    const selectItem = (index: number, event?: GestureResponderEvent | KeyboardEvent) => {
        const selectedItem = currentMenuItems.at(index);
        if (!selectedItem) {
            return;
        }
        if (selectedItem?.subMenuItems) {
            setCurrentMenuItems([...selectedItem.subMenuItems]);
            setEnteredSubMenuIndexes([...enteredSubMenuIndexes, index]);
            const selectedSubMenuItemIndex = selectedItem?.subMenuItems.findIndex((option) => option.isSelected);
            setFocusedIndex(selectedSubMenuItemIndex);
        } else if (selectedItem.shouldCallAfterModalHide && (!isSafari() || shouldAvoidSafariException)) {
            onItemSelected?.(selectedItem, index, event);
            if (selectedItem.shouldCloseModalOnSelect !== false) {
                close(
                    () => {
                        selectedItem.onSelected?.();
                    },
                    undefined,
                    selectedItem.shouldCloseAllModals,
                );
            } else {
                selectedItem.onSelected?.();
            }
        } else {
            onItemSelected?.(selectedItem, index, event);
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
        const hasBackButtonText = !!previouslySelectedItem?.backButtonText;

        return (
            <MenuItem
                key={previouslySelectedItem?.text}
                icon={Expensicons.BackArrow}
                iconFill={theme.icon}
                style={hasBackButtonText ? styles.pv0 : undefined}
                title={hasBackButtonText ? previouslySelectedItem?.backButtonText : previouslySelectedItem?.text}
                titleStyle={hasBackButtonText ? styles.createMenuHeaderText : undefined}
                shouldShowBasicTitle={hasBackButtonText}
                shouldCheckActionAllowedOnPress={false}
                description={previouslySelectedItem?.description}
                onPress={() => {
                    setCurrentMenuItems(previousMenuItems);
                    setFocusedIndex(-1);
                    setEnteredSubMenuIndexes((prevState) => prevState.slice(0, -1));
                }}
            />
        );
    };

    const renderedMenuItems = currentMenuItems.map((item, menuIndex) => {
        const {text, onSelected, subMenuItems, shouldCallAfterModalHide, key, testID: menuItemTestID, shouldShowLoadingSpinnerIcon, ...menuItemProps} = item;

        return (
            <OfflineWithFeedback
                // eslint-disable-next-line react/no-array-index-key
                key={key ?? `${item.text}_${menuIndex}`}
                pendingAction={item.pendingAction}
            >
                <FocusableMenuItem
                    // eslint-disable-next-line react/no-array-index-key
                    key={key ?? `${item.text}_${menuIndex}`}
                    pressableTestID={menuItemTestID ?? `PopoverMenuItem-${item.text}`}
                    title={text}
                    onPress={(event) => selectItem(menuIndex, event)}
                    focused={focusedIndex === menuIndex}
                    shouldShowSelectedItemCheck={shouldShowSelectedItemCheck}
                    shouldCheckActionAllowedOnPress={false}
                    iconRight={item.rightIcon}
                    shouldShowRightIcon={!!item.rightIcon}
                    onFocus={() => {
                        if (!shouldUpdateFocusedIndex) {
                            return;
                        }
                        setFocusedIndex(menuIndex);
                    }}
                    wrapperStyle={[
                        StyleUtils.getItemBackgroundColorStyle(!!item.isSelected, focusedIndex === menuIndex, item.disabled ?? false, theme.activeComponentBG, theme.hoverComponentBG),
                        shouldUseScrollView && !shouldUseModalPaddingStyle && StyleUtils.getOptionMargin(menuIndex, currentMenuItems.length - 1),
                    ]}
                    shouldRemoveHoverBackground={item.isSelected}
                    titleStyle={StyleSheet.flatten([styles.flex1, item.titleStyle])}
                    // Spread other props dynamically
                    {...menuItemProps}
                    shouldShowLoadingSpinnerIcon={shouldShowLoadingSpinnerIcon}
                />
            </OfflineWithFeedback>
        );
    });

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

    const keyboardShortcutSpaceCallback = useCallback(
        (e?: GestureResponderEvent | KeyboardEvent) => {
            if (shouldUseScrollView) {
                return;
            }

            e?.preventDefault();
        },
        [shouldUseScrollView],
    );

    // On web and desktop, pressing the space bar after interacting with the parent view
    // can cause the parent view to scroll when the space bar is pressed.
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.SPACE, keyboardShortcutSpaceCallback, {isActive: isWebOrDesktop && isVisible, shouldPreventDefault: false});

    const handleModalHide = () => {
        onModalHide?.();
        setFocusedIndex(currentMenuItemsFocusedIndex);
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

        // Update the focused item to match the selected item, but only when the popover is not visible.
        // This ensures that if the popover is visible, highlight from the keyboard navigation is not overridden
        // by external updates.
        if (isVisible) {
            return;
        }
        setFocusedIndex(getSelectedItemIndex(menuItems));

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [menuItems, setFocusedIndex]);

    const menuContainerStyle = useMemo(() => {
        if (isSmallScreenWidth) {
            return shouldEnableMaxHeight ? {maxHeight: windowHeight - 250} : {};
        }
        return styles.createMenuContainer;
    }, [isSmallScreenWidth, shouldEnableMaxHeight, windowHeight, styles.createMenuContainer]);

    const {paddingTop, paddingBottom, paddingVertical, ...restScrollContainerStyle} = (StyleSheet.flatten([styles.pv4, scrollContainerStyle]) as ViewStyle) ?? {};

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
            onModalHide={handleModalHide}
            onModalShow={onModalShow}
            animationIn={animationIn}
            animationOut={animationOut}
            animationInDelay={animationInDelay}
            animationInTiming={animationInTiming}
            animationOutTiming={animationOutTiming}
            disableAnimation={disableAnimation}
            fromSidebarMediumScreen={fromSidebarMediumScreen}
            withoutOverlay={withoutOverlay}
            shouldSetModalVisibility={shouldSetModalVisibility}
            shouldEnableNewFocusManagement={shouldEnableNewFocusManagement}
            useNativeDriver
            restoreFocusType={restoreFocusType}
            innerContainerStyle={{...styles.pv0, ...innerContainerStyle}}
            shouldUseModalPaddingStyle={shouldUseModalPaddingStyle}
            testID={testID}
        >
            <FocusTrapForModal active={isVisible}>
                <View
                    onLayout={onLayout}
                    style={[menuContainerStyle, containerStyles, {paddingTop, paddingBottom, paddingVertical, ...(isWebOrDesktop ? styles.flex1 : styles.flexGrow1)}]}
                >
                    {renderHeaderText()}
                    {enteredSubMenuIndexes.length > 0 && renderBackButtonItem()}
                    {renderWithConditionalWrapper(shouldUseScrollView, restScrollContainerStyle, renderedMenuItems)}
                </View>
            </FocusTrapForModal>
        </PopoverWithMeasuredContent>
    );
}

PopoverMenu.displayName = 'PopoverMenu';

export default React.memo(
    PopoverMenu,
    (prevProps, nextProps) =>
        deepEqual(prevProps.menuItems, nextProps.menuItems) &&
        prevProps.isVisible === nextProps.isVisible &&
        deepEqual(prevProps.anchorPosition, nextProps.anchorPosition) &&
        prevProps.anchorRef === nextProps.anchorRef &&
        prevProps.headerText === nextProps.headerText &&
        prevProps.fromSidebarMediumScreen === nextProps.fromSidebarMediumScreen &&
        deepEqual(prevProps.anchorAlignment, nextProps.anchorAlignment) &&
        prevProps.animationIn === nextProps.animationIn &&
        prevProps.animationOut === nextProps.animationOut &&
        prevProps.animationInTiming === nextProps.animationInTiming &&
        prevProps.disableAnimation === nextProps.disableAnimation &&
        prevProps.withoutOverlay === nextProps.withoutOverlay &&
        prevProps.shouldSetModalVisibility === nextProps.shouldSetModalVisibility,
);
export type {PopoverMenuItem, PopoverMenuProps};

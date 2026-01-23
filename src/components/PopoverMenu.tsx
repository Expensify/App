/* eslint-disable react/jsx-props-no-spreading */
import {deepEqual} from 'fast-equals';
import type {ReactNode, RefObject} from 'react';
import React, {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import type {GestureResponderEvent, LayoutChangeEvent, StyleProp, TextStyle, ViewStyle} from 'react-native';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isSafari} from '@libs/Browser';
import getPlatform from '@libs/getPlatform';
import variables from '@styles/variables';
import {close} from '@userActions/Modal';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import type IconAsset from '@src/types/utils/IconAsset';
import FocusableMenuItem from './FocusableMenuItem';
import FocusTrapForModal from './FocusTrap/FocusTrapForModal';
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

    /** Whether to call onSelected for items with sub menu */
    shouldCallOnSelectedForSubMenuItem?: boolean;

    /** Sub menu items to be rendered after a menu item is selected */
    subMenuItems?: PopoverMenuItem[];

    /** Header text to be shown if sub menu items are opened */
    subMenuHeaderText?: string;

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

    rightIcon?: IconAsset;

    key?: string;

    /** Whether to keep the modal open after clicking on the menu item */
    shouldKeepModalOpen?: boolean;

    /** Test identifier used to find elements in unit and e2e tests */
    testID?: string;

    /** Whether to show a loading spinner icon for the menu item */
    shouldShowLoadingSpinnerIcon?: boolean;

    /** Whether to close the modal on select */
    shouldCloseModalOnSelect?: boolean;

    /** Additional data for the menu item */
    additionalData?: Record<string, unknown>;
};

type ModalAnimationProps = Pick<ReanimatedModalProps, 'animationInDelay' | 'animationIn' | 'animationInTiming' | 'animationOut' | 'animationOutTiming'>;

type PopoverMenuProps = Partial<ModalAnimationProps> & {
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

    /** Whether to put the header text after the back button */
    shouldPutHeaderTextAfterBackButton?: boolean;
};

const renderWithConditionalWrapper = (shouldUseScrollView: boolean, contentContainerStyle: StyleProp<ViewStyle>, children: ReactNode): React.JSX.Element => {
    if (shouldUseScrollView) {
        return <ScrollView contentContainerStyle={contentContainerStyle}>{children}</ScrollView>;
    }
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <View style={contentContainerStyle}>{children}</View>;
};

function getSelectedItemIndex(menuItems: PopoverMenuItem[]) {
    return menuItems.findIndex((option) => option.isSelected);
}

/**
 * Return a stable string key for a menu item.
 * Prefers explicit `key` property on the item. If missing, falls back to `text`.
 *
 * IMPORTANT: the key must be stable and unique across the whole menu tree for the
 * path-resolution algorithm to work reliably when menu arrays change.
 */
const getItemKey = (item: PopoverMenuItem) => item.key ?? item.text;

/**
 * Build a key-path (array of keys) by walking the `root` using `indexPath`.
 *
 * The `indexPath` is an array of indexes which represent the path previously
 * selected by the user (e.g. [1, 2] means: at root index 1, then its subMenuItems index 2).
 *
 * We iterate down the `root` following `indexPath` and collect getItemKey(node)
 * for each visited node. If any index is out-of-bounds for a level, we stop
 * and return the keys collected so far (could be empty).
 */
function buildKeyPathFromIndexPath(root: PopoverMenuItem[], indexPath: readonly number[]): string[] {
    const keys: string[] = [];
    let level: PopoverMenuItem[] | undefined = root;

    for (const idx of indexPath) {
        const node: PopoverMenuItem | undefined = level?.[idx];
        if (!node) {
            break;
        }
        keys.push(getItemKey(node));
        level = node.subMenuItems;
    }
    return keys;
}

/**
 * Try to resolve a key-path against the current `root` and return the corresponding index-path
 * and the `itemsAtLeaf` (the subMenuItems array of the final matched node, or an empty array).
 *
 * Returns `{found: false}` if any key in keyPath cannot be found at the expected level.
 */
function resolveIndexPathByKeyPath(root: PopoverMenuItem[], keyPath: string[]) {
    let level: PopoverMenuItem[] = root;
    const indexes: number[] = [];

    for (const key of keyPath) {
        const i = level.findIndex((n) => getItemKey(n) === key);
        if (i === -1) {
            return {found: false as const};
        }
        indexes.push(i);
        const next = level.at(i)?.subMenuItems;
        level = next ?? [];
    }
    return {found: true as const, indexes, itemsAtLeaf: level};
}

function PopoverMenu(props: PopoverMenuProps) {
    const wasVisible = usePrevious(props.isVisible);
    // Do not render the PopoverMenu before it gets opened. Until then both values are false
    if (!wasVisible && !props.isVisible) {
        return null;
    }
    return <BasePopoverMenu {...props} />;
}

function useHeaderState(initialHeaderText: string): [string, boolean, (newHeaderText: string, alwaysShow: boolean) => void, () => void, () => void] {
    const [headerTexts, setHeaderTexts] = useState<string[]>([initialHeaderText]);
    const [shouldAlwaysShowHeaderTexts, setShouldAlwaysShowHeaderTexts] = useState<boolean[]>([true]);
    const [headerIndex, setHeaderIndex] = useState(0);
    const currentHeaderText = headerTexts.at(headerIndex) ?? '';
    const shouldAlwaysShowHeaderText = shouldAlwaysShowHeaderTexts.at(headerIndex) ?? false;

    const pushHeaderText = (newHeaderText: string, alwaysShow: boolean) => {
        setHeaderTexts((prev) => [...prev, newHeaderText]);
        setShouldAlwaysShowHeaderTexts((prev) => [...prev, alwaysShow]);
        setHeaderIndex((index) => index + 1);
    };

    const popHeaderText = () => {
        setHeaderTexts((prev) => prev.slice(0, -1));
        setShouldAlwaysShowHeaderTexts((prev) => prev.slice(0, -1));
        setHeaderIndex((index) => index - 1);
    };

    const resetHeaderText = () => {
        setHeaderTexts([initialHeaderText]);
        setShouldAlwaysShowHeaderTexts([true]);
        setHeaderIndex(0);
    };

    return [currentHeaderText, shouldAlwaysShowHeaderText, pushHeaderText, popHeaderText, resetHeaderText];
}

function BasePopoverMenu({
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
    shouldPutHeaderTextAfterBackButton = false,
}: PopoverMenuProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply correct popover styles
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const [currentMenuItems, setCurrentMenuItems] = useState(menuItems);
    const currentMenuItemsFocusedIndex = getSelectedItemIndex(currentMenuItems);
    const [enteredSubMenuIndexes, setEnteredSubMenuIndexes] = useState<readonly number[]>(CONST.EMPTY_ARRAY);
    const platform = getPlatform();
    const isWeb = platform === CONST.PLATFORM.WEB;
    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({initialFocusedIndex: currentMenuItemsFocusedIndex, maxIndex: currentMenuItems.length - 1, isActive: isVisible});
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['BackArrow', 'ReceiptScan', 'MoneyCircle']);
    const prevMenuItems = usePrevious(menuItems);
    const [currentHeaderText, shouldAlwaysShowHeaderText, pushHeaderText, popHeaderText, resetHeaderText] = useHeaderState(headerText ?? '');

    const selectItem = (index: number, event?: GestureResponderEvent | KeyboardEvent) => {
        const selectedItem = currentMenuItems.at(index);
        if (!selectedItem) {
            return;
        }
        if (selectedItem?.subMenuItems) {
            if (selectedItem?.shouldCallOnSelectedForSubMenuItem) {
                selectedItem.onSelected?.();
            }
            setCurrentMenuItems([...selectedItem.subMenuItems]);
            setEnteredSubMenuIndexes([...enteredSubMenuIndexes, index]);
            pushHeaderText(selectedItem.subMenuHeaderText ?? '', !!selectedItem.subMenuHeaderText);
            const selectedSubMenuItemIndex = selectedItem?.subMenuItems.findIndex((option) => option.isSelected);
            setFocusedIndex(selectedSubMenuItemIndex);
        } else if (selectedItem.shouldCloseModalOnSelect === false) {
            onItemSelected?.(selectedItem, index, event);
            selectedItem.onSelected?.();
            setFocusedIndex(-1);
        } else if (selectedItem.shouldCallAfterModalHide && (!isSafari() || shouldAvoidSafariException)) {
            onItemSelected?.(selectedItem, index, event);
            close(
                () => {
                    selectedItem.onSelected?.();
                },
                undefined,
                selectedItem.shouldCloseAllModals,
            );
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
        const backButtonTitle = hasBackButtonText ? previouslySelectedItem?.backButtonText : previouslySelectedItem?.text;

        return (
            <MenuItem
                key={previouslySelectedItem?.text}
                icon={expensifyIcons.BackArrow}
                iconFill={(isHovered) => (isHovered ? theme.iconHovered : theme.icon)}
                style={hasBackButtonText ? styles.pv0 : undefined}
                additionalIconStyles={[{width: variables.iconSizeSmall, height: variables.iconSizeSmall}, styles.opacitySemiTransparent, styles.mr1]}
                title={backButtonTitle}
                accessibilityLabel={`${translate('common.goBack')}, ${backButtonTitle}`}
                titleStyle={hasBackButtonText ? styles.createMenuHeaderText : undefined}
                shouldShowBasicTitle={hasBackButtonText}
                shouldCheckActionAllowedOnPress={false}
                description={previouslySelectedItem?.description}
                onPress={() => {
                    popHeaderText();
                    setCurrentMenuItems(previousMenuItems);
                    setFocusedIndex(-1);
                    setEnteredSubMenuIndexes((prevState) => prevState.slice(0, -1));
                }}
            />
        );
    };

    const renderedMenuItems = currentMenuItems.map((item, menuIndex) => {
        const {text, onSelected, subMenuItems, shouldCallAfterModalHide, key, testID: menuItemTestID, shouldShowLoadingSpinnerIcon, ...menuItemProps} = item;
        const icon = typeof item.icon === 'string' ? expensifyIcons[item.icon as keyof typeof expensifyIcons] : item.icon;
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
                    icon={icon}
                    role={CONST.ROLE.BUTTON}
                    // Spread other props dynamically
                    {...menuItemProps}
                    hasSubMenuItems={!!subMenuItems?.length}
                    shouldShowLoadingSpinnerIcon={shouldShowLoadingSpinnerIcon}
                />
            </OfflineWithFeedback>
        );
    });

    const renderHeaderText = () => {
        if (!currentHeaderText || (enteredSubMenuIndexes.length !== 0 && !shouldAlwaysShowHeaderText)) {
            return;
        }
        return (
            <Text
                key={`${currentHeaderText}_${shouldPutHeaderTextAfterBackButton}`}
                style={[styles.createMenuHeaderText, styles.ph5, styles.pv3, headerStyles]}
            >
                {currentHeaderText}
            </Text>
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

    const keyboardShortcutSpaceCallback = useCallback(
        (e?: GestureResponderEvent | KeyboardEvent) => {
            if (shouldUseScrollView) {
                return;
            }

            e?.preventDefault();
        },
        [shouldUseScrollView],
    );

    // On web, pressing the space bar after interacting with the parent view
    // can cause the parent view to scroll when the space bar is pressed.
    useKeyboardShortcut(CONST.KEYBOARD_SHORTCUTS.SPACE, keyboardShortcutSpaceCallback, {isActive: isWeb && isVisible, shouldPreventDefault: false});

    const handleModalHide = () => {
        onModalHide?.();
        setFocusedIndex(currentMenuItemsFocusedIndex);
    };

    // When the menu items are changed, we want to reset the sub-menu to make sure
    // we are not accessing the wrong sub-menu parent or possibly undefined when rendering the back button.
    // We use useLayoutEffect so the reset happens before the repaint
    useLayoutEffect(() => {
        if (menuItems.length === 0 || deepEqual(menuItems, prevMenuItems)) {
            return;
        }

        // The following logic is designed to check whether the submenu was open, and if so, we check whether the path to this
        // submenu remained after the menuItems changes. If we were able to recreate the submenu from the new items, we leave it open;
        // if not, we close it. This is necessary in order to close the submenu only if its parent element has been removed from menuItems.
        const keyPath = buildKeyPathFromIndexPath(prevMenuItems ?? menuItems, enteredSubMenuIndexes);

        if (keyPath.length === 0) {
            setEnteredSubMenuIndexes(CONST.EMPTY_ARRAY);
            setCurrentMenuItems(menuItems);
            if (!isVisible) {
                setFocusedIndex(getSelectedItemIndex(menuItems));
            }
            return;
        }

        const resolved = resolveIndexPathByKeyPath(menuItems, keyPath);

        if (resolved.found) {
            setEnteredSubMenuIndexes(resolved.indexes);
            setCurrentMenuItems(resolved.itemsAtLeaf);
            if (!isVisible) {
                setFocusedIndex(getSelectedItemIndex(resolved.itemsAtLeaf));
            }
            return;
        }

        setEnteredSubMenuIndexes(CONST.EMPTY_ARRAY);
        setCurrentMenuItems(menuItems);
        if (!isVisible) {
            setFocusedIndex(getSelectedItemIndex(menuItems));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [menuItems, setFocusedIndex]);

    const menuContainerStyle = useMemo(() => {
        if (isSmallScreenWidth) {
            return shouldEnableMaxHeight ? [{maxHeight: CONST.POPOVER_MENU_MAX_HEIGHT_MOBILE}] : [];
        }

        const stylesArray: ViewStyle[] = [StyleSheet.flatten(styles.createMenuContainer)];

        if (shouldUseScrollView && shouldEnableMaxHeight) {
            stylesArray.push({maxHeight: CONST.POPOVER_MENU_MAX_HEIGHT});
        }

        return stylesArray;
    }, [isSmallScreenWidth, shouldEnableMaxHeight, styles.createMenuContainer, shouldUseScrollView]);

    const {paddingTop, paddingBottom, paddingVertical, ...restScrollContainerStyle} = (StyleSheet.flatten([styles.pv4, scrollContainerStyle]) as ViewStyle) ?? {};
    const {
        paddingVertical: menuContainerPaddingVertical,
        paddingTop: menuContainerPaddingTop,
        paddingBottom: menuContainerPaddingBottom,
        ...restMenuContainerStyle
    } = StyleSheet.flatten(menuContainerStyle) ?? {};

    const {
        paddingVertical: containerPaddingVertical,
        paddingTop: containerPaddingTop,
        paddingBottom: containerPaddingBottom,
        ...restContainerStyles
    } = StyleSheet.flatten(containerStyles) ?? {};

    const scrollViewPaddingStyles = useMemo(
        () => ({
            paddingTop: paddingTop ?? containerPaddingTop ?? menuContainerPaddingTop,
            paddingBottom: paddingBottom ?? containerPaddingBottom ?? menuContainerPaddingBottom,
            paddingVertical: paddingVertical ?? containerPaddingVertical ?? menuContainerPaddingVertical ?? 0,
        }),
        [
            paddingTop,
            containerPaddingTop,
            menuContainerPaddingTop,
            paddingBottom,
            containerPaddingBottom,
            menuContainerPaddingBottom,
            paddingVertical,
            containerPaddingVertical,
            menuContainerPaddingVertical,
        ],
    );

    return (
        <PopoverWithMeasuredContent
            anchorPosition={anchorPosition}
            anchorRef={anchorRef}
            anchorAlignment={anchorAlignment}
            onClose={() => {
                setCurrentMenuItems(menuItems);
                setEnteredSubMenuIndexes(CONST.EMPTY_ARRAY);
                resetHeaderText();
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
            restoreFocusType={restoreFocusType}
            innerContainerStyle={{...styles.pv0, ...innerContainerStyle}}
            shouldUseModalPaddingStyle={shouldUseModalPaddingStyle}
            testID={testID}
        >
            <FocusTrapForModal
                active={isVisible}
                shouldReturnFocus={!shouldEnableNewFocusManagement}
            >
                <View
                    onLayout={onLayout}
                    style={[restMenuContainerStyle, restContainerStyles, isWeb ? styles.flex1 : styles.flexGrow1]}
                >
                    {renderWithConditionalWrapper(
                        shouldUseScrollView,
                        [scrollViewPaddingStyles, restScrollContainerStyle],
                        [
                            !shouldPutHeaderTextAfterBackButton && renderHeaderText(),
                            enteredSubMenuIndexes.length > 0 && renderBackButtonItem(),
                            shouldPutHeaderTextAfterBackButton && renderHeaderText(),
                            renderedMenuItems,
                        ],
                    )}
                </View>
            </FocusTrapForModal>
        </PopoverWithMeasuredContent>
    );
}

PopoverMenu.displayName = 'PopoverMenu';

export default React.memo(
    PopoverMenu,
    (prevProps, nextProps) =>
        // eslint-disable-next-line rulesdir/no-deep-equal-in-memo -- menuItems array is created inline in most usages with unstable references
        deepEqual(prevProps.menuItems, nextProps.menuItems) &&
        prevProps.isVisible === nextProps.isVisible &&
        // eslint-disable-next-line rulesdir/no-deep-equal-in-memo -- anchorPosition object is created inline in most usages
        deepEqual(prevProps.anchorPosition, nextProps.anchorPosition) &&
        prevProps.anchorRef === nextProps.anchorRef &&
        prevProps.headerText === nextProps.headerText &&
        prevProps.fromSidebarMediumScreen === nextProps.fromSidebarMediumScreen &&
        // eslint-disable-next-line rulesdir/no-deep-equal-in-memo -- anchorAlignment object is created inline in most usages
        deepEqual(prevProps.anchorAlignment, nextProps.anchorAlignment) &&
        prevProps.animationIn === nextProps.animationIn &&
        prevProps.animationOut === nextProps.animationOut &&
        prevProps.animationInTiming === nextProps.animationInTiming &&
        prevProps.disableAnimation === nextProps.disableAnimation &&
        prevProps.withoutOverlay === nextProps.withoutOverlay &&
        prevProps.shouldSetModalVisibility === nextProps.shouldSetModalVisibility &&
        prevProps.shouldPutHeaderTextAfterBackButton === nextProps.shouldPutHeaderTextAfterBackButton,
);
export type {PopoverMenuItem, PopoverMenuProps};
export {getItemKey, buildKeyPathFromIndexPath, resolveIndexPathByKeyPath};

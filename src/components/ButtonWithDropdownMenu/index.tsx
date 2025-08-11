import type {RefObject} from 'react';
import React, {forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaPaddings from '@hooks/useSafeAreaPaddings';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import mergeRefs from '@libs/mergeRefs';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type {ButtonWithDropdownMenuProps} from './types';

type ButtonWithDropdownMenuRef = {
    setIsMenuVisible: (visible: boolean) => void;
};

function ButtonWithDropdownMenuInner<IValueType>(props: ButtonWithDropdownMenuProps<IValueType>, ref: React.Ref<ButtonWithDropdownMenuRef>) {
    const {
        success = true,
        isSplitButton = true,
        isLoading = false,
        isDisabled = false,
        pressOnEnter = false,
        shouldAlwaysShowDropdownMenu = false,
        menuHeaderText = '',
        customText,
        style,
        disabledStyle,
        buttonSize = CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
        anchorAlignment = {
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
        },
        popoverHorizontalOffsetType,
        buttonRef,
        onPress,
        options,
        onOptionSelected,
        onSubItemSelected,
        onOptionsMenuShow,
        onOptionsMenuHide,
        enterKeyEventListenerPriority = 0,
        wrapperStyle,
        useKeyboardShortcuts = false,
        shouldUseStyleUtilityForAnchorPosition = false,
        defaultSelectedIndex = 0,
        shouldShowSelectedItemCheck = false,
        testID,
        secondLineText = '',
        icon,
        shouldPopoverUseScrollView = false,
        containerStyles,
        shouldUseModalPaddingStyle = true,
        shouldUseShortForm = false,
        shouldUseOptionIcon = false,
    } = props;

    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [selectedItemIndex, setSelectedItemIndex] = useState(defaultSelectedIndex);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    // In tests, skip the popover anchor position calculation. The default values are needed for popover menu to be rendered in tests.
    const defaultPopoverAnchorPosition = process.env.NODE_ENV === 'test' ? {horizontal: 100, vertical: 100} : null;
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState<AnchorPosition | null>(defaultPopoverAnchorPosition);
    const {windowWidth, windowHeight} = useWindowDimensions();
    const dropdownAnchor = useRef<View | null>(null);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply correct popover styles
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    // eslint-disable-next-line react-compiler/react-compiler
    const dropdownButtonRef = isSplitButton ? buttonRef : mergeRefs(buttonRef, dropdownAnchor);
    const selectedItem = options.at(selectedItemIndex) ?? options.at(0);
    const areAllOptionsDisabled = options.every((option) => option.disabled);
    const innerStyleDropButton = StyleUtils.getDropDownButtonHeight(buttonSize);
    const isButtonSizeLarge = buttonSize === CONST.DROPDOWN_BUTTON_SIZE.LARGE;
    const isButtonSizeSmall = buttonSize === CONST.DROPDOWN_BUTTON_SIZE.SMALL;
    const nullCheckRef = (refParam: RefObject<View | null>) => refParam ?? null;
    const shouldShowButtonRightIcon = !!options.at(0)?.shouldShowButtonRightIcon;

    useEffect(() => {
        setSelectedItemIndex(defaultSelectedIndex);
    }, [defaultSelectedIndex]);

    const {paddingBottom} = useSafeAreaPaddings(true);

    useEffect(() => {
        if (!dropdownAnchor.current) {
            return;
        }
        if (!isMenuVisible) {
            return;
        }
        if ('measureInWindow' in dropdownAnchor.current) {
            dropdownAnchor.current.measureInWindow((x, y, w, h) => {
                let horizontalPosition = x + w;

                if (popoverHorizontalOffsetType === 'left') {
                    horizontalPosition = x;
                } else if (popoverHorizontalOffsetType === 'center') {
                    horizontalPosition = x + w / 2;
                }

                setPopoverAnchorPosition({
                    horizontal: horizontalPosition,
                    vertical:
                        anchorAlignment.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP
                            ? y + h + CONST.MODAL.POPOVER_MENU_PADDING // if vertical anchorAlignment is TOP, menu will open below the button and we need to add the height of button and padding
                            : y - CONST.MODAL.POPOVER_MENU_PADDING, // if it is BOTTOM, menu will open above the button so NO need to add height but DO subtract padding
                });
            });
        }
    }, [windowWidth, windowHeight, isMenuVisible, anchorAlignment.vertical, popoverHorizontalOffsetType]);

    const handleSingleOptionPress = useCallback(
        (event: GestureResponderEvent | KeyboardEvent | undefined) => {
            const option = options.at(0);
            if (!option) {
                return;
            }

            if (option.onSelected) {
                option.onSelected();
            } else {
                onOptionSelected?.(option);
                onPress(event, option.value);
            }

            onSubItemSelected?.(option, 0, event);
        },
        [options, onPress, onOptionSelected, onSubItemSelected],
    );

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER,
        (e) => {
            if (shouldAlwaysShowDropdownMenu || options.length) {
                if (!isSplitButton) {
                    setIsMenuVisible(!isMenuVisible);
                    return;
                }
                if (selectedItem?.value) {
                    onPress(e, selectedItem.value);
                }
            } else {
                handleSingleOptionPress(e);
            }
        },
        {
            captureOnInputs: true,
            shouldBubble: false,
            isActive: useKeyboardShortcuts,
        },
    );
    const splitButtonWrapperStyle = isSplitButton ? [styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter] : {};
    const isTextTooLong = customText && customText?.length > 6;

    const handlePress = useCallback(
        (event?: GestureResponderEvent | KeyboardEvent) => {
            if (!isSplitButton) {
                setIsMenuVisible(!isMenuVisible);
            } else if (selectedItem?.value) {
                onPress(event, selectedItem.value);
            }
        },
        [isMenuVisible, isSplitButton, onPress, selectedItem?.value],
    );

    useImperativeHandle(ref, () => ({
        setIsMenuVisible,
    }));

    return (
        <View style={wrapperStyle}>
            {shouldAlwaysShowDropdownMenu || options.length > 1 ? (
                <View style={[splitButtonWrapperStyle, style]}>
                    <Button
                        success={success}
                        pressOnEnter={pressOnEnter}
                        ref={dropdownButtonRef}
                        onPress={handlePress}
                        text={customText ?? selectedItem?.text ?? ''}
                        isDisabled={isDisabled || areAllOptionsDisabled}
                        isLoading={isLoading}
                        shouldRemoveRightBorderRadius
                        style={isSplitButton ? [styles.flex1, styles.pr0] : {}}
                        large={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                        medium={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                        small={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                        innerStyles={[innerStyleDropButton, !isSplitButton && styles.dropDownButtonCartIconView, isTextTooLong && shouldUseShortForm && {...styles.pl2, ...styles.pr1}]}
                        enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                        iconRight={Expensicons.DownArrow}
                        shouldShowRightIcon={!isSplitButton}
                        isSplitButton={isSplitButton}
                        testID={testID}
                        textStyles={[isTextTooLong && shouldUseShortForm ? {...styles.textExtraSmall, ...styles.textBold} : {}]}
                        secondLineText={secondLineText}
                        icon={icon}
                    />

                    {isSplitButton && (
                        <Button
                            ref={dropdownAnchor}
                            success={success}
                            isDisabled={isDisabled}
                            style={[styles.pl0]}
                            onPress={() => setIsMenuVisible(!isMenuVisible)}
                            shouldRemoveLeftBorderRadius
                            large={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                            medium={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                            small={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                            innerStyles={[styles.dropDownButtonCartIconContainerPadding, innerStyleDropButton, isButtonSizeSmall && styles.dropDownButtonCartIcon]}
                            enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                        >
                            <View style={[styles.dropDownButtonCartIconView, innerStyleDropButton]}>
                                <View style={[success ? styles.buttonSuccessDivider : styles.buttonDivider]} />
                                <View
                                    style={[
                                        isButtonSizeLarge && styles.dropDownLargeButtonArrowContain,
                                        isButtonSizeSmall && shouldUseShortForm ? styles.dropDownSmallButtonArrowContain : styles.dropDownMediumButtonArrowContain,
                                    ]}
                                >
                                    <Icon
                                        medium={isButtonSizeLarge}
                                        small={!isButtonSizeLarge && !shouldUseShortForm}
                                        inline={shouldUseShortForm}
                                        width={shouldUseShortForm ? variables.iconSizeExtraSmall : undefined}
                                        height={shouldUseShortForm ? variables.iconSizeExtraSmall : undefined}
                                        src={Expensicons.DownArrow}
                                        additionalStyles={shouldUseShortForm ? [styles.pRelative, styles.t0] : undefined}
                                        fill={success ? theme.buttonSuccessText : theme.icon}
                                    />
                                </View>
                            </View>
                        </Button>
                    )}
                </View>
            ) : (
                <Button
                    success={success}
                    ref={buttonRef}
                    pressOnEnter={pressOnEnter}
                    isDisabled={isDisabled || !!options.at(0)?.disabled}
                    style={[styles.w100, style]}
                    disabledStyle={disabledStyle}
                    isLoading={isLoading}
                    text={selectedItem?.text}
                    onPress={handleSingleOptionPress}
                    large={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                    medium={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    small={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                    innerStyles={[innerStyleDropButton, shouldShowButtonRightIcon && styles.dropDownButtonCartIconView]}
                    iconRightStyles={shouldShowButtonRightIcon && styles.ml2}
                    enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                    secondLineText={secondLineText}
                    icon={shouldUseOptionIcon && !shouldShowButtonRightIcon ? options.at(0)?.icon : icon}
                    iconRight={shouldShowButtonRightIcon ? options.at(0)?.icon : undefined}
                    shouldShowRightIcon={shouldShowButtonRightIcon}
                    testID={testID}
                />
            )}
            {(shouldAlwaysShowDropdownMenu || options.length > 1) && !!popoverAnchorPosition && (
                <PopoverMenu
                    isVisible={isMenuVisible}
                    onClose={() => {
                        setIsMenuVisible(false);
                        onOptionsMenuHide?.();
                    }}
                    onModalShow={onOptionsMenuShow}
                    onItemSelected={(selectedSubitem, index, event) => {
                        onSubItemSelected?.(selectedSubitem, index, event);
                        if (selectedSubitem.shouldCloseModalOnSelect !== false) {
                            setIsMenuVisible(false);
                        }
                    }}
                    anchorPosition={shouldUseStyleUtilityForAnchorPosition ? styles.popoverButtonDropdownMenuOffset(windowWidth) : popoverAnchorPosition}
                    shouldShowSelectedItemCheck={shouldShowSelectedItemCheck}
                    // eslint-disable-next-line react-compiler/react-compiler
                    anchorRef={nullCheckRef(dropdownAnchor)}
                    scrollContainerStyle={!shouldUseModalPaddingStyle && isSmallScreenWidth && {...styles.pt4, paddingBottom}}
                    anchorAlignment={anchorAlignment}
                    shouldUseModalPaddingStyle={shouldUseModalPaddingStyle}
                    headerText={menuHeaderText}
                    shouldUseScrollView={shouldPopoverUseScrollView}
                    containerStyles={containerStyles}
                    menuItems={options.map((item, index) => ({
                        ...item,
                        onSelected: item.onSelected
                            ? () => {
                                  item.onSelected?.();
                                  if (item.shouldUpdateSelectedIndex) {
                                      setSelectedItemIndex(index);
                                  }
                              }
                            : () => {
                                  onOptionSelected?.(item);
                                  if (item.shouldUpdateSelectedIndex === false) {
                                      return;
                                  }

                                  setSelectedItemIndex(index);
                              },
                        shouldCallAfterModalHide: true,
                        subMenuItems: item.subMenuItems?.map((subItem) => ({...subItem, shouldCallAfterModalHide: true})),
                    }))}
                />
            )}
        </View>
    );
}

ButtonWithDropdownMenuInner.displayName = 'ButtonWithDropdownMenu';
const ButtonWithDropdownMenu = forwardRef(ButtonWithDropdownMenuInner) as <IValueType>(
    props: ButtonWithDropdownMenuProps<IValueType> & {ref?: React.Ref<ButtonWithDropdownMenuRef>},
) => ReturnType<typeof ButtonWithDropdownMenuInner>;
export default ButtonWithDropdownMenu;

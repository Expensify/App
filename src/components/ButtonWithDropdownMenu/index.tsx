import type {MutableRefObject} from 'react';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import useKeyboardShortcut from '@hooks/useKeyboardShortcut';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import mergeRefs from '@libs/mergeRefs';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type {ButtonWithDropdownMenuProps} from './types';

function ButtonWithDropdownMenu<IValueType>({
    success = false,
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
    buttonRef,
    onPress,
    options,
    onOptionSelected,
    onOptionsMenuShow,
    onOptionsMenuHide,
    enterKeyEventListenerPriority = 0,
    wrapperStyle,
    useKeyboardShortcuts = false,
    shouldUseStyleUtilityForAnchorPosition = false,
    defaultSelectedIndex = 0,
    shouldShowSelectedItemCheck = false,
}: ButtonWithDropdownMenuProps<IValueType>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [selectedItemIndex, setSelectedItemIndex] = useState(defaultSelectedIndex);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState<AnchorPosition | null>(null);
    const {windowWidth, windowHeight} = useWindowDimensions();
    const dropdownAnchor = useRef<View | null>(null);
    const dropdownButtonRef = isSplitButton ? buttonRef : mergeRefs(buttonRef, dropdownAnchor);
    const selectedItem = options.at(selectedItemIndex) ?? options.at(0);
    const innerStyleDropButton = StyleUtils.getDropDownButtonHeight(buttonSize);
    const isButtonSizeLarge = buttonSize === CONST.DROPDOWN_BUTTON_SIZE.LARGE;
    const nullCheckRef = (ref: MutableRefObject<View | null>) => ref ?? null;

    useEffect(() => {
        if (!dropdownAnchor.current) {
            return;
        }
        if (!isMenuVisible) {
            return;
        }
        if ('measureInWindow' in dropdownAnchor.current) {
            dropdownAnchor.current.measureInWindow((x, y, w, h) => {
                setPopoverAnchorPosition({
                    horizontal: x + w,
                    vertical:
                        anchorAlignment.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP
                            ? y + h + CONST.MODAL.POPOVER_MENU_PADDING // if vertical anchorAlignment is TOP, menu will open below the button and we need to add the height of button and padding
                            : y - CONST.MODAL.POPOVER_MENU_PADDING, // if it is BOTTOM, menu will open above the button so NO need to add height but DO subtract padding
                });
            });
        }
    }, [windowWidth, windowHeight, isMenuVisible, anchorAlignment.vertical]);

    useKeyboardShortcut(
        CONST.KEYBOARD_SHORTCUTS.CTRL_ENTER,
        (e) => {
            if (shouldAlwaysShowDropdownMenu || options.length) {
                if (!isSplitButton) {
                    setIsMenuVisible(!isMenuVisible);
                    return;
                }
                if (selectedItem?.value) {
                    onPress(e, selectedItem?.value);
                }
            } else {
                const option = options.at(0);
                if (option?.value) {
                    onPress(e, option?.value);
                }
            }
        },
        {
            captureOnInputs: true,
            shouldBubble: false,
            isActive: useKeyboardShortcuts,
        },
    );
    const splitButtonWrapperStyle = isSplitButton ? [styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter] : {};

    return (
        <View style={wrapperStyle}>
            {shouldAlwaysShowDropdownMenu || options.length > 1 ? (
                <View style={[splitButtonWrapperStyle, style]}>
                    <Button
                        success={success}
                        pressOnEnter={pressOnEnter}
                        ref={dropdownButtonRef}
                        // eslint-disable-next-line no-nested-ternary
                        onPress={(event) => (!isSplitButton ? setIsMenuVisible(!isMenuVisible) : selectedItem?.value ? onPress(event, selectedItem?.value) : undefined)}
                        text={customText ?? selectedItem?.text ?? ''}
                        isDisabled={isDisabled || !!selectedItem?.disabled}
                        isLoading={isLoading}
                        shouldRemoveRightBorderRadius
                        style={isSplitButton ? [styles.flex1, styles.pr0] : {}}
                        large={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                        medium={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                        small={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                        innerStyles={[innerStyleDropButton, !isSplitButton && styles.dropDownButtonCartIconView]}
                        enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                        iconRight={Expensicons.DownArrow}
                        shouldShowRightIcon={!isSplitButton}
                        isSplitButton={isSplitButton}
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
                            innerStyles={[styles.dropDownButtonCartIconContainerPadding, innerStyleDropButton]}
                            enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                        >
                            <View style={[styles.dropDownButtonCartIconView, innerStyleDropButton]}>
                                <View style={[success ? styles.buttonSuccessDivider : styles.buttonDivider]} />
                                <View style={[isButtonSizeLarge ? styles.dropDownLargeButtonArrowContain : styles.dropDownMediumButtonArrowContain]}>
                                    <Icon
                                        medium={isButtonSizeLarge}
                                        small={!isButtonSizeLarge}
                                        src={Expensicons.DownArrow}
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
                    onPress={(event) => {
                        const option = options.at(0);
                        return option ? onPress(event, option.value) : undefined;
                    }}
                    large={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.LARGE}
                    medium={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    small={buttonSize === CONST.DROPDOWN_BUTTON_SIZE.SMALL}
                    innerStyles={[innerStyleDropButton]}
                    enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                />
            )}
            {(shouldAlwaysShowDropdownMenu || options.length > 1) && popoverAnchorPosition && (
                <PopoverMenu
                    isVisible={isMenuVisible}
                    onClose={() => {
                        setIsMenuVisible(false);
                        onOptionsMenuHide?.();
                    }}
                    onModalShow={onOptionsMenuShow}
                    onItemSelected={() => setIsMenuVisible(false)}
                    anchorPosition={shouldUseStyleUtilityForAnchorPosition ? styles.popoverButtonDropdownMenuOffset(windowWidth) : popoverAnchorPosition}
                    shouldShowSelectedItemCheck={shouldShowSelectedItemCheck}
                    anchorRef={nullCheckRef(dropdownAnchor)}
                    withoutOverlay
                    anchorAlignment={anchorAlignment}
                    headerText={menuHeaderText}
                    menuItems={options.map((item, index) => ({
                        ...item,
                        onSelected: item.onSelected
                            ? () => item.onSelected?.()
                            : () => {
                                  onOptionSelected?.(item);
                                  setSelectedItemIndex(index);
                              },
                        shouldCallAfterModalHide: true,
                    }))}
                />
            )}
        </View>
    );
}

ButtonWithDropdownMenu.displayName = 'ButtonWithDropdownMenu';

export default ButtonWithDropdownMenu;

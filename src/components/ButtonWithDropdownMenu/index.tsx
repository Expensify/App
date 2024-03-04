import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PopoverMenu from '@components/PopoverMenu';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {AnchorPosition} from '@src/styles';
import type {ButtonWithDropdownMenuProps} from './types';

function ButtonWithDropdownMenu<IValueType>({
    success = false,
    isLoading = false,
    isDisabled = false,
    pressOnEnter = false,
    shouldAlwaysShowDropdownMenu = false,
    menuHeaderText = '',
    customText,
    style,
    buttonSize = CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
    anchorAlignment = {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
    buttonRef,
    onPress,
    options,
    onOptionSelected,
    enterKeyEventListenerPriority = 0,
}: ButtonWithDropdownMenuProps<IValueType>) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [selectedItemIndex, setSelectedItemIndex] = useState(0);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState<AnchorPosition | null>(null);
    const {windowWidth, windowHeight} = useWindowDimensions();
    const caretButton = useRef<View & HTMLDivElement>(null);
    const selectedItem = options[selectedItemIndex] || options[0];
    const innerStyleDropButton = StyleUtils.getDropDownButtonHeight(buttonSize);
    const isButtonSizeLarge = buttonSize === CONST.DROPDOWN_BUTTON_SIZE.LARGE;

    useEffect(() => {
        if (!caretButton.current) {
            return;
        }
        if (!isMenuVisible) {
            return;
        }
        if ('measureInWindow' in caretButton.current) {
            caretButton.current.measureInWindow((x, y, w, h) => {
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

    return (
        <View>
            {shouldAlwaysShowDropdownMenu || options.length > 1 ? (
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, style]}>
                    <Button
                        success={success}
                        pressOnEnter={pressOnEnter}
                        ref={buttonRef}
                        onPress={(event) => onPress(event, selectedItem.value)}
                        text={customText ?? selectedItem.text}
                        isDisabled={isDisabled}
                        isLoading={isLoading}
                        shouldRemoveRightBorderRadius
                        style={[styles.flex1, styles.pr0]}
                        large={isButtonSizeLarge}
                        medium={!isButtonSizeLarge}
                        innerStyles={[innerStyleDropButton, customText !== undefined && styles.cursorDefault, customText !== undefined && styles.pointerEventsNone]}
                        enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                    />

                    <Button
                        ref={caretButton}
                        success={success}
                        isDisabled={isDisabled}
                        style={[styles.pl0]}
                        onPress={() => setIsMenuVisible(!isMenuVisible)}
                        shouldRemoveLeftBorderRadius
                        large={isButtonSizeLarge}
                        medium={!isButtonSizeLarge}
                        innerStyles={[styles.dropDownButtonCartIconContainerPadding, innerStyleDropButton]}
                        enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                    >
                        <View style={[styles.dropDownButtonCartIconView, innerStyleDropButton]}>
                            <View style={[success ? styles.buttonSuccessDivider : styles.buttonDivider]} />
                            <View style={[styles.dropDownButtonArrowContain]}>
                                <Icon
                                    src={Expensicons.DownArrow}
                                    fill={success ? theme.buttonSuccessText : theme.icon}
                                    width={variables.iconSizeSmall}
                                    height={variables.iconSizeSmall}
                                />
                            </View>
                        </View>
                    </Button>
                </View>
            ) : (
                <Button
                    success={success}
                    ref={buttonRef}
                    pressOnEnter={pressOnEnter}
                    isDisabled={isDisabled}
                    style={[styles.w100, style]}
                    isLoading={isLoading}
                    text={selectedItem.text}
                    onPress={(event) => onPress(event, options[0].value)}
                    large={isButtonSizeLarge}
                    medium={!isButtonSizeLarge}
                    innerStyles={[innerStyleDropButton]}
                    enterKeyEventListenerPriority={enterKeyEventListenerPriority}
                />
            )}
            {(shouldAlwaysShowDropdownMenu || options.length > 1) && popoverAnchorPosition && (
                <PopoverMenu
                    isVisible={isMenuVisible}
                    onClose={() => setIsMenuVisible(false)}
                    onItemSelected={() => setIsMenuVisible(false)}
                    anchorPosition={popoverAnchorPosition}
                    anchorRef={caretButton}
                    withoutOverlay
                    anchorAlignment={anchorAlignment}
                    headerText={menuHeaderText}
                    menuItems={options.map((item, index) => ({
                        ...item,
                        onSelected:
                            item.onSelected ??
                            (() => {
                                onOptionSelected?.(item);
                                setSelectedItemIndex(index);
                            }),
                    }))}
                />
            )}
        </View>
    );
}

ButtonWithDropdownMenu.displayName = 'ButtonWithDropdownMenu';

export default ButtonWithDropdownMenu;

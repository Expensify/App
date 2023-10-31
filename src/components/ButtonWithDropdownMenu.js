import PropTypes from 'prop-types';
import React, {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import Button from './Button';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import PopoverMenu from './PopoverMenu';

const propTypes = {
    /** Text to display for the menu header */
    menuHeaderText: PropTypes.string,

    /** Callback to execute when the main button is pressed */
    onPress: PropTypes.func.isRequired,

    /** Call the onPress function on main button when Enter key is pressed */
    pressOnEnter: PropTypes.bool,

    /** Whether we should show a loading state for the main button */
    isLoading: PropTypes.bool,

    /** The size of button size */
    buttonSize: PropTypes.oneOf(_.values(CONST.DROPDOWN_BUTTON_SIZE)),

    /** Should the confirmation button be disabled? */
    isDisabled: PropTypes.bool,

    /** Additional styles to add to the component */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Menu options to display */
    /** e.g. [{text: 'Pay with Expensify', icon: Wallet}] */
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            text: PropTypes.string.isRequired,
            icon: PropTypes.elementType,
            iconWidth: PropTypes.number,
            iconHeight: PropTypes.number,
            iconDescription: PropTypes.string,
        }),
    ).isRequired,

    /** The anchor alignment of the popover menu */
    anchorAlignment: PropTypes.shape({
        horizontal: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL)),
        vertical: PropTypes.oneOf(_.values(CONST.MODAL.ANCHOR_ORIGIN_VERTICAL)),
    }),

    /* ref for the button */
    buttonRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};

const defaultProps = {
    isLoading: false,
    isDisabled: false,
    pressOnEnter: false,
    menuHeaderText: '',
    style: [],
    buttonSize: CONST.DROPDOWN_BUTTON_SIZE.MEDIUM,
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
    buttonRef: () => {},
};

function ButtonWithDropdownMenu(props) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [selectedItemIndex, setSelectedItemIndex] = useState(0);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState(null);
    const {windowWidth, windowHeight} = useWindowDimensions();
    const caretButton = useRef(null);
    const selectedItem = props.options[selectedItemIndex];
    const innerStyleDropButton = StyleUtils.getDropDownButtonHeight(props.buttonSize);
    const isButtonSizeLarge = props.buttonSize === CONST.DROPDOWN_BUTTON_SIZE.LARGE;

    useEffect(() => {
        if (!caretButton.current) {
            return;
        }
        if (!isMenuVisible) {
            return;
        }
        caretButton.current.measureInWindow((x, y, w, h) => {
            setPopoverAnchorPosition({
                horizontal: x + w,
                vertical:
                    props.anchorAlignment.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP
                        ? y + h + CONST.MODAL.POPOVER_MENU_PADDING // if vertical anchorAlignment is TOP, menu will open below the button and we need to add the height of button and padding
                        : y - CONST.MODAL.POPOVER_MENU_PADDING, // if it is BOTTOM, menu will open above the button so NO need to add height but DO subtract padding
            });
        });
    }, [windowWidth, windowHeight, isMenuVisible, props.anchorAlignment.vertical]);

    return (
        <View>
            {props.options.length > 1 ? (
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter, ...props.style]}>
                    <Button
                        success
                        pressOnEnter={props.pressOnEnter}
                        ref={props.buttonRef}
                        onPress={(event) => props.onPress(event, selectedItem.value)}
                        text={selectedItem.text}
                        isDisabled={props.isDisabled}
                        isLoading={props.isLoading}
                        shouldRemoveRightBorderRadius
                        style={[styles.flex1, styles.pr0]}
                        large={isButtonSizeLarge}
                        medium={!isButtonSizeLarge}
                        innerStyles={[innerStyleDropButton]}
                    />

                    <Button
                        ref={caretButton}
                        success
                        isDisabled={props.isDisabled}
                        style={[styles.pl0]}
                        onPress={() => setIsMenuVisible(!isMenuVisible)}
                        shouldRemoveLeftBorderRadius
                        large={isButtonSizeLarge}
                        medium={!isButtonSizeLarge}
                        innerStyles={[styles.dropDownButtonCartIconContainerPadding, innerStyleDropButton]}
                    >
                        <View style={[styles.dropDownButtonCartIconView, innerStyleDropButton]}>
                            <View style={[styles.buttonDivider]} />
                            <View style={[styles.dropDownButtonArrowContain]}>
                                <Icon
                                    src={Expensicons.DownArrow}
                                    fill={theme.textLight}
                                />
                            </View>
                        </View>
                    </Button>
                </View>
            ) : (
                <Button
                    success
                    ref={props.buttonRef}
                    pressOnEnter={props.pressOnEnter}
                    isDisabled={props.isDisabled}
                    style={[styles.w100, ...props.style]}
                    isLoading={props.isLoading}
                    text={selectedItem.text}
                    onPress={(event) => props.onPress(event, props.options[0].value)}
                    large={isButtonSizeLarge}
                    medium={!isButtonSizeLarge}
                    innerStyles={[innerStyleDropButton]}
                />
            )}
            {props.options.length > 1 && !_.isEmpty(popoverAnchorPosition) && (
                <PopoverMenu
                    isVisible={isMenuVisible}
                    onClose={() => setIsMenuVisible(false)}
                    onItemSelected={() => setIsMenuVisible(false)}
                    anchorPosition={popoverAnchorPosition}
                    anchorRef={caretButton}
                    withoutOverlay
                    anchorAlignment={props.anchorAlignment}
                    headerText={props.menuHeaderText}
                    menuItems={_.map(props.options, (item, index) => ({
                        ...item,
                        onSelected: () => {
                            setSelectedItemIndex(index);
                        },
                    }))}
                />
            )}
        </View>
    );
}

ButtonWithDropdownMenu.propTypes = propTypes;
ButtonWithDropdownMenu.defaultProps = defaultProps;
ButtonWithDropdownMenu.displayName = 'ButtonWithDropdownMenu';

export default React.memo(ButtonWithDropdownMenu);

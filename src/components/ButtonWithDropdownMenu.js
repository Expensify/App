import React, {useState, useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import useWindowDimensions from '../hooks/useWindowDimensions';
import styles from '../styles/styles';
import Button from './Button';
import PopoverMenu from './PopoverMenu';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import themeColors from '../styles/themes/default';
import CONST from '../CONST';

const propTypes = {
    /** Text to display for the menu header */
    menuHeaderText: PropTypes.string,

    /** Callback to execute when the main button is pressed */
    onPress: PropTypes.func.isRequired,

    /** Whether we should show a loading state for the main button */
    isLoading: PropTypes.bool,

    /** Should the confirmation button be disabled? */
    isDisabled: PropTypes.bool,

    /** Additional styles to add to the component */
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Menu options to display */
    /** e.g. [{text: 'Pay with Expensify', icon: Wallet}, {text: 'PayPal', icon: PayPal}] */
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
    menuHeaderText: '',
    style: [],
    anchorAlignment: {
        horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
        vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP, // we assume that popover menu opens below the button, anchor is at TOP
    },
    buttonRef: () => {},
};

function ButtonWithDropdownMenu(props) {
    const [selectedItemIndex, setSelectedItemIndex] = useState(0);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState(null);
    const {windowWidth, windowHeight} = useWindowDimensions();
    const caretButton = useRef(null);
    const selectedItem = props.options[selectedItemIndex];

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
                        ref={props.buttonRef}
                        onPress={(event) => props.onPress(event, selectedItem.value)}
                        text={selectedItem.text}
                        isDisabled={props.isDisabled}
                        isLoading={props.isLoading}
                        shouldRemoveRightBorderRadius
                        style={[styles.flex1, styles.pr0]}
                        pressOnEnter
                    />
                    <View style={styles.buttonDivider} />
                    <Button
                        ref={caretButton}
                        success
                        isDisabled={props.isDisabled}
                        style={[styles.pl0]}
                        onPress={() => setIsMenuVisible(!isMenuVisible)}
                        shouldRemoveLeftBorderRadius
                    >
                        <Icon
                            src={Expensicons.DownArrow}
                            fill={themeColors.textLight}
                        />
                    </Button>
                </View>
            ) : (
                <Button
                    success
                    isDisabled={props.isDisabled}
                    style={[styles.w100, ...props.style]}
                    isLoading={props.isLoading}
                    text={selectedItem.text}
                    onPress={(event) => props.onPress(event, props.options[0].value)}
                    pressOnEnter
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

import React, {useState, useRef, useEffect} from 'react';
import PropTypes from 'prop-types';
import {View, useWindowDimensions} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import Button from './Button';
import PopoverMenu from './PopoverMenu';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import themeColors from '../styles/themes/default';

const propTypes = {
    /** Text to display for the menu header */
    menuHeaderText: PropTypes.string,

    /** Callback to execute when the main button is pressed */
    onPress: PropTypes.func.isRequired,

    /** Whether we should show a loading state for the main button */
    isLoading: PropTypes.bool,

    /** Should the confirmation button be disabled? */
    isDisabled: PropTypes.bool,

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
};

const defaultProps = {
    isLoading: false,
    isDisabled: false,
    menuHeaderText: '',
};

const ButtonWithDropdownMenu = (props) => {
    const [selectedItemIndex, setSelectedItemIndex] = useState(0);
    const [isMenuVisible, setIsMenuVisible] = useState(false);
    const [popoverAnchorPosition, setPopoverAnchorPosition] = useState(null);
    const {width, height} = useWindowDimensions();
    const caretButton = useRef(null);
    useEffect(() => {
        if (!caretButton.current) {
            return;
        }
        caretButton.current.measureInWindow((x, y, w, h) => {
            setPopoverAnchorPosition({
                left: x,
                top: y + w + 10,
            });
        });
    }, [width, height]);

    const selectedItem = props.options[selectedItemIndex];
    return (
        <View>
            {props.options.length > 1 ? (
                <View style={[styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                    <Button
                        success
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
                        onPress={() => {
                            setIsMenuVisible(true);
                        }}
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
                    style={[styles.w100]}
                    isLoading={props.isLoading}
                    text={selectedItem.text}
                    onPress={(event) => props.onPress(event, props.options[0].value)}
                    pressOnEnter
                />
            )}
            {props.options.length > 1 && (
                <PopoverMenu
                    isVisible={isMenuVisible}
                    onClose={() => setIsMenuVisible(false)}
                    onItemSelected={() => setIsMenuVisible(false)}
                    anchorPosition={popoverAnchorPosition}
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
};

ButtonWithDropdownMenu.propTypes = propTypes;
ButtonWithDropdownMenu.defaultProps = defaultProps;
ButtonWithDropdownMenu.displayName = 'ButtonWithDropdownMenu';

export default React.memo(ButtonWithDropdownMenu);

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import styles from '../styles/styles';
import Button from './Button';
import ButtonWithDropdown from './ButtonWithDropdown';
import PopoverMenu from './PopoverMenu';

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
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        icon: PropTypes.elementType,
        iconWidth: PropTypes.number,
        iconHeight: PropTypes.number,
        iconDescription: PropTypes.string,
    })).isRequired,
};

const defaultProps = {
    isLoading: false,
    isDisabled: false,
    menuHeaderText: '',
};

class ButtonWithMenu extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            selectedItemIndex: 0,
            isMenuVisible: false,
        };
    }

    setMenuVisibility(isMenuVisible) {
        this.setState({isMenuVisible});
    }

    render() {
        const selectedItem = this.props.options[this.state.selectedItemIndex];
        return (
            <View>
                {this.props.options.length > 1 ? (
                    <ButtonWithDropdown
                        buttonText={selectedItem.text}
                        isLoading={this.props.isLoading}
                        isDisabled={this.props.isDisabled}
                        onButtonPress={event => this.props.onPress(event, selectedItem.value)}
                        onDropdownPress={() => {
                            this.setMenuVisibility(true);
                        }}
                    />
                ) : (
                    <Button
                        success
                        isDisabled={this.props.isDisabled}
                        style={[styles.w100]}
                        isLoading={this.props.isLoading}
                        text={selectedItem.text}
                        onPress={event => this.props.onPress(event, this.props.options[0].value)}
                        pressOnEnter
                    />
                )}
                {this.props.options.length > 1 && (
                    <PopoverMenu
                        isVisible={this.state.isMenuVisible}
                        onClose={() => this.setMenuVisibility(false)}
                        onItemSelected={() => this.setMenuVisibility(false)}
                        anchorPosition={styles.createMenuPositionRightSidepane}
                        headerText={this.props.menuHeaderText}
                        menuItems={_.map(this.props.options, (item, index) => ({
                            ...item,
                            onSelected: () => {
                                this.setState({selectedItemIndex: index});
                            },
                        }))}
                    />
                )}
            </View>
        );
    }
}

ButtonWithMenu.propTypes = propTypes;
ButtonWithMenu.defaultProps = defaultProps;

export default ButtonWithMenu;

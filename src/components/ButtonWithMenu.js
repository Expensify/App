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
    onButtonPress: PropTypes.func,

    /** Callback to execute when a menu item is selected */
    onChange: PropTypes.func,

    /** Whether we should show a loading state for the main button */
    isLoading: PropTypes.bool,

    /** Is the network currently offline or not */
    isOffline: PropTypes.bool,

    /** Menu options to display */
    /** [{text: 'Pay with Expensify', icon: Wallet}, {text: 'PayPal', icon: PayPal}, {text: 'Venmo', icon: Venmo}] */
    options: PropTypes.arrayOf(PropTypes.shape({
        text: PropTypes.string.isRequired,
        icon: PropTypes.elementType,
        iconWidth: PropTypes.number,
        iconHeight: PropTypes.number,
        iconDescription: PropTypes.string,
    })).isRequired,
};

const defaultProps = {
    onButtonPress: () => {},
    onChange: () => {},
    isLoading: false,
    isOffline: false,
    menuHeaderText: '',
};

class ButtonWithMenu extends PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            selectedItem: props.options[0],
            isMenuVisible: false,
        };
    }

    setMenuVisibility(isMenuVisible) {
        this.setState({isMenuVisible});
    }

    render() {
        const selectedItemText = this.state.selectedItem.text;
        return (
            <View style={styles.p5}>
                {this.props.options.length > 1 ? (
                    <ButtonWithDropdown
                        success
                        buttonText={selectedItemText}
                        isLoading={this.props.isLoading}
                        onButtonPress={this.props.onButtonPress}
                        onDropdownPress={() => {
                            this.setMenuVisibility(true);
                        }}
                    />
                ) : (
                    <Button
                        success
                        isDisabled={this.props.isOffline}
                        style={[styles.w100]}
                        isLoading={this.props.isLoading && !this.props.isOffline}
                        text={selectedItemText}
                        onPress={this.props.onButtonPress}
                        pressOnEnter
                    />
                )}
                {this.props.options.length > 1 && (
                    <PopoverMenu
                        isVisible={this.state.isMenuVisible}
                        onClose={() => this.setMenuVisibility(false)}
                        onItemSelected={() => this.setMenuVisibility(false)}
                        anchorPosition={styles.createMenuPositionRightSidepane}
                        animationIn="fadeInUp"
                        animationOut="fadeOutDown"
                        headerText={this.props.menuHeaderText}
                        menuItems={_.map(this.props.options, item => ({
                            ...item,
                            onSelected: () => {
                                this.setState({selectedItem: item});
                                this.props.onChange(item);
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
ButtonWithMenu.displayName = 'ButtonWithMenu';

export default ButtonWithMenu;

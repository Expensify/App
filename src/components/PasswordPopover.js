import {TouchableOpacity, View} from 'react-native';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';
import Popover from './Popover';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import compose from '../libs/compose';
import withWindowDimensions from './withWindowDimensions';
import TextInput from './TextInput';

const propTypes = {
    /** Is the popover currently showing? */
    isVisible: PropTypes.bool.isRequired,

    /** Function that gets called when the user closes the modal */
    onClose: PropTypes.func.isRequired,

    /** Where the popover should be placed */
    anchorPosition: PropTypes.shape({
        top: PropTypes.number,
        left: PropTypes.number,
    }).isRequired,

    /** Function that gets called when the user clicks the delete / make default button */
    onSubmit: PropTypes.func,

    /** The text that should be displayed in the submit button */
    submitButtonText: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    onSubmit: () => {},
    submitButtonText: '',
};

class PasswordPopover extends Component {
    constructor(props) {
        super(props);

        this.passwordInput = undefined;

        this.focusInput = this.focusInput.bind(this);

        this.state = {
            password: '',
        };
    }

    /**
     * Focus the password input
     */
    focusInput() {
        if (!this.passwordInput) {
            return;
        }
        this.passwordInput.focus();
    }

    render() {
        return (
            <Popover
                isVisible={this.props.isVisible}
                onClose={this.props.onClose}
                anchorPosition={this.props.anchorPosition}
                onModalShow={this.focusInput}
            >
                <View
                    style={[
                        styles.m5,
                        !this.props.isSmallScreenWidth ? styles.sidebarPopover : '',
                    ]}
                >
                    <Text
                        style={[
                            styles.mb3,
                        ]}
                    >
                        {this.props.translate('passwordForm.pleaseFillPassword')}
                    </Text>
                    <TextInput
                        label={this.props.translate('common.password')}
                        ref={el => this.passwordInput = el}
                        secureTextEntry
                        autoCompleteType="password"
                        textContentType="password"
                        value={this.state.currentPassword}
                        onChangeText={password => this.setState({password})}
                        returnKeyType="done"
                        onSubmitEditing={() => this.props.onSubmit(this.state.password)}
                        style={styles.mt3}
                        autoFocus
                    />
                    <TouchableOpacity
                        onPress={() => this.props.onSubmit(this.state.password)}
                        style={[
                            styles.button,
                            styles.mt3,
                            styles.w100,
                        ]}
                    >
                        <Text style={[styles.buttonText]}>
                            {this.props.submitButtonText}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Popover>
        );
    }
}

PasswordPopover.propTypes = propTypes;
PasswordPopover.defaultProps = defaultProps;
export default compose(
    withWindowDimensions,
    withLocalize,
)(PasswordPopover);

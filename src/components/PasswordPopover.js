import {TouchableOpacity, View} from 'react-native';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import Text from './Text';
import TextInputFocusable from './TextInputFocusable';
import Popover from './Popover';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

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

    /** Is the reason for the password dangerous. This will change the button style to red */
    isDangerousAction: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    onSubmit: () => {},
    submitButtonText: '',
    isDangerousAction: false,
};

class PasswordPopover extends Component {
    constructor(props) {
        super(props);

        this.state = {
            password: '',
        };
    }

    render() {
        return (
            <Popover
                isVisible={this.props.isVisible}
                onClose={this.props.onClose}
                anchorPosition={this.props.anchorPosition}
            >
                <View
                    style={styles.m2}
                >
                    <Text
                        style={[
                            styles.h1,
                            styles.mv2,
                        ]}
                    >
                        {this.props.translate('passwordForm.pleaseFillPassword')}
                    </Text>
                    <TextInputFocusable
                        style={[
                            styles.textInputCompose,
                            styles.border,
                            styles.w100,
                        ]}
                        onChangeText={password => this.setState({password})}
                        autoFocus
                        secureTextEntry
                    />
                    <TouchableOpacity
                        onPress={() => this.props.onSubmit(this.state.password)}
                        style={[
                            styles.button,
                            styles.mv2,
                            styles.defaultOrDeleteButton,
                            this.props.isDangerousAction && styles.buttonDanger,
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
export default withLocalize(PasswordPopover);

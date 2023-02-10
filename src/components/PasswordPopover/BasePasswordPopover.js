import {View} from 'react-native';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import Text from '../Text';
import Popover from '../Popover';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';
import withWindowDimensions from '../withWindowDimensions';
import TextInput from '../TextInput';
import KeyboardSpacer from '../KeyboardSpacer';
import {propTypes as passwordPopoverPropTypes, defaultProps as passwordPopoverDefaultProps} from './passwordPopoverPropTypes';
import Button from '../Button';
import withViewportOffsetTop from '../withViewportOffsetTop';

const propTypes = {
    /** Whether we should wait before focusing the TextInput, useful when using transitions on Android */
    shouldDelayFocus: PropTypes.bool,

    ...passwordPopoverPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    shouldDelayFocus: false,
    ...passwordPopoverDefaultProps,
};

class BasePasswordPopover extends Component {
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
                outerStyle={{maxHeight: this.props.windowHeight, marginTop: this.props.viewportOffsetTop}}
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
                        shouldDelayFocus={this.props.shouldDelayFocus}
                    />
                    <Button
                        onPress={() => this.props.onSubmit(this.state.password)}
                        style={styles.mt3}
                        text={this.props.submitButtonText}
                    />
                </View>
                <KeyboardSpacer />
            </Popover>
        );
    }
}

BasePasswordPopover.propTypes = propTypes;
BasePasswordPopover.defaultProps = defaultProps;
export default compose(
    withViewportOffsetTop,
    withWindowDimensions,
    withLocalize,
)(BasePasswordPopover);

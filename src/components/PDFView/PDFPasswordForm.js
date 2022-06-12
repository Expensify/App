import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Button from '../Button';
import Text from '../Text';
import TextInput from '../TextInput';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../withWindowDimensions';

const propTypes = {
    /** If the submitted password is invalid (show an error message) */
    isPasswordInvalid: PropTypes.bool,

    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const defaultProps = {
    isPasswordInvalid: false,
};

class PDFPasswordForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            password: '',
        };
        this.submitPassword = this.submitPassword.bind(this);
    }

    submitPassword() {
        if (_.isEmpty(this.state.password)) {
            return;
        }
        this.props.onSubmit(this.state.password);
    }

    render() {
        // Use container styles appropriate for screen size.
        const containerStyles = this.props.isSmallScreenWidth
            ? styles.pdfPasswordForm.narrowScreen
            : styles.pdfPasswordForm.wideScreen;

        return (
            <View style={containerStyles}>
                <Text style={styles.mb4}>
                    {this.props.translate('attachmentView.pdfPasswordRequired')}
                </Text>
                <TextInput
                    label={this.props.translate('common.password')}
                    autoCompleteType="off"
                    textContentType="password"
                    onChangeText={password => this.setState({password})}
                    returnKeyType="done"
                    onSubmitEditing={this.submitPassword}
                    secureTextEntry
                    autoFocus
                />
                {this.props.isPasswordInvalid && (
                    <Text style={[styles.formError]}>
                        {this.props.translate('attachmentView.incorrectPDFPassword')}
                    </Text>
                )}
                <Button
                    text={this.props.translate('common.confirm')}
                    onPress={this.submitPassword}
                    style={styles.mt4}
                    pressOnEnter
                />
            </View>
        );
    }
}

PDFPasswordForm.propTypes = propTypes;
PDFPasswordForm.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
)(PDFPasswordForm);

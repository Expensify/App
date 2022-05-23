import React, {PureComponent, memo} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import Button from '../Button';
import Text from '../Text';
import TextInput from '../TextInput';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';

const propTypes = {
    /** If the submitted password is invalid */
    isPasswordInvalid: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isPasswordInvalid: false,
};

class PDFPasswordForm extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            password: null,
        };
    }

    /**
     * When the form is submitted, call the props.onSubmit() if the password
     * input field contains text.
     */
    onSubmit = () => {
        if (!this.state.password) {
            return;
        }
        this.props.onSubmit(this.state.password);
    }

    render() {
        return (
            <View style={styles.pdfPasswordForm}>

                <Text style={[styles.mb4, styles.col]}>
                    {this.props.translate('attachmentView.pdfPasswordRequired')}
                </Text>

                <TextInput
                    label={this.props.translate('common.password')}
                    autoCompleteType="password"
                    textContentType="password"
                    onChangeText={password => this.setState({password})}
                    returnKeyType="done"
                    onSubmitEditing={this.onSubmit}
                    secureTextEntry
                    autoFocus
                />

                {this.props.isPasswordInvalid && (
                    <Text style={[styles.formError]}>
                        {this.props.translate('attachmentView.incorrectPDFPassword')}
                    </Text>
                )}

                <Button
                    textStyles={[styles.buttonConfirmText]}
                    text={this.props.translate('common.confirm')}
                    onPress={this.onSubmit}
                    style={styles.mt4}
                    isDisabled={!this.state.password}
                    isFocused
                />

            </View>
        );
    }
}

PDFPasswordForm.propTypes = propTypes;
PDFPasswordForm.defaultProps = defaultProps;
PDFPasswordForm.displayName = 'PDFPasswordForm';

export default compose(
    memo,
    withLocalize,
)(PDFPasswordForm);

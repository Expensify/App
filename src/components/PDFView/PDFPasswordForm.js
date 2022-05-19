import React, {PureComponent, memo} from 'react';
import {View} from 'react-native';
import Button from '../Button';
import Text from '../Text';
import TextInput from '../TextInput';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import compose from '../../libs/compose';

const propTypes = {
    ...withLocalizePropTypes,
};

class PDFPasswordForm extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            password: null,
        };
    }

    onSubmit = () => {
        // console.debug("on submit - password is", this.state.password)
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

                <Button
                    success
                    textStyles={[styles.buttonConfirmText]}
                    text={this.props.translate('common.confirm')}
                    onPress={this.onSubmit}
                    pressOnEnter
                    style={styles.mt4}
                />

            </View>
        );
    }
}

PDFPasswordForm.propTypes = propTypes;

// PDFPasswordForm.defaultProps = defaultProps;
PDFPasswordForm.displayName = 'PDFPasswordForm';

export default compose(
    memo,
    withLocalize,
)(PDFPasswordForm);

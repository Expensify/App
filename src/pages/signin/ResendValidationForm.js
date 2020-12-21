import React from 'react';
import {Text, View} from 'react-native';
import styles from '../../styles/styles';
import SubmitButton from './SubmitButton';
import {resendValidationLink} from '../../libs/actions/Session';

class ResendValidationForm extends React.Component {
    constructor() {
        super();

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            formSuccess: '',
        };
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        this.setState({
            formSuccess: 'Link has been resent',
        });

        resendValidationLink();

        setTimeout(() => {
            this.setState({formSuccess: ''});
        }, 5000);
    }

    render() {
        return (
            <>
                <View>
                    <Text style={[styles.textP]}>
                        Please validate your account by clicking on the link we just sent you.
                    </Text>
                </View>
                <View style={[styles.mt4]}>
                    <SubmitButton
                        text="Resend Link"
                        isLoading={this.state.isLoading}
                        onClick={this.validateAndSubmitForm}
                    />
                </View>

                {this.state.formSuccess && (
                    <Text style={[styles.formSuccess]}>
                        {this.state.formSuccess}
                    </Text>
                )}
            </>
        );
    }
}

export default ResendValidationForm;

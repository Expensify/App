import React from 'react';
import {Text, TextInput, View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import SubmitButton from './SubmitButton';
import openURLInNewTab from '../../libs/openURLInNewTab';

const propTypes = {
    // A function that is called when the form is submitted
    onSubmit: PropTypes.func.isRequired,
};

class ResendValidationForm extends React.Component {
    constructor() {
        super();

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            isLoading: false,
        };
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        this.setState({
            isLoading: true,
        });

        // Resend link
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
            </>
        );
    }
}

ResendValidationForm.propTypes = propTypes;

export default ResendValidationForm;

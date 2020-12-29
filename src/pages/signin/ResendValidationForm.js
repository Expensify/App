import React from 'react';
import {Text, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import SubmitButton from './SubmitButton';
import {resendValidationLink} from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    /* Onyx Props */

    // The session of the logged in person
    session: PropTypes.shape({
        // Whether or not a sign on form is loading (being submitted)
        isLoading: PropTypes.bool,
    }),
};

const defaultProps = {
    session: {
        isLoading: false,
    },
};

class ResendValidationForm extends React.Component {
    constructor(props) {
        super(props);

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
            formSuccess: 'Link has been re-sent',
        });

        resendValidationLink();

        setTimeout(() => {
            this.setState({formSuccess: ''});
        }, 5000);
    }

    render() {
        return (
            <View style={[styles.loginFormContainer]}>
                <View>
                    <Text style={[styles.textP]}>
                        Please validate your account by clicking on the link we just sent you.
                    </Text>
                </View>
                <View style={[styles.mt4]}>
                    <SubmitButton
                        text="Resend Link"
                        isLoading={this.props.session.isLoading}
                        onClick={this.validateAndSubmitForm}
                    />
                </View>

                {this.state.formSuccess && (
                    <Text style={[styles.formSuccess]}>
                        {this.state.formSuccess}
                    </Text>
                )}
            </View>
        );
    }
}

ResendValidationForm.propTypes = propTypes;
ResendValidationForm.defaultProps = defaultProps;

export default withOnyx({
    session: {key: ONYXKEYS.SESSION},
})(ResendValidationForm);

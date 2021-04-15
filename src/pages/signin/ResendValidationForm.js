import React from 'react';
import {Text, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../styles/styles';
import ButtonWithLoader from '../../components/ButtonWithLoader';
import {resendValidationLink, resetPassword} from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';

const propTypes = {
    /* Onyx Props */

    // The details about the account that the user is signing in with
    account: PropTypes.shape({
        // Whether or not a sign on form is loading (being submitted)
        loading: PropTypes.bool,

        // Weather or not the account is validated
        validated: PropTypes.bool,
    }),
};

const defaultProps = {
    account: {},
};

class ResendValidationForm extends React.Component {
    constructor(props) {
        super(props);

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            formSuccess: '',
        };
    }

    componentWillUnmount() {
        if (this.successMessageTimer) {
            clearTimeout(this.successMessageTimer);
        }
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        this.setState({
            formSuccess: 'Link has been re-sent',
        });

        if (!this.props.account.validated) {
            resendValidationLink();
            console.debug('Account is unvalidated: Sending validation link.');
        } else {
            resetPassword();
            console.debug('Account forgot password: Sending reset password link.');
        }

        this.successMessageTimer = setTimeout(() => {
            this.setState({formSuccess: ''});
        }, 5000);
    }

    render() {
        return (
            <>
                <View>
                    <Text style={[styles.textP]}>
                        We&apos;ve sent you a magic sign in link – just click on it to log in!
                    </Text>
                </View>
                <View style={[styles.mt4]}>
                    <ButtonWithLoader
                        text="Resend Link"
                        isLoading={this.props.account.loading}
                        onClick={this.validateAndSubmitForm}
                    />
                    <ChangeExpensifyLoginLink />
                </View>

                {!_.isEmpty(this.state.formSuccess) && (
                    <Text style={[styles.formSuccess]}>
                        {this.state.formSuccess}
                    </Text>
                )}
            </>
        );
    }
}

ResendValidationForm.propTypes = propTypes;
ResendValidationForm.defaultProps = defaultProps;

export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
})(ResendValidationForm);

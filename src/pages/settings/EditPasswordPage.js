import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Form from '../../components/Form';
import Text from '../../components/Text';
import TextInput from '../../components/TextInput';
import {withCurrentUserPersonalDetailsDefaultProps} from '../../components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as User from '../../libs/actions/User';
import compose from '../../libs/compose';
import * as ErrorUtils from '../../libs/ErrorUtils';
import * as ValidationUtils from '../../libs/ValidationUtils';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';

const propTypes = {
    account: PropTypes.shape({
        /** An error message to display to the user */
        errors: PropTypes.objectOf(PropTypes.string),

        /** Success message to display when necessary */
        success: PropTypes.string,

        /** Whether a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
    }),
    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class EditPasswordPage extends Component {
    constructor(props) {
        super(props);
        this.submit = this.submit.bind(this);
        this.validate = this.validate.bind(this);
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Object}
     */
    validate(values) {
        const errors = {};
        if (!values.currentPassword) {
            errors.currentPassword = this.props.translate('passwordPage.errors.currentPassword');
        }

        if (!values.newPassword || !ValidationUtils.isValidPassword(values.newPassword)) {
            errors.newPassword = this.props.translate('passwordPage.errors.newPassword');
        }

        if (values.currentPassword && values.newPassword && _.isEqual(values.currentPassword, values.newPassword)) {
            errors.newPasswordSameAsOld = this.props.translate('passwordPage.errors.newPasswordSameAsOld');
        }
        return errors;
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     */
    submit(values) {
        User.updatePassword(values.currentPassword, values.newPassword);
    }

    render() {
        return (
            <View
                style={[styles.flex1, styles.p5]}
            >
                <Text style={[styles.mb6]}>
                    {this.props.translate('passwordPage.changingYourPasswordPrompt')}
                </Text>
                <Form
                    formID={ONYXKEYS.FORMS.EDIT_PASSWORD_FORM}
                    validate={this.validate}
                    onSubmit={this.submit}
                    submitButtonText={this.props.translate('passwordPage.changePassword')}
                >
                    <View style={styles.mb6}>
                        <TextInput
                            label={this.props.translate('passwordPage.currentPassword')}
                            secureTextEntry
                            autoCompleteType="password"
                            textContentType="password"
                            returnKeyType="done"
                            inputID="currentPassword"
                        />
                    </View>
                    <View style={styles.mb6}>
                        <TextInput
                            label={this.props.translate('passwordPage.newPassword')}
                            secureTextEntry
                            autoCompleteType="password"
                            textContentType="password"
                            inputID="newPassword"
                        />

                        <Text
                            style={[styles.textLabelSupporting, styles.mt1]}
                        >
                            {this.props.translate('passwordPage.newPasswordPrompt')}
                        </Text>

                    </View>
                    { !_.isEmpty(this.props.account.errors) && (
                        <Text style={styles.formError}>
                            {ErrorUtils.getLatestErrorMessage(this.props.account)}
                        </Text>
                    )}
                </Form>
            </View>
        );
    }
}

EditPasswordPage.propTypes = propTypes;
EditPasswordPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
    }),
)(EditPasswordPage);

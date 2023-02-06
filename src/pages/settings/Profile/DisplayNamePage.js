import lodashGet from 'lodash/get';
import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import * as Localize from '../../../libs/Localize';
import ROUTES from '../../../ROUTES';
import Form from '../../../components/Form';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import * as ValidationUtils from '../../../libs/ValidationUtils';
import TextInput from '../../../components/TextInput';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../../libs/actions/PersonalDetails';
import compose from '../../../libs/compose';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class DisplayNamePage extends Component {
    constructor(props) {
        super(props);

        this.validate = this.validate.bind(this);
        this.updateDisplayName = this.updateDisplayName.bind(this);
    }

    /**
     * Submit form to update user's first and last name (and display name)
     * @param {Object} values
     * @param {String} values.firstName
     * @param {String} values.lastName
     */
    updateDisplayName(values) {
        PersonalDetails.updateDisplayName(
            values.firstName.trim(),
            values.lastName.trim(),
        );
    }

    /**
     * @param {Object} values
     * @param {String} values.firstName
     * @param {String} values.lastName
     * @returns {Object} - An object containing the errors for each inputID
     */
    validate(values) {
        const errors = {};
        const [doesFirstNameHaveInvalidCharacters, doesLastNameHaveInvalidCharacters] = ValidationUtils.doesContainCommaOrSemicolon(
            [values.firstName, values.lastName],
        );
        const [isFirstNameTooLong, isLastNameTooLong] = ValidationUtils.doesFailCharacterLimitAfterTrim(
            CONST.DISPLAY_NAME.MAX_LENGTH,
            [values.firstName, values.lastName],
        );

        // First we validate the first name field
        if (doesFirstNameHaveInvalidCharacters) {
            errors.firstName = this.props.translate('personalDetails.error.hasInvalidCharacter');
        } else if (isFirstNameTooLong) {
            errors.firstName = this.props.translate('personalDetails.error.firstNameLength');
        } else if (ValidationUtils.doesContainReservedWord(values.firstName, CONST.DISPLAY_NAME.RESERVED_FIRST_NAMES)) {
            errors.firstName = 'blah blah';
        }

        // Then we validate the last name field
        if (doesLastNameHaveInvalidCharacters) {
            errors.lastName = this.props.translate('personalDetails.error.hasInvalidCharacter');
        } else if (isLastNameTooLong) {
            errors.lastName = this.props.translate('personalDetails.error.lastNameLength');
        }

        return errors;
    }

    render() {
        const currentUserDetails = this.props.currentUserPersonalDetails || {};

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('displayNamePage.headerTitle')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.DISPLAY_NAME_FORM}
                    validate={this.validate}
                    onSubmit={this.updateDisplayName}
                    submitButtonText={this.props.translate('common.save')}
                    enabledWhenOffline
                >
                    <Text style={[styles.mb6]}>
                        {this.props.translate('displayNamePage.isShownOnProfile')}
                    </Text>
                    <View style={styles.mb4}>
                        <TextInput
                            inputID="firstName"
                            name="fname"
                            label={this.props.translate('common.firstName')}
                            defaultValue={lodashGet(currentUserDetails, 'firstName', '')}
                            placeholder={this.props.translate('displayNamePage.john')}
                            maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        />
                    </View>
                    <View>
                        <TextInput
                            inputID="lastName"
                            name="lname"
                            label={this.props.translate('common.lastName')}
                            defaultValue={lodashGet(currentUserDetails, 'lastName', '')}
                            placeholder={this.props.translate('displayNamePage.doe')}
                            maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        />
                    </View>
                </Form>
            </ScreenWrapper>
        );
    }
}

DisplayNamePage.propTypes = propTypes;
DisplayNamePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
)(DisplayNamePage);

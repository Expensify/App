import _ from 'underscore';
import React, {Component} from 'react';
import {View} from 'react-native';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import * as Localize from '../../../../libs/Localize';
import ROUTES from '../../../../ROUTES';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import TextInput from '../../../../components/TextInput';
import styles from '../../../../styles/styles';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../../../libs/actions/PersonalDetails';
import compose from '../../../../libs/compose';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class LegalNamePage extends Component {
    constructor(props) {
        super(props);

        this.validate = this.validate.bind(this);
        this.updateLegalName = this.updateLegalName.bind(this);
    }

    /**
     * Submit form to update user's legal first and last name
     * @param {Object} values
     * @param {String} values.legalFirstName
     * @param {String} values.legalLastName
     */
    updateLegalName(values) {
        PersonalDetails.updateLegalName(
            values.legalFirstName.trim(),
            values.legalLastName.trim(),
        );
    }

    /**
     * @param {Object} values
     * @param {String} values.legalFirstName
     * @param {String} values.legalLastName
     * @returns {Object} - An object containing the errors for each inputID
     */
    validate(values) {
        const errors = {};

        // Check for invalid characters in legal first and last name
        const [hasInvalidLegalFirstNameCharacter, hasInvalidLegalLastNameCharacter] = ValidationUtils.findInvalidSymbols(
            [values.legalFirstName, values.legalLastName],
        );
        const [hasLegalFirstNameLengthError, hasLegalLastNameLengthError] = ValidationUtils.doesFailCharacterLimitAfterTrim(
            CONST.LEGAL_NAMES_CHARACTER_LIMIT,
            [values.legalFirstName, values.legalLastName],
        );

        if (!_.isEmpty(hasInvalidLegalFirstNameCharacter)) {
            errors.legalFirstName = Localize.translateLocal(
                'personalDetailsPages.error.hasInvalidCharacter',
                {characterName: hasInvalidLegalFirstNameCharacter},
            );
        } else if (_.isEmpty(values.legalFirstName)) {
            errors.legalFirstName = Localize.translateLocal('personalDetailsPages.error.legalFirstNameEmpty');
        } else if (hasLegalFirstNameLengthError) {
            errors.legalFirstName = Localize.translateLocal('personalDetails.error.characterLimit', {limit: CONST.LEGAL_NAMES_CHARACTER_LIMIT});
        }

        if (!_.isEmpty(hasInvalidLegalLastNameCharacter)) {
            errors.legalLastName = Localize.translateLocal(
                'personalDetailsPages.error.hasInvalidCharacter',
                {characterName: hasInvalidLegalLastNameCharacter},
            );
        } else if (_.isEmpty(values.legalLastName)) {
            errors.legalLastName = Localize.translateLocal('personalDetailsPages.error.legalLastNameEmpty');
        } else if (hasLegalLastNameLengthError) {
            errors.legalLastName = Localize.translateLocal('personalDetails.error.characterLimit', {limit: CONST.LEGAL_NAMES_CHARACTER_LIMIT});
        }

        return errors;
    }

    render() {
        const currentUserDetails = this.props.currentUserPersonalDetails || {};

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('personalDetailsPages.legalName')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.LEGAL_NAME_FORM}
                    validate={this.validate}
                    onSubmit={this.updateLegalName}
                    submitButtonText={this.props.translate('common.save')}
                    enabledWhenOffline
                >
                    <View style={[styles.mb4]}>
                        <TextInput
                            inputID="legalFirstName"
                            name="lfname"
                            label={this.props.translate('personalDetailsPages.legalFirstName')}
                            defaultValue={currentUserDetails.legalFirstName || ''}
                        />
                    </View>
                    <View>
                        <TextInput
                            inputID="legalLastName"
                            name="llname"
                            label={this.props.translate('personalDetailsPages.legalLastName')}
                            defaultValue={currentUserDetails.legalLastName || ''}
                        />
                    </View>
                </Form>
            </ScreenWrapper>
        );
    }
}

LegalNamePage.propTypes = propTypes;
LegalNamePage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
)(LegalNamePage);

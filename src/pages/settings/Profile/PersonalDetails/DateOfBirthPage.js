import lodashGet from 'lodash/get';
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
import Text from '../../../../components/Text';
import styles from '../../../../styles/styles';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../../../libs/actions/PersonalDetails';
import compose from '../../../../libs/compose';
import DatePicker from '../../../../components/DatePicker';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class DateOfBirthPage extends Component {
    constructor(props) {
        super(props);

        this.validate = this.validate.bind(this);
        this.updateDateOfBirth = this.updateDateOfBirth.bind(this);
    }

    /**
     * Submit form to update user's first and last legal name
     * @param {Object} values
     * @param {String} values.dateOfBirth
     */
    updateDateOfBirth(values) {
        PersonalDetails.updateDateOfBirth(
            values.dateOfBirth.trim(),
        );
    }

    /**
     * @param {Object} values
     * @param {String} values.dateOfBirth
     * @returns {Object} - An object containing the errors for each inputID
     */
    validate(values) {
        const errors = {};
        const minimumAge = 5;

        if (!values.dateOfBirth) {
            errors.dateOfBirth = this.props.translate('personalDetailsPages.error.dobInvalid');
        } else if (!ValidationUtils.meetsAgeRequirements(values.dateOfBirth, minimumAge)) {
            // TODO: show error for too young or too old
            errors.dateOfBirth = this.props.translate('personalDetailsPages.error.dobTooYoung', {age: minimumAge});
        }

        return errors;
    }

    render() {
        const currentUserDetails = this.props.currentUserPersonalDetails || {};

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.DATE_OF_BIRTH_FORM}
                    validate={this.validate}
                    onSubmit={this.updateDateOfBirth}
                    submitButtonText={this.props.translate('common.save')}
                    enabledWhenOffline
                >
                    <View>
                        <DatePicker
                            inputID={'dateOfBirth'}
                            label={this.props.translate('common.date')}
                            defaultValue={currentUserDetails.dateOfBirth || ''}
                            shouldSaveDraft
                        />
                    </View>
                </Form>
            </ScreenWrapper>
        );
    }
}

DateOfBirthPage.propTypes = propTypes;
DateOfBirthPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
)(DateOfBirthPage);

import _ from 'underscore';
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import ROUTES from '../../ROUTES';
import Form from '../../components/Form';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import TextInput from '../../components/TextInput';
import styles from '../../styles/styles';
import Navigation from '../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../libs/actions/PersonalDetails';

const propTypes = {
    /* Onyx Props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    taskTitle: '',
};

class TaskTitlePage extends Component {
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

        if (_.isEmpty(values.legalFirstName)) {
            errors.legalFirstName = this.props.translate('common.error.fieldRequired');
        }

        return errors;
    }

    render() {
        const privateDetails = this.props.privatePersonalDetails || {};

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('privatePersonalDetails.legalName')}
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
                            inputID="taskTitle"
                            name="taskTitle"
                            label={this.props.translate('privatePersonalDetails.legalFirstName')}
                            defaultValue={privateDetails.legalFirstName || ''}
                            maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        />
                    </View>
                </Form>
            </ScreenWrapper>
        );
    }
}

TaskTitlePage.propTypes = propTypes;
TaskTitlePage.defaultProps = defaultProps;

export default withLocalize(TaskTitlePage);

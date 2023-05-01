import React, {
    useCallback, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {withOnyx} from 'react-native-onyx';
import {compose} from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import Button from '../../../../components/Button';
import FixedFooter from '../../../../components/FixedFooter';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Text from '../../../../components/Text';
import TextInput from '../../../../components/TextInput';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import Navigation from '../../../../libs/Navigation/Navigation';
import Permissions from '../../../../libs/Permissions';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';
import styles from '../../../../styles/styles';
import * as User from '../../../../libs/actions/User';
import * as LoginUtils from '../../../../libs/LoginUtils';
import Form from '../../../../components/Form';
import _ from 'underscore';

const propTypes = {
    /* Onyx Props */

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Login list for the user that is signed in */
    loginList: PropTypes.shape({
        /** The partner creating the account. It depends on the source: website, mobile, integrations, ... */
        partnerName: PropTypes.string,

        /** Phone/Email associated with user */
        partnerUserID: PropTypes.string,

        /** The date when the login was validated, used to show the brickroad status */
        validatedDate: PropTypes.string,

        /** Field-specific server side errors keyed by microtime */
        errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),

        /** Field-specific pending states for offline UI status */
        pendingFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    }),

    ...withLocalizePropTypes,
};
const defaultProps = {
    betas: [],
    loginList: {},
};

function NewContactMethodPage(props) { 

    function isFormValid(values) { 
        const userEmailOrPhone = Str.removeSMSDomain(props.session.email);
        const phoneLogin = !_.isEmpty(values.phoneOrEmail) ? LoginUtils.getPhoneNumberWithoutSpecialChars(values.phoneOrEmail) : ''

        const errors = {};

        if (_.isEmpty(values.phoneOrEmail)) {
            errors.phoneOrEmail = props.translate('contacts.genericFailureMessages.contactMethodRequired')
        }  

        if(!_.isEmpty(values.phoneOrEmail) && !(Str.isValidPhone(phoneLogin) || Str.isValidEmail(values.phoneOrEmail)) ){
            errors.phoneOrEmail =  props.translate('contacts.genericFailureMessages.invalidContactMethod')
        }   

        if(!_.isEmpty(values.phoneOrEmail) && userEmailOrPhone.toLowerCase() === values.phoneOrEmail.toLowerCase()){
            errors.phoneOrEmail = props.translate('contacts.genericFailureMessages.enteredMethodIsAlreadySubmited');
        } 

        if (!Permissions.canUsePasswordlessLogins(props.betas) ||  _.isEmpty(values.password)) {
            errors.password =  props.translate('contacts.genericFailureMessages.passwordRequired')
        }  

        return errors;
    };

    function submitForm(value) {
        User.addNewContactMethodAndNavigate(value.phoneOrEmail,value.password);
    } 

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithCloseButton
                title={props.translate('contacts.newContactMethod')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <Form
                formID={ONYXKEYS.FORMS.NEW_CONTACT_FORM}
                validate={isFormValid}
                onSubmit={submitForm}
                submitButtonText={props.translate('common.add')}
                style={[styles.flexGrow1,styles.mh5]}
            >
                <Text style={[ styles.mb5]}>
                    {props.translate('common.pleaseEnterEmailOrPhoneNumber')}
                </Text>
                <View style={[styles.mb6]}>
                    <TextInput
                        label={`${props.translate('common.email')}/${props.translate('common.phoneNumber')}`}
                        inputID="phoneOrEmail"
                        autoCapitalize="none"
                        returnKeyType={Permissions.canUsePasswordlessLogins(props.betas) ? 'done' : 'next'}
                        autoFocus
                    />
                </View>
                {!Permissions.canUsePasswordlessLogins(props.betas)
                    && (
                        <View style={[styles.mb6]}>
                            <TextInput
                                label={props.translate('common.password')}
                                inputID="password"
                                returnKeyType="done"
                            />
                        </View>
                    )}
            </Form>
        </ScreenWrapper>
    );
}

NewContactMethodPage.propTypes = propTypes;
NewContactMethodPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        betas: {key: ONYXKEYS.BETAS},
        loginList: {key: ONYXKEYS.LOGIN_LIST},
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(NewContactMethodPage);

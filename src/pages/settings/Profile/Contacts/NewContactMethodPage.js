import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useRef} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as LoginUtils from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /* Onyx Props */

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
    loginList: {},
};

const addNewContactMethod = (values) => {
    const phoneLogin = LoginUtils.getPhoneLogin(values.phoneOrEmail);
    const validateIfnumber = LoginUtils.validateNumber(phoneLogin);
    const submitDetail = (validateIfnumber || values.phoneOrEmail).trim().toLowerCase();

    User.addNewContactMethodAndNavigate(submitDetail);
};

function NewContactMethodPage(props) {
    const styles = useThemeStyles();
    const loginInputRef = useRef(null);

    const validate = React.useCallback(
        (values) => {
            const phoneLogin = LoginUtils.getPhoneLogin(values.phoneOrEmail);
            const validateIfnumber = LoginUtils.validateNumber(phoneLogin);

            const errors = {};

            if (_.isEmpty(values.phoneOrEmail)) {
                ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', 'contacts.genericFailureMessages.contactMethodRequired');
            }

            if (!_.isEmpty(values.phoneOrEmail) && !(validateIfnumber || Str.isValidEmail(values.phoneOrEmail))) {
                ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', 'contacts.genericFailureMessages.invalidContactMethod');
            }

            if (!_.isEmpty(values.phoneOrEmail) && lodashGet(props.loginList, validateIfnumber || values.phoneOrEmail.toLowerCase())) {
                ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', 'contacts.genericFailureMessages.enteredMethodIsAlreadySubmited');
            }

            return errors;
        },
        // We don't need `props.loginList` because when submitting this form
        // the props.loginList gets updated, causing this function to run again.
        // https://github.com/Expensify/App/issues/20610
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => {
                if (!loginInputRef.current) {
                    return;
                }

                loginInputRef.current.focus();
            }}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={NewContactMethodPage.displayName}
        >
            <HeaderWithBackButton
                title={props.translate('contacts.newContactMethod')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.route)}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM}
                validate={validate}
                onSubmit={addNewContactMethod}
                submitButtonText={props.translate('common.add')}
                style={[styles.flexGrow1, styles.mh5]}
                enabledWhenOffline
            >
                <Text style={[styles.mb5]}>{props.translate('common.pleaseEnterEmailOrPhoneNumber')}</Text>
                <View style={[styles.mb6]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        label={`${props.translate('common.email')}/${props.translate('common.phoneNumber')}`}
                        aria-label={`${props.translate('common.email')}/${props.translate('common.phoneNumber')}`}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        inputMode={CONST.INPUT_MODE.EMAIL}
                        ref={(el) => (loginInputRef.current = el)}
                        inputID="phoneOrEmail"
                        autoCapitalize="none"
                        enterKeyHint="done"
                        maxLength={CONST.LOGIN_CHARACTER_LIMIT}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

NewContactMethodPage.propTypes = propTypes;
NewContactMethodPage.defaultProps = defaultProps;
NewContactMethodPage.displayName = 'NewContactMethodPage';

export default compose(
    withLocalize,
    withOnyx({
        loginList: {key: ONYXKEYS.LOGIN_LIST},
    }),
)(NewContactMethodPage);

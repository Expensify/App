import type {StackScreenProps} from '@react-navigation/stack';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import DotIndicatorMessage from '@components/DotIndicatorMessage';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as LoginUtils from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as UserUtils from '@libs/UserUtils';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/NewContactMethodForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type NewContactMethodPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD>;

function NewContactMethodPage({route}: NewContactMethodPageProps) {
    const contactMethod = UserUtils.getContactMethod();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const loginInputRef = useRef<AnimatedTextInputRef>(null);
    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(false);
    const [pendingContactAction] = useOnyx(ONYXKEYS.PENDING_CONTACT_ACTION);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const loginData = loginList?.[pendingContactAction?.contactMethod ?? contactMethod];
    const validateLoginError = ErrorUtils.getEarliestErrorField(loginData, 'validateLogin');

    const navigateBackTo = route?.params?.backTo ?? ROUTES.SETTINGS_PROFILE;

    const hasFailedToSendVerificationCode = !!pendingContactAction?.errorFields?.actionVerified;

    const handleValidateMagicCode = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM>) => {
        const phoneLogin = LoginUtils.getPhoneLogin(values.phoneOrEmail);
        const validateIfnumber = LoginUtils.validateNumber(phoneLogin);
        const submitDetail = (validateIfnumber || values.phoneOrEmail).trim().toLowerCase();
        User.addPendingContactMethod(submitDetail);
        setIsValidateCodeActionModalVisible(true);
    }, []);

    const addNewContactMethod = useCallback(
        (magicCode: string) => {
            User.addNewContactMethod(pendingContactAction?.contactMethod ?? '', magicCode);
            Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS.route);
        },
        [pendingContactAction?.contactMethod],
    );

    useEffect(() => () => User.clearUnvalidatedNewContactMethodAction(), []);

    const validate = React.useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM>): Errors => {
            const phoneLogin = LoginUtils.getPhoneLogin(values.phoneOrEmail);
            const validateIfnumber = LoginUtils.validateNumber(phoneLogin);

            const errors = {};

            if (!values.phoneOrEmail) {
                ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', translate('contacts.genericFailureMessages.contactMethodRequired'));
            }

            if (!!values.phoneOrEmail && !(validateIfnumber || Str.isValidEmail(values.phoneOrEmail))) {
                ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', translate('contacts.genericFailureMessages.invalidContactMethod'));
            }

            if (!!values.phoneOrEmail && loginList?.[validateIfnumber || values.phoneOrEmail.toLowerCase()]) {
                ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', translate('contacts.genericFailureMessages.enteredMethodIsAlreadySubmited'));
            }

            return errors;
        },
        // We don't need `loginList` because when submitting this form
        // the loginList gets updated, causing this function to run again.
        // https://github.com/Expensify/App/issues/20610
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [translate],
    );

    const onBackButtonPress = useCallback(() => {
        if (navigateBackTo === ROUTES.SETTINGS_PROFILE) {
            Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.route);
            return;
        }
        Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.getRoute(navigateBackTo));
    }, [navigateBackTo]);

    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => loginInputRef.current?.focus()}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={NewContactMethodPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('contacts.newContactMethod')}
                onBackButtonPress={onBackButtonPress}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM}
                validate={validate}
                onSubmit={handleValidateMagicCode}
                submitButtonText={translate('common.add')}
                style={[styles.flexGrow1, styles.mh5]}
            >
                <Text style={styles.mb5}>{translate('common.pleaseEnterEmailOrPhoneNumber')}</Text>
                <View style={styles.mb6}>
                    <InputWrapper
                        InputComponent={TextInput}
                        label={`${translate('common.email')}/${translate('common.phoneNumber')}`}
                        aria-label={`${translate('common.email')}/${translate('common.phoneNumber')}`}
                        role={CONST.ROLE.PRESENTATION}
                        inputMode={CONST.INPUT_MODE.EMAIL}
                        ref={loginInputRef}
                        inputID={INPUT_IDS.PHONE_OR_EMAIL}
                        autoCapitalize="none"
                        enterKeyHint="done"
                        maxLength={CONST.LOGIN_CHARACTER_LIMIT}
                    />
                </View>
                {hasFailedToSendVerificationCode && (
                    <DotIndicatorMessage
                        messages={ErrorUtils.getLatestErrorField(pendingContactAction, 'actionVerified')}
                        type="error"
                    />
                )}
            </FormProvider>
            <ValidateCodeActionModal
                validatePendingAction={pendingContactAction?.pendingFields?.actionVerified}
                validateError={validateLoginError}
                handleSubmitForm={addNewContactMethod}
                clearError={() => User.clearContactMethodErrors(contactMethod, 'validateLogin')}
                onClose={() => setIsValidateCodeActionModalVisible(false)}
                isVisible={isValidateCodeActionModalVisible}
                title={contactMethod}
                description={translate('contacts.enterMagicCode', {contactMethod})}
            />
        </ScreenWrapper>
    );
}

NewContactMethodPage.displayName = 'NewContactMethodPage';

export default NewContactMethodPage;

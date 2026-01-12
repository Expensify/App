import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage, getLatestErrorField} from '@libs/ErrorUtils';
import {getPhoneLogin, validateNumber} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {addNewContactMethod, clearContactMethod, clearUnvalidatedNewContactMethodAction, setServerErrorsOnForm, updateIsVerifiedValidateActionCode} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/NewContactMethodForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type NewContactMethodPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD>;

function NewContactMethodPage({route}: NewContactMethodPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const loginInputRef = useRef<AnimatedTextInputRef>(null);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [pendingContactAction] = useOnyx(ONYXKEYS.PENDING_CONTACT_ACTION, {canBeMissing: true});
    const [validateActionCode] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE, {canBeMissing: true});
    const navigateBackTo = route?.params?.backTo;
    const loginData = pendingContactAction?.contactMethod ? loginList?.[pendingContactAction?.contactMethod] : undefined;
    const validateLoginError = getLatestErrorField(loginData, 'addedLogin');
    const validateActionCodeError = getLatestErrorField(validateActionCode, 'addedLogin');

    useEffect(() => {
        updateIsVerifiedValidateActionCode(false);
    }, []);
    useEffect(() => {
        let error = validateLoginError;
        if (isEmptyObject(error)) {
            error = validateActionCodeError;
        }
        setServerErrorsOnForm(error);
    }, [validateLoginError, validateActionCodeError]);
    useEffect(() => {
        return () => {
            if (!loginList) {
                return;
            }
            const removedLogin: string[] = [];
            for (const login of Object.keys(loginList)) {
                const error = getLatestErrorField(loginList?.[login], 'addedLogin');
                if (!isEmptyObject(error)) {
                    removedLogin.push(login);
                }
            }
            clearContactMethod(removedLogin);
        };
    }, [loginList]);

    const handleAddSecondaryLogin = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM>) => {
            const phoneLogin = getPhoneLogin(values.phoneOrEmail, countryCode);
            const validateIfNumber = validateNumber(phoneLogin);
            const submitDetail = (validateIfNumber || values.phoneOrEmail).trim().toLowerCase();
            addNewContactMethod(submitDetail, pendingContactAction?.validateActionCode ?? '');
        },
        [countryCode, pendingContactAction?.validateActionCode],
    );

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM>): Errors => {
            const phoneLogin = getPhoneLogin(values.phoneOrEmail, countryCode);
            const validateIfNumber = validateNumber(phoneLogin);

            const errors = {};

            if (!values.phoneOrEmail) {
                addErrorMessage(errors, 'phoneOrEmail', translate('contacts.genericFailureMessages.contactMethodRequired'));
            } else if (values.phoneOrEmail.length > CONST.LOGIN_CHARACTER_LIMIT) {
                addErrorMessage(errors, 'phoneOrEmail', translate('common.error.characterLimitExceedCounter', values.phoneOrEmail.length, CONST.LOGIN_CHARACTER_LIMIT));
            }

            if (!!values.phoneOrEmail && !(validateIfNumber || Str.isValidEmail(values.phoneOrEmail))) {
                addErrorMessage(errors, 'phoneOrEmail', translate('contacts.genericFailureMessages.invalidContactMethod'));
            }

            if (!!values.phoneOrEmail && loginList?.[validateIfNumber || values.phoneOrEmail.toLowerCase()]) {
                addErrorMessage(errors, 'phoneOrEmail', translate('contacts.genericFailureMessages.enteredMethodIsAlreadySubmitted'));
            }

            return errors;
        },
        // We don't need `loginList` because when submitting this form
        // the loginList gets updated, causing this function to run again.
        // https://github.com/Expensify/App/issues/20610
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [translate, countryCode],
    );

    const onBackButtonPress = useCallback(() => {
        Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.getRoute(navigateBackTo));
    }, [navigateBackTo]);

    useEffect(() => {
        if (!pendingContactAction?.actionVerified || !pendingContactAction?.contactMethod) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHOD_DETAILS.getRoute(addSMSDomainIfPhoneNumber(pendingContactAction?.contactMethod), navigateBackTo, true));
        clearUnvalidatedNewContactMethodAction();
    }, [pendingContactAction?.actionVerified, pendingContactAction?.contactMethod, navigateBackTo]);

    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => loginInputRef.current?.focus()}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            shouldShowOfflineIndicatorInWideScreen
            testID="NewContactMethodPage"
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('contacts.newContactMethod')}
                    onBackButtonPress={onBackButtonPress}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM}
                    validate={validate}
                    onSubmit={handleAddSecondaryLogin}
                    submitButtonText={translate('common.add')}
                    style={[styles.flexGrow1, styles.mh5]}
                    isLoading={pendingContactAction?.isLoading}
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
                        />
                    </View>
                </FormProvider>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

export default NewContactMethodPage;

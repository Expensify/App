import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {emailSelector} from '@selectors/Session';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues, FormRef} from '@components/Form/types';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage, getLatestErrorMessage} from '@libs/ErrorUtils';
import {getPhoneLogin, validateNumber} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isNumericWithSpecialChars} from '@libs/ValidationUtils';
import {clearGetValidateCodeForAccountMerge, requestValidationCodeForAccountMerge} from '@userActions/MergeAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/MergeAccountDetailsForm';
import type {Account} from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';

const getValidateCodeErrorKey = (err: string): ValueOf<typeof CONST.MERGE_ACCOUNT_RESULTS> | null => {
    if (err.includes('403')) {
        return CONST.MERGE_ACCOUNT_RESULTS.TOO_MANY_ATTEMPTS;
    }

    if (err.includes('404')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_NO_EXIST;
    }

    if (err.includes('401')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_PRIMARY_LOGIN;
    }

    if (err.includes('402')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_NOT_SUPPORTED;
    }

    if (err.includes('400 Cannot merge account into itself')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_MERGE_SELF;
    }

    return null;
};

const getValidateCodeForAccountMergeSelector = (account: OnyxEntry<Account>) => account?.getValidateCodeForAccountMerge;

function AccountDetailsPage() {
    const formRef = useRef<FormRef>(null);
    const navigation = useNavigation();
    const [userEmailOrPhone] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector, canBeMissing: true});
    const [getValidateCodeForAccountMerge] = useOnyx(ONYXKEYS.ACCOUNT, {selector: getValidateCodeForAccountMergeSelector, canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const privateSubscription = usePrivateSubscription();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {params} = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.MERGE_ACCOUNTS.ACCOUNT_DETAILS>>();
    const [email, setEmail] = useState(params?.email ?? '');
    const {inputCallbackRef} = useAutoFocusInput();
    const validateCodeSent = getValidateCodeForAccountMerge?.validateCodeSent;
    const latestError = getLatestErrorMessage(getValidateCodeForAccountMerge);
    const errorKey = getValidateCodeErrorKey(latestError);
    const genericError = !errorKey ? latestError : undefined;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useFocusEffect(
        useCallback(() => {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const task = InteractionManager.runAfterInteractions(() => {
                if (!validateCodeSent || !email) {
                    return;
                }

                Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS_MAGIC_CODE.getRoute(email.trim()));
            });

            return () => task.cancel();
        }, [validateCodeSent, email]),
    );

    useFocusEffect(
        useCallback(() => {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const task = InteractionManager.runAfterInteractions(() => {
                if (!errorKey || !email) {
                    return;
                }
                Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(email.trim(), errorKey));
            });

            return () => task.cancel();
        }, [errorKey, email]),
    );

    useFocusEffect(
        useCallback(() => {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const task = InteractionManager.runAfterInteractions(() => {
                if (privateSubscription?.type !== CONST.SUBSCRIPTION.TYPE.INVOICING) {
                    return;
                }

                Navigation.navigate(
                    ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(currentUserPersonalDetails.login ?? '', CONST.MERGE_ACCOUNT_RESULTS.ERR_INVOICING, ROUTES.SETTINGS_SECURITY),
                );
            });

            return () => task.cancel();
        }, [privateSubscription?.type, currentUserPersonalDetails.login]),
    );

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            clearGetValidateCodeForAccountMerge();
        });

        return unsubscribe;
    }, [navigation]);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MERGE_ACCOUNT_DETAILS_FORM>): Errors => {
        const errors = {};

        const login = values[INPUT_IDS.PHONE_OR_EMAIL];

        if (!login) {
            addErrorMessage(errors, INPUT_IDS.PHONE_OR_EMAIL, translate('common.pleaseEnterEmailOrPhoneNumber'));
        } else if (login.trim() === userEmailOrPhone) {
            addErrorMessage(errors, INPUT_IDS.PHONE_OR_EMAIL, translate('common.error.email'));
        } else {
            const phoneLogin = getPhoneLogin(login, countryCode);
            const validateIfNumber = validateNumber(phoneLogin);

            if (!Str.isValidEmail(login) && !validateIfNumber) {
                if (isNumericWithSpecialChars(login)) {
                    addErrorMessage(errors, INPUT_IDS.PHONE_OR_EMAIL, translate('common.error.phoneNumber'));
                } else {
                    addErrorMessage(errors, INPUT_IDS.PHONE_OR_EMAIL, translate('loginForm.error.invalidFormatEmailLogin'));
                }
            }
        }

        if (!values[INPUT_IDS.CONSENT]) {
            addErrorMessage(errors, INPUT_IDS.CONSENT, translate('common.error.fieldRequired'));
        }
        return errors;
    };

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
            testID="AccountDetailsPage"
            shouldShowOfflineIndicator={false}
        >
            <HeaderWithBackButton
                title={translate('mergeAccountsPage.mergeAccount')}
                onBackButtonPress={() => Navigation.dismissModal()}
            />
            <FullPageOfflineBlockingView>
                <FormProvider
                    formID={ONYXKEYS.FORMS.MERGE_ACCOUNT_DETAILS_FORM}
                    onSubmit={(values) => {
                        requestValidationCodeForAccountMerge(values[INPUT_IDS.PHONE_OR_EMAIL], false, countryCode);
                    }}
                    style={[styles.flexGrow1, styles.mh5]}
                    shouldTrimValues
                    validate={validate}
                    submitButtonText={translate('common.next')}
                    isSubmitButtonVisible={false}
                    ref={formRef}
                >
                    <View style={[styles.flexGrow1, styles.mt3]}>
                        <View style={[styles.renderHTML]}>
                            <RenderHTML html={translate('mergeAccountsPage.accountDetails.accountToMergeInto', {login: userEmailOrPhone ?? ''})} />
                        </View>
                        <InputWrapper
                            ref={inputCallbackRef}
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.PHONE_OR_EMAIL}
                            autoCapitalize="none"
                            label={translate('loginForm.phoneOrEmail')}
                            aria-label={translate('loginForm.phoneOrEmail')}
                            role={CONST.ROLE.PRESENTATION}
                            containerStyles={[styles.mt8]}
                            autoCorrect={false}
                            onChangeText={setEmail}
                            value={email}
                            inputMode={CONST.INPUT_MODE.EMAIL}
                        />
                        <InputWrapper
                            style={[styles.mt8]}
                            InputComponent={CheckboxWithLabel}
                            inputID={INPUT_IDS.CONSENT}
                            label={translate('mergeAccountsPage.accountDetails.notReversibleConsent')}
                            aria-label={translate('mergeAccountsPage.accountDetails.notReversibleConsent')}
                        />
                    </View>
                    <FormAlertWithSubmitButton
                        isAlertVisible={!!genericError}
                        onSubmit={() => {
                            formRef.current?.submit();
                        }}
                        message={genericError}
                        buttonText={translate('common.next')}
                        enabledWhenOffline={false}
                        containerStyles={styles.mt3}
                        isLoading={getValidateCodeForAccountMerge?.isLoading}
                    />
                </FormProvider>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

export default AccountDetailsPage;

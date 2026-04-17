import {PUBLIC_DOMAINS_SET, Str} from 'expensify-common';
import React, {useEffect, useState} from 'react';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateSelectedExpensifyCardFeed} from '@libs/actions/Card';
import {setContactMethodAsDefault} from '@libs/actions/User';
import {addErrorMessage, getMicroSecondOnyxErrorWithMessage} from '@libs/ErrorUtils';
import Log from '@libs/Log';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isValidEmail} from '@libs/ValidationUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import {linkCardFeedToPolicy} from '@userActions/CompanyCards';
import {setErrorFields} from '@userActions/FormActions';
import {AddWorkEmail} from '@userActions/Session';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/AddWorkEmailForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';

type WorkspaceExpensifyCardAddWorkEmailPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_ADD_WORK_EMAIL>;

function WorkspaceExpensifyCardAddWorkEmailPage({route}: WorkspaceExpensifyCardAddWorkEmailPageProps) {
    const {policyID, fundID} = route.params;
    const primaryContactMethod = usePrimaryContactMethod();
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {isOffline} = useNetwork();
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [loading, setLoading] = useState(false);

    const {translate, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const [email, setEmail] = useState('');
    const emailLoginKey = email ? Object.keys(loginList ?? {}).find((login) => login.toLowerCase() === email.toLowerCase()) : undefined;
    const isWorkEmailValidated = emailLoginKey ? !!loginList?.[emailLoginKey]?.validatedDate : false;

    const {inputCallbackRef} = useAutoFocusInput();

    const handleSubmit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM>) => {
        const submittedEmail = values[INPUT_IDS.EMAIL].trim();
        const existingLoginKey = Object.keys(loginList ?? {}).find((login) => login.toLowerCase() === submittedEmail.toLowerCase());
        const isExistingLoginValidated = existingLoginKey ? !!loginList?.[existingLoginKey]?.validatedDate : false;

        if (existingLoginKey) {
            if (!isExistingLoginValidated) {
                setEmail(submittedEmail);
                Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_VERIFY_WORK_EMAIL.getRoute(policyID, fundID));
                return;
            }
            setContactMethodAsDefault(currentUserPersonalDetails, allPolicies, existingLoginKey, formatPhoneNumber, undefined, true);
            setLoading(true);
            linkCardFeedToPolicy(Number(fundID), policyID, CONST.COMPANY_CARD.LINK_FEED_TYPE.EXPENSIFY_CARD)
                .then(() => {
                    updateSelectedExpensifyCardFeed(Number(fundID), policyID);
                    Navigation.closeRHPFlow();
                })
                .catch((error: TranslationPaths) => {
                    setErrorFields(ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM, {
                        [INPUT_IDS.EMAIL]: getMicroSecondOnyxErrorWithMessage(translate(error)),
                    });
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            AddWorkEmail(submittedEmail);
        }
        setEmail(submittedEmail);
    };

    useEffect(() => {
        if (!email || !primaryContactMethod || primaryContactMethod.toLowerCase() !== email.toLowerCase() || isWorkEmailValidated) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_VERIFY_WORK_EMAIL.getRoute(policyID, fundID));
    }, [primaryContactMethod, email, policyID, fundID, isWorkEmailValidated]);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM>): Errors => {
        const errors = {};
        const userEmail = values.email;
        const emailParts = userEmail.split('@');
        const domain = emailParts.at(1) ?? '';

        if (!values.email) {
            addErrorMessage(errors, INPUT_IDS.EMAIL, translate('common.error.fieldRequired'));
        } else if (values.email.length > CONST.LOGIN_CHARACTER_LIMIT) {
            addErrorMessage(errors, INPUT_IDS.EMAIL, translate('common.error.characterLimitExceedCounter', values.email.length, CONST.LOGIN_CHARACTER_LIMIT));
        } else if ((!Str.isValidEmail(userEmail) || PUBLIC_DOMAINS_SET.has(domain.toLowerCase())) && !isOffline) {
            Log.hmmm('User is trying to add an invalid work email', {userEmail, domain});
            addErrorMessage(errors, INPUT_IDS.EMAIL, translate('onboarding.workEmailValidationError.publicEmail'));
        }

        if (isOffline ?? false) {
            addErrorMessage(errors, INPUT_IDS.EMAIL, translate('onboarding.workEmailValidationError.offline'));
        }

        const isEmailInvalid = !!values.email && !isValidEmail(values.email);

        if (isEmailInvalid) {
            addErrorMessage(errors, INPUT_IDS.EMAIL, translate('messages.errorMessageInvalidEmail'));
        }
        return errors;
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID="WorkspaceExpensifyCardAddWorkEmailPage"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton title={translate('workspace.companyCards.addWorkEmail')} />
                <Text style={[styles.textHeadlineLineHeightXXL, styles.ph5]}>{translate('workspace.companyCards.addWorkEmail')}</Text>
                <Text style={[styles.mt2, styles.mb4, styles.ph5, styles.textSupporting]}>{translate('workspace.companyCards.addWorkEmailDescription')}</Text>
                <FormProvider
                    formID={ONYXKEYS.FORMS.ADD_WORK_EMAIL_FORM}
                    validate={validate}
                    onSubmit={handleSubmit}
                    isLoading={loading}
                    submitButtonText={translate('common.save')}
                    style={[styles.flex1, styles.ph5, styles.pb3]}
                >
                    <InputWrapper
                        InputComponent={TextInput}
                        label={`${translate('common.workEmail')}`}
                        aria-label={`${translate('common.workEmail')}`}
                        role={CONST.ROLE.PRESENTATION}
                        inputMode={CONST.INPUT_MODE.EMAIL}
                        ref={inputCallbackRef}
                        inputID={INPUT_IDS.EMAIL}
                        autoCapitalize="none"
                        spellCheck={false}
                        suffixStyle={styles.colorMuted}
                        enterKeyHint="done"
                    />
                </FormProvider>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardAddWorkEmailPage;

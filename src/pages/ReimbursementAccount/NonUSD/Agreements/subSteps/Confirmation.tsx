import React, {useCallback, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import {getFieldRequiredErrors, isRequiredFulfilled} from '@libs/ValidationUtils';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const {AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT, PROVIDE_TRUTHFUL_INFORMATION, AGREE_TO_TERMS_AND_CONDITIONS, CONSENT_TO_PRIVACY_NOTICE} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT, PROVIDE_TRUTHFUL_INFORMATION, AGREE_TO_TERMS_AND_CONDITIONS, CONSENT_TO_PRIVACY_NOTICE];

function IsAuthorizedToUseBankAccountLabel() {
    const {translate} = useLocalize();
    return <Text>{translate('agreementsStep.iAmAuthorized')}</Text>;
}

function CertifyTrueAndAccurateLabel() {
    const {translate} = useLocalize();
    return <Text>{translate('agreementsStep.iCertify')}</Text>;
}

function TermsAndConditionsLabel() {
    const {translate} = useLocalize();
    return (
        <Text>
            {translate('common.iAcceptThe')}
            <TextLink href="https://cross-border.corpay.com/tc/">{`${translate('agreementsStep.termsAndConditions')}`}</TextLink>.
        </Text>
    );
}

function ConsentToPrivacyNoticeLabel() {
    const {translate} = useLocalize();
    return (
        <Text>
            {translate('agreementsStep.iConsentToThe')} <TextLink href="https://payments.corpay.com/compliance">{`${translate('agreementsStep.privacyNotice')}`}</TextLink>.
        </Text>
    );
}

const INPUT_KEYS = {
    PROVIDE_TRUTHFUL_INFORMATION: INPUT_IDS.ADDITIONAL_DATA.CORPAY.PROVIDE_TRUTHFUL_INFORMATION,
    AGREE_TO_TERMS_AND_CONDITIONS: INPUT_IDS.ADDITIONAL_DATA.CORPAY.AGREE_TO_TERMS_AND_CONDITIONS,
    CONSENT_TO_PRIVACY_NOTICE: INPUT_IDS.ADDITIONAL_DATA.CORPAY.CONSENT_TO_PRIVACY_NOTICE,
    AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT: INPUT_IDS.ADDITIONAL_DATA.CORPAY.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT,
};

function Confirmation({onNext}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: false});
    const agreementsStepValues = useMemo(() => getSubStepValues(INPUT_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = getFieldRequiredErrors(values, STEP_FIELDS);

            if (!isRequiredFulfilled(values[AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT])) {
                errors[AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT] = translate('agreementsStep.error.authorized');
            }

            if (!isRequiredFulfilled(values[PROVIDE_TRUTHFUL_INFORMATION])) {
                errors[PROVIDE_TRUTHFUL_INFORMATION] = translate('agreementsStep.error.certify');
            }

            if (!isRequiredFulfilled(values[AGREE_TO_TERMS_AND_CONDITIONS])) {
                errors[AGREE_TO_TERMS_AND_CONDITIONS] = translate('common.error.acceptTerms');
            }

            if (!isRequiredFulfilled(values[CONSENT_TO_PRIVACY_NOTICE])) {
                errors[CONSENT_TO_PRIVACY_NOTICE] = translate('agreementsStep.error.consent');
            }

            return errors;
        },
        [translate],
    );

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            onSubmit={onNext}
            validate={validate}
            submitButtonText={translate('agreementsStep.accept')}
            style={[styles.mh5, styles.flexGrow1]}
            enabledWhenOffline={false}
            isLoading={reimbursementAccount?.isFinishingCorpayBankAccountOnboarding}
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('agreementsStep.pleaseConfirm')}</Text>
            <Text style={[styles.pv3, styles.textSupporting]}>{translate('agreementsStep.regulationRequiresUs')}</Text>
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                accessibilityLabel={translate('agreementsStep.iAmAuthorized')}
                inputID={AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT}
                style={styles.mt6}
                LabelComponent={IsAuthorizedToUseBankAccountLabel}
                defaultValue={agreementsStepValues[AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT]}
                shouldSaveDraft
            />
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                accessibilityLabel={translate('agreementsStep.iCertify')}
                inputID={PROVIDE_TRUTHFUL_INFORMATION}
                style={styles.mt6}
                LabelComponent={CertifyTrueAndAccurateLabel}
                defaultValue={agreementsStepValues[PROVIDE_TRUTHFUL_INFORMATION]}
                shouldSaveDraft
            />
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                accessibilityLabel={`${translate('common.iAcceptThe')} ${translate('agreementsStep.termsAndConditions')}.`}
                inputID={AGREE_TO_TERMS_AND_CONDITIONS}
                style={styles.mt6}
                LabelComponent={TermsAndConditionsLabel}
                defaultValue={agreementsStepValues[AGREE_TO_TERMS_AND_CONDITIONS]}
                shouldSaveDraft
            />
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                accessibilityLabel={`${translate('agreementsStep.iConsentToThe')} ${translate('agreementsStep.privacyNotice')}.`}
                inputID={CONSENT_TO_PRIVACY_NOTICE}
                style={styles.mt6}
                LabelComponent={ConsentToPrivacyNoticeLabel}
                defaultValue={agreementsStepValues[CONSENT_TO_PRIVACY_NOTICE]}
                shouldSaveDraft
            />
        </FormProvider>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;

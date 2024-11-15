import React, {useCallback} from 'react';
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
import * as ValidationUtils from '@libs/ValidationUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const {AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT, PROVIDE_TRUTHFUL_INFORMATION, AGREE_TO_TERMS_AND_CONDITIONS} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT, PROVIDE_TRUTHFUL_INFORMATION, AGREE_TO_TERMS_AND_CONDITIONS];

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
            <TextLink href="">{`${translate('agreementsStep.termsAndConditions')}`}</TextLink>
        </Text>
    );
}

function Confirmation({onNext}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const defaultValues = {
        [AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT]:
            !!reimbursementAccount?.achData?.additionalData?.corpay?.[AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT] ?? reimbursementAccountDraft?.[AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT] ?? '',
        [PROVIDE_TRUTHFUL_INFORMATION]:
            !!reimbursementAccount?.achData?.additionalData?.corpay?.[PROVIDE_TRUTHFUL_INFORMATION] ?? reimbursementAccountDraft?.[PROVIDE_TRUTHFUL_INFORMATION] ?? '',
        [AGREE_TO_TERMS_AND_CONDITIONS]:
            !!reimbursementAccount?.achData?.additionalData?.corpay?.[AGREE_TO_TERMS_AND_CONDITIONS] ?? reimbursementAccountDraft?.[AGREE_TO_TERMS_AND_CONDITIONS] ?? '',
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

            if (!ValidationUtils.isRequiredFulfilled(values[AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT])) {
                errors[AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT] = translate('agreementsStep.error.authorized');
            }

            if (!ValidationUtils.isRequiredFulfilled(values[PROVIDE_TRUTHFUL_INFORMATION])) {
                errors[PROVIDE_TRUTHFUL_INFORMATION] = translate('agreementsStep.error.certify');
            }

            if (!ValidationUtils.isRequiredFulfilled(values[AGREE_TO_TERMS_AND_CONDITIONS])) {
                errors[AGREE_TO_TERMS_AND_CONDITIONS] = translate('common.error.acceptTerms');
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
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('agreementsStep.pleaseConfirm')}</Text>
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                accessibilityLabel={translate('agreementsStep.iAmAuthorized')}
                inputID={AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT}
                style={styles.mt6}
                LabelComponent={IsAuthorizedToUseBankAccountLabel}
                defaultValue={defaultValues[AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT]}
                shouldSaveDraft
            />
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                accessibilityLabel={translate('agreementsStep.iCertify')}
                inputID={PROVIDE_TRUTHFUL_INFORMATION}
                style={styles.mt6}
                LabelComponent={CertifyTrueAndAccurateLabel}
                defaultValue={defaultValues[PROVIDE_TRUTHFUL_INFORMATION]}
                shouldSaveDraft
            />
            <InputWrapper
                InputComponent={CheckboxWithLabel}
                accessibilityLabel={`${translate('common.iAcceptThe')} ${translate('agreementsStep.termsAndConditions')}`}
                inputID={AGREE_TO_TERMS_AND_CONDITIONS}
                style={styles.mt6}
                LabelComponent={TermsAndConditionsLabel}
                defaultValue={defaultValues[AGREE_TO_TERMS_AND_CONDITIONS]}
                shouldSaveDraft
            />
        </FormProvider>
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;

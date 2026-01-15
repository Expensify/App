import React, {useMemo} from 'react';
import PushRowFieldsStep from '@components/SubStepForms/PushRowFieldsStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getListOptionsFromCorpayPicklist from '@pages/ReimbursementAccount/NonUSD/utils/getListOptionsFromCorpayPicklist';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type PaymentVolumeProps = SubStepProps;

const {ANNUAL_VOLUME} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [ANNUAL_VOLUME];

function PaymentVolume({onNext, onMove, isEditing}: PaymentVolumeProps) {
    const {translate} = useLocalize();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [corpayOnboardingFields] = useOnyx(ONYXKEYS.CORPAY_ONBOARDING_FIELDS, {canBeMissing: false});
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const currency = policy?.outputCurrency ?? '';

    const annualVolumeRangeListOptions = useMemo(
        () => getListOptionsFromCorpayPicklist(corpayOnboardingFields?.picklists.AnnualVolumeRange),
        [corpayOnboardingFields?.picklists.AnnualVolumeRange],
    );

    const annualVolumeDefaultValue = reimbursementAccount?.achData?.corpay?.[ANNUAL_VOLUME] ?? '';

    const pushRowFields = useMemo(
        () => [
            {
                inputID: ANNUAL_VOLUME,
                defaultValue: annualVolumeDefaultValue,
                options: annualVolumeRangeListOptions,
                description: translate('businessInfoStep.annualPaymentVolumeInCurrency', currency),
                modalHeaderTitle: translate('businessInfoStep.selectAnnualPaymentVolume'),
                searchInputTitle: translate('businessInfoStep.findAnnualPaymentVolume'),
            },
        ],
        [annualVolumeDefaultValue, annualVolumeRangeListOptions, translate, currency],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    if (corpayOnboardingFields === undefined) {
        return null;
    }

    return (
        <PushRowFieldsStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('businessInfoStep.whatsTheBusinessAnnualPayment')}
            onSubmit={handleSubmit}
            pushRowFields={pushRowFields}
        />
    );
}

export default PaymentVolume;

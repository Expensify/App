import React, {useMemo} from 'react';
import PushRowFieldsStep from '@components/SubStepForms/PushRowFieldsStep';
import useEnableGlobalReimbursementsStepFormSubmit from '@hooks/useEnableGlobalReimbursementsStepFormSubmit';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getListOptionsFromCorpayPicklist from '@pages/ReimbursementAccount/NonUSD/utils/getListOptionsFromCorpayPicklist';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';

type PaymentVolumeProps = SubStepProps & {currency: string};

const {ANNUAL_VOLUME} = INPUT_IDS;
const STEP_FIELDS = [ANNUAL_VOLUME];

function PaymentVolume({onNext, onMove, isEditing, currency}: PaymentVolumeProps) {
    const {translate} = useLocalize();
    const [enableGlobalReimbursementsDraft] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT, {canBeMissing: true});
    const [corpayOnboardingFields] = useOnyx(ONYXKEYS.CORPAY_ONBOARDING_FIELDS, {canBeMissing: true});

    const annualVolumeRangeListOptions = useMemo(
        () => getListOptionsFromCorpayPicklist(corpayOnboardingFields?.picklists.AnnualVolumeRange),
        [corpayOnboardingFields?.picklists.AnnualVolumeRange],
    );

    const pushRowFields = useMemo(
        () => [
            {
                inputID: ANNUAL_VOLUME,
                defaultValue: enableGlobalReimbursementsDraft?.[ANNUAL_VOLUME] ?? '',
                options: annualVolumeRangeListOptions,
                description: translate('businessInfoStep.annualPaymentVolumeInCurrency', currency),
                modalHeaderTitle: translate('businessInfoStep.selectAnnualPaymentVolume'),
                searchInputTitle: translate('businessInfoStep.findAnnualPaymentVolume'),
            },
        ],
        [enableGlobalReimbursementsDraft, currency, annualVolumeRangeListOptions, translate],
    );

    const handleSubmit = useEnableGlobalReimbursementsStepFormSubmit({
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
            formID={ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS}
            formTitle={translate('businessInfoStep.whatsTheBusinessAnnualPayment')}
            onSubmit={handleSubmit}
            pushRowFields={pushRowFields}
        />
    );
}

export default PaymentVolume;

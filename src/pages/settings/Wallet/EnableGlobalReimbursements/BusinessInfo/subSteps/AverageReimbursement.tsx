import React, {useMemo} from 'react';
import PushRowFieldsStep from '@components/SubStepForms/PushRowFieldsStep';
import useEnableGlobalReimbursementsStepFormSubmit from '@hooks/useEnableGlobalReimbursementsStepFormSubmit';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getListOptionsFromCorpayPicklist from '@pages/ReimbursementAccount/NonUSD/utils/getListOptionsFromCorpayPicklist';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';

type AverageReimbursementsProps = SubStepProps & {currency: string};

const {TRADE_VOLUME} = INPUT_IDS;
const STEP_FIELDS = [TRADE_VOLUME];

function AverageReimbursements({onNext, onMove, isEditing, currency}: AverageReimbursementsProps) {
    const {translate} = useLocalize();
    const [enableGlobalReimbursementsDraft] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT, {canBeMissing: true});
    const [corpayOnboardingFields] = useOnyx(ONYXKEYS.CORPAY_ONBOARDING_FIELDS, {canBeMissing: true});

    const tradeVolumeRangeListOptions = useMemo(
        () => getListOptionsFromCorpayPicklist(corpayOnboardingFields?.picklists.TradeVolumeRange),
        [corpayOnboardingFields?.picklists.TradeVolumeRange],
    );

    const pushRowFields = useMemo(
        () => [
            {
                inputID: TRADE_VOLUME,
                defaultValue: enableGlobalReimbursementsDraft?.[TRADE_VOLUME] ?? '',
                options: tradeVolumeRangeListOptions,
                description: translate('businessInfoStep.averageReimbursementAmountInCurrency', {currencyCode: currency}),
                modalHeaderTitle: translate('businessInfoStep.selectAverageReimbursement'),
                searchInputTitle: translate('businessInfoStep.findAverageReimbursement'),
            },
        ],
        [enableGlobalReimbursementsDraft, currency, tradeVolumeRangeListOptions, translate],
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
            formTitle={translate('businessInfoStep.whatsYourExpectedAverageReimbursements')}
            onSubmit={handleSubmit}
            pushRowFields={pushRowFields}
        />
    );
}

AverageReimbursements.displayName = 'AverageReimbursements';

export default AverageReimbursements;

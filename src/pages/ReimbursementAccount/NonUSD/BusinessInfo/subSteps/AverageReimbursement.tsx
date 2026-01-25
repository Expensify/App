import React, {useMemo} from 'react';
import PushRowFieldsStep from '@components/SubStepForms/PushRowFieldsStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getListOptionsFromCorpayPicklist from '@pages/ReimbursementAccount/NonUSD/utils/getListOptionsFromCorpayPicklist';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type AverageReimbursementProps = SubStepProps;

const {TRADE_VOLUME} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [TRADE_VOLUME];

function AverageReimbursement({onNext, onMove, isEditing}: AverageReimbursementProps) {
    const {translate} = useLocalize();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [corpayOnboardingFields] = useOnyx(ONYXKEYS.CORPAY_ONBOARDING_FIELDS, {canBeMissing: false});
    const policyID = reimbursementAccount?.achData?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const currency = policy?.outputCurrency ?? '';

    const tradeVolumeRangeListOptions = useMemo(
        () => getListOptionsFromCorpayPicklist(corpayOnboardingFields?.picklists.TradeVolumeRange),
        [corpayOnboardingFields?.picklists.TradeVolumeRange],
    );

    const pushRowFields = useMemo(
        () => [
            {
                inputID: TRADE_VOLUME,
                defaultValue: reimbursementAccount?.achData?.corpay?.[TRADE_VOLUME] ?? '',
                options: tradeVolumeRangeListOptions,
                description: translate('businessInfoStep.averageReimbursementAmountInCurrency', currency),
                modalHeaderTitle: translate('businessInfoStep.selectAverageReimbursement'),
                searchInputTitle: translate('businessInfoStep.findAverageReimbursement'),
            },
        ],
        [reimbursementAccount, currency, tradeVolumeRangeListOptions, translate],
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
            formTitle={translate('businessInfoStep.whatsYourExpectedAverageReimbursements')}
            onSubmit={handleSubmit}
            pushRowFields={pushRowFields}
        />
    );
}

export default AverageReimbursement;

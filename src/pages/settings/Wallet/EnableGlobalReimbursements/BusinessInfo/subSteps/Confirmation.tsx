import React, {useMemo} from 'react';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';

const {BUSINESS_REGISTRATION_INCORPORATION_NUMBER, ANNUAL_VOLUME, APPLICANT_TYPE_ID, TRADE_VOLUME, BUSINESS_CATEGORY} = INPUT_IDS;

const displayStringValue = (list: Array<{id: string; name: string; stringValue: string}>, matchingName: string) => {
    return list.find((item) => item.name === matchingName)?.stringValue ?? '';
};

function Confirmation({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [enableGlobalReimbursementsDraft] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT, {canBeMissing: false});
    const [corpayOnboardingFields] = useOnyx(ONYXKEYS.CORPAY_ONBOARDING_FIELDS, {canBeMissing: false});
    const error = getLatestErrorMessage(enableGlobalReimbursementsDraft);

    const paymentVolume = useMemo(
        () => displayStringValue(corpayOnboardingFields?.picklists.AnnualVolumeRange ?? [], enableGlobalReimbursementsDraft?.[ANNUAL_VOLUME] ?? ''),
        [corpayOnboardingFields?.picklists.AnnualVolumeRange, enableGlobalReimbursementsDraft],
    );
    const businessCategory = useMemo(
        () => displayStringValue(corpayOnboardingFields?.picklists.NatureOfBusiness ?? [], enableGlobalReimbursementsDraft?.[BUSINESS_CATEGORY] ?? ''),
        [corpayOnboardingFields?.picklists.NatureOfBusiness, enableGlobalReimbursementsDraft],
    );
    const businessType = useMemo(
        () => displayStringValue(corpayOnboardingFields?.picklists.ApplicantType ?? [], enableGlobalReimbursementsDraft?.[APPLICANT_TYPE_ID] ?? ''),
        [corpayOnboardingFields?.picklists.ApplicantType, enableGlobalReimbursementsDraft],
    );
    const tradeVolumeRange = useMemo(
        () => displayStringValue(corpayOnboardingFields?.picklists.TradeVolumeRange ?? [], enableGlobalReimbursementsDraft?.[TRADE_VOLUME] ?? ''),
        [corpayOnboardingFields?.picklists.TradeVolumeRange, enableGlobalReimbursementsDraft],
    );

    const summaryItems = useMemo(
        () => [
            {
                title: enableGlobalReimbursementsDraft?.[BUSINESS_REGISTRATION_INCORPORATION_NUMBER] ?? '',
                description: translate('businessInfoStep.registrationNumber'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(0);
                },
            },
            {
                title: businessType,
                description: translate('businessInfoStep.businessType'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(1);
                },
            },
            {
                title: businessCategory,
                description: translate('businessInfoStep.businessCategory'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(1);
                },
            },
            {
                title: paymentVolume,
                description: translate('businessInfoStep.annualPaymentVolume'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(2);
                },
            },
            {
                title: tradeVolumeRange,
                description: translate('businessInfoStep.averageReimbursementAmount'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(3);
                },
            },
        ],
        [businessCategory, businessType, enableGlobalReimbursementsDraft, onMove, paymentVolume, tradeVolumeRange, translate],
    );

    return (
        <ConfirmationStep
            isEditing={isEditing}
            error={error}
            onNext={onNext}
            onMove={onMove}
            pageTitle={translate('businessInfoStep.letsDoubleCheck')}
            summaryItems={summaryItems}
            showOnfidoLinks={false}
        />
    );
}

export default Confirmation;

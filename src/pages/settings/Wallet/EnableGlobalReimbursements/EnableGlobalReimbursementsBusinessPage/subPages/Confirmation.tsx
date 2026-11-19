import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getLatestErrorMessage} from '@libs/ErrorUtils';

import type {BusinessInfoSubPageProps} from '@pages/settings/Wallet/EnableGlobalReimbursements/EnableGlobalReimbursementsBusinessPage/types';

import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';

import React from 'react';

const {BUSINESS_REGISTRATION_INCORPORATION_NUMBER, ANNUAL_VOLUME, APPLICANT_TYPE_ID, TRADE_VOLUME, BUSINESS_CATEGORY} = INPUT_IDS;

const displayStringValue = (list: Array<{id: string; name: string; stringValue: string}>, matchingName: string) => {
    return list.find((item) => item.name === matchingName)?.stringValue ?? '';
};

function Confirmation({onNext, onMove, isEditing}: BusinessInfoSubPageProps) {
    const {translate} = useLocalize();

    const [enableGlobalReimbursementsDraft] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT);
    const [corpayOnboardingFields] = useOnyx(ONYXKEYS.CORPAY_ONBOARDING_FIELDS);
    const error = getLatestErrorMessage(enableGlobalReimbursementsDraft);

    const paymentVolume = displayStringValue(corpayOnboardingFields?.picklists.AnnualVolumeRange ?? [], enableGlobalReimbursementsDraft?.[ANNUAL_VOLUME] ?? '');
    const businessCategory = displayStringValue(corpayOnboardingFields?.picklists.NatureOfBusiness ?? [], enableGlobalReimbursementsDraft?.[BUSINESS_CATEGORY] ?? '');
    const businessType = displayStringValue(corpayOnboardingFields?.picklists.ApplicantType ?? [], enableGlobalReimbursementsDraft?.[APPLICANT_TYPE_ID] ?? '');
    const tradeVolumeRange = displayStringValue(corpayOnboardingFields?.picklists.TradeVolumeRange ?? [], enableGlobalReimbursementsDraft?.[TRADE_VOLUME] ?? '');

    const summaryItems = [
        {
            id: 'registration-number',
            title: enableGlobalReimbursementsDraft?.[BUSINESS_REGISTRATION_INCORPORATION_NUMBER] ?? '',
            description: translate('businessInfoStep.registrationNumber'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(0);
            },
        },
        {
            id: 'business-type',
            title: businessType,
            description: translate('businessInfoStep.businessType'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(1);
            },
        },
        {
            id: 'business-category',
            title: businessCategory,
            description: translate('businessInfoStep.businessCategory'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(1);
            },
        },
        {
            id: 'annual-payment-volume',
            title: paymentVolume,
            description: translate('businessInfoStep.annualPaymentVolume'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(2);
            },
        },
        {
            id: 'trade-volume-range',
            title: tradeVolumeRange,
            description: translate('businessInfoStep.averageReimbursementAmount'),
            shouldShowRightIcon: true,
            onPress: () => {
                onMove(3);
            },
        },
    ];

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

import {CONST as COMMON_CONST} from 'expensify-common/dist/CONST';
import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const BUSINESS_INFO_STEP_KEYS = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const {
    COMPANY_NAME,
    BUSINESS_REGISTRATION_INCORPORATION_NUMBER,
    TAX_ID_EIN_NUMBER,
    COMPANY_COUNTRY_CODE,
    COMPANY_STREET,
    COMPANY_CITY,
    COMPANY_STATE,
    COMPANY_POSTAL_CODE,
    BUSINESS_CONTACT_NUMBER,
    BUSINESS_CONFIRMATION_EMAIL,
    FORMATION_INCORPORATION_COUNTRY_CODE,
    FORMATION_INCORPORATION_STATE,
    ANNUAL_VOLUME,
    APPLICANT_TYPE_ID,
    TRADE_VOLUME,
    BUSINESS_CATEGORY,
} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

const displayStringValue = (list: Array<{id: string; name: string; stringValue: string}>, matchingName: string) => {
    return list.find((item) => item.name === matchingName)?.stringValue ?? '';
};

const displayAddress = (street: string, city: string, state: string, zipCode: string, country: string): string => {
    return country === CONST.COUNTRY.US || country === CONST.COUNTRY.CA ? `${street}, ${city}, ${state}, ${zipCode}, ${country}` : `${street}, ${city}, ${zipCode}, ${country}`;
};

const displayIncorporationLocation = (country: string, state: string) => {
    const countryFullName = CONST.ALL_COUNTRIES[country as keyof typeof CONST.COUNTRY];
    const stateFullName = COMMON_CONST.STATES[state as keyof typeof COMMON_CONST.STATES]?.stateName ?? COMMON_CONST.PROVINCES[state as keyof typeof COMMON_CONST.PROVINCES]?.provinceName;

    return country === CONST.COUNTRY.US || country === CONST.COUNTRY.CA ? `${stateFullName}, ${countryFullName}` : `${countryFullName}`;
};

function Confirmation({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const [corpayOnboardingFields] = useOnyx(ONYXKEYS.CORPAY_ONBOARDING_FIELDS);
    const error = getLatestErrorMessage(reimbursementAccount);

    const values = useMemo(() => getSubStepValues(BUSINESS_INFO_STEP_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const paymentVolume = useMemo(
        () => displayStringValue(corpayOnboardingFields?.picklists.AnnualVolumeRange ?? [], values[ANNUAL_VOLUME]),
        [corpayOnboardingFields?.picklists.AnnualVolumeRange, values],
    );
    const businessCategory = useMemo(
        () => displayStringValue(corpayOnboardingFields?.picklists.NatureOfBusiness ?? [], values[BUSINESS_CATEGORY]),
        [corpayOnboardingFields?.picklists.NatureOfBusiness, values],
    );
    const businessType = useMemo(
        () => displayStringValue(corpayOnboardingFields?.picklists.ApplicantType ?? [], values[APPLICANT_TYPE_ID]),
        [corpayOnboardingFields?.picklists.ApplicantType, values],
    );
    const tradeVolumeRange = useMemo(
        () => displayStringValue(corpayOnboardingFields?.picklists.TradeVolumeRange ?? [], values[TRADE_VOLUME]),
        [corpayOnboardingFields?.picklists.TradeVolumeRange, values],
    );

    const summaryItems = useMemo(
        () => [
            {
                title: values[COMPANY_NAME],
                description: translate('businessInfoStep.legalBusinessName'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(0);
                },
            },
            {
                title: values[BUSINESS_REGISTRATION_INCORPORATION_NUMBER],
                description: translate('businessInfoStep.registrationNumber'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(3);
                },
            },
            {
                title: values[TAX_ID_EIN_NUMBER],
                description: translate('businessInfoStep.taxIDEIN'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(4);
                },
            },
            {
                title: displayAddress(values[COMPANY_STREET], values[COMPANY_CITY], values[COMPANY_STATE], values[COMPANY_POSTAL_CODE], values[COMPANY_COUNTRY_CODE]),
                description: translate('businessInfoStep.businessAddress'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(1);
                },
            },
            {
                title: values[BUSINESS_CONTACT_NUMBER],
                description: translate('common.phoneNumber'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(2);
                },
            },
            {
                title: values[BUSINESS_CONFIRMATION_EMAIL],
                description: translate('common.email'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(2);
                },
            },
            {
                title: businessType,
                description: translate('businessInfoStep.businessType'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(6);
                },
            },
            {
                title: displayIncorporationLocation(values[FORMATION_INCORPORATION_COUNTRY_CODE], values[FORMATION_INCORPORATION_STATE]),
                description: translate('businessInfoStep.incorporation'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(5);
                },
            },
            {
                title: businessCategory,
                description: translate('businessInfoStep.businessCategory'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(6);
                },
            },
            {
                title: paymentVolume,
                description: translate('businessInfoStep.annualPaymentVolume'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(7);
                },
            },
            {
                title: tradeVolumeRange,
                description: translate('businessInfoStep.averageReimbursementAmount'),
                shouldShowRightIcon: true,
                onPress: () => {
                    onMove(8);
                },
            },
        ],
        [businessCategory, businessType, onMove, paymentVolume, tradeVolumeRange, translate, values],
    );

    return (
        <ConfirmationStep
            isEditing={isEditing}
            error={error}
            onNext={onNext}
            onMove={onMove}
            pageTitle={translate('businessInfoStep.letsDoubleCheck')}
            summaryItems={summaryItems}
            isLoading={reimbursementAccount?.isSavingCorpayOnboardingCompanyFields}
            showOnfidoLinks={false}
        />
    );
}

Confirmation.displayName = 'Confirmation';

export default Confirmation;

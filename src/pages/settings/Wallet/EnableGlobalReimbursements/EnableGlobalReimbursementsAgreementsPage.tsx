import AgreementsFullStep from '@components/SubStepForms/AgreementsFullStep';

import useEnableGlobalReimbursementsNavigation from '@hooks/useEnableGlobalReimbursementsNavigation';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';

import React from 'react';

type EnableGlobalReimbursementsAgreementsPageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.SETTINGS.WALLET.ENABLE_GLOBAL_REIMBURSEMENTS_AGREEMENTS | typeof SCREENS.SETTINGS.WALLET.DYNAMIC_ENABLE_GLOBAL_REIMBURSEMENTS_AGREEMENTS
>;

const inputIDs = {
    provideTruthfulInformation: INPUT_IDS.PROVIDE_TRUTHFUL_INFORMATION,
    agreeToTermsAndConditions: INPUT_IDS.AGREE_TO_TERMS_AND_CONDITIONS,
    consentToPrivacyNotice: INPUT_IDS.CONSENT_TO_PRIVACY_NOTICE,
    authorizedToBindClientToAgreement: INPUT_IDS.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT,
};

function EnableGlobalReimbursementsAgreementsPage({route}: EnableGlobalReimbursementsAgreementsPageProps) {
    const {getBusinessRoute, getSignRoute, isDynamic} = useEnableGlobalReimbursementsNavigation();
    const bankAccountID = route.params?.bankAccountID;
    const [currency = ''] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: (list) => list?.[bankAccountID]?.bankCurrency});
    const [enableGlobalReimbursementsDraft] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT);
    const defaultValues: Record<keyof typeof inputIDs, boolean> = Object.fromEntries(
        Object.keys(inputIDs).map((key) => {
            const typedKey = key as keyof typeof inputIDs;
            return [typedKey, enableGlobalReimbursementsDraft?.[typedKey] ?? false];
        }),
    ) as Record<keyof typeof inputIDs, boolean>;

    const persistedRouteParams = {
        bankCountry: route.params?.bankCountry,
        bankCurrency: route.params?.bankCurrency,
    };

    const goBack = () => {
        const confirmRoute = getBusinessRoute(Number(bankAccountID), CONST.ENABLE_GLOBAL_REIMBURSEMENTS.PAGE_NAME.BUSINESS_INFO.CONFIRM, undefined, persistedRouteParams);
        if (isDynamic) {
            Navigation.navigate(confirmRoute, {forceReplace: true});
            return;
        }
        Navigation.goBack(confirmRoute);
    };

    const goToSignPage = () => {
        Navigation.navigate(getSignRoute(Number(bankAccountID)), isDynamic ? {forceReplace: true} : undefined);
    };

    return (
        <AgreementsFullStep
            defaultValues={defaultValues}
            formID={ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS}
            inputIDs={inputIDs}
            isLoading={false}
            onBackButtonPress={goBack}
            onSubmit={goToSignPage}
            currency={currency}
            startStepIndex={1}
            stepNames={CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP_INDEX_LIST}
        />
    );
}

export default EnableGlobalReimbursementsAgreementsPage;

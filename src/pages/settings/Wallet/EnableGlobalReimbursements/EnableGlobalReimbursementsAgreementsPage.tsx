import React from 'react';
import AgreementsFullStep from '@components/SubStepForms/AgreementsFullStep';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';

type EnableGlobalReimbursementsAgreementsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS>;

const inputIDs = {
    provideTruthfulInformation: INPUT_IDS.PROVIDE_TRUTHFUL_INFORMATION,
    agreeToTermsAndConditions: INPUT_IDS.AGREE_TO_TERMS_AND_CONDITIONS,
    consentToPrivacyNotice: INPUT_IDS.CONSENT_TO_PRIVACY_NOTICE,
    authorizedToBindClientToAgreement: INPUT_IDS.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT,
};

function EnableGlobalReimbursementsAgreementsPage({route}: EnableGlobalReimbursementsAgreementsPageProps) {
    const bankAccountID = route.params?.bankAccountID;
    const [currency = ''] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {selector: (list) => list?.[bankAccountID]?.bankCurrency});
    const [enableGlobalReimbursementsDraft] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT);
    const defaultValues: Record<keyof typeof inputIDs, boolean> = Object.fromEntries(
        Object.keys(inputIDs).map((key) => {
            const typedKey = key as keyof typeof inputIDs;
            return [typedKey, enableGlobalReimbursementsDraft?.[typedKey] ?? false];
        }),
    ) as Record<keyof typeof inputIDs, boolean>;

    const goBack = () => {
        Navigation.goBack(ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS_BUSINESS.getRoute(Number(bankAccountID), CONST.ENABLE_GLOBAL_REIMBURSEMENTS.PAGE_NAME.BUSINESS_INFO.CONFIRM));
    };

    const goToSignPage = () => {
        Navigation.navigate(ROUTES.SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS_SIGN.getRoute(Number(bankAccountID)));
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

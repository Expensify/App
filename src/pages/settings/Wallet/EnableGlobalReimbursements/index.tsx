import React, {useEffect, useState} from 'react';
import type {ValueOf} from 'type-fest';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import {clearEnableGlobalReimbursementsForUSDBankAccount, enableGlobalReimbursementsForUSDBankAccount} from '@userActions/BankAccounts';
import {clearErrors} from '@userActions/FormActions';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/EnableGlobalReimbursementsForm';
import Agreements from './Agreements';
import Docusign from './Docusign';

type EnableGlobalReimbursementsProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.ENABLE_GLOBAL_REIMBURSEMENTS>;

function EnableGlobalReimbursements({route}: EnableGlobalReimbursementsProps) {
    const policyID = route.params?.policyID;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {canBeMissing: false});
    const policyCurrency = policy?.outputCurrency ?? '';
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: false});
    const [enableGlobalReimbursements] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS, {canBeMissing: true});
    const [enableGlobalReimbursementsDraft] = useOnyx(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS_DRAFT, {canBeMissing: true});
    const bankAccountID = reimbursementAccount?.achData?.bankAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [enableGlobalReimbursementsStep, setEnableGlobalReimbursementsStep] = useState<ValueOf<typeof CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP>>(
        CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.AGREEMENTS,
    );

    const handleNextEnableGlobalReimbursementsStep = () => {
        if (enableGlobalReimbursementsStep === CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.AGREEMENTS) {
            setEnableGlobalReimbursementsStep(CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.DOCUSIGN);
        } else {
            enableGlobalReimbursementsForUSDBankAccount({
                inputs: JSON.stringify({
                    provideTruthfulInformation: enableGlobalReimbursementsDraft?.[INPUT_IDS.PROVIDE_TRUTHFUL_INFORMATION],
                    agreeToTermsAndConditions: enableGlobalReimbursementsDraft?.[INPUT_IDS.AGREE_TO_TERMS_AND_CONDITIONS],
                    consentToPrivacyNotice: enableGlobalReimbursementsDraft?.[INPUT_IDS.CONSENT_TO_PRIVACY_NOTICE],
                    authorizedToBindClientToAgreement: enableGlobalReimbursementsDraft?.[INPUT_IDS.AUTHORIZED_TO_BIND_CLIENT_TO_AGREEMENT],
                }),
                achAuthorizationForm: enableGlobalReimbursementsDraft?.[INPUT_IDS.ACH_AUTHORIZATION_FORM].at(0),
                bankAccountID,
            });
        }
    };

    const handleEnableGlobalReimbursementGoBack = () => {
        clearErrors(ONYXKEYS.FORMS.ENABLE_GLOBAL_REIMBURSEMENTS);
        switch (enableGlobalReimbursementsStep) {
            case CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.AGREEMENTS:
                Navigation.goBack();
                break;
            case CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.DOCUSIGN:
                setEnableGlobalReimbursementsStep(CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.AGREEMENTS);
                break;
            default:
                return null;
        }
    };

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (enableGlobalReimbursements?.errors || enableGlobalReimbursements?.isEnablingGlobalReimbursements || !enableGlobalReimbursements?.isSuccess) {
            return;
        }

        if (enableGlobalReimbursements?.isSuccess) {
            clearEnableGlobalReimbursementsForUSDBankAccount();
            Navigation.goBack();
        }

        return () => {
            clearEnableGlobalReimbursementsForUSDBankAccount();
        };
    }, [enableGlobalReimbursements?.errors, enableGlobalReimbursements?.isEnablingGlobalReimbursements, enableGlobalReimbursements?.isSuccess]);

    switch (enableGlobalReimbursementsStep) {
        case CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.AGREEMENTS:
            return (
                <Agreements
                    onBackButtonPress={handleEnableGlobalReimbursementGoBack}
                    onSubmit={handleNextEnableGlobalReimbursementsStep}
                    policyCurrency={policyCurrency}
                />
            );
        case CONST.ENABLE_GLOBAL_REIMBURSEMENTS.STEP.DOCUSIGN:
            return (
                <Docusign
                    onBackButtonPress={handleEnableGlobalReimbursementGoBack}
                    onSubmit={handleNextEnableGlobalReimbursementsStep}
                    policyCurrency={policyCurrency}
                />
            );
        default:
            return null;
    }
}

EnableGlobalReimbursements.displayName = 'EnableGlobalReimbursements';

export default EnableGlobalReimbursements;

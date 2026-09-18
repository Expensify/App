import DynamicFormFlow from '@components/DynamicForm/DynamicFormFlow';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {submitWiseKYCRequirement} from '@userActions/BankAccounts/wise';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

import getWiseRequirementTitle from './getWiseRequirementTitle';

type RequirementFormPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.WISE_KYC_REQUIREMENT_FORM>;

function RequirementFormPage({route}: RequirementFormPageProps) {
    const {translate} = useLocalize();
    const bankAccountID = Number(route.params.bankAccountID);
    const {requirementKey} = route.params;
    const [requirement] = useOnyx(ONYXKEYS.WISE_KYC_REQUIREMENTS, {selector: (requirements) => requirements?.find((item) => item.key === requirementKey)});

    const goBackToList = () => Navigation.goBack(ROUTES.SETTINGS_WALLET_WISE_KYC_REQUIREMENTS.getRoute(bankAccountID));

    return (
        <DynamicFormFlow
            fields={requirement?.fields ?? []}
            formID={ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM}
            headerTitle={translate('wiseKYC.title')}
            confirmationTitle={getWiseRequirementTitle(requirementKey, translate)}
            testID="WiseKYCRequirementFormPage"
            buildRoute={(pageName, action) => ROUTES.SETTINGS_WALLET_WISE_KYC_REQUIREMENT_FORM.getRoute(bankAccountID, requirementKey, pageName, action)}
            onSubmit={(values) => {
                submitWiseKYCRequirement(bankAccountID, requirementKey, values);
                goBackToList();
            }}
            onBack={goBackToList}
        />
    );
}

export default RequirementFormPage;

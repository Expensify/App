import DynamicFormFlow from '@components/DynamicForm/DynamicFormFlow';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import {getWiseKYCRequirements, submitWiseKYCRequirement} from '@userActions/BankAccounts/wise';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect, useRef} from 'react';

import getWiseRequirementTitle from './getWiseRequirementTitle';

type RequirementFormPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.WISE_KYC_REQUIREMENT_FORM>;

function RequirementFormPage({route}: RequirementFormPageProps) {
    const {translate} = useLocalize();
    const bankAccountID = Number(route.params.bankAccountID);
    const {requirementKey} = route.params;
    const [requirement] = useOnyx(ONYXKEYS.WISE_KYC_REQUIREMENTS, {selector: (requirements) => requirements?.find((item) => item.key === requirementKey)});
    const [form] = useOnyx(ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM);
    const fields = requirement?.fields ?? [];

    const goBackToList = () => Navigation.goBack(ROUTES.SETTINGS_WALLET_WISE_KYC_REQUIREMENTS.getRoute(bankAccountID));

    useEffect(() => {
        if (requirement !== undefined) {
            return;
        }
        getWiseKYCRequirements(bankAccountID);
    }, [bankAccountID, requirement]);

    const isSubmitting = !!form?.isLoading;
    const hasSubmitError = !isEmptyObject(form?.errors ?? {});
    const wasSubmittingRef = useRef(false);
    useEffect(() => {
        if (isSubmitting) {
            wasSubmittingRef.current = true;
            return;
        }
        if (!wasSubmittingRef.current || hasSubmitError) {
            return;
        }
        wasSubmittingRef.current = false;
        Navigation.goBack(ROUTES.SETTINGS_WALLET_WISE_KYC_REQUIREMENTS.getRoute(bankAccountID));
    }, [isSubmitting, hasSubmitError, bankAccountID]);

    if (requirement === undefined) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <DynamicFormFlow
            fields={fields}
            formID={ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM}
            headerTitle={translate('wiseKYC.title')}
            confirmationTitle={getWiseRequirementTitle(requirementKey, translate)}
            testID="WiseKYCRequirementFormPage"
            buildRoute={(pageName, action) => ROUTES.SETTINGS_WALLET_WISE_KYC_REQUIREMENT_FORM.getRoute(bankAccountID, requirementKey, pageName, action)}
            onSubmit={(values) => submitWiseKYCRequirement(bankAccountID, requirementKey, values, fields)}
            onBack={goBackToList}
            isSubmitting={isSubmitting}
            submitError={getLatestErrorMessage(form)}
        />
    );
}

export default RequirementFormPage;

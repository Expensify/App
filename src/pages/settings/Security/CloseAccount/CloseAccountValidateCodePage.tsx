import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import useRuleBotGuardModal from '@hooks/useRuleBotGuardModal';

import {requestValidateCodeAction} from '@libs/actions/User';
import {getRuleBotEnforcedPolicy} from '@libs/AgentRulesUtils';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';

import {clearError} from '@userActions/CloseAccount';
import {closeAccount} from '@userActions/User';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {OnyxCollection} from 'react-native-onyx';

import React, {useEffect} from 'react';

function shouldBlockCloseAccountAction(accountID: number | undefined, policies: OnyxCollection<Policy> | undefined, reasonForLeaving?: string) {
    if (!reasonForLeaving) {
        return true;
    }

    return !!getRuleBotEnforcedPolicy(accountID, policies);
}

function CloseAccountValidateCodePage() {
    const {translate} = useLocalize();
    const primaryLogin = usePrimaryContactMethod();
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [closeAccountForm] = useOnyx(ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM);
    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM_DRAFT);
    const showRuleBotGuardModal = useRuleBotGuardModal();

    const reasonForLeaving = draftValues?.reasonForLeaving;
    const closeAccountError = getLatestError(closeAccountForm?.errors ?? undefined);
    const ruleBotEnforcedPolicy = getRuleBotEnforcedPolicy(session?.accountID, policies);

    useEffect(() => {
        // The reason is a required field of the close account form, so an empty draft means this page was reached
        // without submitting that form (e.g. a direct link) and the default contact method was never confirmed.
        if (isLoadingOnyxValue(draftValuesMetadata)) {
            return;
        }

        if (!reasonForLeaving) {
            Navigation.goBack(ROUTES.SETTINGS_CLOSE);
            return;
        }

        if (ruleBotEnforcedPolicy) {
            showRuleBotGuardModal('closeAccount', ruleBotEnforcedPolicy.id);
        }
    }, [draftValuesMetadata, reasonForLeaving, ruleBotEnforcedPolicy, showRuleBotGuardModal]);

    const handleSendValidateCode = () => {
        if (!reasonForLeaving) {
            Navigation.goBack(ROUTES.SETTINGS_CLOSE);
            return;
        }

        if (ruleBotEnforcedPolicy) {
            showRuleBotGuardModal('closeAccount', ruleBotEnforcedPolicy.id);
            return;
        }

        requestValidateCodeAction();
    };

    const handleSubmitForm = (validateCode: string) => {
        if (shouldBlockCloseAccountAction(session?.accountID, policies, reasonForLeaving)) {
            if (ruleBotEnforcedPolicy) {
                showRuleBotGuardModal('closeAccount', ruleBotEnforcedPolicy.id);
            }
            return;
        }

        closeAccount(reasonForLeaving ?? '', validateCode);
    };

    return (
        <ValidateCodeActionContent
            title={translate('delegate.makeSureItIsYou')}
            descriptionPrimary={translate('contacts.enterSecurityCode', primaryLogin ?? '')}
            sendValidateCode={handleSendValidateCode}
            validateCodeActionErrorField="closeAccount"
            handleSubmitForm={handleSubmitForm}
            validateError={closeAccountError}
            isLoading={closeAccountForm?.isLoading}
            clearError={clearError}
            onClose={() => Navigation.goBack(ROUTES.SETTINGS_CLOSE)}
        />
    );
}

export {shouldBlockCloseAccountAction};
export default CloseAccountValidateCodePage;

import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';

import {requestValidateCodeAction} from '@libs/actions/User';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';

import {clearError} from '@userActions/CloseAccount';
import {closeAccount} from '@userActions/User';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect} from 'react';

function CloseAccountValidateCodePage() {
    const {translate} = useLocalize();
    const primaryLogin = usePrimaryContactMethod();
    const [closeAccountForm] = useOnyx(ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM);
    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.CLOSE_ACCOUNT_FORM_DRAFT);

    const reasonForLeaving = draftValues?.reasonForLeaving;
    const closeAccountError = getLatestError(closeAccountForm?.errors ?? undefined);

    useEffect(() => {
        // The reason is a required field of the close account form, so an empty draft means this page was reached
        // without submitting that form (e.g. a direct link) and the default contact method was never confirmed.
        if (isLoadingOnyxValue(draftValuesMetadata) || reasonForLeaving) {
            return;
        }
        Navigation.goBack(ROUTES.SETTINGS_CLOSE);
    }, [draftValuesMetadata, reasonForLeaving]);

    return (
        <ValidateCodeActionContent
            title={translate('delegate.makeSureItIsYou')}
            descriptionPrimary={translate('contacts.enterSecurityCode', primaryLogin ?? '')}
            sendValidateCode={() => requestValidateCodeAction()}
            validateCodeActionErrorField="closeAccount"
            handleSubmitForm={(validateCode) => closeAccount(reasonForLeaving ?? '', validateCode)}
            validateError={closeAccountError}
            isLoading={closeAccountForm?.isLoading}
            clearError={clearError}
            onClose={() => Navigation.goBack(ROUTES.SETTINGS_CLOSE)}
        />
    );
}

export default CloseAccountValidateCodePage;

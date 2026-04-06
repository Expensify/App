import React, {useEffect} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearPendingContactActionErrors, requestValidateCodeAction, verifyAddSecondaryLoginCode} from '@libs/actions/User';
import {getLatestErrorField} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {getContactMethod} from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

function NewContactMethodConfirmMagicCodePage() {
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.SETTINGS_NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE.path);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const contactMethod = getContactMethod(account?.primaryLogin, session?.email);
    const [pendingContactAction] = useOnyx(ONYXKEYS.PENDING_CONTACT_ACTION);
    const validateCodeError = getLatestErrorField(pendingContactAction, 'addedLogin');

    useEffect(() => {
        if (!pendingContactAction?.isVerifiedValidateActionCode) {
            return;
        }
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.SETTINGS_NEW_CONTACT_METHOD.path));
    }, [pendingContactAction?.isVerifiedValidateActionCode]);

    return (
        <ValidateCodeActionContent
            title={translate('delegate.makeSureItIsYou')}
            sendValidateCode={() => requestValidateCodeAction()}
            descriptionPrimary={translate('contacts.enterMagicCode', contactMethod)}
            validateCodeActionErrorField="addedLogin"
            validateError={validateCodeError}
            handleSubmitForm={verifyAddSecondaryLoginCode}
            clearError={() => {
                clearPendingContactActionErrors();
            }}
            onClose={() => {
                Navigation.goBack(backPath);
            }}
            isLoading={pendingContactAction?.isLoading}
        />
    );
}

export default NewContactMethodConfirmMagicCodePage;

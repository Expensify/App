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

import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useEffect, useRef} from 'react';

function DynamicNewContactMethodConfirmValidateCodePage() {
    const {translate} = useLocalize();
    const listPath = useDynamicBackPath(DYNAMIC_ROUTES.NEW_CONTACT_METHOD_CONFIRM_VALIDATE_CODE.path);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const contactMethod = getContactMethod(account?.primaryLogin, session?.email);
    const [pendingContactAction] = useOnyx(ONYXKEYS.PENDING_CONTACT_ACTION);
    const validateCodeError = getLatestErrorField(pendingContactAction, 'addedLogin');

    // Guards against firing twice: once this screen is replaced, useDynamicBackPath (reactive to
    // navigation state) recomputes listPath against the NEW screen, so a second effect run would
    // navigate forward again on top of an already-stale base path.
    const hasNavigatedForwardRef = useRef(false);
    useEffect(() => {
        if (hasNavigatedForwardRef.current || !pendingContactAction?.isVerifiedValidateActionCode) {
            return;
        }
        hasNavigatedForwardRef.current = true;
        // forceReplace so this transient confirm-validate-code step isn't left in the stack under
        // the new contact method form - its back path assumes it sits directly on the contact methods list.
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.NEW_CONTACT_METHOD.path, listPath), {forceReplace: true});
    }, [listPath, pendingContactAction?.isVerifiedValidateActionCode]);

    return (
        <ValidateCodeActionContent
            title={translate('delegate.makeSureItIsYou')}
            sendValidateCode={() => requestValidateCodeAction({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.ADD_CONTACT_METHOD})}
            validateCodeReasonCode={COMMON_CONST.VALIDATE_CODE_REASONS.ADD_CONTACT_METHOD}
            descriptionPrimary={translate('contacts.enterSecurityCode', contactMethod)}
            validateCodeActionErrorField="addedLogin"
            validateError={validateCodeError}
            handleSubmitForm={verifyAddSecondaryLoginCode}
            clearError={() => {
                clearPendingContactActionErrors();
            }}
            onClose={() => {
                Navigation.goBack(listPath);
            }}
            isLoading={pendingContactAction?.isLoading}
        />
    );
}

export default DynamicNewContactMethodConfirmValidateCodePage;

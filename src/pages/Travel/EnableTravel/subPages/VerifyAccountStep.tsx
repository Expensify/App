import Text from '@components/Text';
import ValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearContactMethodErrors, requestValidateCodeAction, validateSecondaryLogin} from '@libs/actions/User';
import {getEarliestErrorField, getLatestErrorField} from '@libs/ErrorUtils';
import {expensifyLoginsSelector} from '@libs/UserUtils';

import type {EnableTravelSubPageProps} from '@pages/Travel/EnableTravel/types';

import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';

function VerifyAccountStep({onNext}: EnableTravelSubPageProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    // sometimes primaryLogin can be empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const contactMethod = (account?.primaryLogin || currentUserPersonalDetails.email) ?? '';
    const loginData = loginList?.[contactMethod];
    const validateLoginError = getEarliestErrorField(loginData, 'validateLogin');
    const isUserValidated = account?.validated ?? false;

    const firstRenderRef = useRef(true);
    const hasAdvancedRef = useRef(false);

    useEffect(() => {
        if (!firstRenderRef.current || validateCodeAction?.validateCodeSent) {
            return;
        }
        firstRenderRef.current = false;

        requestValidateCodeAction();
        // We only want to send validate code on first render not on change of validateCodeSent, so we don't add it as a dependency.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!isUserValidated || hasAdvancedRef.current) {
            return;
        }
        hasAdvancedRef.current = true;
        onNext();
    }, [isUserValidated, onNext]);

    const handleSubmitForm = useCallback(
        (validateCode: string) => {
            validateSecondaryLogin(contactMethod, validateCode, formatPhoneNumber, true);
        },
        [contactMethod, formatPhoneNumber],
    );

    return (
        <View style={[styles.ph5, styles.mt3, styles.flex1]}>
            <Text style={styles.mb3}>{translate('contacts.featureRequiresValidate')}</Text>
            <Text style={styles.mb3}>{translate('contacts.enterMagicCode', contactMethod)}</Text>
            <ValidateCodeForm
                validatePendingAction={loginData?.pendingFields?.validateCodeSent}
                validateCodeActionErrorField="validateLogin"
                validateError={!isEmptyObject(validateLoginError) ? validateLoginError : getLatestErrorField(loginData, 'validateCodeSent')}
                handleSubmitForm={handleSubmitForm}
                sendValidateCode={requestValidateCodeAction}
                clearError={() => clearContactMethodErrors(contactMethod, !isEmptyObject(validateLoginError) ? 'validateLogin' : 'validateCodeSent')}
                buttonStyles={[styles.justifyContentEnd, styles.flex1]}
                isInPageModal
            />
        </View>
    );
}

export default VerifyAccountStep;

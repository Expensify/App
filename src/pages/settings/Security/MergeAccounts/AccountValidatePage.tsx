import {useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import ValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {
    clearMergeWithValidateCode,
    clearRequestValidationCodeForAccountMerge,
    mergeWithValidateCode as mergeWithValidateCodeAction,
    requestValidationCodeForAccountMerge,
} from '@userActions/MergeAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

const getErrorKey = (err: string): ValueOf<typeof CONST.MERGE_ACCOUNT_RESULTS> | null => {
    if (err.includes('401 Cannot merge accounts - 2FA enabled')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_2FA;
    }

    if (err.includes('401 Not authorized - domain under control')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_DOMAIN_CONTROL;
    }

    if (err.includes('405 Cannot merge account under invoicing')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_INVOICING;
    }

    if (err.includes('405 Cannot merge SmartScanner account')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_SMART_SCANNER;
    }

    if (err.includes('413')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_ACCOUNT_LOCKED;
    }

    return null;
};

function AccountValidatePage() {
    const [mergeWithValidateCode] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.mergeWithValidateCode});
    const [getValidateCodeForAccountMerge] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.getValidateCodeForAccountMerge});
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const {params} = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.MERGE_ACCOUNTS.ACCOUNT_VALIDATE>>();

    const email = params.login ?? '';

    const accountMerged = mergeWithValidateCode?.accountMerged;

    const latestError = getLatestErrorMessage(mergeWithValidateCode);
    const errorKey = getErrorKey(latestError);

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useEffect(() => {
        if (!accountMerged || !email) {
            return;
        }
        return Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(email, 'success'));
    }, [accountMerged, email]);

    useEffect(() => {
        if (!errorKey || !email) {
            return;
        }
        return Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(email, errorKey));
    }, [errorKey, email]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={AccountValidatePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('mergeAccountsPage.mergeAccount')}
                onBackButtonPress={() => {
                    clearRequestValidationCodeForAccountMerge();
                    clearMergeWithValidateCode();
                    Navigation.goBack();
                }}
            />
            <View style={[styles.ph5, styles.mt3, styles.mb5, styles.flex1]}>
                <Text style={[styles.mt5, styles.textStrong]}>{translate('mergeAccountsPage.accountValidate.confirmMerge')}</Text>
                <Text style={[styles.mt5]}>{translate('mergeAccountsPage.accountValidate.lossOfUnsubmittedData', {email})}</Text>
                <Text style={[styles.mt5]}>{translate('mergeAccountsPage.accountValidate.enterMagicCode', {email})}</Text>
                <ValidateCodeForm
                    validateCodeAction={validateCodeAction}
                    handleSubmitForm={(code) => {
                        mergeWithValidateCodeAction(email, code);
                    }}
                    sendValidateCode={() => requestValidationCodeForAccountMerge(email)}
                    clearError={() => clearMergeWithValidateCode()}
                    validateError={mergeWithValidateCode?.errors}
                    hasMagicCodeBeenSent={getValidateCodeForAccountMerge?.validateCodeSent}
                    hideSubmitButton
                />
            </View>
        </ScreenWrapper>
    );
}

AccountValidatePage.displayName = 'AccountValidatePage';

export default AccountValidatePage;

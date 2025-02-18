import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import ValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as MergeAccounts from '@userActions/MergeAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function AccountValidatePage() {
    const [mergeAccountData] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.mergeAccount});
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useEffect(() => {
        if (mergeAccountData?.mergeWithValidateCode?.isLoading) {
            return;
        }

        if (mergeAccountData?.mergeWithValidateCode?.accountMerged) {
            return Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(mergeAccountData?.email ?? '', 'success'));
        }

        if (mergeAccountData?.mergeWithValidateCode?.errors) {
            return Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(mergeAccountData?.email ?? '', 'error'));
        }
    }, [mergeAccountData]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={AccountValidatePage.displayName}
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('mergeAccountsPage.mergeAccount')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <View style={[styles.ph5, styles.mt3, styles.mb5, styles.flex1]}>
                    <Text style={[styles.mt5, styles.textStrong]}>{translate('mergeAccountsPage.accountValidate.confirmMerge')}</Text>
                    <Text style={[styles.mt5]}>{translate('mergeAccountsPage.accountValidate.lossOfUnsubmittedData', {email: mergeAccountData?.email ?? ''})}</Text>
                    <Text style={[styles.mt5]}>{translate('mergeAccountsPage.accountValidate.enterMagicCode', {email: mergeAccountData?.email ?? ''})}</Text>
                    <ValidateCodeForm
                        validateCodeAction={validateCodeAction}
                        handleSubmitForm={(code) => {
                            MergeAccounts.mergeWithValidateCode(mergeAccountData?.email ?? '', code);
                        }}
                        sendValidateCode={() => MergeAccounts.requestValidationCodeForAccountMerge(mergeAccountData?.email ?? '')}
                        clearError={() => MergeAccounts.clearMergeWithValidateCode()}
                        validateError={mergeAccountData?.mergeWithValidateCode?.errors}
                        hasMagicCodeBeenSent={mergeAccountData?.getValidateCodeForAccountMerge?.validateCodeSent}
                        hideSubmitButton
                    />
                </View>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

AccountValidatePage.displayName = 'AccountValidatePage';

export default AccountValidatePage;

import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import ValidateCodeActionForm from '@components/ValidateCodeActionForm';
import type {ValidateCodeFormHandle} from '@components/ValidateCodeActionModal/ValidateCodeForm/BaseValidateCodeForm';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {
    clearGetValidateCodeForAccountMerge,
    clearMergeWithValidateCode,
    mergeWithValidateCode as mergeWithValidateCodeAction,
    requestValidationCodeForAccountMerge,
} from '@userActions/MergeAccounts';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

const getMergeErrorPage = (err: string): ValueOf<typeof CONST.MERGE_ACCOUNT_RESULTS> | null => {
    if (err.includes('403')) {
        return CONST.MERGE_ACCOUNT_RESULTS.TOO_MANY_ATTEMPTS;
    }

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

    if (err.includes('405 Cannot merge into unvalidated account')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ACCOUNT_UNVALIDATED;
    }

    if (err.includes('413')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_ACCOUNT_LOCKED;
    }

    return null;
};

const getAuthenticationErrorKey = (err: string): TranslationPaths | null => {
    if (!err) {
        return null;
    }

    if (err.includes('Invalid validateCode')) {
        return 'mergeAccountsPage.accountValidate.errors.incorrectMagicCode';
    }

    return 'mergeAccountsPage.accountValidate.errors.fallback';
};

function AccountValidatePage() {
    const validateCodeFormRef = useRef<ValidateCodeFormHandle>(null);
    const navigation = useNavigation();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: (data) => ({
            mergeWithValidateCode: data?.mergeWithValidateCode,
            getValidateCodeForAccountMerge: data?.getValidateCodeForAccountMerge,
        }),
        canBeMissing: true,
    });

    const {params} = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.MERGE_ACCOUNTS.ACCOUNT_VALIDATE>>();

    const email = params.login ?? '';

    const mergeWithValidateCode = account?.mergeWithValidateCode;
    const getValidateCodeForAccountMerge = account?.getValidateCodeForAccountMerge;

    const isAccountMerged = mergeWithValidateCode?.isAccountMerged;

    const latestError = getLatestErrorMessage(mergeWithValidateCode);
    const errorPage = getMergeErrorPage(latestError);

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useFocusEffect(
        useCallback(() => {
            if (!isAccountMerged || !email) {
                return;
            }
            return Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(email, 'success'), {forceReplace: true});
        }, [isAccountMerged, email]),
    );

    useFocusEffect(
        useCallback(() => {
            if (!errorPage || !email) {
                return;
            }
            return Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(email, errorPage), {forceReplace: true});
        }, [errorPage, email]),
    );

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            clearGetValidateCodeForAccountMerge();
            clearMergeWithValidateCode();
        });

        return unsubscribe;
    }, [navigation]);

    const authenticationErrorKey = getAuthenticationErrorKey(latestError);
    const validateCodeError = !errorPage && authenticationErrorKey ? {authError: translate(authenticationErrorKey)} : undefined;

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
            testID={AccountValidatePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('mergeAccountsPage.mergeAccount')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SETTINGS_MERGE_ACCOUNTS.getRoute());
                }}
                shouldDisplayHelpButton={false}
            />
            <ScrollView
                style={[styles.w100, styles.h100, styles.flex1]}
                contentContainerStyle={[styles.flexGrow1]}
            >
                <ValidateCodeActionForm
                    descriptionPrimary={translate('mergeAccountsPage.accountValidate.confirmMerge')}
                    descriptionPrimaryStyles={{...styles.mb8, ...styles.textStrong}}
                    descriptionSecondary={
                        <View style={[styles.w100]}>
                            <Text style={[styles.mb8]}>
                                {translate('mergeAccountsPage.accountValidate.lossOfUnsubmittedData')}
                                <Text style={styles.textStrong}>{email}</Text>.
                            </Text>
                            <Text>
                                {translate('mergeAccountsPage.accountValidate.enterMagicCode')}
                                <Text style={styles.textStrong}>{email}</Text>.
                            </Text>
                        </View>
                    }
                    descriptionSecondaryStyles={styles.mb8}
                    handleSubmitForm={(code) => {
                        mergeWithValidateCodeAction(email, code);
                    }}
                    sendValidateCode={() => {
                        requestValidationCodeForAccountMerge(email, true);
                    }}
                    shouldSkipInitialValidation
                    clearError={() => clearMergeWithValidateCode()}
                    validateError={validateCodeError}
                    hasMagicCodeBeenSent={getValidateCodeForAccountMerge?.validateCodeResent}
                    submitButtonText={translate('mergeAccountsPage.mergeAccount')}
                    forwardedRef={validateCodeFormRef}
                    isLoading={mergeWithValidateCode?.isLoading}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

AccountValidatePage.displayName = 'AccountValidatePage';

export default AccountValidatePage;

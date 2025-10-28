import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import ValidateCodeActionForm from '@components/ValidateCodeActionForm';
import type {ValidateCodeFormHandle} from '@components/ValidateCodeActionModal/ValidateCodeForm/BaseValidateCodeForm';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
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
import type {Account} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

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

const accountSelector = (account: OnyxEntry<Account>) => ({
    mergeWithValidateCode: account?.mergeWithValidateCode,
    getValidateCodeForAccountMerge: account?.getValidateCodeForAccountMerge,
});

function AccountValidatePage() {
    const validateCodeFormRef = useRef<ValidateCodeFormHandle>(null);
    const navigation = useNavigation();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: accountSelector,
        canBeMissing: true,
    });

    const privateSubscription = usePrivateSubscription();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const [, loginListResult] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [, sessionResult] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [, myDomainSecurityGroupsResult] = useOnyx(ONYXKEYS.MY_DOMAIN_SECURITY_GROUPS, {canBeMissing: true});
    const [, securityGroupsResult] = useOnyx(ONYXKEYS.COLLECTION.SECURITY_GROUP, {canBeMissing: true});
    const [, isLoadingReportDataResult] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {canBeMissing: true});
    const isLoadingOnyxValues = isLoadingOnyxValue(loginListResult, sessionResult, myDomainSecurityGroupsResult, securityGroupsResult, isLoadingReportDataResult);

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

    useFocusEffect(
        useCallback(() => {
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const task = InteractionManager.runAfterInteractions(() => {
                if (privateSubscription?.type !== CONST.SUBSCRIPTION.TYPE.INVOICING) {
                    return;
                }

                Navigation.navigate(
                    ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(currentUserPersonalDetails.login ?? '', CONST.MERGE_ACCOUNT_RESULTS.ERR_INVOICING, ROUTES.SETTINGS_SECURITY),
                );
            });

            return () => task.cancel();
        }, [privateSubscription?.type, currentUserPersonalDetails.login]),
    );

    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            clearGetValidateCodeForAccountMerge();
            clearMergeWithValidateCode();
        });

        return unsubscribe;
    }, [navigation]);

    const didClearError = useRef(false);

    useEffect(() => {
        if (isLoadingOnyxValues || didClearError.current) {
            return;
        }
        didClearError.current = true;
        clearMergeWithValidateCode();
    }, [isLoadingOnyxValues]);

    const authenticationErrorKey = getAuthenticationErrorKey(latestError);
    const validateCodeError = !errorPage && authenticationErrorKey ? {authError: translate(authenticationErrorKey)} : undefined;

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
            testID={AccountValidatePage.displayName}
            shouldShowOfflineIndicatorInWideScreen
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
                            <View style={[styles.mb8, styles.renderHTML, styles.flexRow]}>
                                <RenderHTML html={translate('mergeAccountsPage.accountValidate.lossOfUnsubmittedData', {login: email})} />
                            </View>
                            <View style={[styles.renderHTML, styles.flexRow]}>
                                <RenderHTML html={translate('mergeAccountsPage.accountValidate.enterMagicCode', {login: email})} />
                            </View>
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

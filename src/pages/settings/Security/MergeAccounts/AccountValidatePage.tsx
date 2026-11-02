import HeaderWithBackButton from '@components/HeaderWithBackButton';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import ValidateCodeActionForm from '@components/ValidateCodeActionForm';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrivateSubscription from '@hooks/usePrivateSubscription';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorMessage} from '@libs/ErrorUtils';
import getMergeErrorPage from '@libs/MergeAccountUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
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

import type {OnyxEntry} from 'react-native-onyx';

import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import React, {useEffect} from 'react';
import {View} from 'react-native';

const getAuthenticationErrorKey = (err: string): TranslationPaths | null => {
    if (!err) {
        return null;
    }

    if (err.includes(CONST.MERGE_ACCOUNT_INVALID_CODE_ERROR)) {
        return 'mergeAccountsPage.accountValidate.errors.incorrectSecurityCode';
    }

    return 'mergeAccountsPage.accountValidate.errors.fallback';
};

const accountSelector = (account: OnyxEntry<Account>) => ({
    mergeWithValidateCode: account?.mergeWithValidateCode,
    getValidateCodeForAccountMerge: account?.getValidateCodeForAccountMerge,
});

function AccountValidatePage() {
    const navigation = useNavigation();

    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: accountSelector,
    });

    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);

    const privateSubscription = usePrivateSubscription();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const {params} = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.MERGE_ACCOUNTS.ACCOUNT_VALIDATE>>();

    const email = params.login ?? '';

    const mergeWithValidateCode = account?.mergeWithValidateCode;
    const getValidateCodeForAccountMerge = account?.getValidateCodeForAccountMerge;

    const isAccountMerged = mergeWithValidateCode?.isAccountMerged;

    const latestError = getLatestErrorMessage(mergeWithValidateCode);
    const errorPage = getMergeErrorPage(latestError);

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useFocusEffect(() => {
        if (!isAccountMerged || !email) {
            return;
        }
        return Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(email, 'success'), {forceReplace: true});
    });

    useFocusEffect(() => {
        if (!errorPage || !email) {
            return;
        }
        return Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(email, errorPage), {forceReplace: true});
    });

    useFocusEffect(() => {
        const task = TransitionTracker.runAfterTransitions({
            callback: () => {
                if (privateSubscription?.type !== CONST.SUBSCRIPTION.TYPE.INVOICING) {
                    return;
                }

                Navigation.navigate(
                    ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(currentUserPersonalDetails.login ?? '', CONST.MERGE_ACCOUNT_RESULTS.ERR_INVOICING, ROUTES.SETTINGS_SECURITY),
                );
            },
        });

        return () => task.cancel();
    });

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
            testID="AccountValidatePage"
            shouldShowOfflineIndicatorInWideScreen
        >
            <HeaderWithBackButton
                title={translate('mergeAccountsPage.mergeAccount')}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SETTINGS_MERGE_ACCOUNTS.getRoute());
                }}
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
                                <RenderHTML html={translate('mergeAccountsPage.accountValidate.mergeIsIrreversible', email)} />
                            </View>
                            <View style={[styles.renderHTML, styles.flexRow]}>
                                <RenderHTML html={translate('mergeAccountsPage.accountValidate.enterSecurityCode', email)} />
                            </View>
                        </View>
                    }
                    descriptionSecondaryStyles={styles.mb8}
                    handleSubmitForm={(code) => {
                        mergeWithValidateCodeAction(email, code);
                    }}
                    sendValidateCode={() => {
                        requestValidationCodeForAccountMerge(email, true, countryCode);
                    }}
                    shouldSkipInitialValidation
                    clearError={() => clearMergeWithValidateCode()}
                    validateError={validateCodeError}
                    hasValidateCodeBeenSent={getValidateCodeForAccountMerge?.validateCodeResent}
                    submitButtonText={translate('mergeAccountsPage.mergeAccount')}
                    isLoading={mergeWithValidateCode?.isLoading}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

export default AccountValidatePage;

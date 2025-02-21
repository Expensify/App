import {useRoute} from '@react-navigation/native';
import React, {useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ConfirmationPage from '@components/ConfirmationPage';
import type {ConfirmationPageProps} from '@components/ConfirmationPage';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import LottieAnimations from '@components/LottieAnimations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as MergeAccounts from '@userActions/MergeAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

function MergeResultPage() {
    const {translate} = useLocalize();
    const [userEmailOrPhone] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});
    const {params} = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.MERGE_ACCOUNTS.MERGE_RESULT>>();
    const {result, login} = params;

    const defaultResult = {
        heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
        buttonText: translate('common.buttonConfirm'),
        illustration: Illustrations.LockClosedOrange,
    };

    const results: Record<ValueOf<typeof CONST.MERGE_ACCOUNT_RESULTS>, ConfirmationPageProps> = useMemo(() => {
        return {
            [CONST.MERGE_ACCOUNT_RESULTS.SUCCESS]: {
                heading: translate('mergeAccountsPage.mergeSuccess.accountsMerged'),
                description: translate('mergeAccountsPage.mergeSuccess.successfullyMergedAllData', {email: login, newEmail: userEmailOrPhone ?? ''}),
                buttonText: translate('common.buttonConfirm'),
                illustration: LottieAnimations.Fireworks,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_NO_EXIST]: {
                heading: translate('mergeAccountsPage.mergeFailureGenericHeading'),
                description: translate('mergeAccountsPage.mergeFailureUncreatedAccount.noExpensifyAccount', {email: login}),
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_2FA]: {
                heading: translate('mergeAccountsPage.mergeFailure2FA.oldAccount2FAEnabled', {email: login}),
                description: '',
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_SMART_SCANNER]: {
                heading: translate('mergeAccountsPage.mergeFailureSmartScannerAccount', {email: login}),
                description: '',
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_PRIMARY_LOGIN]: {
                heading: translate('mergeAccountsPage.mergeFailureSAMLAccount', {email: login}),
                description: '',
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.PENDING]: {
                heading: 'mergeAccountsPage.mergePendingSAML',
                description: 'mergeAccountsPage.mergePending.pendingMerge',
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.RunningTurtle,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_EMAIL_VERIFICATION]: {
                heading: 'mergeAccountsPage.mergePendingSAML',
                description: 'mergeAccountsPage.mergePending.pendingMerge',
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.RunningTurtle,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML]: {
                heading: 'mergeAccountsPage.mergePendingSAML',
                description: 'mergeAccountsPage.mergePending.pendingMerge',
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.RunningTurtle,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_ACCOUNT_LOCKED]: {
                heading: 'mergeAccountsPage.mergePendingSAML',
                description: 'mergeAccountsPage.mergePending.pendingMerge',
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.RunningTurtle,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_DOMAIN]: {
                heading: 'mergeAccountsPage.mergePendingSAML',
                description: 'mergeAccountsPage.mergePending.pendingMerge',
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.RunningTurtle,
            },
            [CONST.MERGE_ACCOUNT_RESULTS.ERR_INVOICING]: {
                heading: 'mergeAccountsPage.mergePendingSAML',
                description: 'mergeAccountsPage.mergePending.pendingMerge',
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.RunningTurtle,
            },
        };
    }, [login, translate, userEmailOrPhone]);

    const {heading, headingStyle, onButtonPress, shouldShowButton, descriptionStyle, illustration, illustrationStyle, description} = results[result] || defaultResult;

    useEffect(() => {
        return () => {
            MergeAccounts.clearRequestValidationCodeForAccountMerge();
            MergeAccounts.clearMergeWithValidateCode();
        };
    }, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={MergeResultPage.displayName}
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('mergeAccountsPage.mergeAccount')}
                    onBackButtonPress={() => {
                        Navigation.dismissModal();
                    }}
                />
                <ConfirmationPage
                    heading={heading}
                    headingStyle={headingStyle}
                    onButtonPress={onButtonPress}
                    shouldShowButton={shouldShowButton}
                    description={description}
                    descriptionStyle={descriptionStyle}
                    illustration={illustration}
                    illustrationStyle={illustrationStyle}
                />
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

MergeResultPage.displayName = 'MergeResultPage';

export default MergeResultPage;

import {useRoute} from '@react-navigation/native';
import React, {useMemo} from 'react';
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
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

function MergeResultPage() {
    const {translate} = useLocalize();
    const {params} = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.MERGE_ACCOUNTS.MERGE_RESULT>>();
    const {result, login} = params;

    const results: Record<keyof typeof CONST.MERGE_ACCOUNT_RESULTS, ConfirmationPageProps> = useMemo(() => {
        return {
            SUCCESS: {
                heading: translate('mergeAccountsPage.mergeSuccess.accountsMerged'),
                description: translate('mergeAccountsPage.mergeSuccess.successfullyMergedAllData', {email: login, newEmail: ''}),
                buttonText: translate('common.buttonConfirm'),
                illustration: LottieAnimations.Fireworks,
            },
            ERR_NO_EXIST: {
                heading: translate('mergeAccountsPage.mergeFailureUncreatedAccount.noExpensifyAccount', {email: login}),
                description: '',
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            ERR_2FA: {
                heading: translate('mergeAccountsPage.mergeFailure2FA.oldAccount2FAEnabled', {email: login}),
                description: '',
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            ERR_SMART_SCANNER: {
                heading: translate('mergeAccountsPage.mergeFailureSmartScannerAccount', {email: login}),
                description: '',
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            ERR_PRIMARY_LOGIN: {
                heading: translate('mergeAccountsPage.mergeFailureSAMLAccount', {email: login}),
                description: '',
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.LockClosedOrange,
            },
            PENDING: {
                heading: 'mergeAccountsPage.mergePendingSAML',
                description: 'mergeAccountsPage.mergePending.pendingMerge',
                buttonText: translate('common.buttonConfirm'),
                illustration: Illustrations.RunningTurtle,
            },
        };
    }, [login, translate]);

    if (!(result in results)) {
        return null;
    }

    const {heading, headingStyle, onButtonPress, shouldShowButton, descriptionStyle, illustration, illustrationStyle, description} = results[result];

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={MergeResultPage.displayName}
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('mergeAccountsPage.mergeAccount')}
                    onBackButtonPress={() => Navigation.goBack()}
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

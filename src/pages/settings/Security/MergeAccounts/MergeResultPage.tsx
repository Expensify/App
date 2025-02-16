import React from 'react';
import ConfirmationPage, {ConfirmationPageProps} from '@components/ConfirmationPage';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import LottieAnimations from '@components/LottieAnimations';
import * as Illustrations from '@components/Icon/Illustrations';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import { useRoute } from '@react-navigation/native';

const results: Record<keyof typeof CONST.MERGE_ACCOUNT_RESULTS, ConfirmationPageProps> = {
    'SUCCESS': {
        heading: 'mergeAccountsPage.mergeSuccess.accountsMerged',
        description: 'mergeAccountsPage.mergeSuccess.successfullyMergedAllData',
        buttonText: 'common.buttonConfirm',
        illustration: LottieAnimations.Fireworks,
    },
    'ERR_NO_EXIST': {
        heading: 'mergeAccountsPage.mergeFailureUncreatedAccount.noExpensifyAccount',
        description: '',
        buttonText: 'common.buttonConfirm',
        illustration: Illustrations.LockClosedOrange,
    },
    'ERR_2FA': {
        heading: 'mergeAccountsPage.mergeFailure2FA.oldAccount2FAEnabled',
        description: '',
        buttonText: 'common.buttonConfirm',
        illustration: Illustrations.LockClosedOrange,
    },
    'ERR_SMART_SCANNER': {
        heading: 'mergeAccountsPage.mergeFailureSmartScannerAccount',
        description: '',
        buttonText: 'common.buttonConfirm',
        illustration: Illustrations.LockClosedOrange,
    },
    'ERR_PRIMARY_LOGIN': {
        heading: 'mergeAccountsPage.mergeFailureSAMLAccount',
        description: '',
        buttonText: 'common.buttonConfirm',
        illustration: Illustrations.LockClosedOrange,
    },
    'PENDING': {
        heading: 'mergeAccountsPage.mergePendingSAML',
        description: 'mergeAccountsPage.mergePending.pendingMerge',
        buttonText: 'common.buttonConfirm',
        illustration: Illustrations.RunningTurtle,
    },
};

function MergeResultPage() {
    const {translate} = useLocalize();
    const {params} = useRoute();

    const resultKey = params.result;
    const login = params.login;

    const result = results[resultKey];

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
                <ConfirmationPage {...result} />
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

MergeResultPage.displayName = 'MergeResultPage';

export default MergeResultPage;

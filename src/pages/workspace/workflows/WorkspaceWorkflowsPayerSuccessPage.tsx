import React, {useEffect} from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import ScrollView from '@components/ScrollView';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {clearShareBankAccount} from '@userActions/BankAccounts';
import ONYXKEYS from '@src/ONYXKEYS';

function WorkspaceWorkflowsPayerSuccessPage() {
    const {translate} = useLocalize();
    const [sharedBankAccountData] = useOnyx(ONYXKEYS.SHARE_BANK_ACCOUNT);
    const shouldShowSuccess = sharedBankAccountData?.shouldShowSuccess ?? false;
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['ShareBank', 'Telescope']);

    useEffect(() => {
        return () => {
            if (!shouldShowSuccess) {
                return;
            }
            clearShareBankAccount();
        };
    }, [shouldShowSuccess]);

    const onButtonPress = () => Navigation.closeRHPFlow();

    return (
        <ScrollView
            addBottomSafeAreaPadding
            contentContainerStyle={styles.flexGrow1}
        >
            <ConfirmationPage
                heading={translate('walletPage.shareBankAccountSuccess')}
                description={translate('walletPage.shareBankAccountSuccessDescription')}
                illustration={illustrations.ShareBank}
                shouldShowButton
                descriptionStyle={[styles.ph4, styles.textSupporting]}
                illustrationStyle={styles.successBankSharedCardIllustration}
                onButtonPress={onButtonPress}
                buttonText={translate('common.buttonConfirm')}
                containerStyle={styles.h100}
            />
        </ScrollView>
    );
}

export default WorkspaceWorkflowsPayerSuccessPage;

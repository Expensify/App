import React, {useEffect} from 'react';
import ConfirmationPage from '@components/ConfirmationPage';
import ScrollView from '@components/ScrollView';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {clearShareBankAccount} from '@userActions/BankAccounts';
import {setWorkspacePayer} from '@userActions/Policy/Policy';
import ONYXKEYS from '@src/ONYXKEYS';

type WorkspaceWorkflowsPayerPageOnyxProps = {
    /** Selected payer */
    selectedPayer: string;
    /** ID of the policy */
    policyID?: string;
};

function WorkspaceWorkflowsPayerSuccessPage({policyID, selectedPayer}: WorkspaceWorkflowsPayerPageOnyxProps) {
    const {translate} = useLocalize();
    const [sharedBankAccountData] = useOnyx(ONYXKEYS.SHARE_BANK_ACCOUNT, {canBeMissing: true});
    const shouldShowSuccess = sharedBankAccountData?.shouldShowSuccess ?? false;
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['ShareBank', 'Telescope'] as const);

    useEffect(() => {
        if (policyID) {
            return;
        }
        setWorkspacePayer(policyID, selectedPayer);
    }, [policyID, selectedPayer]);

    useEffect(() => {
        return () => {
            if (!shouldShowSuccess) {
                return;
            }
            clearShareBankAccount();
        };
    }, [shouldShowSuccess]);

    const onButtonPress = () => {
        if (!selectedPayer || !policyID) {
            Navigation.closeRHPFlow();
            return;
        }
        setWorkspacePayer(policyID, selectedPayer);
        Navigation.closeRHPFlow();
    };

    return (
        <ScrollView contentContainerStyle={styles.flexGrow1}>
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

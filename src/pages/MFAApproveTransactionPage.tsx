import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MFAApproveTransactionActions from '@components/MFA/MFAApproveTransactionActions';
import MFAApproveTransactionConfirmModal from '@components/MFA/MFAApproveTransactionConfirmModal';
import MFAApproveTransactionContent from '@components/MFA/MFAApproveTransactionContent';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultiFactorAuthenticationParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type MFAApproveTransactionPageProps = PlatformStackScreenProps<MultiFactorAuthenticationParamList, typeof SCREENS.MULTIFACTORAUTHENTICATION.APPROVE_TRANSACTION>;

function MFAScenarioApproveTransactionPage({route}: MFAApproveTransactionPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const transactionID = route.params.transactionID;
    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);

    const onGoBackPress = useCallback(() => {
        Navigation.goBack();
    }, []);

    const showConfirmModal = useCallback(() => {
        setConfirmModalVisibility(true);
    }, []);

    const hideConfirmModal = useCallback(() => {
        setConfirmModalVisibility(false);
    }, []);

    // TODO: replace with proper logic from MFAContext - now only for testing
    const approveTransaction = useCallback(() => {
        Navigation.navigate(ROUTES.MULTIFACTORAUTHENTICATION_PROMPT.getRoute('enable-biometrics'));
    }, []);

    const denyTransaction = useCallback(() => {
        if (isConfirmModalVisible) {
            hideConfirmModal();
        }
        // MFAdenyTransaction(); // TODO: update context or sth
        onGoBackPress();
    }, [isConfirmModalVisible, hideConfirmModal, onGoBackPress]);

    return (
        <ScreenWrapper testID={MFAScenarioApproveTransactionPage.displayName}>
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.approveTransaction.headerButtonTitle')}
                onBackButtonPress={showConfirmModal}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentBetween]}>
                    <MFAApproveTransactionContent transactionID={transactionID} />
                    <MFAApproveTransactionActions onApprove={approveTransaction} onDeny={showConfirmModal} />
                    <MFAApproveTransactionConfirmModal isVisible={isConfirmModalVisible} onConfirm={denyTransaction} onCancel={hideConfirmModal} />
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MFAScenarioApproveTransactionPage.displayName = 'MFAScenarioApproveTransactionPage';

export default MFAScenarioApproveTransactionPage;

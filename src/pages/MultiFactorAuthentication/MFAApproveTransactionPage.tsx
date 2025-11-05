import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MFAApproveTransactionActions from '@components/MultiFactorAuthentication/MFAApproveTransactionActions';
import MFAApproveTransactionContent from '@components/MultiFactorAuthentication/MFAApproveTransactionContent';
import MFADenyTransactionConfirmModal from '@components/MultiFactorAuthentication/MFADenyTransactionConfirmModal';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultiFactorAuthenticationParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type MFAApproveTransactionPageProps = PlatformStackScreenProps<MultiFactorAuthenticationParamList, typeof SCREENS.MULTIFACTORAUTHENTICATION.APPROVE_TRANSACTION>;

function MFAScenarioApproveTransactionPage({route}: MFAApproveTransactionPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {process} = useMultifactorAuthenticationContext();

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

    const approveTransaction = useCallback(() => {
        process(CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION, {transactionID});
    }, [process, transactionID]);

    const denyTransaction = useCallback(() => {
        if (isConfirmModalVisible) {
            hideConfirmModal();
        }
        // MFAdenyTransaction(); // TODO: trigger(cancel) do transaction denied page
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
                    <MFAApproveTransactionActions
                        onApprove={approveTransaction}
                        onDeny={showConfirmModal}
                    />
                    <MFADenyTransactionConfirmModal
                        isVisible={isConfirmModalVisible}
                        onConfirm={denyTransaction}
                        onCancel={hideConfirmModal}
                    />
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MFAScenarioApproveTransactionPage.displayName = 'MFAScenarioApproveTransactionPage';

export default MFAScenarioApproveTransactionPage;

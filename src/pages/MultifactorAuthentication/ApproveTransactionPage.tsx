import React, {useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MultifactorAuthenticationApproveTransactionActions from '@components/MultifactorAuthentication/ApproveTransactionActions';
import MultifactorAuthenticationApproveTransactionContent from '@components/MultifactorAuthentication/ApproveTransactionContent';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthentication/Context';
import MultifactorAuthenticationTriggerCancelConfirmModal from '@components/MultifactorAuthentication/TriggerCancelConfirmModal';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultifactorAuthenticationParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type MultifactorAuthenticationApproveTransactionPageProps = PlatformStackScreenProps<MultifactorAuthenticationParamList, typeof SCREENS.MULTIFACTOR_AUTHENTICATION.APPROVE_TRANSACTION>;

function MultifactorAuthenticationScenarioApproveTransactionPage({route}: MultifactorAuthenticationApproveTransactionPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {process, trigger, info} = useMultifactorAuthenticationContext();

    const transactionID = route.params.transactionID;
    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);

    const showConfirmModal = () => {
        setConfirmModalVisibility(true);
    };

    const hideConfirmModal = () => {
        setConfirmModalVisibility(false);
    };

    const approveTransaction = () => {
        process(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION, {
            transactionID,
        });
    };

    const denyTransaction = () => {
        if (isConfirmModalVisible) {
            hideConfirmModal();
        }
        // TODO: MFA/Dev should not be done here
        trigger(CONST.MULTIFACTOR_AUTHENTICATION.TRIGGER.FAILURE, 'authorize-transaction-failure');
    };

    return (
        <ScreenWrapper testID={MultifactorAuthenticationScenarioApproveTransactionPage.displayName}>
            <HeaderWithBackButton
                title={translate('multifactorAuthentication.reviewTransaction.reviewTransaction')}
                onBackButtonPress={showConfirmModal}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentBetween]}>
                    <MultifactorAuthenticationApproveTransactionContent transactionID={transactionID} />
                    <MultifactorAuthenticationApproveTransactionActions
                        onApprove={approveTransaction}
                        onDeny={showConfirmModal}
                    />
                    <MultifactorAuthenticationTriggerCancelConfirmModal
                        scenario={info.scenario}
                        isVisible={isConfirmModalVisible}
                        onConfirm={denyTransaction}
                        onCancel={hideConfirmModal}
                    />
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationScenarioApproveTransactionPage.displayName = 'MultifactorAuthenticationScenarioApproveTransactionPage';

export default MultifactorAuthenticationScenarioApproveTransactionPage;

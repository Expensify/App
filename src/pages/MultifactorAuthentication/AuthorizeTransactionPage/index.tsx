import React, {useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MultifactorAuthenticationTriggerCancelConfirmModal from '@components/MultifactorAuthentication/TriggerCancelConfirmModal';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MultifactorAuthenticationParamList} from '@libs/Navigation/types';
import type SCREENS from '@src/SCREENS';
import MultifactorAuthenticationAuthorizeTransactionActions from './AuthorizeTransactionActions';
import MultifactorAuthenticationAuthorizeTransactionContent from './AuthorizeTransactionContent';

type MultifactorAuthenticationAuthorizeTransactionPageProps = PlatformStackScreenProps<MultifactorAuthenticationParamList, typeof SCREENS.MULTIFACTOR_AUTHENTICATION.AUTHORIZE_TRANSACTION>;

function MultifactorAuthenticationScenarioAuthorizeTransactionPage({route}: MultifactorAuthenticationAuthorizeTransactionPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // TODO: Use context here when merged
    // const {executeScenario, cancel} = useMultifactorAuthenticationContext();

    const transactionID = route.params.transactionID;
    const [isConfirmModalVisible, setConfirmModalVisibility] = useState(false);

    const showConfirmModal = () => {
        setConfirmModalVisibility(true);
    };

    const hideConfirmModal = () => {
        setConfirmModalVisibility(false);
    };

    const approveTransaction = () => {
        // TODO: Use context here when merged
        // executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION, {
        //     transactionID,
        // });
    };

    // Remove this eslint disable when below TODO is done
    // eslint-disable-next-line rulesdir/prefer-early-return
    const denyTransaction = () => {
        if (isConfirmModalVisible) {
            hideConfirmModal();
        }
        // TODO: Use context here when merged
        // cancel();
    };

    return (
        <ScreenWrapper testID={MultifactorAuthenticationScenarioAuthorizeTransactionPage.displayName}>
            <HeaderWithBackButton
                title={translate('multifactorAuthentication.reviewTransaction.reviewTransaction')}
                onBackButtonPress={showConfirmModal}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <View style={[styles.flex1, styles.flexColumn, styles.justifyContentBetween]}>
                    <MultifactorAuthenticationAuthorizeTransactionContent transactionID={transactionID} />
                    <MultifactorAuthenticationAuthorizeTransactionActions
                        onAuthorize={approveTransaction}
                        onDeny={showConfirmModal}
                    />
                    <MultifactorAuthenticationTriggerCancelConfirmModal
                        // TODO: Uncomment when context is merged
                        // scenario={CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION}
                        isVisible={isConfirmModalVisible}
                        onConfirm={denyTransaction}
                        onCancel={hideConfirmModal}
                    />
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationScenarioAuthorizeTransactionPage.displayName = 'MultifactorAuthenticationScenarioAuthorizeTransactionPage';

export default MultifactorAuthenticationScenarioAuthorizeTransactionPage;

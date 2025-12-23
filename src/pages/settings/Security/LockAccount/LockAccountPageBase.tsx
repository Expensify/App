import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderPageLayout from '@components/HeaderPageLayout';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {lockAccount} from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import type Response from '@src/types/onyx/Response';

type BaseLockAccountComponentProps = {
    confirmModalPrompt: React.JSX.Element | string;
    lockAccountPagePrompt: React.JSX.Element | string;
    testID: string;
    onBackButtonPress: () => void;
    handleLockRequestFinish: (response: void | Response) => void;
};
function BaseLockAccountComponent({confirmModalPrompt, lockAccountPagePrompt, testID, onBackButtonPress, handleLockRequestFinish}: BaseLockAccountComponentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [isLoading, setIsLoading] = useState(false);
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});

    const {showConfirmModal} = useConfirmModal();

    const handleReportSuspiciousActivity = async () => {
        if (session?.accountID === -1) {
            return;
        }
        const modalResult = await showConfirmModal({
            danger: true,
            title: translate('lockAccountPage.reportSuspiciousActivity'),

            prompt: confirmModalPrompt,
            confirmText: translate('lockAccountPage.lockAccount'),
            cancelText: translate('common.cancel'),
            shouldDisableConfirmButtonWhenOffline: true,
            shouldShowCancelButton: true,
        });

        if (modalResult.action !== ModalActions.CONFIRM) {
            return;
        }

        setIsLoading(true);
        const response = await lockAccount();
        setIsLoading(false);

        handleLockRequestFinish(response);
    };

    const lockAccountButton = (
        <Button
            danger
            isLoading={isLoading}
            isDisabled={isOffline}
            large
            text={translate('lockAccountPage.reportSuspiciousActivity')}
            style={styles.mt6}
            pressOnEnter
            onPress={handleReportSuspiciousActivity}
        />
    );

    return (
        <HeaderPageLayout
            onBackButtonPress={onBackButtonPress}
            title={translate('lockAccountPage.reportSuspiciousActivity')}
            testID={testID}
            footer={lockAccountButton}
            childrenContainerStyles={[styles.pt3, styles.gap6]}
            shouldShowOfflineIndicatorInWideScreen
        >
            <View style={[styles.flex1, styles.gap4, styles.mh5]}>{lockAccountPagePrompt}</View>
        </HeaderPageLayout>
    );
}

export default BaseLockAccountComponent;

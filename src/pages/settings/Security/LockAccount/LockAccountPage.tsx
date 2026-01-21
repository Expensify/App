import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderPageLayout from '@components/HeaderPageLayout';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {lockAccount} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function LockAccountPage() {
    const {translate} = useLocalize();
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const [isLoading, setIsLoading] = useState(false);
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});

    const lockAccountButton = (
        <Button
            danger
            isLoading={isLoading}
            isDisabled={isOffline}
            large
            text={translate('lockAccountPage.reportSuspiciousActivity')}
            style={styles.mt6}
            pressOnEnter
            onPress={() => {
                setIsConfirmModalVisible(true);
            }}
        />
    );

    return (
        <>
            <HeaderPageLayout
                onBackButtonPress={() => Navigation.goBack()}
                title={translate('lockAccountPage.reportSuspiciousActivity')}
                testID="LockAccountPage"
                footer={lockAccountButton}
                childrenContainerStyles={[styles.pt3, styles.gap6]}
                shouldShowOfflineIndicatorInWideScreen
            >
                <View style={[styles.flex1, styles.gap4, styles.mh5]}>
                    <Text>{translate('lockAccountPage.compromisedDescription')}</Text>
                    <Text>{translate('lockAccountPage.domainAdminsDescription')}</Text>
                </View>
            </HeaderPageLayout>
            <ConfirmModal
                danger
                title={translate('lockAccountPage.reportSuspiciousActivity')}
                onConfirm={() => {
                    // If there is no user accountID yet (because the app isn't fully setup yet), so return early
                    if (session?.accountID === -1) {
                        return;
                    }

                    setIsConfirmModalVisible(false);

                    setIsLoading(true);
                    lockAccount().then((response) => {
                        setIsLoading(false);
                        if (!response?.jsonCode) {
                            return;
                        }

                        if (response.jsonCode === CONST.JSON_CODE.SUCCESS) {
                            Navigation.navigate(ROUTES.SETTINGS_UNLOCK_ACCOUNT);
                        } else {
                            Navigation.navigate(ROUTES.SETTINGS_FAILED_TO_LOCK_ACCOUNT);
                        }
                    });
                }}
                onCancel={() => setIsConfirmModalVisible(false)}
                isVisible={isConfirmModalVisible}
                prompt={
                    <>
                        <Text style={[styles.mb5]}>{translate('lockAccountPage.areYouSure')}</Text>
                        <Text style={[styles.mb5]}>{translate('lockAccountPage.onceLocked')}</Text>
                    </>
                }
                confirmText={translate('lockAccountPage.lockAccount')}
                cancelText={translate('common.cancel')}
                shouldDisableConfirmButtonWhenOffline
                shouldShowCancelButton
            />
        </>
    );
}

export default LockAccountPage;

import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderPageLayout from '@components/HeaderPageLayout';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {lockAccount} from '@userActions/User';
import ROUTES from '@src/ROUTES';

function LockAccountPage() {
    const {translate} = useLocalize();
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const lockAccountButton = (
        <Button
            danger
            isDisabled={isOffline}
            large
            text={translate('lockAccountPage.lockAccount')}
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
                title={translate('lockAccountPage.lockAccount')}
                testID={LockAccountPage.displayName}
                footer={lockAccountButton}
                childrenContainerStyles={[styles.pt3, styles.gap6]}
            >
                <View style={[styles.flex1, styles.gap4, styles.mh5]}>
                    <Text>{translate('lockAccountPage.compromisedDescription')}</Text>
                    <Text>
                        <Text>{translate('lockAccountPage.domainAdminsDescriptionPartOne')}</Text>
                        <Text style={styles.textBold}>{translate('lockAccountPage.domainAdminsDescriptionPartTwo')}</Text>
                        <Text>{translate('lockAccountPage.domainAdminsDescriptionPartThree')}</Text>
                    </Text>
                </View>
            </HeaderPageLayout>
            <ConfirmModal
                danger
                title={translate('lockAccountPage.lockAccount')}
                onConfirm={() => {
                    lockAccount();
                    setIsConfirmModalVisible(false);
                    Navigation.navigate(ROUTES.SETTINGS_UNLOCK_ACCOUNT);
                }}
                onCancel={() => setIsConfirmModalVisible(false)}
                isVisible={isConfirmModalVisible}
                prompt={translate('lockAccountPage.warning')}
                confirmText={translate('lockAccountPage.lockAccount')}
                cancelText={translate('common.cancel')}
                shouldDisableConfirmButtonWhenOffline
                shouldShowCancelButton
            />
        </>
    );
}

LockAccountPage.displayName = 'LockAccountPage';
export default LockAccountPage;

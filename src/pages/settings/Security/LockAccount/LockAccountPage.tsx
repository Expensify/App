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

function LockAccountPage() {
    const {translate} = useLocalize();
    const [isWarningModalVisible, setWarningModalVisible] = useState(false);
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
                setWarningModalVisible(true);
            }}
        />
    );

    return (
        <HeaderPageLayout
            onBackButtonPress={() => Navigation.goBack()}
            title={translate('lockAccountPage.lockAccount')}
            testID={LockAccountPage.displayName}
            footer={lockAccountButton}
            childrenContainerStyles={[styles.pt3, styles.gap6]}
        >
            <View style={[styles.flex1, styles.gap4, styles.mh5]}>
                <Text>{translate('lockAccountPage.compromisedDescription')}</Text>
                <View style={styles.dInline}>
                    <Text>{translate('lockAccountPage.domainAdminsDescriptionPartOne')}</Text>
                    <Text style={styles.textBold}>{translate('lockAccountPage.domainAdminsDescriptionPartTwo')}</Text>
                    <Text>{translate('lockAccountPage.domainAdminsDescriptionPartThree')}</Text>
                </View>
            </View>
            <ConfirmModal
                danger
                title={translate('lockAccountPage.lockAccount')}
                onConfirm={() => {}}
                onCancel={() => setWarningModalVisible(false)}
                isVisible={isWarningModalVisible}
                prompt={translate('lockAccountPage.warning')}
                confirmText={translate('lockAccountPage.lockAccount')}
                cancelText={translate('common.cancel')}
                shouldDisableConfirmButtonWhenOffline
                shouldShowCancelButton
            />
        </HeaderPageLayout>
    );
}

LockAccountPage.displayName = 'LockAccountPage';
export default LockAccountPage;

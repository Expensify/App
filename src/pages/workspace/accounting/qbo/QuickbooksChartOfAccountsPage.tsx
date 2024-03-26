import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import variables from '@styles/variables';
import * as Policy from '@userActions/Policy';

function QuickbooksChartOfAccountsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {enableNewCategories, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksChartOfAccountsPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.accounts')} />
            <ScrollView contentContainerStyle={[styles.pb2, styles.ph5]}>
                <Text style={styles.pb5}>{translate('workspace.qbo.accountsDescription')}</Text>
                <View style={[styles.flexRow, styles.mb3, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <View style={styles.flex1}>
                        <Text fontSize={variables.fontSizeNormal}>{translate('workspace.qbo.accountsSwitchTitle')}</Text>
                    </View>
                    <OfflineWithFeedback pendingAction={pendingFields?.enableNewCategories}>
                        <View style={[styles.flex1, styles.alignItemsEnd, styles.pl3]}>
                            <Switch
                                accessibilityLabel={translate('workspace.qbo.accounts')}
                                isOn={Boolean(enableNewCategories)}
                                onToggle={() => Policy.updatePolicyConnectionConfig(policyID, 'quickbooksOnline', 'enableNewCategories', !enableNewCategories)}
                            />
                        </View>
                    </OfflineWithFeedback>
                </View>
                <View style={styles.flex1}>
                    <Text
                        fontSize={variables.fontSizeLabel}
                        style={styles.textSupporting}
                    >
                        {translate('workspace.qbo.accountsSwitchDescription')}
                    </Text>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksChartOfAccountsPage.displayName = 'QuickbooksChartOfAccountsConfigurationPage';

export default withPolicy(QuickbooksChartOfAccountsPage);

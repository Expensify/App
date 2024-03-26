import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
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

function QuickbooksCustomersPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {syncCustomers, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isSwitchOn = Boolean(syncCustomers && syncCustomers !== 'NONE');
    const isReportFieldsSelected = syncCustomers === 'REPORT_FIELD';
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksCustomersPage.displayName}
        >
            <HeaderWithBackButton title={translate('workspace.qbo.customers')} />
            <ScrollView contentContainerStyle={[styles.pb2, styles.ph5]}>
                <Text style={styles.pb5}>{translate('workspace.qbo.customersDescription')}</Text>
                <View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                    <View style={styles.flex1}>
                        <Text fontSize={variables.fontSizeNormal}>{translate('workspace.qbo.import')}</Text>
                    </View>
                    <OfflineWithFeedback pendingAction={pendingFields?.syncCustomers}>
                        <View style={[styles.flex1, styles.alignItemsEnd, styles.pl3]}>
                            <Switch
                                accessibilityLabel={translate('workspace.qbo.customers')}
                                isOn={isSwitchOn}
                                onToggle={() => Policy.updatePolicyConnectionConfig(policyID, 'quickbooksOnline', 'syncCustomers', isSwitchOn ? 'NONE' : 'TAG')}
                            />
                        </View>
                    </OfflineWithFeedback>
                </View>
                {isSwitchOn && (
                    <OfflineWithFeedback>
                        <MenuItemWithTopDescription
                            interactive={false}
                            title={isReportFieldsSelected ? translate('workspace.common.reportFields') : translate('workspace.common.tags')}
                            description={translate('workspace.qbo.displayedAs')}
                            wrapperStyle={styles.sectionMenuItemTopDescription}
                        />
                    </OfflineWithFeedback>
                )}
            </ScrollView>
        </ScreenWrapper>
    );
}

QuickbooksCustomersPage.displayName = 'QuickbooksCustomersPage';

export default withPolicy(QuickbooksCustomersPage);

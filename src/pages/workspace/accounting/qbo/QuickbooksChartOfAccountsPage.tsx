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
import * as Connections from '@libs/actions/connections';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function QuickbooksChartOfAccountsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {enableNewCategories, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isSwitchOn = Boolean(enableNewCategories && enableNewCategories !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <FeatureEnabledAccessOrNotFoundWrapper
                policyID={policyID}
                featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            >
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    shouldEnableMaxHeight
                    testID={QuickbooksChartOfAccountsPage.displayName}
                >
                    <HeaderWithBackButton title={translate('workspace.qbo.accounts')} />
                    <ScrollView contentContainerStyle={[styles.pb2, styles.ph5]}>
                        <Text style={styles.pb5}>{translate('workspace.qbo.accountsDescription')}</Text>
                        <View style={[styles.flexRow, styles.mb2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                            <View style={styles.flex1}>
                                <Text fontSize={variables.fontSizeNormal}>{translate('workspace.qbo.accountsSwitchTitle')}</Text>
                            </View>
                            <OfflineWithFeedback pendingAction={pendingFields?.enableNewCategories}>
                                <View style={[styles.flex1, styles.alignItemsEnd, styles.pl3]}>
                                    <Switch
                                        accessibilityLabel={translate('workspace.qbo.accounts')}
                                        isOn={isSwitchOn}
                                        onToggle={() =>
                                            Connections.updatePolicyConnectionConfig(
                                                policyID,
                                                CONST.POLICY.CONNECTIONS.NAME.QBO,
                                                CONST.QUICKBOOKS_IMPORTS.ENABLE_NEW_CATEGORIES,
                                                isSwitchOn ? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE : CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                                            )
                                        }
                                    />
                                </View>
                            </OfflineWithFeedback>
                        </View>
                        <View style={styles.flex1}>
                            <Text style={styles.mutedTextLabel}>{translate('workspace.qbo.accountsSwitchDescription')}</Text>
                        </View>
                    </ScrollView>
                </ScreenWrapper>
            </FeatureEnabledAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

QuickbooksChartOfAccountsPage.displayName = 'QuickbooksChartOfAccountsPage';

export default withPolicy(QuickbooksChartOfAccountsPage);

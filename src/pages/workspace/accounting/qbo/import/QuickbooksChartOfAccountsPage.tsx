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
import * as Connections from '@libs/actions/connections';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function QuickbooksChartOfAccountsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {enableNewCategories, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={QuickbooksChartOfAccountsPage.displayName}
            >
                <HeaderWithBackButton title={translate('workspace.accounting.accounts')} />
                <ScrollView contentContainerStyle={[styles.pb2, styles.ph5]}>
                    <Text style={styles.pb5}>{translate('workspace.qbo.accountsDescription')}</Text>
                    <View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <View style={styles.flex1}>
                            <Text fontSize={variables.fontSizeNormal}>{translate('workspace.accounting.import')}</Text>
                        </View>
                        <View style={[styles.flex1, styles.alignItemsEnd, styles.pl3]}>
                            <Switch
                                accessibilityLabel={translate('workspace.accounting.accounts')}
                                isOn
                                disabled
                                onToggle={() => {}}
                            />
                        </View>
                    </View>
                    <MenuItemWithTopDescription
                        interactive={false}
                        title={translate('workspace.common.categories')}
                        description={translate('workspace.qbo.displayedAs')}
                        wrapperStyle={styles.sectionMenuItemTopDescription}
                    />
                    <Text style={styles.pv5}>{translate('workspace.qbo.accountsSwitchTitle')}</Text>
                    <View style={[styles.flexRow, styles.mb2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                        <View style={styles.flex1}>
                            <Text fontSize={variables.fontSizeNormal}>{translate('workspace.common.enabled')}</Text>
                        </View>
                        <OfflineWithFeedback pendingAction={pendingFields?.enableNewCategories}>
                            <View style={[styles.flex1, styles.alignItemsEnd, styles.pl3]}>
                                <Switch
                                    accessibilityLabel={translate('workspace.accounting.accounts')}
                                    isOn={!!enableNewCategories}
                                    onToggle={() =>
                                        Connections.updatePolicyConnectionConfig(
                                            policyID,
                                            CONST.POLICY.CONNECTIONS.NAME.QBO,
                                            CONST.QUICK_BOOKS_CONFIG.ENABLE_NEW_CATEGORIES,
                                            !enableNewCategories,
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
        </AccessOrNotFoundWrapper>
    );
}

QuickbooksChartOfAccountsPage.displayName = 'QuickbooksChartOfAccountsPage';

export default withPolicyConnections(QuickbooksChartOfAccountsPage);

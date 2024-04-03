import React from 'react';
import {View} from 'react-native';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import {hasAccessToAccountingFeatures} from '@libs/WorkspacesSettingsUtils';
import Navigation from '@navigation/Navigation';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import variables from '@styles/variables';
import * as Policy from '@userActions/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function QuickbooksChartOfAccountsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {canUseAccountingIntegrations} = usePermissions();
    const policyID = policy?.id ?? '';
    const {enableNewCategories, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};
    const hasAccess = hasAccessToAccountingFeatures(policy, canUseAccountingIntegrations);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={QuickbooksChartOfAccountsPage.displayName}
        >
            <FullPageNotFoundView
                onBackButtonPress={Navigation.dismissModal}
                onLinkPress={Navigation.resetToHome}
                shouldShow={!hasAccess}
                subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                shouldForceFullScreen
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
                                    isOn={Boolean(enableNewCategories)}
                                    onToggle={() => Policy.updatePolicyConnectionConfig(policyID, 'quickbooksOnline', 'enableNewCategories', !enableNewCategories)}
                                />
                            </View>
                        </OfflineWithFeedback>
                    </View>
                    <View style={styles.flex1}>
                        <Text style={styles.mutedTextLabel}>{translate('workspace.qbo.accountsSwitchDescription')}</Text>
                    </View>
                </ScrollView>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

QuickbooksChartOfAccountsPage.displayName = 'QuickbooksChartOfAccountsConfigurationPage';

export default withPolicy(QuickbooksChartOfAccountsPage);

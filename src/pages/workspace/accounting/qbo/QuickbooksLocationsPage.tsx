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
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function QuickbooksLocationsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '';
    const {syncLocations, pendingFields} = policy?.connections?.quickbooksOnline?.config ?? {};
    const isSwitchOn = Boolean(syncLocations && syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isReportFieldsSelected = syncLocations === CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD;

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <FeatureEnabledAccessOrNotFoundWrapper
                policyID={policyID}
                featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            >
                <ScreenWrapper
                    includeSafeAreaPaddingBottom={false}
                    shouldEnableMaxHeight
                    testID={QuickbooksLocationsPage.displayName}
                >
                    <HeaderWithBackButton title={translate('workspace.qbo.locations')} />
                    <ScrollView contentContainerStyle={[styles.pb2, styles.ph5]}>
                        <Text style={styles.pb5}>{translate('workspace.qbo.locationsDescription')}</Text>
                        <View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.justifyContentBetween]}>
                            <View style={styles.flex1}>
                                <Text fontSize={variables.fontSizeNormal}>{translate('workspace.qbo.import')}</Text>
                            </View>
                            <OfflineWithFeedback pendingAction={pendingFields?.syncLocations}>
                                <View style={[styles.flex1, styles.alignItemsEnd, styles.pl3]}>
                                    <Switch
                                        accessibilityLabel={translate('workspace.qbo.locations')}
                                        isOn={isSwitchOn}
                                        onToggle={() =>
                                            Connections.updatePolicyConnectionConfig(
                                                policyID,
                                                CONST.POLICY.CONNECTIONS.NAME.QBO,
                                                CONST.QUICKBOOKS_IMPORTS.SYNC_LOCATIONS,
                                                isSwitchOn ? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE : CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                                            )
                                        }
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
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.mt1]}>
                            <Text style={styles.mutedTextLabel}>{translate('workspace.qbo.locationsAdditionalDescription')}</Text>
                        </View>
                    </ScrollView>
                </ScreenWrapper>
            </FeatureEnabledAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

QuickbooksLocationsPage.displayName = 'QuickbooksLocationsPage';

export default withPolicy(QuickbooksLocationsPage);

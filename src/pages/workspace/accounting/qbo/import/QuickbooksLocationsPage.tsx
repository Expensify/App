import React, {useEffect} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as QuickbooksOnline from '@libs/actions/connections/QuickbooksOnline';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksLocationsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const isSwitchOn = !!(qboConfig?.syncLocations && qboConfig?.syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isTagsSelected = qboConfig?.syncLocations === CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG;
    const shouldShowLineItemsRestriction = !(
        qboConfig?.reimbursableExpensesExportDestination === CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY &&
        qboConfig?.nonReimbursableExpensesExportDestination === CONST.QUICKBOOKS_NON_REIMBURSABLE_ACCOUNT_TYPE.CREDIT_CARD
    );

    // If we previously selected tags but now we have the line items restriction, we need to switch to report fields
    useEffect(() => {
        if (qboConfig?.syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG || !shouldShowLineItemsRestriction) {
            return;
        }
        QuickbooksOnline.updateQuickbooksOnlineSyncLocations(policyID, CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD, qboConfig?.syncLocations);
    }, [qboConfig?.syncLocations, shouldShowLineItemsRestriction, policyID]);

    return (
        <ConnectionLayout
            displayName={QuickbooksLocationsPage.displayName}
            headerTitle="workspace.qbo.locations"
            title="workspace.qbo.locationsDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[[styles.pb2, styles.ph5]]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT.getRoute(policyID))}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={translate('workspace.qbo.locations')}
                isActive={isSwitchOn}
                onToggle={() =>
                    QuickbooksOnline.updateQuickbooksOnlineSyncLocations(
                        policyID,
                        // eslint-disable-next-line no-nested-ternary
                        isSwitchOn
                            ? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE
                            : shouldShowLineItemsRestriction
                            ? CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD
                            : CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG,
                        qboConfig?.syncLocations,
                    )
                }
                errors={ErrorUtils.getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS)}
                onCloseError={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS)}
                pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS], qboConfig?.pendingFields)}
            />
            {isSwitchOn && (
                <OfflineWithFeedback pendingAction={PolicyUtils.settingsPendingAction([CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS], qboConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        interactive={!shouldShowLineItemsRestriction}
                        title={!isTagsSelected ? translate('workspace.common.reportFields') : translate('workspace.common.tags')}
                        description={translate('workspace.common.displayedAs')}
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS_DISPLAYED_AS.getRoute(policyID))}
                        shouldShowRightIcon={!shouldShowLineItemsRestriction}
                        wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt4]}
                        brickRoadIndicator={
                            PolicyUtils.areSettingsInErrorFields([CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS], qboConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                        }
                    />
                </OfflineWithFeedback>
            )}

            {shouldShowLineItemsRestriction && isSwitchOn && (
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.gap2, styles.mt3]}>
                    <Text style={styles.mutedTextLabel}>{translate('workspace.qbo.locationsLineItemsRestrictionDescription')}</Text>
                </View>
            )}
        </ConnectionLayout>
    );
}

QuickbooksLocationsPage.displayName = 'QuickbooksLocationsPage';

export default withPolicyConnections(QuickbooksLocationsPage);

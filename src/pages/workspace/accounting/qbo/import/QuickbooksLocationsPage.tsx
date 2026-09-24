import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemSectionRow from '@components/MenuItem/presets/MenuItemSectionRow';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateQuickbooksOnlineSyncLocations as updateQuickbooksOnlineSyncLocationsAction} from '@libs/actions/connections/QuickbooksOnline';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, isControlPolicy, settingsPendingAction} from '@libs/PolicyUtils';

import {canImportLocationsAsTags, shouldSwitchLocationsToReportFields} from '@pages/workspace/accounting/qbo/utils';
import {getQuickbooksOnlineIntegrationName} from '@pages/workspace/accounting/utils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {clearQBOErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {IntegrationEntityMap} from '@src/types/onyx/Policy';

import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

function QuickbooksLocationsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const integrationName = getQuickbooksOnlineIntegrationName(policy, translate);
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const isSwitchOn = !!(qboConfig?.syncLocations && qboConfig?.syncLocations !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isTagsSelected = qboConfig?.syncLocations === CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG;
    const canUseTagsForLocations = canImportLocationsAsTags(qboConfig);
    const {isAccordionExpanded, shouldAnimateAccordionSection} = useAccordionAnimation(isSwitchOn);

    const updateQuickbooksOnlineSyncLocations = useCallback(
        (settingValue: IntegrationEntityMap) => {
            if (settingValue === CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD && !isControlPolicy(policy)) {
                Navigation.navigate(
                    ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.REPORT_FIELDS_FEATURE.qbo.locations, ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS.getRoute(policyID)),
                );
                return;
            }
            updateQuickbooksOnlineSyncLocationsAction(policyID, settingValue, qboConfig?.syncLocations);
        },
        [policy, policyID, qboConfig?.syncLocations],
    );
    // If we previously selected tags but now we have the line items restriction, we need to switch to report fields
    useEffect(() => {
        if (!shouldSwitchLocationsToReportFields(qboConfig)) {
            return;
        }
        updateQuickbooksOnlineSyncLocations(CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD);
    }, [qboConfig, updateQuickbooksOnlineSyncLocations]);

    return (
        <ConnectionLayout
            displayName="QuickbooksLocationsPage"
            headerTitle="workspace.qbo.locations"
            title="workspace.qbo.locationsDescription"
            titleAlreadyTranslated={translate('workspace.qbo.locationsDescription', integrationName)}
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
                    updateQuickbooksOnlineSyncLocations(
                        // eslint-disable-next-line no-nested-ternary
                        isSwitchOn
                            ? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE
                            : canUseTagsForLocations
                              ? CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG
                              : CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD,
                    )
                }
                errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS)}
                onCloseError={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS)}
                pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS], qboConfig?.pendingFields)}
            />
            <Accordion
                isExpanded={isAccordionExpanded}
                isToggleTriggered={shouldAnimateAccordionSection}
            >
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS], qboConfig?.pendingFields)}>
                    <View style={styles.mt4}>
                        <MenuItemSectionRow
                            onPress={canUseTagsForLocations ? () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS_DISPLAYED_AS.getRoute(policyID)) : undefined}
                        >
                            <MenuItemField.Row
                                name={translate('workspace.common.displayedAs')}
                                value={!isTagsSelected ? translate('workspace.common.reportFields') : translate('workspace.common.tags')}
                            >
                                {areSettingsInErrorFields([CONST.QUICKBOOKS_CONFIG.SYNC_LOCATIONS], qboConfig?.errorFields) && (
                                    <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                )}
                                {canUseTagsForLocations && <MenuItem.Chevron />}
                            </MenuItemField.Row>
                            <MenuItem.HelpText message={translate('workspace.qbo.locationsLineItemsRestrictionDescription', integrationName)} />
                        </MenuItemSectionRow>
                    </View>
                </OfflineWithFeedback>
            </Accordion>
        </ConnectionLayout>
    );
}

export default withPolicyConnections(QuickbooksLocationsPage);

import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import MenuItemSectionRow from '@components/MenuItem/presets/MenuItemSectionRow';
import OfflineWithFeedback from '@components/OfflineWithFeedback';

import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateQuickbooksOnlineSyncClasses} from '@libs/actions/connections/QuickbooksOnline';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';

import {getQuickbooksOnlineIntegrationName} from '@pages/workspace/accounting/utils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';

import {clearQBOErrorField} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

function QuickbooksClassesPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const integrationName = getQuickbooksOnlineIntegrationName(policy, translate);
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const qboConfig = policy?.connections?.quickbooksOnline?.config;
    const isSwitchOn = !!(qboConfig?.syncClasses && qboConfig.syncClasses !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE);
    const isReportFieldsSelected = qboConfig?.syncClasses === CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD;

    const {isAccordionExpanded, shouldAnimateAccordionSection} = useAccordionAnimation(isSwitchOn);

    return (
        <ConnectionLayout
            displayName="QuickbooksClassesPage"
            headerTitle="workspace.qbo.classes"
            title="workspace.qbo.classesDescription"
            titleAlreadyTranslated={translate('workspace.qbo.classesDescription', integrationName)}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.QBO}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT.getRoute(policyID))}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.accounting.import')}
                switchAccessibilityLabel={translate('workspace.qbo.classes')}
                isActive={isSwitchOn}
                onToggle={() =>
                    updateQuickbooksOnlineSyncClasses(policyID, isSwitchOn ? CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE : CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG, qboConfig?.syncClasses)
                }
                pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.SYNC_CLASSES], qboConfig?.pendingFields)}
                errors={getLatestErrorField(qboConfig, CONST.QUICKBOOKS_CONFIG.SYNC_CLASSES)}
                onCloseError={() => clearQBOErrorField(policyID, CONST.QUICKBOOKS_CONFIG.SYNC_CLASSES)}
            />
            <Accordion
                isExpanded={isAccordionExpanded}
                isToggleTriggered={shouldAnimateAccordionSection}
            >
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.QUICKBOOKS_CONFIG.SYNC_CLASSES], qboConfig?.pendingFields)}>
                    <View style={styles.mt4}>
                        <MenuItemSectionRow onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES_DISPLAYED_AS.getRoute(policyID))}>
                            <MenuItemField.Row
                                name={translate('workspace.common.displayedAs')}
                                value={isReportFieldsSelected ? translate('workspace.common.reportFields') : translate('workspace.common.tags')}
                            >
                                {areSettingsInErrorFields([CONST.QUICKBOOKS_CONFIG.SYNC_CLASSES], qboConfig?.errorFields) && (
                                    <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />
                                )}
                                <MenuItem.Chevron />
                            </MenuItemField.Row>
                        </MenuItemSectionRow>
                    </View>
                </OfflineWithFeedback>
            </Accordion>
        </ConnectionLayout>
    );
}

export default withPolicyConnections(QuickbooksClassesPage);

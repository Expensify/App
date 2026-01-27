import React from 'react';
import Accordion from '@components/Accordion';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useAccordionAnimation from '@hooks/useAccordionAnimation';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateQuickbooksOnlineSyncClasses} from '@libs/actions/connections/QuickbooksOnline';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {clearQBOErrorField} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function QuickbooksClassesPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
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
                    <MenuItemWithTopDescription
                        title={isReportFieldsSelected ? translate('workspace.common.reportFields') : translate('workspace.common.tags')}
                        description={translate('workspace.common.displayedAs')}
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES_DISPLAYED_AS.getRoute(policyID))}
                        shouldShowRightIcon
                        wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt4]}
                        brickRoadIndicator={areSettingsInErrorFields([CONST.QUICKBOOKS_CONFIG.SYNC_CLASSES], qboConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            </Accordion>
        </ConnectionLayout>
    );
}

export default withPolicyConnections(QuickbooksClassesPage);

import React, {useCallback} from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateNetSuiteQuickStartProjectsMapping} from '@libs/actions/connections/NetSuiteQuickStart';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import Parser from '@libs/Parser';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NetSuiteQuickStartProjectsPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const nsqsConfig = policy?.connections?.nsqs?.config;
    const importType = nsqsConfig?.syncOptions.mapping.projects ?? CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
    const isImportEnabled = importType != CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;

    const toggleImport = useCallback(() => {
        const mapping = isImportEnabled ? CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT : CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.TAG;
        updateNetSuiteQuickStartProjectsMapping(policyID, mapping, importType);
    }, [policyID, importType, isImportEnabled]);

    return (
        <ConnectionLayout
            policyID={policyID}
            displayName={NetSuiteQuickStartProjectsPage.displayName}
            headerTitle="workspace.nsqs.import.importFields.projects.title"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5, styles.gap6]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
            onBackButtonPress={() => Navigation.goBack(ROUTES.POLICY_ACCOUNTING_NSQS_IMPORT.getRoute(policyID))}
        >
            <RenderHTML html={`<comment>${Parser.replace(translate(`workspace.nsqs.import.importFields.projects.subtitle`))}</comment>`} />
            <View>
                <ToggleSettingOptionRow
                    title={translate('workspace.accounting.import')}
                    switchAccessibilityLabel={translate('workspace.accounting.import')}
                    isActive={isImportEnabled}
                    onToggle={toggleImport}
                    pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.PROJECTS], nsqsConfig?.pendingFields)}
                    errors={ErrorUtils.getLatestErrorField(nsqsConfig, CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.PROJECTS)}
                    onCloseError={() => Policy.clearNSQSErrorField(policyID, CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.PROJECTS)}
                />
                {isImportEnabled && (
                    <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.PROJECTS], nsqsConfig?.pendingFields)}>
                        <MenuItemWithTopDescription
                            title={translate(`workspace.nsqs.import.importTypes.${importType}.label`)}
                            description={translate(`workspace.common.displayedAs`)}
                            wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3]}
                            shouldShowRightIcon
                            onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_IMPORT_PROJECTS_DISPLAYED_AS.getRoute(policyID))}
                            brickRoadIndicator={
                                areSettingsInErrorFields([CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.PROJECTS], nsqsConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                            }
                        />
                    </OfflineWithFeedback>
                )}
            </View>
        </ConnectionLayout>
    );
}

NetSuiteQuickStartProjectsPage.displayName = 'NetSuiteQuickStartProjectsPage';

export default withPolicyConnections(NetSuiteQuickStartProjectsPage);

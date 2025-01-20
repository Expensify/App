import noop from 'lodash/noop';
import React from 'react';
import {View} from 'react-native';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, settingsPendingAction} from '@libs/PolicyUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NSQSImportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const nsqsConfig = policy?.connections?.nsqs?.config;
    const customersImportType = nsqsConfig?.syncOptions.mapping.customers ?? CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
    const projectsImportType = nsqsConfig?.syncOptions.mapping.projects ?? CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;

    return (
        <ConnectionLayout
            policyID={policyID}
            displayName={NSQSImportPage.displayName}
            headerTitle="workspace.accounting.import"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5, styles.gap6]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
        >
            <ToggleSettingOptionRow
                title={translate('workspace.nsqs.import.expenseCategories')}
                subtitle={translate('workspace.nsqs.import.expenseCategoriesDescription')}
                switchAccessibilityLabel={translate('workspace.nsqs.import.expenseCategories')}
                shouldPlaceSubtitleBelowSwitch
                isActive
                disabled
                onToggle={noop}
            />
            <View>
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.CUSTOMERS], nsqsConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={translate(`workspace.accounting.importTypes.${customersImportType}`)}
                        description={translate('workspace.nsqs.import.importFields.customers.title')}
                        wrapperStyle={[styles.sectionMenuItemTopDescription]}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_IMPORT_CUSTOMERS.getRoute(policyID))}
                        brickRoadIndicator={
                            areSettingsInErrorFields([CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.CUSTOMERS], nsqsConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                        }
                    />
                </OfflineWithFeedback>
                <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.PROJECTS], nsqsConfig?.pendingFields)}>
                    <MenuItemWithTopDescription
                        title={translate(`workspace.accounting.importTypes.${projectsImportType}`)}
                        description={translate('workspace.nsqs.import.importFields.projects.title')}
                        wrapperStyle={[styles.sectionMenuItemTopDescription]}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_IMPORT_PROJECTS.getRoute(policyID))}
                        brickRoadIndicator={
                            areSettingsInErrorFields([CONST.NSQS_CONFIG.SYNC_OPTIONS.MAPPING.PROJECTS], nsqsConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined
                        }
                    />
                </OfflineWithFeedback>
            </View>
        </ConnectionLayout>
    );
}

NSQSImportPage.displayName = 'NSQSImportPage';

export default withPolicyConnections(NSQSImportPage);

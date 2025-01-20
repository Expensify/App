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
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function NSQSExportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id ?? '-1';
    const policyOwner = policy?.owner ?? '';
    const nsqsConfig = policy?.connections?.nsqs?.config;
    const exporter = nsqsConfig?.exporter ?? policyOwner;
    const exportDate = nsqsConfig?.exportDate ?? CONST.NSQS_EXPORT_DATE.LAST_EXPENSE;

    return (
        <ConnectionLayout
            policyID={policyID}
            displayName={NSQSExportPage.displayName}
            headerTitle="workspace.accounting.export"
            title="workspace.nsqs.export.description"
            titleStyle={styles.pb3}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={[styles.pb2, styles.ph5]}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.NSQS}
        >
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.EXPORTER], nsqsConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={exporter}
                    description={translate('workspace.accounting.preferredExporter')}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_EXPORT_PREFERRED_EXPORTER.getRoute(policyID))}
                    brickRoadIndicator={areSettingsInErrorFields([CONST.NSQS_CONFIG.EXPORTER], nsqsConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <View style={[styles.sectionDividerLine, styles.mv3]} />
            <OfflineWithFeedback pendingAction={settingsPendingAction([CONST.NSQS_CONFIG.EXPORT_DATE], nsqsConfig?.pendingFields)}>
                <MenuItemWithTopDescription
                    title={translate(`workspace.nsqs.export.exportDate.values.${exportDate}.label`)}
                    description={translate('common.date')}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    shouldShowRightIcon
                    onPress={() => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_NSQS_EXPORT_DATE.getRoute(policyID))}
                    brickRoadIndicator={areSettingsInErrorFields([CONST.NSQS_CONFIG.EXPORT_DATE], nsqsConfig?.errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />
            </OfflineWithFeedback>
            <MenuItemWithTopDescription
                interactive={false}
                title={translate('workspace.nsqs.export.expense')}
                description={translate('workspace.nsqs.export.reimbursableExpenses')}
                wrapperStyle={[styles.sectionMenuItemTopDescription]}
            />
            <MenuItemWithTopDescription
                interactive={false}
                title={translate('workspace.nsqs.export.expense')}
                description={translate('workspace.nsqs.export.nonReimbursableExpenses')}
                wrapperStyle={[styles.sectionMenuItemTopDescription]}
            />
        </ConnectionLayout>
    );
}

NSQSExportPage.displayName = 'NSQSExportPage';

export default withPolicyConnections(NSQSExportPage);

import {useRoute} from '@react-navigation/native';
import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, getCurrentSageIntacctEntityName, settingsPendingAction} from '@libs/PolicyUtils';
import goBackFromExportConnection from '@navigation/helpers/goBackFromExportConnection';
import type {PlatformStackRouteProp} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

function SageIntacctExportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policyID = policy?.id;
    const route = useRoute<PlatformStackRouteProp<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.SAGE_INTACCT_EXPORT>>();
    const backTo = route?.params?.backTo;
    const {export: exportConfig, pendingFields, errorFields} = policy?.connections?.intacct?.config ?? {};
    const shouldGoBackToSpecificRoute = exportConfig?.reimbursable === CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT;

    const goBack = () => {
        return goBackFromExportConnection(shouldGoBackToSpecificRoute, backTo);
    };

    const sections = [
        {
            description: translate('workspace.sageIntacct.preferredExporter'),
            action: !policyID ? undefined : () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_PREFERRED_EXPORTER.getRoute(policyID, Navigation.getActiveRoute())),
            title: exportConfig?.exporter,
            subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.EXPORTER],
        },
        {
            description: translate('workspace.sageIntacct.exportDate.label'),
            action: !policyID ? undefined : () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT_DATE.getRoute(policyID, Navigation.getActiveRoute())),
            title: exportConfig?.exportDate ? translate(`workspace.sageIntacct.exportDate.values.${exportConfig.exportDate}.label`) : undefined,
            subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.EXPORT_DATE],
        },
        {
            description: translate('workspace.accounting.exportOutOfPocket'),
            action: !policyID ? undefined : () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_EXPENSES.getRoute(policyID, Navigation.getActiveRoute())),
            title: exportConfig?.reimbursable ? translate(`workspace.sageIntacct.reimbursableExpenses.values.${exportConfig.reimbursable}`) : undefined,
            subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE, CONST.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR],
        },
        {
            description: translate('workspace.accounting.exportCompanyCard'),
            action: !policyID ? undefined : () => Navigation.navigate(ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES.getRoute(policyID, Navigation.getActiveRoute())),
            title: exportConfig?.nonReimbursable ? translate(`workspace.sageIntacct.nonReimbursableExpenses.values.${exportConfig.nonReimbursable}`) : undefined,
            subscribedSettings: [
                CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE,
                CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT,
                exportConfig?.nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL
                    ? CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR
                    : CONST.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR,
            ],
        },
    ];

    return (
        <ConnectionLayout
            displayName="SageIntacctExportPage"
            headerTitle="workspace.accounting.export"
            headerSubtitle={getCurrentSageIntacctEntityName(policy, translate('workspace.common.topLevel'))}
            title="workspace.sageIntacct.exportDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            onBackButtonPress={goBack}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            contentContainerStyle={styles.pb2}
            titleStyle={styles.ph5}
            connectionName={CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}
        >
            {sections.map((section) => (
                <OfflineWithFeedback
                    key={section.description}
                    pendingAction={settingsPendingAction(section.subscribedSettings, pendingFields)}
                >
                    <MenuItemWithTopDescription
                        title={section.title}
                        description={section.description}
                        shouldShowRightIcon
                        onPress={section.action}
                        brickRoadIndicator={areSettingsInErrorFields(section.subscribedSettings, errorFields) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                </OfflineWithFeedback>
            ))}
        </ConnectionLayout>
    );
}

export default withPolicyConnections(SageIntacctExportPage);

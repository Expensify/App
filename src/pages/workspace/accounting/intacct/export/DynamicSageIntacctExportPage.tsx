import React from 'react';
import ConnectionLayout from '@components/ConnectionLayout';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {getCardSettings} from '@libs/CardUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import replaceCompanyCardsRoute from '@libs/Navigation/helpers/replaceCompanyCardsRoute';
import Navigation from '@libs/Navigation/Navigation';
import {areSettingsInErrorFields, getCurrentSageIntacctEntityName, settingsPendingAction} from '@libs/PolicyUtils';
import {getIsTravelInvoicingEnabled, getTravelInvoicingCardSettingsKey} from '@libs/TravelInvoicingUtils';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicyConnections from '@pages/workspace/withPolicyConnections';
import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';

function DynamicSageIntacctExportPage({policy}: WithPolicyProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const policyID = policy?.id;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.path);
    const {export: exportConfig, pendingFields, errorFields} = policy?.connections?.intacct?.config ?? {};
    const exportPath = policyID ? `${ROUTES.POLICY_ACCOUNTING.getRoute(policyID)}/${DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT.path}` : undefined;
    const travelPayableAccount = policy?.connections?.intacct?.data?.creditCards?.find((account) => account.name === exportConfig?.travelInvoicingPayableAccountID);

    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [cardSettings] = useOnyx(getTravelInvoicingCardSettingsKey(workspaceAccountID));
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);
    const isTravelInvoicingEnabled = isBetaEnabled(CONST.BETAS.TRAVEL_INVOICING) && getIsTravelInvoicingEnabled(travelSettings);

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
        ...(isTravelInvoicingEnabled
            ? [
                  {
                      title: travelPayableAccount?.name,
                      description: translate('workspace.common.travelInvoicing'),
                      action: !exportPath
                          ? undefined
                          : () => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.POLICY_ACCOUNTING_SAGE_INTACCT_TRAVEL_INVOICING_CONFIGURATION.path, exportPath)),
                      subscribedSettings: [CONST.SAGE_INTACCT_CONFIG.TRAVEL_INVOICING_PAYABLE_ACCOUNT],
                  },
              ]
            : []),
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
            displayName="DynamicSageIntacctExportPage"
            headerTitle="workspace.accounting.export"
            headerSubtitle={getCurrentSageIntacctEntityName(policy, translate('workspace.common.topLevel'))}
            title="workspace.sageIntacct.exportDescription"
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            onBackButtonPress={() => Navigation.goBack(replaceCompanyCardsRoute(backPath))}
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

export default withPolicyConnections(DynamicSageIntacctExportPage);

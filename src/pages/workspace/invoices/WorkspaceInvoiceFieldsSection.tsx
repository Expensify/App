import React from 'react';
import usePolicy from '@hooks/usePolicy';
import {enablePolicyInvoiceFields} from '@libs/actions/Policy/Policy';
import WorkspaceFieldsSection from '@pages/workspace/fields/WorkspaceFieldsSection';
import {openPolicyInvoicesPage} from '@userActions/Policy/ReportField';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type WorkspaceInvoiceFieldsSectionProps = {
    policyID: string;
};

function WorkspaceInvoiceFieldsSection({policyID}: WorkspaceInvoiceFieldsSectionProps) {
    const policy = usePolicy(policyID);

    return (
        <WorkspaceFieldsSection
            policy={policy}
            policyID={policyID}
            isEnabled={!!policy?.areInvoiceFieldsEnabled}
            pendingAction={policy?.pendingFields?.areInvoiceFieldsEnabled}
            fieldFilter={(field) => field.target === CONST.REPORT_FIELD_TARGETS.INVOICE}
            titleKey="workspace.common.invoiceFields"
            subtitleKey="workspace.invoiceFields.subtitle"
            importedFromAccountingSoftwareKey="workspace.invoiceFields.importedFromAccountingSoftware"
            disableTitleKey="workspace.invoiceFields.disableInvoiceFields"
            disablePromptKey="workspace.invoiceFields.disableInvoiceFieldsConfirmation"
            addFieldKey="workspace.invoiceFields.addField"
            createRoute={ROUTES.WORKSPACE_INVOICE_FIELDS_CREATE.getRoute(policyID)}
            getSettingsRoute={ROUTES.WORKSPACE_INVOICE_FIELDS_SETTINGS.getRoute}
            upgradeFeatureAlias={CONST.UPGRADE_FEATURE_INTRO_MAPPING.invoiceFields.alias}
            upgradeBackToRoute={ROUTES.WORKSPACE_INVOICES.getRoute(policyID)}
            enableFields={enablePolicyInvoiceFields}
            openFieldsPage={openPolicyInvoicesPage}
            policyFeature={CONST.POLICY.POLICY_FEATURE.MORE_FEATURES}
        />
    );
}

WorkspaceInvoiceFieldsSection.displayName = 'WorkspaceInvoiceFieldsSection';

export default WorkspaceInvoiceFieldsSection;

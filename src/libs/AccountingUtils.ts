import type {LocaleContextProps} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {ConnectionName, PolicyConnectionName} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

const ROUTE_NAME_MAPPING = {
    [CONST.POLICY.CONNECTIONS.ROUTE.QBO]: CONST.POLICY.CONNECTIONS.NAME.QBO,
    [CONST.POLICY.CONNECTIONS.ROUTE.XERO]: CONST.POLICY.CONNECTIONS.NAME.XERO,
    [CONST.POLICY.CONNECTIONS.ROUTE.SAGE_INTACCT]: CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
    [CONST.POLICY.CONNECTIONS.ROUTE.NETSUITE]: CONST.POLICY.CONNECTIONS.NAME.NETSUITE,
    [CONST.POLICY.CONNECTIONS.ROUTE.QBD]: CONST.POLICY.CONNECTIONS.NAME.QBD,
    [CONST.POLICY.CONNECTIONS.ROUTE.CERTINIA]: CONST.POLICY.CONNECTIONS.NAME.CERTINIA,
    [CONST.POLICY.CONNECTIONS.ROUTE.RILLET]: CONST.POLICY.CONNECTIONS.NAME.RILLET,
    [CONST.POLICY.CONNECTIONS.ROUTE.GUSTO]: CONST.POLICY.CONNECTIONS.NAME.GUSTO,
    [CONST.POLICY.CONNECTIONS.ROUTE.ZENEFITS]: CONST.POLICY.CONNECTIONS.NAME.ZENEFITS,
    [CONST.POLICY.CONNECTIONS.ROUTE.MERGE_HR]: CONST.POLICY.CONNECTIONS.NAME.MERGE_HR,
    [CONST.POLICY.CONNECTIONS.ROUTE.DUALENTRY]: CONST.POLICY.CONNECTIONS.NAME.DUALENTRY,
};

const NAME_ROUTE_MAPPING = {
    [CONST.POLICY.CONNECTIONS.NAME.QBO]: CONST.POLICY.CONNECTIONS.ROUTE.QBO,
    [CONST.POLICY.CONNECTIONS.NAME.XERO]: CONST.POLICY.CONNECTIONS.ROUTE.XERO,
    [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: CONST.POLICY.CONNECTIONS.ROUTE.SAGE_INTACCT,
    [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: CONST.POLICY.CONNECTIONS.ROUTE.NETSUITE,
    [CONST.POLICY.CONNECTIONS.NAME.QBD]: CONST.POLICY.CONNECTIONS.ROUTE.QBD,
    [CONST.POLICY.CONNECTIONS.NAME.CERTINIA]: CONST.POLICY.CONNECTIONS.ROUTE.CERTINIA,
    [CONST.POLICY.CONNECTIONS.NAME.RILLET]: CONST.POLICY.CONNECTIONS.ROUTE.RILLET,
    [CONST.POLICY.CONNECTIONS.NAME.GUSTO]: CONST.POLICY.CONNECTIONS.ROUTE.GUSTO,
    [CONST.POLICY.CONNECTIONS.NAME.ZENEFITS]: CONST.POLICY.CONNECTIONS.ROUTE.ZENEFITS,
    [CONST.POLICY.CONNECTIONS.NAME.MERGE_HR]: CONST.POLICY.CONNECTIONS.ROUTE.MERGE_HR,
    [CONST.POLICY.CONNECTIONS.NAME.DUALENTRY]: CONST.POLICY.CONNECTIONS.ROUTE.DUALENTRY,
};

const STANDARD_EXPORT_TEMPLATE_NAME_MAPPING = {
    [CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT]: CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT,
    [CONST.REPORT.EXPORT_OPTIONS.REPORT_LEVEL_EXPORT]: CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT,
    [CONST.REPORT.EXPORT_OPTIONS.MULTIPLE_TAX_EXPORT]: CONST.REPORT.EXPORT_OPTION_LABELS.MULTIPLE_TAX_EXPORT,
};

const STANDARD_EXPORT_TEMPLATE_LABELS = new Set<string>(Object.values(STANDARD_EXPORT_TEMPLATE_NAME_MAPPING));

function getConnectionNameFromRouteParam(routeParam: ValueOf<typeof CONST.POLICY.CONNECTIONS.ROUTE>) {
    return ROUTE_NAME_MAPPING[routeParam];
}

function getRouteParamForConnection(connectionName: ConnectionName) {
    return NAME_ROUTE_MAPPING[connectionName];
}

function getExportLabelForConnection(connectionName: ConnectionName, policy?: OnyxEntry<Policy>): string {
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.QBO && isIntuitEnterpriseSuiteConnection(policy)) {
        return CONST.EXPORT_LABELS.INTUIT_ENTERPRISE_SUITE;
    }
    return CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName];
}

function getExportLabelsForConnection(connectionName: ConnectionName, policies: Array<OnyxEntry<Policy>>): string[] {
    const connectionPolicies = policies.filter((policy) => !!policy?.connections?.[connectionName]);
    if (connectionPolicies.length === 0) {
        return [getExportLabelForConnection(connectionName)];
    }
    return [...new Set(connectionPolicies.map((policy) => getExportLabelForConnection(connectionName, policy)))];
}

function isIntuitEnterpriseSuiteConnection(policy: OnyxEntry<Policy>): boolean {
    return !!policy?.connections?.quickbooksOnline?.config?.credentials?.scope?.includes(CONST.POLICY.CONNECTIONS.INTUIT_ENTERPRISE_SUITE_SCOPE);
}

function getQuickbooksOnlineIntegrationName(policy: OnyxEntry<Policy>, translate: LocaleContextProps['translate']): string {
    return translate(isIntuitEnterpriseSuiteConnection(policy) ? 'workspace.accounting.intuitEnterpriseSuite' : 'workspace.accounting.qbo');
}

function getAccountingIntegrationDisplayName(policy: OnyxEntry<Policy>, connectionName: PolicyConnectionName, translate: LocaleContextProps['translate']): string {
    if (connectionName === CONST.POLICY.CONNECTIONS.NAME.QBO) {
        return getQuickbooksOnlineIntegrationName(policy, translate);
    }
    return CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName];
}

function getStandardExportTemplateDisplayName(templateName: string): string {
    return STANDARD_EXPORT_TEMPLATE_NAME_MAPPING[templateName as keyof typeof STANDARD_EXPORT_TEMPLATE_NAME_MAPPING] ?? templateName;
}

/** Whether the given template ID belongs to one of the standard (i.e. not user-defined) export templates */
function isStandardExportTemplate(templateName: string): boolean {
    return templateName in STANDARD_EXPORT_TEMPLATE_NAME_MAPPING;
}

/** Whether the given export label, as sent by the backend on an export report action, belongs to one of the standard (i.e. not user-defined) export templates */
function isStandardExportTemplateLabel(label: string): boolean {
    return STANDARD_EXPORT_TEMPLATE_LABELS.has(label);
}

export {
    getAccountingIntegrationDisplayName,
    getConnectionNameFromRouteParam,
    getExportLabelForConnection,
    getExportLabelsForConnection,
    getQuickbooksOnlineIntegrationName,
    getRouteParamForConnection,
    getStandardExportTemplateDisplayName,
    isStandardExportTemplate,
    isStandardExportTemplateLabel,
    isIntuitEnterpriseSuiteConnection,
};

/** The onboarding catalog is independent of the integrations that support direct connection setup. */
import type {ExpensifyIconName} from '@components/Icon/ExpensifyIconLoader';

import type {OnboardingAccountingOption} from '@src/CONST';

type AccountingOption = {
    name: string;
    iconName: ExpensifyIconName;
    integration: OnboardingAccountingOption;
    aliases?: string;
    isComingSoon?: boolean;
};

// New products use the existing Other payload until their canonical onboarding values are supported.
const accountingOptions: AccountingOption[] = [
    {name: 'QuickBooks Online', iconName: 'QBOCircle', integration: 'quickbooksOnline', aliases: 'QBO'},
    {name: 'Intuit Enterprise Suite', iconName: 'IntuitSquare', integration: 'intuitEnterpriseSuite', aliases: 'IES'},
    {name: 'QuickBooks Desktop', iconName: 'QBDSquare', integration: 'quickbooksDesktop', aliases: 'QBD'},
    {name: 'Xero', iconName: 'XeroCircle', integration: 'xero'},
    {name: 'NetSuite', iconName: 'NetSuiteSquare', integration: 'netsuite'},
    {name: 'DualEntry', iconName: 'DualEntrySquare', integration: 'other'},
    {name: 'Campfire', iconName: 'CampfireSquare', integration: 'other'},
    {name: 'Odoo', iconName: 'OdooSquare', integration: 'other'},
    {name: 'Exact Online', iconName: 'ExactOnlineSquare', integration: 'other'},
    {name: 'Digits', iconName: 'DigitsSquare', integration: 'other', isComingSoon: true},
    {name: 'Zoho Books', iconName: 'ZohoBooksSquare', integration: 'other'},
    // These products have no bundled brand artwork, so use the generic icon.
    {name: 'Acumatica', iconName: 'Building', integration: 'other'},
    {name: 'Qanta', iconName: 'Building', integration: 'other'},
    {name: 'Lensing.ai', iconName: 'Building', integration: 'other'},
    {name: 'Holded', iconName: 'Building', integration: 'other'},
    {name: 'MYOB Business', iconName: 'Building', integration: 'other'},
    {name: 'Pennylane', iconName: 'Building', integration: 'other'},
    {name: 'DATEV', iconName: 'Building', integration: 'other'},
    {name: 'Workday', iconName: 'Building', integration: 'other'},
    {name: 'Sage Intacct', iconName: 'IntacctSquare', integration: 'intacct'},
    {name: 'Sage Accounting', iconName: 'IntacctSquare', integration: 'other'},
    {name: 'Sage Intacct CRE', iconName: 'IntacctSquare', integration: 'other'},
    {name: 'Sage 50', iconName: 'IntacctSquare', integration: 'other'},
    {name: 'Sage 100', iconName: 'IntacctSquare', integration: 'other'},
    {name: 'Sage 300', iconName: 'IntacctSquare', integration: 'other'},
    {name: 'Sage X3', iconName: 'IntacctSquare', integration: 'other'},
    {name: 'Certinia', iconName: 'CertiniaSquare', integration: 'financialforce', aliases: 'FinancialForce'},
    {name: 'Rillet', iconName: 'RilletSquare', integration: 'rillet'},
    {name: 'SAP S/4HANA', iconName: 'SapSquare', integration: 'sap', aliases: 'SAP S4 HANA'},
    {name: 'Oracle Fusion Cloud', iconName: 'OracleSquare', integration: 'oracle'},
    {name: 'Dynamics', iconName: 'MicrosoftDynamicsSquare', integration: 'microsoftDynamics', aliases: 'Microsoft Dynamics 365 Business Central'},
];

export default accountingOptions;
export type {AccountingOption};

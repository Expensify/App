import {canUseVendorBillForCompanyCardExport} from '@pages/workspace/accounting/qbo/utils';

import CONST from '@src/CONST';
import type {QBOConnectionConfig} from '@src/types/onyx/Policy';

const buildQBOConfig = (syncLocations: QBOConnectionConfig['syncLocations']): QBOConnectionConfig => ({
    realmId: '123',
    companyName: 'QuickBooks Company',
    autoSync: {
        jobID: '456',
        enabled: false,
    },
    syncPeople: false,
    syncItems: false,
    markChecksToBePrinted: false,
    reimbursableExpensesExportDestination: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
    nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
    nonReimbursableBillDefaultVendor: '',
    autoCreateVendor: false,
    hasChosenAutoSyncOption: false,
    syncClasses: CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
    syncCustomers: CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE,
    syncLocations,
    lastConfigurationTime: 0,
    syncTax: false,
    enableNewCategories: false,
    exportDate: CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE,
    export: {},
    credentials: {
        companyID: '123',
        companyName: 'QuickBooks Company',
        scope: '',
    },
});

describe('canUseVendorBillForCompanyCardExport', () => {
    it('allows vendor bill when QBO config is missing', () => {
        expect(canUseVendorBillForCompanyCardExport()).toBe(true);
    });

    it('allows vendor bill when locations are not imported', () => {
        expect(canUseVendorBillForCompanyCardExport(buildQBOConfig(CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE))).toBe(true);
    });

    it('allows vendor bill when locations are imported as report fields', () => {
        expect(canUseVendorBillForCompanyCardExport(buildQBOConfig(CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD))).toBe(true);
    });

    it('hides vendor bill when locations are imported as tags', () => {
        expect(canUseVendorBillForCompanyCardExport(buildQBOConfig(CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG))).toBe(false);
    });
});

import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {getAccountingIntegrationData} from '@pages/workspace/accounting/utils';

import CONST from '@src/CONST';
import type {Policy} from '@src/types/onyx';
import type {QBOConnectionConfig} from '@src/types/onyx/Policy';

type NonReimbursableDestination = QBOConnectionConfig['nonReimbursableExpensesExportDestination'];

const POLICY_ID = 'policy123';

const EXISTING_CONNECTIONS = {sageIntacct: false, qbd: false, certinia: false, rillet: false, dualEntry: false};

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const mockTranslate = ((key: string) => key) as unknown as LocaleContextProps['translate'];

function buildPolicy(nonReimbursableExpensesExportDestination: NonReimbursableDestination, autoCreateVendor: boolean): Policy {
    const policy = {
        id: POLICY_ID,
        connections: {
            quickbooksOnline: {
                config: {
                    nonReimbursableExpensesExportDestination,
                    autoCreateVendor,
                },
            },
        },
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return policy as unknown as Policy;
}

function getIntegrationData(nonReimbursableExpensesExportDestination: NonReimbursableDestination, autoCreateVendor = false) {
    return getAccountingIntegrationData(
        CONST.POLICY.CONNECTIONS.NAME.QBO,
        POLICY_ID,
        mockTranslate,
        EXISTING_CONNECTIONS,
        buildPolicy(nonReimbursableExpensesExportDestination, autoCreateVendor),
    );
}

describe('QBO default vendor export subscriptions', () => {
    it('subscribes to the bill default vendor on the Vendor Bill path even when autoCreateVendor is off', () => {
        const subscribedExportSettings = getIntegrationData(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL)?.subscribedExportSettings ?? [];

        expect(subscribedExportSettings).toContain(CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR);
        expect(subscribedExportSettings).not.toContain(CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_DEFAULT_VENDOR);
    });

    it('no longer surfaces autoCreateVendor on the export path — it is an Advanced setting', () => {
        const integrationData = getIntegrationData(CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL, true);

        expect(integrationData?.subscribedExportSettings ?? []).not.toContain(CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR);
        expect(integrationData?.subscribedAdvancedSettings ?? []).toContain(CONST.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR);
    });

    it.each([CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD])(
        'subscribes to the credit card default vendor on the %s path',
        (destination) => {
            const subscribedExportSettings = getIntegrationData(destination)?.subscribedExportSettings ?? [];

            expect(subscribedExportSettings).toContain(CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_DEFAULT_VENDOR);
            expect(subscribedExportSettings).not.toContain(CONST.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR);
        },
    );
});

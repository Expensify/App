import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {getAccountingIntegrationData} from '@pages/workspace/accounting/utils';

import CONST from '@src/CONST';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import type {Policy} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

import {CONST as COMMON_CONST} from 'expensify-common';

import createMock from '../../../../../utils/createMock';

type NonReimbursableDestination = ValueOf<typeof CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE>;
type AccountingMethod = ValueOf<typeof COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD>;

const POLICY_ID = 'policy123';

const EXISTING_CONNECTIONS = {sageIntacct: false, qbd: true, certinia: false, rillet: false, dualEntry: false, campfire: false};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Translation parameters are required by the production callback signature; this stub intentionally returns only the key.
const mockTranslate: LocaleContextProps['translate'] = <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>): string => path;

function getIntegrationData({
    nonReimbursable,
    shouldAutoCreateVendor = false,
    accountingMethod,
}: {
    nonReimbursable?: NonReimbursableDestination;
    shouldAutoCreateVendor?: boolean;
    accountingMethod?: AccountingMethod;
} = {}) {
    const policy = createMock<Policy>({
        id: POLICY_ID,
        connections: {
            quickbooksDesktop: {
                config: {
                    shouldAutoCreateVendor,
                    export: {nonReimbursable, accountingMethod},
                },
            },
        },
    });

    return getAccountingIntegrationData(CONST.POLICY.CONNECTIONS.NAME.QBD, POLICY_ID, mockTranslate, EXISTING_CONNECTIONS, {policy});
}

describe('QBD subscribed settings', () => {
    describe('default vendor', () => {
        it('subscribes to the bill default vendor only once auto-create is on', () => {
            // Given company cards exporting as a vendor bill with auto-create on, which is when the row is shown
            // When the Accounting page reads what the Export row covers
            const withAutoCreate = getIntegrationData({nonReimbursable: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL, shouldAutoCreateVendor: true});

            // Then both the toggle and the vendor it reveals are covered
            expect(withAutoCreate?.subscribedExportSettings ?? []).toContain(CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR);
            expect(withAutoCreate?.subscribedExportSettings ?? []).toContain(CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR);

            // And with auto-create off the vendor row is hidden, so its error must not reach the Export row
            const withoutAutoCreate = getIntegrationData({nonReimbursable: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.VENDOR_BILL});
            expect(withoutAutoCreate?.subscribedExportSettings ?? []).toContain(CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR);
            expect(withoutAutoCreate?.subscribedExportSettings ?? []).not.toContain(CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR);
        });

        it('leaves the vendor settings out on the credit card path', () => {
            // Given company cards exporting as a credit card, where neither row is reachable
            // When the Accounting page reads what the Export row covers
            const subscribedExportSettings = getIntegrationData({nonReimbursable: CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD})?.subscribedExportSettings ?? [];

            // Then a failed save cannot strand a dot the app has no page to clear it from
            expect(subscribedExportSettings).not.toContain(CONST.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR);
            expect(subscribedExportSettings).not.toContain(CONST.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR);
        });
    });

    describe('currency conversion fee account', () => {
        it('subscribes to the fee account only while out-of-pocket expenses export on payment', () => {
            // Given a workspace exporting on cash, which is the only time the Advanced row is shown
            // When the Accounting page reads what the Advanced row covers
            const cash = getIntegrationData({accountingMethod: COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH});

            // Then the fee account is covered
            expect(cash?.subscribedAdvancedSettings ?? []).toContain(CONST.QUICKBOOKS_DESKTOP_CONFIG.FX_EXPENSE_ACCOUNT);

            // And on accrual the row is hidden, so its error must not strand a dot on the Accounting page
            const accrual = getIntegrationData({accountingMethod: COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL});
            expect(accrual?.subscribedAdvancedSettings ?? []).not.toContain(CONST.QUICKBOOKS_DESKTOP_CONFIG.FX_EXPENSE_ACCOUNT);
        });

        it('treats an unset accounting method as cash, matching the Advanced page', () => {
            // Given a workspace that has never picked a method
            // When the Accounting page reads what the Advanced row covers
            const subscribedAdvancedSettings = getIntegrationData()?.subscribedAdvancedSettings ?? [];

            // Then the fee account is covered, because the row defaults to shown
            expect(subscribedAdvancedSettings).toContain(CONST.QUICKBOOKS_DESKTOP_CONFIG.FX_EXPENSE_ACCOUNT);
        });
    });
});

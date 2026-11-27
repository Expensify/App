import type {LocaleContextProps} from '@components/LocaleContextProvider';

import Navigation from '@navigation/Navigation';

import {getAccountingIntegrationData} from '@pages/workspace/accounting/utils';

import CONST from '@src/CONST';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import createMock from '../../../../../utils/createMock';

const POLICY_ID = 'policy123';

const EXISTING_CONNECTIONS = {sageIntacct: false, qbd: false, certinia: false, rillet: false, dualEntry: false, campfire: false};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Translation parameters are required by the production callback signature; this stub intentionally returns only the key.
const mockTranslate: LocaleContextProps['translate'] = <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>): string => path;

function getDigitsIntegrationData() {
    const policy = createMock<Policy>({id: POLICY_ID, outputCurrency: CONST.CURRENCY.USD});
    return getAccountingIntegrationData(CONST.POLICY.CONNECTIONS.NAME.DIGITS, POLICY_ID, mockTranslate, EXISTING_CONNECTIONS, {policy});
}

describe('Digits Advanced row', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('opens the Digits Advanced page', () => {
        // Given a workspace connected to Digits
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        const integrationData = getDigitsIntegrationData();

        // When the admin presses the Advanced row on the Connections page
        integrationData?.onAdvancedPagePress();

        // Then the Advanced page opens
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_DIGITS_ADVANCED.getRoute(POLICY_ID));
    });

    it('covers every setting on the Advanced page', () => {
        // Given a workspace connected to Digits
        // When the Connections page reads which settings the Advanced row covers
        const integrationData = getDigitsIntegrationData();

        // Then each setting the Advanced page saves is covered, so a pending change or a failed update on any of them shows on the Advanced row
        expect(integrationData?.subscribedAdvancedSettings).toEqual([
            CONST.DIGITS_CONFIG.ACCOUNTING_METHOD,
            CONST.DIGITS_CONFIG.AUTO_SYNC,
            CONST.DIGITS_CONFIG.SYNC_REIMBURSED_REPORTS,
            CONST.DIGITS_CONFIG.BILL_PAYMENT_ACCOUNT_ID,
            CONST.DIGITS_CONFIG.SYNC_EXPENSIFY_CARD_SETTLEMENTS,
            CONST.DIGITS_CONFIG.SETTLEMENTS_BANK_ACCOUNT_ID,
            CONST.DIGITS_CONFIG.SYNC_TRAVEL_BILLING_SETTLEMENTS,
            CONST.DIGITS_CONFIG.TRAVEL_BILLING_SETTLEMENTS_BANK_ACCOUNT_ID,
            CONST.DIGITS_CONFIG.TRAVEL_BILLING_PAYABLE_ACCOUNT_ID,
        ]);
    });
});

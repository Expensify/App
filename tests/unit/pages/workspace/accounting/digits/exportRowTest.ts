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

describe('Digits Export row', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('opens the Digits Export page', () => {
        // Given a workspace connected to Digits
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        const integrationData = getDigitsIntegrationData();

        // When the admin presses the Export row on the Connections page
        integrationData?.onExportPagePress();

        // Then the Export page opens
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_DIGITS_EXPORT.getRoute(POLICY_ID));
    });

    it('covers every setting on the Export page', () => {
        // Given a workspace connected to Digits
        // When the Connections page reads which settings the Export row covers
        const integrationData = getDigitsIntegrationData();

        // Then each setting the Export page saves is covered, so a pending change or a failed update on any of them shows on the Export row
        expect(integrationData?.subscribedExportSettings).toEqual([
            CONST.DIGITS_CONFIG.EXPORTER,
            CONST.DIGITS_CONFIG.EXPORT_DATE,
            CONST.DIGITS_CONFIG.REIMBURSABLE,
            CONST.DIGITS_CONFIG.NON_REIMBURSABLE,
            CONST.DIGITS_CONFIG.DEFAULT_VENDORID,
            CONST.DIGITS_CONFIG.CREDIT_CARD_ACCOUNT_ID,
        ]);
    });
});

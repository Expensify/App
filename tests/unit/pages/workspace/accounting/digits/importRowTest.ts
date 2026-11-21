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

describe('Digits Import row', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('opens the Digits Import page', () => {
        // Given a workspace connected to Digits
        const navigateSpy = jest.spyOn(Navigation, 'navigate').mockImplementation(() => {});
        const integrationData = getDigitsIntegrationData();

        // When the admin presses the Import row on the Connections page
        integrationData?.onImportPagePress();

        // Then the Import page opens, so the row is no longer a dead end
        expect(navigateSpy).toHaveBeenCalledWith(ROUTES.POLICY_ACCOUNTING_DIGITS_IMPORT.getRoute(POLICY_ID));
    });

    it('covers both toggles on the Import page', () => {
        // Given a workspace connected to Digits
        // When the Connections page reads which settings the Import row covers
        const integrationData = getDigitsIntegrationData();

        // Then both toggles are covered, so a pending change or a failed update on either one shows on the Import row
        expect(integrationData?.subscribedImportSettings).toEqual([
            CONST.DIGITS_CONFIG.ENABLE_NEW_CATEGORIES,
            `${CONST.DIGITS_CONFIG.FIELD_MAPPING_PREFIX}${CONST.DIGITS_FIELD.DEPARTMENTS}`,
        ]);
    });
});

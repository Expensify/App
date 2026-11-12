import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {getAccountingIntegrationData} from '@pages/workspace/accounting/utils';

import CONST from '@src/CONST';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import type {Policy} from '@src/types/onyx';

import createMock from '../../../../../utils/createMock';

const POLICY_ID = 'policy123';

const EXISTING_CONNECTIONS = {sageIntacct: false, qbd: false, certinia: false, rillet: false, dualEntry: false, campfire: false};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Translation parameters are required by the production callback signature; this stub intentionally returns only the key.
const mockTranslate: LocaleContextProps['translate'] = <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>): string => path;

function getDigitsIntegrationData(outputCurrency: string) {
    const policy = createMock<Policy>({id: POLICY_ID, outputCurrency});
    return getAccountingIntegrationData(CONST.POLICY.CONNECTIONS.NAME.DIGITS, POLICY_ID, mockTranslate, EXISTING_CONNECTIONS, {policy});
}

describe('Digits connect prerequisite', () => {
    it('flags a workspace outside USD as not ready to connect', () => {
        // Given a workspace in EUR, which Digits can't connect to
        // When the Connections page asks whether Digits can replace the current integration
        const integrationData = getDigitsIntegrationData(CONST.CURRENCY.EUR);

        // Then it can't yet, so starting Digits asks for the currency change before anything is disconnected
        expect(integrationData?.hasUnmetConnectPrerequisite).toBe(true);
    });

    it('lets a USD workspace go through the usual replace prompt', () => {
        // Given a workspace in USD, which Digits supports
        // When the Connections page asks whether Digits can replace the current integration
        const integrationData = getDigitsIntegrationData(CONST.CURRENCY.USD);

        // Then nothing blocks it, so the admin is asked to replace the current integration as with any other connector
        expect(integrationData?.hasUnmetConnectPrerequisite).toBe(false);
    });
});

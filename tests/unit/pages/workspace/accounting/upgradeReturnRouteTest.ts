import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {getAccountingIntegrationData} from '@pages/workspace/accounting/utils';

import CONST from '@src/CONST';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import createMock from '../../../../utils/createMock';

const POLICY_ID = 'policy123';

const EXISTING_CONNECTIONS = {sageIntacct: false, qbd: false, certinia: false, rillet: false, dualEntry: false, campfire: false};

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Translation parameters are required by the production callback signature; this stub intentionally returns only the key.
const mockTranslate: LocaleContextProps['translate'] = <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>): string => path;

const policy = createMock<Policy>({id: POLICY_ID});

describe('Return route after the workspace upgrade', () => {
    it('keeps the Certinia sandbox choice', () => {
        // Given the admin picked "Connect to sandbox" for Certinia on a workspace that needs an upgrade first
        // When the upgrade finishes and sends the admin back
        const integrationData = getAccountingIntegrationData(CONST.POLICY.CONNECTIONS.NAME.CERTINIA, POLICY_ID, mockTranslate, EXISTING_CONNECTIONS, {policy, isSandbox: true});

        // Then the setup resumes on the sandbox installer instead of the production one
        expect(integrationData?.workspaceUpgradeNavigationDetails?.backToAfterWorkspaceUpgradeRoute).toBe(
            ROUTES.POLICY_ACCOUNTING_CERTINIA_PREREQUISITES.getRoute(POLICY_ID, CONST.CERTINIA_PREREQUISITES.PAGE_NAME.INSTALL_BUNDLE, true),
        );
    });

    it('offers reusable Certinia connections for a production connect', () => {
        // Given the admin picked "Connect" for Certinia and another workspace already has a Certinia connection
        // When the upgrade finishes and sends the admin back
        const integrationData = getAccountingIntegrationData(
            CONST.POLICY.CONNECTIONS.NAME.CERTINIA,
            POLICY_ID,
            mockTranslate,
            {...EXISTING_CONNECTIONS, certinia: true},
            {policy, isSandbox: false},
        );

        // Then the admin can reuse that connection or create a new one, as the Certinia flow does without an upgrade
        expect(integrationData?.workspaceUpgradeNavigationDetails?.backToAfterWorkspaceUpgradeRoute).toBe(ROUTES.POLICY_ACCOUNTING_CERTINIA_EXISTING_CONNECTIONS.getRoute(POLICY_ID));
    });

    it('keeps the Intuit Enterprise Suite sandbox choice', () => {
        // Given the admin picked "Connect to sandbox" for Intuit Enterprise Suite on a workspace that needs an upgrade first
        // When the upgrade finishes and sends the admin back
        const integrationData = getAccountingIntegrationData(CONST.POLICY.CONNECTIONS.NAME.QBO, POLICY_ID, mockTranslate, EXISTING_CONNECTIONS, {
            policy,
            isIntuitEnterpriseSuiteOverride: true,
            isSandbox: true,
        });

        // Then the Connections page restarts the setup with the sandbox choice, so the admin isn't asked again
        expect(integrationData?.workspaceUpgradeNavigationDetails?.backToAfterWorkspaceUpgradeRoute).toBe(
            ROUTES.WORKSPACE_CONNECTIONS.getRoute(POLICY_ID, CONST.POLICY.CONNECTIONS.NAME.QBO, undefined, undefined, true, undefined, true),
        );
    });
});

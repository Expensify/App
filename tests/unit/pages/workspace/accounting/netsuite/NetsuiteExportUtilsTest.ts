import {getNonReimbursableNetSuiteExportDestinations, isNetSuiteRestConnection} from '@pages/workspace/accounting/netsuite/utils';

import CONST from '@src/CONST';
import type {NetSuiteConnection, NetSuiteConnectionConfig} from '@src/types/onyx/Policy';

describe('NetSuite export utils', () => {
    it('treats oauth2 config as a REST connection', () => {
        const config = {authType: CONST.NETSUITE_CONFIG.AUTH_TYPE.OAUTH2} as NetSuiteConnectionConfig;
        expect(isNetSuiteRestConnection(config)).toBe(true);
    });

    it('treats oauth2 on connection root config as a REST connection', () => {
        const connection = {config: {authType: CONST.NETSUITE_CONFIG.AUTH_TYPE.OAUTH2}} as NetSuiteConnection;
        expect(isNetSuiteRestConnection({} as NetSuiteConnectionConfig, connection)).toBe(true);
    });

    it('omits credit card charges from non-reimbursable destinations on SOAP connections', () => {
        const destinations = getNonReimbursableNetSuiteExportDestinations({} as NetSuiteConnectionConfig);
        expect(destinations).not.toContain(CONST.NETSUITE_EXPORT_DESTINATION.CREDIT_CARD_CHARGE);
        expect(destinations).toContain(CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL);
    });

    it('includes credit card charges first for REST connections', () => {
        const config = {authType: CONST.NETSUITE_CONFIG.AUTH_TYPE.OAUTH2} as NetSuiteConnectionConfig;
        const destinations = getNonReimbursableNetSuiteExportDestinations(config);
        expect(destinations.at(0)).toBe(CONST.NETSUITE_EXPORT_DESTINATION.CREDIT_CARD_CHARGE);
    });

    it('includes credit card charges when oauth2 is only on connection root config', () => {
        const connection = {config: {authType: CONST.NETSUITE_CONFIG.AUTH_TYPE.OAUTH2}} as NetSuiteConnection;
        const destinations = getNonReimbursableNetSuiteExportDestinations({} as NetSuiteConnectionConfig, connection);
        expect(destinations).toContain(CONST.NETSUITE_EXPORT_DESTINATION.CREDIT_CARD_CHARGE);
    });
});

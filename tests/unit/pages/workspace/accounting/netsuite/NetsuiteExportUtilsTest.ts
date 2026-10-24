import {getNonReimbursableNetSuiteExportDestinations, isNetSuiteRestConnection} from '@pages/workspace/accounting/netsuite/utils';

import CONST from '@src/CONST';

describe('NetSuite export utils', () => {
    it('treats oauth2 config as a REST connection', () => {
        // Given a settings config from an OAuth2 REST connection
        const config = {authType: CONST.NETSUITE_CONFIG.AUTH_TYPE.OAUTH2};

        // When the connection is checked for REST authentication
        const result = isNetSuiteRestConnection(config);

        // Then it is recognized as REST because OAuth2 connections only support credit card charges
        expect(result).toBe(true);
    });

    it('treats oauth2 on connection root config as a REST connection', () => {
        // Given a connection whose OAuth2 auth type lives on the root config instead of the settings config
        const connection = {config: {authType: CONST.NETSUITE_CONFIG.AUTH_TYPE.OAUTH2}};

        // When the connection is checked for REST authentication
        const result = isNetSuiteRestConnection({}, connection);

        // Then it is recognized as REST because some connections store the auth type outside the settings config
        expect(result).toBe(true);
    });

    it('omits credit card charges from non-reimbursable destinations on SOAP connections', () => {
        // Given a SOAP connection whose settings config has no OAuth2 auth type
        const destinations = getNonReimbursableNetSuiteExportDestinations({});

        // When the non-reimbursable export destinations are listed
        // Then credit card charges are excluded because SOAP connections cannot export them, while vendor bills remain available
        expect(destinations).not.toContain(CONST.NETSUITE_EXPORT_DESTINATION.CREDIT_CARD_CHARGE);
        expect(destinations).toContain(CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL);
    });

    it('includes credit card charges first for REST connections', () => {
        // Given an OAuth2 REST connection
        const config = {authType: CONST.NETSUITE_CONFIG.AUTH_TYPE.OAUTH2};

        // When the non-reimbursable export destinations are listed
        const destinations = getNonReimbursableNetSuiteExportDestinations(config);

        // Then credit card charges are offered first so company card expenses default to the REST-only export type
        expect(destinations.at(0)).toBe(CONST.NETSUITE_EXPORT_DESTINATION.CREDIT_CARD_CHARGE);
    });

    it('includes credit card charges when oauth2 is only on connection root config', () => {
        // Given a connection whose OAuth2 auth type lives on the root config instead of the settings config
        const connection = {config: {authType: CONST.NETSUITE_CONFIG.AUTH_TYPE.OAUTH2}};

        // When the non-reimbursable export destinations are listed
        const destinations = getNonReimbursableNetSuiteExportDestinations({}, connection);

        // Then credit card charges are included because the connection is still REST
        expect(destinations).toContain(CONST.NETSUITE_EXPORT_DESTINATION.CREDIT_CARD_CHARGE);
    });
});

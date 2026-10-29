import {buildSubstitutionsMap} from '@src/components/Search/SearchRouter/buildSubstitutionsMap';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';

/* eslint-disable @typescript-eslint/naming-convention */
// we need "dirty" object key names in these tests
import type {OnyxCollection} from 'react-native-onyx';

import createMock from '../../utils/createMock';
import {formatPhoneNumber, translateLocal} from '../../utils/TestHelper';

jest.mock('@libs/ReportUtils', () => {
    return {
        parseReportRouteParams: jest.fn(() => ({})),
        // The `getReportName` method is quite complex, and we don't need to test it, we just want to test the logic around generating substitutionsMap
        getReportName(reportNameInformation: {report: OnyxTypes.Report}) {
            return reportNameInformation.report?.reportName;
        },
    };
});

const personalDetailsMock = {
    12345: {
        accountID: 12345,
        firstName: 'John',
        displayName: 'John Doe',
        login: 'johndoe@example.com',
    },
    78901: {
        accountID: 78901,
        firstName: 'Jane',
        displayName: 'Jane Doe',
        login: 'janedoe@example.com',
    },
} as OnyxTypes.PersonalDetailsList;

const reportsMock = {
    [`${ONYXKEYS.COLLECTION.REPORT}rep123`]: {
        reportID: 'rep123',
        reportName: 'Report 1',
    },
    [`${ONYXKEYS.COLLECTION.REPORT}rep456`]: {
        reportID: 'rep456',
        reportName: 'Report 2',
    },
} as OnyxCollection<OnyxTypes.Report>;

const taxRatesMock = {
    TAX_1: ['id_TAX_1'],
} as Record<string, string[]>;

const cardListMock = createMock<OnyxTypes.CardList>({
    '11223344': {
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        bank: 'vcf',
        lastFourPAN: '1234',
    },
    '10203040': {
        state: CONST.EXPENSIFY_CARD.STATE.OPEN,
        bank: CONST.EXPENSIFY_CARD.BANK,
        lastFourPAN: '1234',
    },
});

const cardFeedMock: CardFeedWithNumber = `${CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT} 1001`;
const cardFeedsMock: OnyxCollection<OnyxTypes.CardFeeds> = {
    sharedNVP_private_domain_member_1234: createMock<OnyxTypes.CardFeeds>({
        settings: {
            companyCards: {
                [cardFeedMock]: {},
            },
            oAuthAccountDetails: {
                [cardFeedMock]: {accountList: ['CREDIT CARD...1234'], credentials: 'xxxxx', expiration: 1730998958},
            },
        },
    }),
};

const policiesMock = createMock<OnyxCollection<OnyxTypes.Policy>>({
    [`${ONYXKEYS.COLLECTION.POLICY}policyA`]: {
        id: 'policyA',
        name: 'Test Workspace',
    },
    [`${ONYXKEYS.COLLECTION.POLICY}policyB`]: {
        id: 'policyB',
        name: 'Test Workspace',
    },
});

describe('buildSubstitutionsMap should return correct substitutions map', () => {
    test('when there were no substitutions', () => {
        const userQuery = 'foo bar';

        const result = buildSubstitutionsMap(userQuery, personalDetailsMock, reportsMock, taxRatesMock, {}, cardFeedsMock, {}, 12345, translateLocal, formatPhoneNumber, {});

        expect(result).toStrictEqual({});
    });
    test('when query has a single substitution', () => {
        const userQuery = 'foo from:12345';

        const result = buildSubstitutionsMap(userQuery, personalDetailsMock, reportsMock, taxRatesMock, {}, cardFeedsMock, {}, 11111, translateLocal, formatPhoneNumber, {});

        expect(result).toStrictEqual({
            'from:John Doe': '12345',
        });
    });

    test('when query has multiple substitutions of different types', () => {
        const userQuery = 'from:78901,12345 to:nonExistingGuy@mail.com cardID:11223344 in:rep123 taxRate:id_TAX_1 groupBy:cards feed:"1234_oauth.americanexpressfdx.com 1001"';

        const result = buildSubstitutionsMap(userQuery, personalDetailsMock, reportsMock, taxRatesMock, cardListMock, cardFeedsMock, {}, 11111, translateLocal, formatPhoneNumber, {});

        expect(result).toStrictEqual({
            'from:Jane Doe': '78901',
            'from:John Doe': '12345',
            'in:Report 1': 'rep123',
            'cardID:Visa • 1234': '11223344',
            'taxRate:TAX_1': 'id_TAX_1',
            'feed:American Express': '1234_oauth.americanexpressfdx.com 1001',
        });
    });

    test('when query has a substitution for the current user', () => {
        const userQuery = 'from:12345';

        const result = buildSubstitutionsMap(userQuery, personalDetailsMock, reportsMock, taxRatesMock, cardListMock, cardFeedsMock, {}, 12345, translateLocal, formatPhoneNumber, {});

        expect(result).toStrictEqual({
            'from:me': '12345',
        });
    });

    test('when query has duplicate workspaces with same display name, build indexed substitution keys', () => {
        const userQuery = 'policyID:policyA,policyB';

        const result = buildSubstitutionsMap(
            userQuery,
            personalDetailsMock,
            reportsMock,
            taxRatesMock,
            cardListMock,
            cardFeedsMock,
            policiesMock,
            12345,
            translateLocal,
            formatPhoneNumber,
            {},
        );

        expect(result).toStrictEqual({
            'policyID:Test Workspace': 'policyA',
            'policyID:Test Workspace:1': 'policyB',
        });
    });
});

/* eslint-disable @typescript-eslint/naming-convention */
// we need "dirty" object key names in these tests
import type {OnyxCollection} from 'react-native-onyx';
import {buildSubstitutionsMap} from '@src/components/Search/SearchRouter/buildSubstitutionsMap';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

jest.mock('@libs/CardUtils', () => {
    return {
        getCardDescription(cardID: number) {
            return cardID;
        },
    };
});

jest.mock('@libs/ReportUtils', () => {
    return {
        parseReportRouteParams: jest.fn(() => ({})),
        // The `getReportName` method is quite complex, and we don't need to test it, we just want to test the logic around generating subsitutionsMap
        getReportName(report: OnyxTypes.Report) {
            return report.reportName;
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

describe('buildSubstitutionsMap should return correct substitutions map', () => {
    test('when there were no substitutions', () => {
        const userQuery = 'foo bar';

        const result = buildSubstitutionsMap(userQuery, personalDetailsMock, reportsMock, taxRatesMock);

        expect(result).toStrictEqual({});
    });
    test('when query has a single substitution', () => {
        const userQuery = 'foo from:12345';

        const result = buildSubstitutionsMap(userQuery, personalDetailsMock, reportsMock, taxRatesMock);

        expect(result).toStrictEqual({
            'from:John Doe': '12345',
        });
    });

    test('when query has multiple substitutions of different types', () => {
        const userQuery = 'from:78901,12345 to:nonExistingGuy@mail.com cardID:11223344 in:rep123 taxRate:id_TAX_1';

        const result = buildSubstitutionsMap(userQuery, personalDetailsMock, reportsMock, taxRatesMock);

        expect(result).toStrictEqual({
            'from:Jane Doe': '78901',
            'from:John Doe': '12345',
            'in:Report 1': 'rep123',
            'cardID:11223344': '11223344',
            'taxRate:TAX_1': 'id_TAX_1',
        });
    });
});

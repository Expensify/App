import {act, render} from '@testing-library/react-native';

import {applyCompanyCardColumnMappings} from '@libs/actions/ImportSpreadsheet';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';

import CompanyCardsImportedPage from '@pages/workspace/companyCards/addNew/CompanyCardsImportedPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {AddNewCompanyCardFeed, CardFeeds} from '@src/types/onyx';
import type ImportedSpreadsheet from '@src/types/onyx/ImportedSpreadsheet';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/actions/ImportSpreadsheet', () => ({
    ...jest.requireActual<Record<string, unknown>>('@libs/actions/ImportSpreadsheet'),
    applyCompanyCardColumnMappings: jest.fn(),
}));

jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/ImportSpreadsheetColumns', () => () => null);
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@hooks/useCloseImportPage', () => ({
    __esModule: true,
    default: () => ({setIsClosing: jest.fn()}),
}));
jest.mock('@hooks/useImportSpreadsheetConfirmModal', () => ({
    __esModule: true,
    default: () => jest.fn(),
}));

const POLICY_ID = 'policy123';
const DOMAIN_ACCOUNT_ID = 777;
const FEED = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CSV}1`;

// "Notes" is not a header any role is detected from, so `merchant` can only come from the saved layout's index
const SPREADSHEET_DATA = [
    ['Card', '1234'],
    ['Date', '2024-01-15'],
    ['Notes', 'Coffee Shop'],
];
const SAVED_COLUMN_MAPPINGS = {merchant: '2'};

const mockApplyCompanyCardColumnMappings = jest.mocked(applyCompanyCardColumnMappings);

type CompanyCardsImportedPageScreenProps = PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_IMPORTED>;

const route: CompanyCardsImportedPageScreenProps['route'] = {
    key: 'workspace-company-cards-imported',
    name: SCREENS.WORKSPACE.COMPANY_CARDS_IMPORTED,
    params: {policyID: POLICY_ID},
};
// The screen does not read navigation; this inert test double only satisfies the navigator-provided prop.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const navigation = {} as CompanyCardsImportedPageScreenProps['navigation'];

/** The roles the page offers, which is what it hands to the mapping helper. */
function getExpectedRoleValues(): string[] {
    return [
        CONST.CSV_IMPORT_COLUMNS.IGNORE,
        CONST.CSV_IMPORT_COLUMNS.CARD_NUMBER,
        CONST.CSV_IMPORT_COLUMNS.CARD_NAME,
        CONST.CSV_IMPORT_COLUMNS.POSTED_DATE,
        CONST.CSV_IMPORT_COLUMNS.MERCHANT,
        CONST.CSV_IMPORT_COLUMNS.AMOUNT,
        CONST.CSV_IMPORT_COLUMNS.CURRENCY,
        CONST.CSV_IMPORT_COLUMNS.ORIGINAL_TRANSACTION_DATE,
        CONST.CSV_IMPORT_COLUMNS.ORIGINAL_AMOUNT,
        CONST.CSV_IMPORT_COLUMNS.ORIGINAL_CURRENCY,
        CONST.CSV_IMPORT_COLUMNS.COMMENT,
        CONST.CSV_IMPORT_COLUMNS.CATEGORY,
        CONST.CSV_IMPORT_COLUMNS.TAG,
        CONST.CSV_IMPORT_COLUMNS.EXTERNAL_ID,
    ];
}

describe('CompanyCardsImportedPage', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdatesWithAct();
    });

    it('applies the saved column mappings when the card feeds arrive after the spreadsheet', async () => {
        const spreadsheet: ImportedSpreadsheet = {
            data: SPREADSHEET_DATA,
            columns: {},
            containsHeader: true,
            isImportingMultiLevelTags: false,
            isImportingIndependentMultiLevelTags: false,
            isGLAdjacent: false,
        };
        const addNewCard: AddNewCompanyCardFeed = {
            currentStep: CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS,
            isEditing: false,
            data: {
                // The page never reads the provider, so any of them satisfies the type here
                feedType: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                cardTitle: '',
                selectedBank: null,
                selectedFeedType: CONST.COMPANY_CARDS.FEED_TYPE.CUSTOM,
                selectedAmexCustomFeed: CONST.COMPANY_CARDS.AMEX_CUSTOM_FEED.CORPORATE,
                domainAccountID: DOMAIN_ACCOUNT_ID,
                layoutType: FEED,
            },
        };

        await Onyx.multiSet({
            [ONYXKEYS.IMPORTED_SPREADSHEET]: spreadsheet,
            [ONYXKEYS.ADD_NEW_COMPANY_CARD]: addNewCard,
        });
        await waitForBatchedUpdatesWithAct();

        render(
            <CompanyCardsImportedPage
                route={route}
                navigation={navigation}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // The feeds have not loaded yet, so there is no saved layout to restore from
        expect(mockApplyCompanyCardColumnMappings).toHaveBeenLastCalledWith(SPREADSHEET_DATA, undefined, getExpectedRoleValues());

        const cardFeeds = {
            settings: {
                companyCards: {
                    [FEED]: {uploadLayoutSettings: {columnMappings: SAVED_COLUMN_MAPPINGS}},
                },
            },
        } as CardFeeds;

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${DOMAIN_ACCOUNT_ID}`, cardFeeds);
        });
        await waitForBatchedUpdatesWithAct();

        // Once the layout arrives the mapping is redone with it, so `merchant` is still restored from its saved index
        expect(mockApplyCompanyCardColumnMappings).toHaveBeenLastCalledWith(SPREADSHEET_DATA, SAVED_COLUMN_MAPPINGS, getExpectedRoleValues());
    });
});

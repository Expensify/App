import lodashSortBy from 'lodash/sortBy';
import type {OnyxCollection} from 'react-native-onyx';
import type IllustrationsType from '@styles/theme/illustrations/types';
// eslint-disable-next-line no-restricted-imports
import type * as Illustrations from '@src/components/Icon/Illustrations';
import CONST from '@src/CONST';
import type {CombinedCardFeeds} from '@src/hooks/useCardFeeds';
import IntlStore from '@src/languages/IntlStore';
import {
    filterAllInactiveCards,
    filterCardsByNonExpensify,
    filterInactiveCards,
    filterOutPersonalCards,
    flattenWorkspaceCardsList,
    formatCardExpiration,
    getAllCardsForWorkspace,
    getAssignedCardSortKey,
    getBankCardDetailsImage,
    getBankName,
    getCardDescription,
    getCardFeedIcon,
    getCardFeedWithDomainID,
    getCardsByCardholderName,
    getCompanyCardDescription,
    getCompanyCardFeed,
    getCompanyFeeds,
    getCustomOrFormattedFeedName,
    getFeedType,
    getFilteredCardList,
    getMonthFromExpirationDateString,
    getOriginalCompanyFeeds,
    getPlaidInstitutionIconUrl,
    getPlaidInstitutionId,
    getSelectedFeed,
    getYearFromExpirationDateString,
    hasIssuedExpensifyCard,
    hasOnlyOneCardToAssign,
    isCustomFeed as isCustomFeedCardUtils,
    isExpensifyCard,
    isExpensifyCardFullySetUp,
    lastFourNumbersFromCardName,
    maskCardNumber,
    sortCardsByCardholderName,
    splitCardFeedWithDomainID,
    splitMaskedCardNumber,
} from '@src/libs/CardUtils';
import type {Card, CardFeeds, CardList, CompanyCardFeed, CompanyCardFeedWithDomainID, ExpensifyCardSettings, PersonalDetailsList, Policy, WorkspaceCardsList} from '@src/types/onyx';
import type {CardFeedWithDomainID, CardFeedWithNumber, CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import type IconAsset from '@src/types/utils/IconAsset';
import {localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const shortDate = '0924';
const shortDateSlashed = '09/24';
const shortDateHyphen = '09-24';
const longDate = '092024';
const longDateSlashed = '09/2024';
const longDateHyphen = '09-2024';
const expectedMonth = '09';
const expectedYear = '2024';

const directFeedBanks = [
    CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT,
    CONST.COMPANY_CARD.FEED_BANK_NAME.BANK_OF_AMERICA,
    CONST.COMPANY_CARD.FEED_BANK_NAME.BREX,
    CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
    CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
    CONST.COMPANY_CARD.FEED_BANK_NAME.CITIBANK,
    CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE,
    CONST.COMPANY_CARD.FEED_BANK_NAME.WELLS_FARGO,
];

const companyCardsCustomFeedSettings = {
    [CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD]: {
        pending: false,
    },
    [CONST.COMPANY_CARD.FEED_BANK_NAME.VISA]: {
        liabilityType: 'personal',
    },
    [CONST.EXPENSIFY_CARD.BANK]: {
        liabilityType: 'personal',
    },
};
const companyCardsCustomFeedSettingsWithNumbers = {
    [`${CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD}1`]: {
        pending: true,
    },
    [`${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}1`]: {
        liabilityType: 'personal',
    },
};
const companyCardsCustomVisaFeedSettingsWithNumbers = {
    [`${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}1`]: {
        pending: false,
    },
    [`${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}3`]: {
        pending: false,
    },
};

const companyCardsDirectFeedSettings = {
    [CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE]: {
        liabilityType: 'personal',
    },
    [CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE]: {
        liabilityType: 'personal',
    },
};
const companyCardsSettingsWithoutExpensifyBank = {
    [CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD]: {
        pending: false,
    },
    [CONST.COMPANY_CARD.FEED_BANK_NAME.VISA]: {
        liabilityType: 'personal',
    },
    ...companyCardsDirectFeedSettings,
};

const companyCardsSettingsWithPendingRemovedFeeds = {
    [CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD]: {
        pending: true,
    },
    [CONST.COMPANY_CARD.FEED_BANK_NAME.VISA]: {
        pending: false,
    },
    [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX]: {
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    },
};

const oAuthAccountDetails = {
    [CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE]: {
        accountList: ['CREDIT CARD...6607', 'CREDIT CARD...5501'],
        credentials: 'xxxxx',
        expiration: 1730998958,
    },
    [CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE]: {
        accountList: ['CREDIT CARD...1233', 'CREDIT CARD...5678', 'CREDIT CARD...4444', 'CREDIT CARD...3333', 'CREDIT CARD...7788'],
        credentials: 'xxxxx',
        expiration: 1730998959,
    },
};

const directFeedCardsSingleList: WorkspaceCardsList = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '21570652': {
        accountID: 18439984,
        bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
        cardID: 21570652,
        cardName: 'CREDIT CARD...5501',
        domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
        fraud: 'none',
        lastFourPAN: '5501',
        lastScrape: '',
        lastUpdated: '',
        lastScrapeResult: 200,
        scrapeMinDate: '2024-08-27',
        state: 3,
    },
};

const directFeedCardsMultipleList: WorkspaceCardsList = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '21570655': {
        accountID: 18439984,
        bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
        cardID: 21570655,
        cardName: 'CREDIT CARD...5678',
        domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
        fraud: 'none',
        lastFourPAN: '5678',
        lastScrape: '',
        lastUpdated: '',
        lastScrapeResult: 200,
        scrapeMinDate: '2024-08-27',
        state: 3,
    },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '21570656': {
        accountID: 18439984,
        bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
        cardID: 21570656,
        cardName: 'CREDIT CARD...4444',
        domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
        fraud: 'none',
        lastFourPAN: '5678',
        lastScrape: '',
        lastUpdated: '',
        lastScrapeResult: 403,
        scrapeMinDate: '2024-08-27',
        state: 3,
    },
};
const customFeedCardsList = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '21310091': {
        accountID: 18439984,
        bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
        cardID: 21310091,
        cardName: '480801XXXXXX2554',
        domainName: 'expensify-policy41314f4dc5ce25af.exfy',
        fraud: 'none',
        lastFourPAN: '2554',
        lastUpdated: '',
        lastScrape: '2024-11-27 11:00:53',
        scrapeMinDate: '2024-10-17',
        state: 3,
    },
    cardList: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '480801XXXXXX2111': 'ENCRYPTED_CARD_NUMBER',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '480801XXXXXX2554': 'ENCRYPTED_CARD_NUMBER',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '480801XXXXXX2566': 'ENCRYPTED_CARD_NUMBER',
    },
} as unknown as WorkspaceCardsList;
const customFeedName = 'Custom feed name';
const unknownFeed = 'ofx.chase.com' as CompanyCardFeed;

const combinedCardFeeds: CombinedCardFeeds = {
    [`${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}#11111111`]: {
        liabilityType: 'personal',
        pending: false,
        domainID: 11111111,
        customFeedName: 'Custom feed name',
        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
    },
    [`${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}#12345`]: {
        liabilityType: 'personal',
        pending: false,
        domainID: 12345,
        customFeedName: 'Custom feed name 2',
        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
    },
    [`${CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD}#11111111`]: {
        pending: true,
        domainID: 11111111,
        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD,
    },
    [`${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#22222222`]: {
        liabilityType: 'personal',
        domainID: 22222222,
        accountList: ['CREDIT CARD...6607', 'CREDIT CARD...5501'],
        credentials: 'xxxxx',
        expiration: 1730998958,
        pending: false,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
    },
    [`${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#12345`]: {
        liabilityType: 'personal',
        domainID: 12345,
        accountList: ['CREDIT CARD...6607', 'CREDIT CARD...5501'],
        credentials: 'xxxxx',
        expiration: 1730998958,
        pending: false,
        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
    },
    [`${CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE}#11111111`]: {
        liabilityType: 'personal',
        domainID: 11111111,
        accountList: ['CREDIT CARD...1233', 'CREDIT CARD...5678', 'CREDIT CARD...4444', 'CREDIT CARD...3333', 'CREDIT CARD...7788'],
        credentials: 'xxxxx',
        expiration: 1730998959,
        pending: false,
        feed: CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
    },
};

const combinedCardFeedsWithExpensifyCard: CombinedCardFeeds = {
    ...combinedCardFeeds,
    [`${CONST.EXPENSIFY_CARD.BANK}#11111111`]: {
        domainID: 11111111,
        pending: false,
        feed: CONST.EXPENSIFY_CARD.BANK,
    },
};

const policyWithCardsEnabled = {
    areExpensifyCardsEnabled: true,
} as unknown as Policy;

const policyWithCardsDisabled = {
    areExpensifyCardsEnabled: false,
} as unknown as Policy;

const cardSettingsWithPaymentBankAccountID = {
    paymentBankAccountID: '12345',
} as unknown as ExpensifyCardSettings;

const cardSettingsWithoutPaymentBankAccountID = {
    paymentBankAccountID: undefined,
} as unknown as ExpensifyCardSettings;

const cardFeedsCollection: OnyxCollection<CardFeeds> = {
    // Policy with both custom and direct feeds
    FAKE_ID_1: {
        settings: {
            companyCardNicknames: {
                [CONST.COMPANY_CARD.FEED_BANK_NAME.VISA]: customFeedName,
            },
            companyCards: {...companyCardsCustomFeedSettings, ...companyCardsDirectFeedSettings},
            oAuthAccountDetails,
        },
    },
    // Policy with pending and removed feeds
    FAKE_ID_2: {
        settings: {
            companyCards: companyCardsSettingsWithPendingRemovedFeeds,
        },
    },
    // Policy with unknown feed
    FAKE_ID_7: {
        settings: {
            companyCardNicknames: {
                [unknownFeed]: '',
            },
        },
    },
};

/* eslint-disable @typescript-eslint/naming-convention */
const allCardsList = {
    [`cards_11111111_${CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE}`]: directFeedCardsMultipleList,
    [`cards_11111111_${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}1`]: customFeedCardsList,
    [`cards_22222222_${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}`]: directFeedCardsSingleList,
    [`cards_11111111_${CONST.EXPENSIFY_CARD.BANK}`]: {
        '21570657': {
            accountID: 18439984,
            bank: CONST.EXPENSIFY_CARD.BANK,
            cardID: 21570657,
            cardName: 'CREDIT CARD...5644',
            domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
            fraud: 'none',
            lastFourPAN: '',
            lastScrape: '',
            lastUpdated: '',
            state: 2,
        },
    },
    [`cards_10101_${CONST.EXPENSIFY_CARD.BANK}`]: {
        '21570657': {
            accountID: 18439984,
            bank: CONST.EXPENSIFY_CARD.BANK,
            cardID: 21570657,
            cardName: 'CREDIT CARD...5644',
            domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
            fraud: 'none',
            lastFourPAN: '',
            lastScrape: '',
            lastUpdated: '',
            state: 2,
        },
    },
} as OnyxCollection<WorkspaceCardsList>;

const mockIcon = (iconName: string): IconAsset => iconName as IconAsset;

const mockIllustrations = {
    EmptyStateBackgroundImage: 'EmptyStateBackgroundImage',
    ExampleCheckES: 'ExampleCheckES',
    ExampleCheckEN: 'ExampleCheckEN',
    WorkspaceProfile: 'WorkspaceProfile',
    ExpensifyApprovedLogo: 'ExpensifyApprovedLogo',
    GenericCompanyCard: 'GenericCompanyCard',
    GenericCSVCompanyCardLarge: 'GenericCSVCompanyCardLarge',
    GenericCompanyCardLarge: 'GenericCompanyCardLarge',
};
type CompanyCardFeedIconsMock = Parameters<typeof getCardFeedIcon>[2];
type CompanyCardBankIconsMock = Parameters<typeof getBankCardDetailsImage>[2];

const mockCompanyCardFeedIcons: CompanyCardFeedIconsMock = {
    VisaCompanyCardDetailLarge: mockIcon('VisaCompanyCardDetailLarge'),
    AmexCardCompanyCardDetailLarge: mockIcon('AmexCardCompanyCardDetailLarge'),
    MasterCardCompanyCardDetailLarge: mockIcon('MasterCardCompanyCardDetailLarge'),
    BankOfAmericaCompanyCardDetailLarge: mockIcon('BankOfAmericaCompanyCardDetailLarge'),
    CapitalOneCompanyCardDetailLarge: mockIcon('CapitalOneCompanyCardDetailLarge'),
    ChaseCompanyCardDetailLarge: mockIcon('ChaseCompanyCardDetailLarge'),
    CitibankCompanyCardDetailLarge: mockIcon('CitibankCompanyCardDetailLarge'),
    WellsFargoCompanyCardDetailLarge: mockIcon('WellsFargoCompanyCardDetailLarge'),
    BrexCompanyCardDetailLarge: mockIcon('BrexCompanyCardDetailLarge'),
    StripeCompanyCardDetailLarge: mockIcon('StripeCompanyCardDetailLarge'),
    PlaidCompanyCardDetailLarge: mockIcon('PlaidCompanyCardDetailLarge'),
};
const mockCompanyCardBankIcons: CompanyCardBankIconsMock = {
    AmexCardCompanyCardDetail: mockIcon('AmexCardCompanyCardDetail'),
    BankOfAmericaCompanyCardDetail: mockIcon('BankOfAmericaCompanyCardDetail'),
    CapitalOneCompanyCardDetail: mockIcon('CapitalOneCompanyCardDetail'),
    ChaseCompanyCardDetail: mockIcon('ChaseCompanyCardDetail'),
    CitibankCompanyCardDetail: mockIcon('CitibankCompanyCardDetail'),
    WellsFargoCompanyCardDetail: mockIcon('WellsFargoCompanyCardDetail'),
    BrexCompanyCardDetail: mockIcon('BrexCompanyCardDetail'),
    StripeCompanyCardDetail: mockIcon('StripeCompanyCardDetail'),
    MasterCardCompanyCardDetail: mockIcon('MasterCardCompanyCardDetail'),
    VisaCompanyCardDetail: mockIcon('VisaCompanyCardDetail'),
    PlaidCompanyCardDetail: mockIcon('PlaidCompanyCardDetail'),
};

jest.mock('@src/components/Icon/Illustrations', () => require('../../__mocks__/Illustrations') as typeof Illustrations);

describe('CardUtils', () => {
    describe('Expiration date formatting', () => {
        it('Should format expirationDate month and year to MM/YYYY', () => {
            expect(getMonthFromExpirationDateString(longDateSlashed)).toBe(expectedMonth);
            expect(getYearFromExpirationDateString(longDateSlashed)).toBe(expectedYear);
        });

        it('Should format expirationDate month and year to MM-YYYY', () => {
            expect(getMonthFromExpirationDateString(longDateHyphen)).toBe(expectedMonth);
            expect(getYearFromExpirationDateString(longDateHyphen)).toBe(expectedYear);
        });

        it('Should format expirationDate month and year to MMYYYY', () => {
            expect(getMonthFromExpirationDateString(longDate)).toBe(expectedMonth);
            expect(getYearFromExpirationDateString(longDate)).toBe(expectedYear);
        });

        it('Should format expirationDate month and year to MM/YY', () => {
            expect(getMonthFromExpirationDateString(shortDateSlashed)).toBe(expectedMonth);
            expect(getYearFromExpirationDateString(shortDateSlashed)).toBe(expectedYear);
        });

        it('Should format expirationDate month and year to MM-YY', () => {
            expect(getMonthFromExpirationDateString(shortDateHyphen)).toBe(expectedMonth);
            expect(getYearFromExpirationDateString(shortDateHyphen)).toBe(expectedYear);
        });

        it('Should format expirationDate month and year to MMYY', () => {
            expect(getMonthFromExpirationDateString(shortDate)).toBe(expectedMonth);
            expect(getYearFromExpirationDateString(shortDate)).toBe(expectedYear);
        });

        it('Should format to MM/YYYY given MM/YY', () => {
            expect(formatCardExpiration(shortDateSlashed)).toBe(longDateSlashed);
            expect(formatCardExpiration(shortDateSlashed)).toBe(longDateSlashed);
        });

        it('Should format to  MM/YYYY given MMYY', () => {
            expect(formatCardExpiration(shortDate)).toBe(longDateSlashed);
            expect(formatCardExpiration(shortDate)).toBe(longDateSlashed);
        });
    });

    describe('isCustomFeed', () => {
        it('Should return true for the custom visa feed with no number', () => {
            const customFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
            const isCustomFeed = isCustomFeedCardUtils(customFeed);
            expect(isCustomFeed).toBe(true);
        });

        it('Should return true for the custom visa feed with a number', () => {
            const customFeed = `${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}1` as CompanyCardFeedWithNumber;
            const isCustomFeed = isCustomFeedCardUtils(customFeed);
            expect(isCustomFeed).toBe(true);
        });

        it('Should return true for the custom mastercard feed with no number', () => {
            const customFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD;
            const isCustomFeed = isCustomFeedCardUtils(customFeed);
            expect(isCustomFeed).toBe(true);
        });

        it('Should return true for the custom mastercard feed with a number', () => {
            const customFeed = `${CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD}3` as CompanyCardFeedWithNumber;
            const isCustomFeed = isCustomFeedCardUtils(customFeed);
            expect(isCustomFeed).toBe(true);
        });

        it('Should return true for the custom amex feed with no number', () => {
            const customFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX;
            const isCustomFeed = isCustomFeedCardUtils(customFeed);
            expect(isCustomFeed).toBe(true);
        });

        it('Should return true for the custom amex feed with a number', () => {
            const customFeed = `${CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX}2` as CompanyCardFeedWithNumber;
            const isCustomFeed = isCustomFeedCardUtils(customFeed);
            expect(isCustomFeed).toBe(true);
        });

        test.each(directFeedBanks)('Should return false for the direct feed %s', (directFeed) => {
            const isCustomFeed = isCustomFeedCardUtils(directFeed);
            expect(isCustomFeed).toBe(false);
        });
    });

    describe('getOriginalCompanyFeeds', () => {
        it('Should return both custom and direct feeds with filtered out "Expensify Card" bank', () => {
            const companyFeeds = getOriginalCompanyFeeds(cardFeedsCollection.FAKE_ID_1);
            expect(companyFeeds).toStrictEqual(companyCardsSettingsWithoutExpensifyBank);
        });

        it('Should return only feeds that are not pending/removed', () => {
            const companyFeeds = getOriginalCompanyFeeds(cardFeedsCollection.FAKE_ID_2);
            expect(Object.keys(companyFeeds).length).toStrictEqual(1);
        });

        it('Should return empty object if undefined is passed', () => {
            const companyFeeds = getOriginalCompanyFeeds(undefined);
            expect(companyFeeds).toStrictEqual({});
        });
    });

    describe('getCompanyFeeds', () => {
        it('Should filter out Expensify Card bank by default', () => {
            const companyFeeds = getCompanyFeeds(combinedCardFeedsWithExpensifyCard);
            const feedKeys = Object.keys(companyFeeds);
            expect(feedKeys).not.toContain(`${CONST.EXPENSIFY_CARD.BANK}#11111111`);
        });

        it('Should filter out pending feeds when shouldFilterOutPendingFeeds is true', () => {
            const companyFeeds = getCompanyFeeds(combinedCardFeeds, false, true);
            const feedKeys = Object.keys(companyFeeds);
            expect(feedKeys).not.toContain(`${CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD}#11111111`);
        });

        it('Should filter out removed feeds when shouldFilterOutRemovedFeeds is true', () => {
            const companyFeeds = getCompanyFeeds(combinedCardFeeds, true, false);
            const feedKeys = Object.keys(companyFeeds);
            expect(feedKeys).not.toContain(`${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#22222222`);
        });

        it('Should return empty object if undefined is passed', () => {
            const companyFeeds = getCompanyFeeds(undefined);
            expect(companyFeeds).toStrictEqual({});
        });
    });

    describe('getSelectedFeed', () => {
        it('Should return last selected custom feed', () => {
            const lastSelectedCustomFeed: CompanyCardFeedWithDomainID = `${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}#12345`;
            const selectedFeed = getSelectedFeed(lastSelectedCustomFeed, combinedCardFeeds);
            expect(selectedFeed).toBe(lastSelectedCustomFeed);
        });

        it('Should return last selected direct feed', () => {
            const lastSelectedDirectFeed: CompanyCardFeedWithDomainID = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#12345`;
            const selectedFeed = getSelectedFeed(lastSelectedDirectFeed, combinedCardFeeds);
            expect(selectedFeed).toBe(lastSelectedDirectFeed);
        });

        it('Should return the first available feed if lastSelectedFeed is undefined', () => {
            const lastSelectedFeed = undefined;
            const selectedFeed = getSelectedFeed(lastSelectedFeed, combinedCardFeeds);
            expect(selectedFeed).toBe(`${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}#11111111`);
        });

        it('Should return undefined if lastSelectedFeed is undefined and there is no card feeds', () => {
            const lastSelectedFeed = undefined;
            const cardFeeds = undefined;
            const selectedFeed = getSelectedFeed(lastSelectedFeed, cardFeeds);
            expect(selectedFeed).toBe(undefined);
        });
    });

    describe('getCustomOrFormattedFeedName', () => {
        beforeAll(() => {
            IntlStore.load(CONST.LOCALES.EN);
            return waitForBatchedUpdates();
        });
        it('Should return custom name if exists', () => {
            const feed = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
            const feedName = getCustomOrFormattedFeedName(translateLocal, feed, customFeedName);
            expect(feedName).toBe(customFeedName);
        });

        it('Should return formatted name if there is no custom name', () => {
            const feed = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
            const customName = undefined;
            const feedName = getCustomOrFormattedFeedName(translateLocal, feed, customName);
            expect(feedName).toBe('Visa cards');
        });

        it('Should return undefined if no feed provided', () => {
            const feed = undefined;
            const feedName = getCustomOrFormattedFeedName(translateLocal, feed);
            expect(feedName).toBe(undefined);
        });

        it('Should return feed key name for unknown feed', () => {
            const companyCardNickname = cardFeedsCollection.FAKE_ID_7?.settings?.companyCardNicknames?.[unknownFeed];
            const feedName = getCustomOrFormattedFeedName(translateLocal, unknownFeed, companyCardNickname);
            expect(feedName).toBe(unknownFeed);
        });
    });

    describe('lastFourNumbersFromCardName', () => {
        it('Should return last 4 numbers from the card name', () => {
            const lastFour = lastFourNumbersFromCardName('Business Card Cash - 3001');
            expect(lastFour).toBe('3001');
        });

        it('Should return empty string if card number does not have space', () => {
            const lastFour = lastFourNumbersFromCardName('480801XXXXXX2554');
            expect(lastFour).toBe('');
        });

        it('Should return empty string if card number does not have number in the end with dash', () => {
            const lastFour = lastFourNumbersFromCardName('Business Card Cash - Business');
            expect(lastFour).toBe('');
        });
    });

    describe('maskCardNumber', () => {
        it("Should return the card number divided into chunks of 4, with 'X' replaced by '•' if it's provided in the '480801XXXXXX2554' format", () => {
            const cardNumber = '480801XXXXXX2554';
            const maskedCardNumber = maskCardNumber(cardNumber, CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD);
            expect(maskedCardNumber).toBe('4808 01•• •••• 2554');
        });

        it('Should return card number without changes if it has empty space', () => {
            const cardNumber = 'CREDIT CARD...6607';
            const maskedCardNumber = maskCardNumber(cardNumber, CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE);
            expect(maskedCardNumber).toBe(cardNumber);
        });

        it("Should return the Amex direct feed card number divided into 4/6/5 chunks, with 'X' replaced by '•' if it's provided in '211944XXXXX6557' format", () => {
            const cardNumber = '211944XXXXX6557';
            const maskedCardNumber = maskCardNumber(cardNumber, CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT);
            expect(maskedCardNumber).toBe('2119 44•••• •6557');
        });

        it("Should return the Amex custom feed card number divided into 4/6/5 chunks, with 'X' replaced by '•' if it's provided in '211944XXXXX6557' format", () => {
            const cardNumber = '211944XXXXX6557';
            const maskedCardNumber = maskCardNumber(cardNumber, CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX);
            expect(maskedCardNumber).toBe('2119 44•••• •6557');
        });

        it('Should return masked card number even if undefined feed was provided', () => {
            const cardNumber = '480801XXXXXX2554';
            const maskedCardNumber = maskCardNumber(cardNumber, undefined);
            expect(maskedCardNumber).toBe('4808 01•• •••• 2554');
        });

        it('Should return empty string if invalid card name was provided', () => {
            const maskedCardNumber = maskCardNumber('', CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD);
            expect(maskedCardNumber).toBe('');
        });

        it('Should return card name without last 4 numbers', () => {
            const maskedCardNumber = maskCardNumber('Business Card Cash - 3001', undefined);
            expect(maskedCardNumber).toBe('Business Card Cash');
        });

        it('Should return CSV import card display name without 4-character formatting', () => {
            const maskedCardNumber = maskCardNumber('Checking', CONST.COMPANY_CARD.FEED_BANK_NAME.UPLOAD);
            expect(maskedCardNumber).toBe('Checking');
        });

        it('Should return CSV import card display name as-is for longer names', () => {
            const maskedCardNumber = maskCardNumber('JustChecking', CONST.COMPANY_CARD.FEED_BANK_NAME.UPLOAD);
            expect(maskedCardNumber).toBe('JustChecking');
        });
    });

    describe('getCardFeedName', () => {
        it('Should return a valid name if a valid feed was provided', () => {
            const feed = 'vcf';
            const feedName = getBankName(feed);
            expect(feedName).toBe('Visa');
        });

        it('Should return a valid name if an OldDot feed variation was provided', () => {
            const feed = `${CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT} 2003` as CompanyCardFeed;
            const feedName = getBankName(feed);
            expect(feedName).toBe('American Express');
        });

        it('Should return a valid name if a CSV imported feed variation was provided', () => {
            const feed = `cards_10101_${CONST.COMPANY_CARD.FEED_BANK_NAME.CSV}666` as CompanyCardFeed;
            const feedName = getBankName(feed);
            expect(feedName).toBe('CSV');
        });

        it('Should return empty string if invalid feed was provided', () => {
            const feed = 'vvcf' as CompanyCardFeed;
            const feedName = getBankName(feed);
            expect(feedName).toBe('');
        });

        it('Should return empty string if feed is not provided (instead of TypeError crashing the app)', () => {
            const feed = undefined;
            const feedName = getBankName(feed as unknown as CompanyCardFeed);
            expect(feedName).toBe('');
        });
    });

    describe('getCardFeedIcon', () => {
        it('Should return a valid illustration if a valid feed was provided', () => {
            const feed = 'vcf';
            const illustration = getCardFeedIcon(feed, mockIllustrations as unknown as IllustrationsType, mockCompanyCardFeedIcons);
            expect(illustration).toBe('VisaCompanyCardDetailLarge');
        });

        it('Should return a valid illustration if an OldDot feed variation was provided', () => {
            const feed = 'oauth.americanexpressfdx.com 2003' as CompanyCardFeed;
            const illustration = getCardFeedIcon(feed, mockIllustrations as unknown as IllustrationsType, mockCompanyCardFeedIcons);
            expect(illustration).toBe('AmexCardCompanyCardDetailLarge');
        });

        it('Should return a valid illustration if a CSV imported feed variation was provided', () => {
            const feed = 'cards_2267989_ccupload666' as CompanyCardFeed;
            const illustration = getCardFeedIcon(feed, mockIllustrations as unknown as IllustrationsType, mockCompanyCardFeedIcons);
            expect(illustration).toBe('GenericCSVCompanyCardLarge');
        });

        it('Should return valid illustration if a non-matching feed was provided', () => {
            const feed = '666' as CompanyCardFeed;
            const illustration = getCardFeedIcon(feed, mockIllustrations as unknown as IllustrationsType, mockCompanyCardFeedIcons);
            expect(illustration).toBe('GenericCompanyCardLarge');
        });
    });

    describe('getBankCardDetailsImage', () => {
        it('Should return a valid illustration if a valid bank name was provided', () => {
            const bank = 'American Express';
            const illustration = getBankCardDetailsImage(bank, mockIllustrations as unknown as IllustrationsType, mockCompanyCardBankIcons);
            expect(illustration).toBe('AmexCardCompanyCardDetail');
        });

        it('Should return a valid illustration if Other bank name was provided', () => {
            const bank = 'Other';
            const illustration = getBankCardDetailsImage(bank, mockIllustrations as unknown as IllustrationsType, mockCompanyCardBankIcons);
            expect(illustration).toBe('GenericCompanyCard');
        });
    });

    describe('getFilteredCardList', () => {
        it('Should return filtered custom feed cards list as UnassignedCard array', () => {
            const cardsList = getFilteredCardList(customFeedCardsList, undefined, undefined);
            expect(cardsList).toStrictEqual([
                {cardName: '480801XXXXXX2111', cardID: 'ENCRYPTED_CARD_NUMBER'},
                {cardName: '480801XXXXXX2566', cardID: 'ENCRYPTED_CARD_NUMBER'},
            ]);
        });

        it('Should return filtered direct feed cards list with a single card (cardName equals cardID)', () => {
            const cardsList = getFilteredCardList(directFeedCardsSingleList, oAuthAccountDetails[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE].accountList, undefined);
            expect(cardsList).toStrictEqual([{cardName: 'CREDIT CARD...6607', cardID: 'CREDIT CARD...6607'}]);
        });

        it('Should return filtered direct feed cards list with multiple cards (cardName equals cardID)', () => {
            const cardsList = getFilteredCardList(directFeedCardsMultipleList, oAuthAccountDetails[CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE].accountList, undefined);
            expect(cardsList).toStrictEqual([
                {cardName: 'CREDIT CARD...1233', cardID: 'CREDIT CARD...1233'},
                {cardName: 'CREDIT CARD...3333', cardID: 'CREDIT CARD...3333'},
                {cardName: 'CREDIT CARD...7788', cardID: 'CREDIT CARD...7788'},
            ]);
        });

        it('Should return empty array if no data was provided', () => {
            const cardsList = getFilteredCardList(undefined, undefined, undefined);
            expect(cardsList).toStrictEqual([]);
        });

        it('Should handle the case when all cards are already assigned in other workspaces', () => {
            const assignedCard1 = 'CREDIT CARD...5566';
            const assignedCard2 = 'CREDIT CARD...6677';

            const mockAllWorkspaceCards = {
                cards_888888_feed: {
                    '11111': {
                        accountID: 999999,
                        bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                        cardID: 11111,
                        cardName: assignedCard1,
                        domainName: 'other-workspace.exfy',
                        state: 3,
                    },
                    '22222': {
                        accountID: 999999,
                        bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                        cardID: 22222,
                        cardName: assignedCard2,
                        domainName: 'other-workspace.exfy',
                        state: 3,
                    },
                },
            } as unknown as OnyxCollection<WorkspaceCardsList>;

            const customFeedWithAllAssignedCards = {
                cardList: {
                    [assignedCard1]: 'ENCRYPTED_DATA',
                    [assignedCard2]: 'ENCRYPTED_DATA',
                },
            } as unknown as WorkspaceCardsList;
            const filteredCards = getFilteredCardList(customFeedWithAllAssignedCards, undefined, mockAllWorkspaceCards);
            expect(filteredCards).toStrictEqual([]);
        });

        it('Should filter out cards that are already assigned in another workspace (custom feed)', () => {
            const customFeedWorkspaceCardsList = {
                '21310091': {
                    accountID: 18439984,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardID: 21310091,
                    cardName: '480801XXXXXX2554',
                    domainName: 'expensify-policy41314f4dc5ce25af.exfy',
                    fraud: 'none',
                    lastFourPAN: '2554',
                    lastUpdated: '',
                    lastScrape: '2024-11-27 11:00:53',
                    scrapeMinDate: '2024-10-17',
                    state: 3,
                },
                '21310092': {
                    accountID: 18439985,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardID: 21310092,
                    cardName: '480801XXXXXX2666',
                    domainName: 'expensify-policy41314f4dc5ce25af.exfy',
                    fraud: 'none',
                    lastFourPAN: '2666',
                    lastUpdated: '',
                    lastScrape: '2024-11-27 11:00:53',
                    scrapeMinDate: '2024-10-17',
                    state: 3,
                },
                cardList: {
                    '480801XXXXXX2554': 'ENCRYPTED_CARD_NUMBER',
                    '480801XXXXXX2666': 'ENCRYPTED_CARD_NUMBER',
                },
            } as unknown as WorkspaceCardsList;

            const filteredCards = getFilteredCardList(customFeedWorkspaceCardsList, undefined, undefined);
            expect(filteredCards).toStrictEqual([]);
        });

        it('Should filter out cards that are already assigned in another workspace (direct feed)', () => {
            const assignedCard1 = 'CREDIT CARD...3344';
            const assignedCard2 = 'CREDIT CARD...3355';
            const unassignedCard = 'CREDIT CARD...6666';

            const mockAllWorkspaceCards = {
                cards_888888_feed: {
                    '67889': {
                        accountID: 999998,
                        bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
                        cardID: 67889,
                        cardName: assignedCard1,
                        domainName: 'other-workspace.exfy',
                        state: 3,
                    },
                    '67890': {
                        accountID: 999999,
                        bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
                        cardID: 67890,
                        cardName: assignedCard2,
                        domainName: 'other-workspace.exfy',
                        state: 3,
                    },
                },
            } as unknown as OnyxCollection<WorkspaceCardsList>;
            const accountList = [assignedCard1, assignedCard2, unassignedCard];
            const filteredCards = getFilteredCardList(undefined, accountList, mockAllWorkspaceCards);
            expect(filteredCards).toStrictEqual([{cardName: unassignedCard, cardID: unassignedCard}]);
        });
    });

    describe('hasOnlyOneCardToAssign', () => {
        it('should return true when there is exactly one unassigned card', () => {
            const cards = [{cardName: 'VISA ****1234', cardID: 'encrypted_123'}];
            expect(hasOnlyOneCardToAssign(cards)).toBe(true);
        });

        it('should return false when there are multiple unassigned cards', () => {
            const cards = [
                {cardName: 'VISA ****1234', cardID: 'encrypted_123'},
                {cardName: 'VISA ****5678', cardID: 'encrypted_456'},
            ];
            expect(hasOnlyOneCardToAssign(cards)).toBe(false);
        });

        it('should return false when there are no unassigned cards', () => {
            expect(hasOnlyOneCardToAssign([])).toBe(false);
        });
    });

    describe('getFeedType', () => {
        it('should return the feed name with a consecutive number, if there is already a feed with a number', () => {
            const feedType = getFeedType('vcf', companyCardsCustomFeedSettingsWithNumbers as CombinedCardFeeds);
            expect(feedType).toBe('vcf2');
        });

        it('should return the feed name with 1, if there is already a feed without a number', () => {
            const feedType = getFeedType('vcf', companyCardsCustomFeedSettings);
            expect(feedType).toBe('vcf1');
        });

        it('should return the feed name with with the first smallest available number', () => {
            const feedType = getFeedType('vcf', companyCardsCustomVisaFeedSettingsWithNumbers as CombinedCardFeeds);
            expect(feedType).toBe('vcf2');
        });
    });

    describe('flattenCompanyCards', () => {
        it('should return the flattened list of non-Expensify cards related to the provided workspaceAccountID', () => {
            const workspaceAccountID = 11111111;
            const flattenedCardsList = flattenWorkspaceCardsList(allCardsList, workspaceAccountID);
            const {cardList, ...customCards} = customFeedCardsList;
            expect(flattenedCardsList).toStrictEqual({
                ...directFeedCardsMultipleList,
                ...customCards,
            });
        });

        it('should return undefined if not defined cards list was provided', () => {
            const workspaceAccountID = 11111111;
            const flattenedCardsList = flattenWorkspaceCardsList(undefined, workspaceAccountID);
            expect(flattenedCardsList).toBeUndefined();
        });
    });

    describe('hasIssuedExpensifyCard', () => {
        it('should return true when Expensify Card was issued for given workspace', () => {
            const workspaceAccountID = 11111111;
            expect(hasIssuedExpensifyCard(workspaceAccountID, allCardsList)).toBe(true);
        });

        it('should return false when Expensify Card was not issued for given workspace', () => {
            const workspaceAccountID = 11111111;
            expect(hasIssuedExpensifyCard(workspaceAccountID, {})).toBe(false);
        });

        it('should not erroneously return true when workspaceAccountID is 0', () => {
            const workspaceAccountID = 0;
            expect(hasIssuedExpensifyCard(workspaceAccountID, allCardsList)).toBe(false);
        });
    });

    describe('getAllCardsForWorkspace', () => {
        it('should return all cards for a given workspace', () => {
            const workspaceAccountID = 11111111;
            expect(getAllCardsForWorkspace(workspaceAccountID, allCardsList)).toEqual({
                '21310091': {
                    accountID: 18439984,
                    bank: 'vcf',
                    cardID: 21310091,
                    cardName: '480801XXXXXX2554',
                    domainName: 'expensify-policy41314f4dc5ce25af.exfy',
                    fraud: 'none',
                    lastFourPAN: '2554',
                    lastScrape: '2024-11-27 11:00:53',
                    lastUpdated: '',
                    scrapeMinDate: '2024-10-17',
                    state: 3,
                },
                '21570655': {
                    accountID: 18439984,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
                    cardID: 21570655,
                    cardName: 'CREDIT CARD...5678',
                    domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
                    fraud: 'none',
                    lastFourPAN: '5678',
                    lastScrape: '',
                    lastScrapeResult: 200,
                    lastUpdated: '',
                    scrapeMinDate: '2024-08-27',
                    state: 3,
                },
                '21570656': {
                    accountID: 18439984,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
                    cardID: 21570656,
                    cardName: 'CREDIT CARD...4444',
                    domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
                    fraud: 'none',
                    lastFourPAN: '5678',
                    lastScrape: '',
                    lastScrapeResult: 403,
                    lastUpdated: '',
                    scrapeMinDate: '2024-08-27',
                    state: 3,
                },
                '21570657': {
                    accountID: 18439984,
                    bank: CONST.EXPENSIFY_CARD.BANK,
                    cardID: 21570657,
                    cardName: 'CREDIT CARD...5644',
                    domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
                    fraud: 'none',
                    lastFourPAN: '',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 2,
                },
            });
        });
    });

    describe('isExpensifyCardFullySetUp', () => {
        it('should return true when policy has enabled cards and cardSettings has payment bank account ID', () => {
            const result = isExpensifyCardFullySetUp(policyWithCardsEnabled, cardSettingsWithPaymentBankAccountID);
            expect(result).toBe(true);
        });

        it('should return false when policy has disabled cards', () => {
            const result = isExpensifyCardFullySetUp(policyWithCardsDisabled, cardSettingsWithoutPaymentBankAccountID);
            expect(result).toBe(false);
        });

        it('should return false when cardSettings has no payment bank account ID', () => {
            const result = isExpensifyCardFullySetUp(policyWithCardsEnabled, cardSettingsWithoutPaymentBankAccountID);
            expect(result).toBe(false);
        });

        it('should return false when cardSettings is undefined', () => {
            const result = isExpensifyCardFullySetUp(policyWithCardsEnabled, undefined);
            expect(result).toBe(false);
        });

        it('should return false when both policy and cardSettings are undefined', () => {
            const result = isExpensifyCardFullySetUp(undefined, undefined);
            expect(result).toBe(false);
        });
    });

    describe('filterInactiveCards', () => {
        it('should filter out closed, deactivated and suspended cards', () => {
            const activeCards = {card1: {cardID: 1, state: CONST.EXPENSIFY_CARD.STATE.OPEN}};
            const closedCards = {
                card2: {cardID: 2, state: CONST.EXPENSIFY_CARD.STATE.CLOSED},
                card3: {cardID: 3, state: CONST.EXPENSIFY_CARD.STATE.STATE_DEACTIVATED},
                card4: {cardID: 4, state: CONST.EXPENSIFY_CARD.STATE.STATE_SUSPENDED},
            };
            const cardList = {...activeCards, ...closedCards} as unknown as CardList;
            const filteredList = filterInactiveCards(cardList);
            expect(filteredList).toEqual(activeCards);
        });

        it('should return an empty object if undefined card list is passed', () => {
            const cards = filterInactiveCards(undefined);
            expect(cards).toEqual({});
        });
    });

    describe('sortCardsByCardholderName', () => {
        const mockPersonalDetails: PersonalDetailsList = {
            1: {
                accountID: 1,
                login: 'john@example.com',
                displayName: 'John Doe',
                firstName: 'John',
                lastName: 'Doe',
            },
            2: {
                accountID: 2,
                login: 'jane@example.com',
                displayName: 'Jane Smith',
                firstName: 'Jane',
                lastName: 'Smith',
            },
            3: {
                accountID: 3,
                login: 'unknown@example.com',
                // No displayName or firstName/lastName
            },
        };

        const mockCards: WorkspaceCardsList = {
            '1': {
                cardID: 1,
                accountID: 1,
                cardName: 'Card 1',
                bank: CONST.EXPENSIFY_CARD.BANK,
                domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
                fraud: 'none',
                lastFourPAN: '',
                lastScrape: '',
                lastUpdated: '',
                state: 2,
            },
            '2': {
                cardID: 2,
                accountID: 2,
                bank: CONST.EXPENSIFY_CARD.BANK,
                cardName: 'Card 2',
                domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
                fraud: 'none',
                lastFourPAN: '',
                lastScrape: '',
                lastUpdated: '',
                state: 2,
            },
            '3': {
                cardID: 3,
                accountID: 3,
                bank: CONST.EXPENSIFY_CARD.BANK,
                cardName: 'Card 3',
                domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
                fraud: 'none',
                lastFourPAN: '',
                lastScrape: '',
                lastUpdated: '',
                state: 2,
            },
        };

        it('should sort cards by cardholder name in ascending order', () => {
            const policyMembersAccountIDs = [1, 2, 3];
            const cards = getCardsByCardholderName(mockCards, policyMembersAccountIDs);
            const sortedCards = sortCardsByCardholderName(cards, mockPersonalDetails, localeCompare);

            expect(sortedCards).toHaveLength(3);
            expect(sortedCards.at(0)?.cardID).toBe(2);
            expect(sortedCards.at(1)?.cardID).toBe(1);
            expect(sortedCards.at(2)?.cardID).toBe(3);
        });

        it('should filter out cards that are not associated with policy members', () => {
            const policyMembersAccountIDs = [1, 2]; // Exclude accountID 3
            const cards = getCardsByCardholderName(mockCards, policyMembersAccountIDs);
            const sortedCards = sortCardsByCardholderName(cards, mockPersonalDetails, localeCompare);

            expect(sortedCards).toHaveLength(2);
            expect(sortedCards.at(0)?.cardID).toBe(2);
            expect(sortedCards.at(1)?.cardID).toBe(1);
        });

        it('should handle undefined cardsList', () => {
            const policyMembersAccountIDs = [1, 2, 3];
            const cards = getCardsByCardholderName(undefined, policyMembersAccountIDs);
            const sortedCards = sortCardsByCardholderName(cards, mockPersonalDetails, localeCompare);

            expect(sortedCards).toHaveLength(0);
        });

        it('should handle undefined personalDetails', () => {
            const policyMembersAccountIDs = [1, 2, 3];
            const cards = getCardsByCardholderName(mockCards, policyMembersAccountIDs);
            const sortedCards = sortCardsByCardholderName(cards, undefined, localeCompare);

            expect(sortedCards).toHaveLength(3);
            // All cards should be sorted with default names
            expect(sortedCards.at(0)?.cardID).toBe(1);
            expect(sortedCards.at(1)?.cardID).toBe(2);
            expect(sortedCards.at(2)?.cardID).toBe(3);
        });

        it('should handle cards with missing accountID', () => {
            const cardsWithMissingAccountID: WorkspaceCardsList = {
                '1': {
                    cardID: 1,
                    accountID: 1,
                    cardName: 'Card 1',
                    bank: CONST.EXPENSIFY_CARD.BANK,
                    domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
                    fraud: 'none',
                    lastFourPAN: '',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 2,
                },
                '2': {
                    cardID: 2,
                    cardName: 'Card 2',
                    bank: CONST.EXPENSIFY_CARD.BANK,
                    domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
                    fraud: 'none',
                    lastFourPAN: '',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 2,
                },
            };

            const policyMembersAccountIDs = [1, 2];
            const cards = getCardsByCardholderName(cardsWithMissingAccountID, policyMembersAccountIDs);
            const sortedCards = sortCardsByCardholderName(cards, mockPersonalDetails, localeCompare);

            expect(sortedCards).toHaveLength(1);
            expect(sortedCards.at(0)?.cardID).toBe(1);
        });
    });

    describe('getCardDescription', () => {
        it('should return the correct card description for company card', () => {
            const card: Card = {
                accountID: 18439984,
                bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                cardID: 21310091,
                cardName: '480801XXXXXX2554',
                domainName: 'expensify-policy41314f4dc5ce25af.exfy',
                fraud: 'none',
                lastFourPAN: '2554',
                lastUpdated: '',
                lastScrape: '2024-11-27 11:00:53',
                scrapeMinDate: '2024-10-17',
                state: 3,
            };
            const description = getCardDescription(card, translateLocal);
            expect(description).toBe('Visa - 2554');
        });

        it('should return the correct card description for Expensify card', () => {
            const card: Card = {
                accountID: 18439984,
                bank: CONST.EXPENSIFY_CARD.BANK,
                cardID: 21570657,
                cardName: 'CREDIT CARD...5644',
                domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
                fraud: 'none',
                lastFourPAN: '',
                lastScrape: '',
                lastUpdated: '',
                state: 2,
            };
            const description = getCardDescription(card, translateLocal);
            expect(description).toBe(CONST.EXPENSIFY_CARD.BANK);
        });
    });

    describe('isExpensifyCard', () => {
        it('should return true for Expensify Card', () => {
            const card: Card = {
                accountID: 18439984,
                bank: CONST.EXPENSIFY_CARD.BANK,
                cardID: 21570657,
                cardName: 'CREDIT CARD...5644',
                domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
                fraud: 'none',
                lastFourPAN: '',
                lastScrape: '',
                lastUpdated: '',
                state: 2,
            };
            expect(isExpensifyCard(card)).toBe(true);
        });

        it('should return false for non-Expensify Card', () => {
            const card: Card = {
                accountID: 18439984,
                bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                cardID: 21310091,
                cardName: '480801XXXXXX2554',
                domainName: 'expensify-policy41314f4dc5ce25af.exfy',
                fraud: 'none',
                lastFourPAN: '2554',
                lastUpdated: '',
                lastScrape: '2024-11-27 11:00:53',
                scrapeMinDate: '2024-10-17',
                state: 3,
            };
            expect(isExpensifyCard(card)).toBe(false);
        });
    });

    describe('getCompanyCardDescription', () => {
        const cardList: CardList = {
            '21310091': {
                accountID: 18439984,
                bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                cardID: 21310091,
                cardName: '480801XXXXXX2554',
                domainName: 'expensify-policy41314f4dc5ce25af.exfy',
                fraud: 'none',
                lastFourPAN: '2554',
                lastUpdated: '',
                lastScrape: '2024-11-27 11:00:53',
                scrapeMinDate: '2024-10-17',
                state: 3,
            },
            '21570657': {
                accountID: 18439984,
                bank: CONST.EXPENSIFY_CARD.BANK,
                cardID: 21570657,
                cardName: 'CREDIT CARD...5644',
                domainName: 'expensify-policy17f617b9fe23d2f1.exfy',
                fraud: 'none',
                lastFourPAN: '',
                lastScrape: '',
                lastUpdated: '',
                state: 2,
            },
        };
        it('should return the correct description for a company card', () => {
            const description = getCompanyCardDescription('Test', 21310091, cardList);
            expect(description).toBe('480801XXXXXX2554');
        });

        it('should return the correct description for an Expensify card', () => {
            const description = getCompanyCardDescription('Test', 21570657, cardList);
            expect(description).toBe('Test');
        });
    });

    describe('Expensify card sort comparator', () => {
        it('should not change the order of non-Expensify cards', () => {
            const cardList = {
                10: {cardID: 10, bank: 'chase'}, // non-Expensify
                11: {cardID: 11, bank: 'chase'}, // non-Expensify
            } as unknown as CardList;

            const sorted = lodashSortBy(Object.values(cardList), getAssignedCardSortKey);
            expect(sorted.map((r: Card) => r.cardID)).toEqual([10, 11]);
        });

        it('places physical Expensify card before its virtual sibling', () => {
            const cardList = {
                10: {cardID: 10, bank: CONST.EXPENSIFY_CARD.BANK, nameValuePairs: {isVirtual: true}}, // Expensify virtual
                11: {cardID: 11, bank: CONST.EXPENSIFY_CARD.BANK}, // Expensify physical
                99: {cardID: 99, bank: 'chase'}, // non-Expensify
            } as unknown as CardList;

            const sorted = lodashSortBy(Object.values(cardList), getAssignedCardSortKey);
            expect(sorted.map((r: Card) => r.cardID)).toEqual([11, 10, 99]);
        });
    });

    describe('getCompanyCardFeed', () => {
        it('should extract the original feed from a combined feed key', () => {
            const combinedKey: CompanyCardFeedWithDomainID = `${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#22222222`;
            const feed = getCompanyCardFeed(combinedKey);
            expect(feed).toBe(CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE);
        });
    });

    describe('getCardFeedWithDomainID', () => {
        it('should combine feed name domain ID', () => {
            const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
            const domainID = 11111111;
            const combinedKey = getCardFeedWithDomainID(feedName, domainID);
            expect(combinedKey).toBe(`${feedName}${CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}${domainID}`);
        });
    });

    describe('splitCardFeedWithDomainID', () => {
        it('should split the feed name and domain ID', () => {
            const feedName = 'vcf#11111111';

            const splitFeedName = splitCardFeedWithDomainID(feedName);
            if (!splitFeedName) {
                throw new Error('Failed to split feed name');
            }

            expect(splitFeedName.feedName).toBe('vcf');
            expect(splitFeedName.domainID).toBe(11111111);
        });

        it('should return undefined for a feed name without separator', () => {
            const result = splitCardFeedWithDomainID('vcf');
            expect(result).toBeUndefined();
        });

        it('should return undefined for undefined input', () => {
            const result = splitCardFeedWithDomainID(undefined);
            expect(result).toBeUndefined();
        });

        it('should return undefined when domainID is not a number', () => {
            const result = splitCardFeedWithDomainID('vcf#abc' as CardFeedWithDomainID);
            expect(result).toBeUndefined();
        });

        it('should return undefined when there are multiple separators', () => {
            const result = splitCardFeedWithDomainID('vcf#123#456' as CardFeedWithDomainID);
            expect(result).toBeUndefined();
        });

        it('should handle direct feed with domain ID', () => {
            const result = splitCardFeedWithDomainID(`${CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE}#22222222` as CardFeedWithDomainID);
            expect(result).toEqual({feedName: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE, domainID: 22222222});
        });

        it('should handle custom feed with number and domain ID', () => {
            const result = splitCardFeedWithDomainID('vcf1#99999' as CardFeedWithDomainID);
            expect(result).toEqual({feedName: 'vcf1', domainID: 99999});
        });

        it('should handle plaid feed with domain ID', () => {
            const result = splitCardFeedWithDomainID('plaid.ins_129663#12345' as CardFeedWithDomainID);
            expect(result).toEqual({feedName: 'plaid.ins_129663', domainID: 12345});
        });
    });

    describe('getPlaidInstitutionId', () => {
        it('should return institution ID from plaid feed name without domain ID', () => {
            const feedName = 'plaid.ins_123456' as CardFeedWithNumber;
            const institutionId = getPlaidInstitutionId(feedName);
            expect(institutionId).toBe('ins_123456');
        });

        it('should return institution ID from plaid feed name with domain ID', () => {
            const feedName = 'plaid.ins_129663#12345' as CardFeedWithDomainID;
            const institutionId = getPlaidInstitutionId(feedName);
            expect(institutionId).toBe('ins_129663');
        });

        it('should return empty string for non-plaid feed', () => {
            const feedName = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
            const institutionId = getPlaidInstitutionId(feedName);
            expect(institutionId).toBe('');
        });
    });

    describe('getPlaidInstitutionIconUrl', () => {
        it('should return correct icon URL for plaid feed without domain ID', () => {
            const feedName = 'plaid.ins_123456' as CardFeedWithNumber;
            const iconUrl = getPlaidInstitutionIconUrl(feedName);
            expect(iconUrl).toBe(`${CONST.COMPANY_CARD_PLAID}ins_123456.png`);
        });

        it('should return correct icon URL for plaid feed with domain ID', () => {
            const feedName = 'plaid.ins_129663#12345' as CardFeedWithDomainID;
            const iconUrl = getPlaidInstitutionIconUrl(feedName);
            expect(iconUrl).toBe(`${CONST.COMPANY_CARD_PLAID}ins_129663.png`);
        });
    });

    describe('splitMaskedCardNumber', () => {
        it('should split a masked card number correctly', () => {
            const result = splitMaskedCardNumber('1234XXXX5678');
            expect(result.firstDigits).toBe('1234');
            expect(result.lastDigits).toBe('5678');
        });

        it('should handle card numbers with custom mask character', () => {
            const result = splitMaskedCardNumber('1234****5678', '*');
            expect(result.firstDigits).toBe('1234');
            expect(result.lastDigits).toBe('5678');
        });

        it('should handle undefined card number', () => {
            const result = splitMaskedCardNumber(undefined);
            expect(result.firstDigits).toBeUndefined();
            expect(result.lastDigits).toBeUndefined();
        });

        it('should handle card number with only first digits', () => {
            const result = splitMaskedCardNumber('1234XXXX');
            expect(result.firstDigits).toBe('1234');
            expect(result.lastDigits).toBe('');
        });

        it('should handle card number with only last digits', () => {
            const result = splitMaskedCardNumber('XXXX5678');
            expect(result.firstDigits).toBe('');
            expect(result.lastDigits).toBe('5678');
        });
    });

    describe('filterCardsByNonExpensify', () => {
        it('should filter out cards with Expensify bank key in their key', () => {
            const cards: CardList = {
                [`${CONST.EXPENSIFY_CARD.BANK}_card1`]: {
                    cardID: 1,
                    bank: CONST.EXPENSIFY_CARD.BANK,
                    cardName: 'Expensify Card',
                    domainName: 'test.exfy',
                    fraud: 'none',
                    lastFourPAN: '1234',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 3,
                },
                visa_card2: {
                    cardID: 2,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardName: 'Visa Card',
                    domainName: 'test.exfy',
                    fraud: 'none',
                    lastFourPAN: '5678',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 3,
                },
                chase_card3: {
                    cardID: 3,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                    cardName: 'Chase Card',
                    domainName: 'test.exfy',
                    fraud: 'none',
                    lastFourPAN: '9012',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 3,
                },
            } as unknown as CardList;

            const result = filterCardsByNonExpensify(cards);
            const keys = Object.keys(result);
            expect(keys).toHaveLength(2);
            expect(keys).toContain('visa_card2');
            expect(keys).toContain('chase_card3');
            expect(keys).not.toContain(`${CONST.EXPENSIFY_CARD.BANK}_card1`);
        });

        it('should return empty object when all cards are Expensify cards', () => {
            const cards: CardList = {
                [`${CONST.EXPENSIFY_CARD.BANK}_1`]: {
                    cardID: 1,
                    bank: CONST.EXPENSIFY_CARD.BANK,
                    cardName: 'Expensify Card 1',
                    domainName: 'test.exfy',
                    fraud: 'none',
                    lastFourPAN: '1111',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 3,
                },
            } as unknown as CardList;

            const result = filterCardsByNonExpensify(cards);
            expect(Object.keys(result)).toHaveLength(0);
        });

        it('should return empty object when undefined is passed', () => {
            const result = filterCardsByNonExpensify(undefined);
            expect(result).toEqual({});
        });

        it('should return all cards when none are Expensify cards', () => {
            const cards: CardList = {
                visa_1: {
                    cardID: 1,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardName: 'Visa',
                    domainName: 'test.exfy',
                    fraud: 'none',
                    lastFourPAN: '1111',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 3,
                },
                chase_2: {
                    cardID: 2,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
                    cardName: 'Chase',
                    domainName: 'test.exfy',
                    fraud: 'none',
                    lastFourPAN: '2222',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 3,
                },
            } as unknown as CardList;

            const result = filterCardsByNonExpensify(cards);
            expect(Object.keys(result)).toHaveLength(2);
        });
    });

    describe('filterAllInactiveCards', () => {
        it('should filter out closed, deactivated and suspended cards', () => {
            const cards: CardList = {
                '1': {cardID: 1, state: CONST.EXPENSIFY_CARD.STATE.OPEN, bank: 'vcf', cardName: 'a', domainName: '', fraud: 'none', lastFourPAN: '', lastScrape: '', lastUpdated: ''},
                '2': {cardID: 2, state: CONST.EXPENSIFY_CARD.STATE.CLOSED, bank: 'vcf', cardName: 'b', domainName: '', fraud: 'none', lastFourPAN: '', lastScrape: '', lastUpdated: ''},
                '3': {
                    cardID: 3,
                    state: CONST.EXPENSIFY_CARD.STATE.STATE_DEACTIVATED,
                    bank: 'vcf',
                    cardName: 'c',
                    domainName: '',
                    fraud: 'none',
                    lastFourPAN: '',
                    lastScrape: '',
                    lastUpdated: '',
                },
                '4': {
                    cardID: 4,
                    state: CONST.EXPENSIFY_CARD.STATE.STATE_SUSPENDED,
                    bank: 'vcf',
                    cardName: 'd',
                    domainName: '',
                    fraud: 'none',
                    lastFourPAN: '',
                    lastScrape: '',
                    lastUpdated: '',
                },
                '5': {
                    cardID: 5,
                    state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED,
                    bank: 'vcf',
                    cardName: 'e',
                    domainName: '',
                    fraud: 'none',
                    lastFourPAN: '',
                    lastScrape: '',
                    lastUpdated: '',
                },
            } as unknown as CardList;

            const result = filterAllInactiveCards(cards);
            const ids = Object.values(result).map((c) => c.cardID);
            expect(ids).toContain(1);
            expect(ids).toContain(5);
            expect(ids).not.toContain(2);
            expect(ids).not.toContain(3);
            expect(ids).not.toContain(4);
        });

        it('should return empty object when undefined is passed', () => {
            const result = filterAllInactiveCards(undefined);
            expect(result).toEqual({});
        });

        it('should return all cards when none are inactive', () => {
            const cards: CardList = {
                '1': {cardID: 1, state: CONST.EXPENSIFY_CARD.STATE.OPEN, bank: 'vcf', cardName: 'a', domainName: '', fraud: 'none', lastFourPAN: '', lastScrape: '', lastUpdated: ''},
                '2': {
                    cardID: 2,
                    state: CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED,
                    bank: 'vcf',
                    cardName: 'b',
                    domainName: '',
                    fraud: 'none',
                    lastFourPAN: '',
                    lastScrape: '',
                    lastUpdated: '',
                },
            } as unknown as CardList;

            const result = filterAllInactiveCards(cards);
            expect(Object.keys(result)).toHaveLength(2);
        });

        it('should return empty object when all cards are inactive', () => {
            const cards: CardList = {
                '1': {cardID: 1, state: CONST.EXPENSIFY_CARD.STATE.CLOSED, bank: 'vcf', cardName: 'a', domainName: '', fraud: 'none', lastFourPAN: '', lastScrape: '', lastUpdated: ''},
                '2': {
                    cardID: 2,
                    state: CONST.EXPENSIFY_CARD.STATE.STATE_DEACTIVATED,
                    bank: 'vcf',
                    cardName: 'b',
                    domainName: '',
                    fraud: 'none',
                    lastFourPAN: '',
                    lastScrape: '',
                    lastUpdated: '',
                },
            } as unknown as CardList;

            const result = filterAllInactiveCards(cards);
            expect(Object.keys(result)).toHaveLength(0);
        });
    });

    describe('UnassignedCard type through getFilteredCardList', () => {
        describe('Commercial feeds (VCF, MCF, etc.) - cardID is encrypted value', () => {
            it('should return UnassignedCard with cardID being the encrypted value from cardList', () => {
                const workspaceCardsList = {
                    cardList: {
                        '490901XXXXXX1234': 'v12:74E3CA3C4C0FA02F4C754FEN4RYP3ED1',
                        '490901XXXXXX5678': 'v12:74E3CA3C4C0FA02F4C754FEN4RYP3ED2',
                    },
                } as unknown as WorkspaceCardsList;

                const result = getFilteredCardList(workspaceCardsList, undefined, undefined);
                const firstCard = result.at(0);

                expect(result).toHaveLength(2);
                expect(firstCard).toEqual({
                    cardName: '490901XXXXXX1234',
                    cardID: 'v12:74E3CA3C4C0FA02F4C754FEN4RYP3ED1',
                });
                expect(firstCard?.cardName).not.toBe(firstCard?.cardID);
            });

            it('should correctly distinguish cardName from cardID for commercial feeds', () => {
                const workspaceCardsList = {
                    cardList: {
                        'VISA ****1234': 'encrypted_abc123xyz',
                    },
                } as unknown as WorkspaceCardsList;

                const result = getFilteredCardList(workspaceCardsList, undefined, undefined);
                const firstCard = result.at(0);

                expect(firstCard?.cardName).toBe('VISA ****1234');
                expect(firstCard?.cardID).toBe('encrypted_abc123xyz');
                expect(firstCard?.cardName).not.toBe(firstCard?.cardID);
            });
        });

        describe('Direct feeds (Plaid, OAuth) - cardName equals cardID', () => {
            it('should return UnassignedCard with cardID equal to cardName for direct feeds', () => {
                const accountList = ['CREDIT CARD...6607', 'CREDIT CARD...1234'];

                const result = getFilteredCardList(undefined, accountList, undefined);
                const firstCard = result.at(0);

                expect(result).toHaveLength(2);
                expect(firstCard).toEqual({
                    cardName: 'CREDIT CARD...6607',
                    cardID: 'CREDIT CARD...6607',
                });
                expect(firstCard?.cardName).toBe(firstCard?.cardID);
            });

            it('should return cardName equal to cardID for Plaid feeds', () => {
                const accountList = ['Plaid Checking 0000'];

                const result = getFilteredCardList(undefined, accountList, undefined);
                const firstCard = result.at(0);

                expect(firstCard?.cardName).toBe('Plaid Checking 0000');
                expect(firstCard?.cardID).toBe('Plaid Checking 0000');
            });
        });
    });

    describe('filterOutPersonalCards', () => {
        it('should return only cards with a valid fundID', () => {
            const cardList: CardList = {
                '1': {
                    cardID: 1,
                    accountID: 12345,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardName: 'Company Card 1',
                    domainName: '',
                    fraud: 'none',
                    lastFourPAN: '1111',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 3,
                    fundID: '100',
                },
                '2': {
                    cardID: 2,
                    accountID: 12345,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardName: 'Personal Card',
                    domainName: '',
                    fraud: 'none',
                    lastFourPAN: '2222',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 3,
                    // No fundID - personal card
                },
                '3': {
                    cardID: 3,
                    accountID: 12345,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD,
                    cardName: 'Company Card 2',
                    domainName: '',
                    fraud: 'none',
                    lastFourPAN: '3333',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 3,
                    fundID: '200',
                },
            };

            const result = filterOutPersonalCards(cardList);
            const cardIDs = Object.keys(result);

            expect(cardIDs).toHaveLength(2);
            expect(cardIDs).toContain('1');
            expect(cardIDs).toContain('3');
            expect(cardIDs).not.toContain('2');
        });

        it('should filter out cards with fundID of "0"', () => {
            const cardList: CardList = {
                '1': {
                    cardID: 1,
                    accountID: 12345,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardName: 'Card with fundID 0',
                    domainName: '',
                    fraud: 'none',
                    lastFourPAN: '1111',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 3,
                    fundID: '0',
                },
                '2': {
                    cardID: 2,
                    accountID: 12345,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardName: 'Card with valid fundID',
                    domainName: '',
                    fraud: 'none',
                    lastFourPAN: '2222',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 3,
                    fundID: '123',
                },
            };

            const result = filterOutPersonalCards(cardList);
            const cardIDs = Object.keys(result);

            expect(cardIDs).toHaveLength(1);
            expect(cardIDs).toContain('2');
            expect(cardIDs).not.toContain('1');
        });

        it('should return empty object for undefined card list', () => {
            const result = filterOutPersonalCards(undefined);
            expect(result).toEqual({});
        });

        it('should return empty object when no cards have fundID', () => {
            const cardList: CardList = {
                '1': {
                    cardID: 1,
                    accountID: 12345,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
                    cardName: 'Personal Card 1',
                    domainName: '',
                    fraud: 'none',
                    lastFourPAN: '1111',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 3,
                },
                '2': {
                    cardID: 2,
                    accountID: 12345,
                    bank: CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD,
                    cardName: 'Personal Card 2',
                    domainName: '',
                    fraud: 'none',
                    lastFourPAN: '2222',
                    lastScrape: '',
                    lastUpdated: '',
                    state: 3,
                },
            };

            const result = filterOutPersonalCards(cardList);
            expect(Object.keys(result)).toHaveLength(0);
        });

        it('should handle empty card list', () => {
            const result = filterOutPersonalCards({});
            expect(result).toEqual({});
        });
    });
});

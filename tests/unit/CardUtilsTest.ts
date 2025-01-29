import type {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import * as CardUtils from '@src/libs/CardUtils';
import {checkIfFeedConnectionIsBroken, flatAllCardsList} from '@src/libs/CardUtils';
import type * as OnyxTypes from '@src/types/onyx';
import type {CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';

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
        pending: true,
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
const companyCardsCustomFeedSettingsWithoutExpensifyBank = {
    [CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD]: {
        pending: true,
    },
    [CONST.COMPANY_CARD.FEED_BANK_NAME.VISA]: {
        liabilityType: 'personal',
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
        pending: true,
    },
    [CONST.COMPANY_CARD.FEED_BANK_NAME.VISA]: {
        liabilityType: 'personal',
    },
    ...companyCardsDirectFeedSettings,
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

const directFeedCardsSingleList: OnyxTypes.WorkspaceCardsList = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '21570652': {
        accountID: 18439984,
        bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
        cardID: 21570652,
        cardName: 'CREDIT CARD...5501',
        domainName: 'expensify-policya7f617b9fe23d2f1.exfy',
        fraud: 'none',
        lastFourPAN: '5501',
        lastScrape: '',
        lastUpdated: '',
        lastScrapeResult: 200,
        scrapeMinDate: '2024-08-27',
        state: 3,
    },
};
const directFeedCardsMultipleList: OnyxTypes.WorkspaceCardsList = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '21570655': {
        accountID: 18439984,
        bank: CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
        cardID: 21570655,
        cardName: 'CREDIT CARD...5678',
        domainName: 'expensify-policya7f617b9fe23d2f1.exfy',
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
        domainName: 'expensify-policya7f617b9fe23d2f1.exfy',
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
} as unknown as OnyxTypes.WorkspaceCardsList;
const customFeedName = 'Custom feed name';

const cardFeedsCollection: OnyxCollection<OnyxTypes.CardFeeds> = {
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
    // Policy with direct feeds only
    FAKE_ID_2: {
        settings: {
            companyCards: companyCardsDirectFeedSettings,
            oAuthAccountDetails,
        },
    },
    // Policy with custom feeds only
    FAKE_ID_3: {
        settings: {
            companyCards: companyCardsCustomFeedSettings,
        },
    },
    // Policy with custom feeds only, feed names with numbers
    FAKE_ID_4: {
        settings: {
            companyCards: companyCardsCustomFeedSettingsWithNumbers,
        },
    },
    // Policy with several Visa feeds
    FAKE_ID_5: {
        settings: {
            companyCards: companyCardsCustomVisaFeedSettingsWithNumbers,
        },
    },
};

/* eslint-disable @typescript-eslint/naming-convention */
const allCardsList = {
    'cards_11111111_oauth.capitalone.com': directFeedCardsMultipleList,
    cards_11111111_vcf1: customFeedCardsList,
    'cards_22222222_oauth.chase.com': directFeedCardsSingleList,
    'cards_11111111_Expensify Card': {
        '21570657': {
            accountID: 18439984,
            bank: CONST.EXPENSIFY_CARD.BANK,
            cardID: 21570657,
            cardName: 'CREDIT CARD...5644',
            domainName: 'expensify-policya7f617b9fe23d2f1.exfy',
            fraud: 'none',
            lastFourPAN: '',
            lastScrape: '',
            lastUpdated: '',
            state: 2,
        },
    },
} as OnyxCollection<OnyxTypes.WorkspaceCardsList>;
/* eslint-enable @typescript-eslint/naming-convention */

describe('CardUtils', () => {
    describe('Expiration date formatting', () => {
        it('Should format expirationDate month and year to MM/YYYY', () => {
            expect(CardUtils.getMonthFromExpirationDateString(longDateSlashed)).toBe(expectedMonth);
            expect(CardUtils.getYearFromExpirationDateString(longDateSlashed)).toBe(expectedYear);
        });

        it('Should format expirationDate month and year to MM-YYYY', () => {
            expect(CardUtils.getMonthFromExpirationDateString(longDateHyphen)).toBe(expectedMonth);
            expect(CardUtils.getYearFromExpirationDateString(longDateHyphen)).toBe(expectedYear);
        });

        it('Should format expirationDate month and year to MMYYYY', () => {
            expect(CardUtils.getMonthFromExpirationDateString(longDate)).toBe(expectedMonth);
            expect(CardUtils.getYearFromExpirationDateString(longDate)).toBe(expectedYear);
        });

        it('Should format expirationDate month and year to MM/YY', () => {
            expect(CardUtils.getMonthFromExpirationDateString(shortDateSlashed)).toBe(expectedMonth);
            expect(CardUtils.getYearFromExpirationDateString(shortDateSlashed)).toBe(expectedYear);
        });

        it('Should format expirationDate month and year to MM-YY', () => {
            expect(CardUtils.getMonthFromExpirationDateString(shortDateHyphen)).toBe(expectedMonth);
            expect(CardUtils.getYearFromExpirationDateString(shortDateHyphen)).toBe(expectedYear);
        });

        it('Should format expirationDate month and year to MMYY', () => {
            expect(CardUtils.getMonthFromExpirationDateString(shortDate)).toBe(expectedMonth);
            expect(CardUtils.getYearFromExpirationDateString(shortDate)).toBe(expectedYear);
        });

        it('Should format to MM/YYYY given MM/YY', () => {
            expect(CardUtils.formatCardExpiration(shortDateSlashed)).toBe(longDateSlashed);
            expect(CardUtils.formatCardExpiration(shortDateSlashed)).toBe(longDateSlashed);
        });

        it('Should format to  MM/YYYY given MMYY', () => {
            expect(CardUtils.formatCardExpiration(shortDate)).toBe(longDateSlashed);
            expect(CardUtils.formatCardExpiration(shortDate)).toBe(longDateSlashed);
        });
    });

    describe('isCustomFeed', () => {
        it('Should return true for the custom visa feed with no number', () => {
            const customFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
            const isCustomFeed = CardUtils.isCustomFeed(customFeed);
            expect(isCustomFeed).toBe(true);
        });

        it('Should return true for the custom visa feed with a number', () => {
            const customFeed = `${CONST.COMPANY_CARD.FEED_BANK_NAME.VISA}1` as CompanyCardFeedWithNumber;
            const isCustomFeed = CardUtils.isCustomFeed(customFeed);
            expect(isCustomFeed).toBe(true);
        });

        it('Should return true for the custom mastercard feed with no number', () => {
            const customFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD;
            const isCustomFeed = CardUtils.isCustomFeed(customFeed);
            expect(isCustomFeed).toBe(true);
        });

        it('Should return true for the custom mastercard feed with a number', () => {
            const customFeed = `${CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD}3` as CompanyCardFeedWithNumber;
            const isCustomFeed = CardUtils.isCustomFeed(customFeed);
            expect(isCustomFeed).toBe(true);
        });

        it('Should return true for the custom amex feed with no number', () => {
            const customFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX;
            const isCustomFeed = CardUtils.isCustomFeed(customFeed);
            expect(isCustomFeed).toBe(true);
        });

        it('Should return true for the custom amex feed with a number', () => {
            const customFeed = `${CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX}2` as CompanyCardFeedWithNumber;
            const isCustomFeed = CardUtils.isCustomFeed(customFeed);
            expect(isCustomFeed).toBe(true);
        });

        test.each(directFeedBanks)('Should return false for the direct feed %s', (directFeed) => {
            const isCustomFeed = CardUtils.isCustomFeed(directFeed);
            expect(isCustomFeed).toBe(false);
        });
    });

    describe('getCompanyFeeds', () => {
        it('Should return both custom and direct feeds with filtered out "Expensify Card" bank', () => {
            const companyFeeds = CardUtils.getCompanyFeeds(cardFeedsCollection.FAKE_ID_1);
            expect(companyFeeds).toStrictEqual(companyCardsSettingsWithoutExpensifyBank);
        });

        it('Should return direct feeds only since custom feeds are not exist', () => {
            const companyFeeds = CardUtils.getCompanyFeeds(cardFeedsCollection.FAKE_ID_2);
            expect(companyFeeds).toStrictEqual(companyCardsDirectFeedSettings);
        });

        it('Should return custom feeds only with filtered out "Expensify Card" bank since direct feeds are not exist', () => {
            const companyFeeds = CardUtils.getCompanyFeeds(cardFeedsCollection.FAKE_ID_3);
            expect(companyFeeds).toStrictEqual(companyCardsCustomFeedSettingsWithoutExpensifyBank);
        });

        it('Should return empty object if undefined is passed', () => {
            const companyFeeds = CardUtils.getCompanyFeeds(undefined);
            expect(companyFeeds).toStrictEqual({});
        });
    });

    describe('getSelectedFeed', () => {
        it('Should return last selected custom feed', () => {
            const lastSelectedCustomFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
            const selectedFeed = CardUtils.getSelectedFeed(lastSelectedCustomFeed, cardFeedsCollection.FAKE_ID_1);
            expect(selectedFeed).toBe(lastSelectedCustomFeed);
        });

        it('Should return last selected direct feed', () => {
            const lastSelectedDirectFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE;
            const selectedFeed = CardUtils.getSelectedFeed(lastSelectedDirectFeed, cardFeedsCollection.FAKE_ID_1);
            expect(selectedFeed).toBe(lastSelectedDirectFeed);
        });

        it('Should return the first available custom feed if lastSelectedFeed is undefined', () => {
            const lastSelectedFeed = undefined;
            const selectedFeed = CardUtils.getSelectedFeed(lastSelectedFeed, cardFeedsCollection.FAKE_ID_3);
            expect(selectedFeed).toBe(CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD);
        });

        it('Should return the first available direct feed if lastSelectedFeed is undefined', () => {
            const lastSelectedFeed = undefined;
            const selectedFeed = CardUtils.getSelectedFeed(lastSelectedFeed, cardFeedsCollection.FAKE_ID_2);
            expect(selectedFeed).toBe(CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE);
        });

        it('Should return undefined if lastSelectedFeed is undefined and there is no card feeds', () => {
            const lastSelectedFeed = undefined;
            const cardFeeds = undefined;
            const selectedFeed = CardUtils.getSelectedFeed(lastSelectedFeed, cardFeeds);
            expect(selectedFeed).toBe(undefined);
        });
    });

    describe('getCustomOrFormattedFeedName', () => {
        it('Should return custom name if exists', () => {
            const feed = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
            const companyCardNicknames = cardFeedsCollection.FAKE_ID_1?.settings?.companyCardNicknames;
            const feedName = CardUtils.getCustomOrFormattedFeedName(feed, companyCardNicknames);
            expect(feedName).toBe(customFeedName);
        });

        it('Should return formatted name if there is no custom name', () => {
            const feed = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
            const companyCardNicknames = cardFeedsCollection.FAKE_ID_3?.settings?.companyCardNicknames;
            const feedName = CardUtils.getCustomOrFormattedFeedName(feed, companyCardNicknames);
            expect(feedName).toBe('Visa cards');
        });

        it('Should return undefined if no feed provided', () => {
            const feed = undefined;
            const companyCardNicknames = cardFeedsCollection.FAKE_ID_1?.settings?.companyCardNicknames;
            const feedName = CardUtils.getCustomOrFormattedFeedName(feed, companyCardNicknames);
            expect(feedName).toBe(undefined);
        });
    });

    describe('maskCardNumber', () => {
        it("Should return the card number divided into chunks of 4, with 'X' replaced by '•' if it's provided in the '480801XXXXXX2554' format", () => {
            const cardNumber = '480801XXXXXX2554';
            const maskedCardNumber = CardUtils.maskCardNumber(cardNumber, CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD);
            expect(maskedCardNumber).toBe('4808 01•• •••• 2554');
        });

        it('Should return card number without changes if it has empty space', () => {
            const cardNumber = 'CREDIT CARD...6607';
            const maskedCardNumber = CardUtils.maskCardNumber(cardNumber, CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE);
            expect(maskedCardNumber).toBe(cardNumber);
        });

        it("Should return the Amex direct feed card number divided into 4/6/5 chunks, with 'X' replaced by '•' if it's provided in '211944XXXXX6557' format", () => {
            const cardNumber = '211944XXXXX6557';
            const maskedCardNumber = CardUtils.maskCardNumber(cardNumber, CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT);
            expect(maskedCardNumber).toBe('2119 44•••• •6557');
        });

        it("Should return the Amex custom feed card number divided into 4/6/5 chunks, with 'X' replaced by '•' if it's provided in '211944XXXXX6557' format", () => {
            const cardNumber = '211944XXXXX6557';
            const maskedCardNumber = CardUtils.maskCardNumber(cardNumber, CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX);
            expect(maskedCardNumber).toBe('2119 44•••• •6557');
        });

        it('Should return masked card number even if undefined feed was provided', () => {
            const cardNumber = '480801XXXXXX2554';
            const maskedCardNumber = CardUtils.maskCardNumber(cardNumber, undefined);
            expect(maskedCardNumber).toBe('4808 01•• •••• 2554');
        });

        it('Should return empty string if invalid card name was provided', () => {
            const maskedCardNumber = CardUtils.maskCardNumber('', CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD);
            expect(maskedCardNumber).toBe('');
        });
    });

    describe('getCardFeedName', () => {
        it('Should return a valid name if a valid feed was provided', () => {
            const feed = 'vcf';
            const feedName = CardUtils.getBankName(feed);
            expect(feedName).toBe('Visa');
        });

        it('Should return a valid name if an OldDot feed variation was provided', () => {
            const feed = 'oauth.americanexpressfdx.com 2003' as OnyxTypes.CompanyCardFeed;
            const feedName = CardUtils.getBankName(feed);
            expect(feedName).toBe('American Express');
        });

        it('Should return empty string if invalid feed was provided', () => {
            const feed = 'vvcf' as OnyxTypes.CompanyCardFeed;
            const feedName = CardUtils.getBankName(feed);
            expect(feedName).toBe('');
        });
    });

    describe('getFilteredCardList', () => {
        it('Should return filtered custom feed cards list', () => {
            const cardsList = CardUtils.getFilteredCardList(customFeedCardsList, undefined);
            expect(cardsList).toStrictEqual({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '480801XXXXXX2111': 'ENCRYPTED_CARD_NUMBER',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                '480801XXXXXX2566': 'ENCRYPTED_CARD_NUMBER',
            });
        });

        it('Should return filtered direct feed cards list with a single card', () => {
            const cardsList = CardUtils.getFilteredCardList(directFeedCardsSingleList, oAuthAccountDetails[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE]);
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(cardsList).toStrictEqual({'CREDIT CARD...6607': 'CREDIT CARD...6607'});
        });

        it('Should return filtered direct feed cards list with multiple cards', () => {
            const cardsList = CardUtils.getFilteredCardList(directFeedCardsMultipleList, oAuthAccountDetails[CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE]);
            expect(cardsList).toStrictEqual({
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'CREDIT CARD...1233': 'CREDIT CARD...1233',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'CREDIT CARD...3333': 'CREDIT CARD...3333',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'CREDIT CARD...7788': 'CREDIT CARD...7788',
            });
        });

        it('Should return empty object if no data was provided', () => {
            const cardsList = CardUtils.getFilteredCardList(undefined, undefined);
            expect(cardsList).toStrictEqual({});
        });
    });

    describe('getFeedType', () => {
        it('should return the feed name with a consecutive number, if there is already a feed with a number', () => {
            const feedType = CardUtils.getFeedType('vcf', cardFeedsCollection.FAKE_ID_4);
            expect(feedType).toBe('vcf2');
        });

        it('should return the feed name with 1, if there is already a feed without a number', () => {
            const feedType = CardUtils.getFeedType('vcf', cardFeedsCollection.FAKE_ID_3);
            expect(feedType).toBe('vcf1');
        });

        it('should return the feed name with with the first smallest available number', () => {
            const feedType = CardUtils.getFeedType('vcf', cardFeedsCollection.FAKE_ID_5);
            expect(feedType).toBe('vcf2');
        });
    });

    describe('flatAllCardsList', () => {
        it('should return the flattened list of non-Expensify cards related to the provided workspaceAccountID', () => {
            const workspaceAccountID = 11111111;
            const flattenedCardsList = flatAllCardsList(allCardsList, workspaceAccountID);
            const {cardList, ...customCards} = customFeedCardsList;
            expect(flattenedCardsList).toStrictEqual({
                ...directFeedCardsMultipleList,
                ...customCards,
            });
        });

        it('should return undefined if not defined cards list was provided', () => {
            const workspaceAccountID = 11111111;
            const flattenedCardsList = flatAllCardsList(undefined, workspaceAccountID);
            expect(flattenedCardsList).toBeUndefined();
        });
    });

    describe('checkIfFeedConnectionIsBroken', () => {
        it('should return true if at least one of the feed(s) cards has the lastScrapeResult not equal to 200', () => {
            expect(checkIfFeedConnectionIsBroken(directFeedCardsMultipleList)).toBeTruthy();
        });

        it('should return false if all of the feed(s) cards has the lastScrapeResult equal to 200', () => {
            expect(checkIfFeedConnectionIsBroken(directFeedCardsSingleList)).toBeFalsy();
        });

        it('should return false if no feed(s) cards are provided', () => {
            expect(checkIfFeedConnectionIsBroken({})).toBeFalsy();
        });

        it('should not take into consideration cards related to feed which is provided as feedToExclude', () => {
            const cards = {...directFeedCardsMultipleList, ...directFeedCardsSingleList};
            const feedToExclude = CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE;
            expect(checkIfFeedConnectionIsBroken(cards, feedToExclude)).toBeFalsy();
        });
    });
});

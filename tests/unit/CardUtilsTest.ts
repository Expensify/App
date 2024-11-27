import type {OnyxCollection} from 'react-native-onyx';
import CONST from '@src/CONST';
import * as CardUtils from '@src/libs/CardUtils';
import type * as OnyxTypes from '@src/types/onyx';
import type {CompanyFeeds} from '@src/types/onyx/CardFeeds';

const shortDate = '0924';
const shortDateSlashed = '09/24';
const shortDateHyphen = '09-24';
const longDate = '092024';
const longDateSlashed = '09/2024';
const longDateHyphen = '09-2024';
const expectedMonth = '09';
const expectedYear = '2024';

const customFeeds = {
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
const customFeedsWithoutExpensifyBank = {
    [CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD]: {
        pending: true,
    },
    [CONST.COMPANY_CARD.FEED_BANK_NAME.VISA]: {
        liabilityType: 'personal',
    },
};
const directFeeds = {
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
const allFeeds: CompanyFeeds = {...customFeeds, ...directFeeds};
const customFeedName = 'Custom feed name';

const cardFeedsCollection: OnyxCollection<OnyxTypes.CardFeeds> = {
    FAKE_ID_1: {
        settings: {
            companyCardNicknames: {
                [CONST.COMPANY_CARD.FEED_BANK_NAME.VISA]: customFeedName,
            },
            companyCards: customFeeds,
            oAuthAccountDetails: directFeeds,
        },
    },
    FAKE_ID_2: {
        settings: {
            oAuthAccountDetails: directFeeds,
        },
    },
    FAKE_ID_3: {
        settings: {
            companyCards: customFeeds,
        },
    },
};

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
        it('Should return true for the custom feed', () => {
            const customFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.VISA;
            const isCustomFeed = CardUtils.isCustomFeed(customFeed);
            expect(isCustomFeed).toBe(true);
        });

        it('Should return false for the direct feed', () => {
            const directFeed = CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE;
            const isCustomFeed = CardUtils.isCustomFeed(directFeed);
            expect(isCustomFeed).toBe(false);
        });
    });

    describe('getCompanyFeeds', () => {
        it('Should return both custom and direct feeds if exists', () => {
            const companyFeeds = CardUtils.getCompanyFeeds(cardFeedsCollection.FAKE_ID_1);
            expect(companyFeeds).toStrictEqual(allFeeds);
        });

        it('Should return direct feeds only since custom feeds are not exist', () => {
            const companyFeeds = CardUtils.getCompanyFeeds(cardFeedsCollection.FAKE_ID_2);
            expect(companyFeeds).toStrictEqual(directFeeds);
        });

        it('Should return custom feeds only since direct feeds are not exist', () => {
            const companyFeeds = CardUtils.getCompanyFeeds(cardFeedsCollection.FAKE_ID_3);
            expect(companyFeeds).toStrictEqual(customFeeds);
        });

        it('Should return empty object if undefined is passed', () => {
            const companyFeeds = CardUtils.getCompanyFeeds(undefined);
            expect(companyFeeds).toStrictEqual({});
        });
    });

    describe('removeExpensifyCardFromCompanyCards', () => {
        it('Should return custom feeds without filtered out "Expensify Card" bank', () => {
            const companyFeeds = CardUtils.removeExpensifyCardFromCompanyCards(cardFeedsCollection.FAKE_ID_3);
            expect(companyFeeds).toStrictEqual(customFeedsWithoutExpensifyBank);
        });

        it('Should return direct feeds without any updates, since there were no "Expensify Card" bank', () => {
            const companyFeeds = CardUtils.removeExpensifyCardFromCompanyCards(cardFeedsCollection.FAKE_ID_2);
            expect(companyFeeds).toStrictEqual(directFeeds);
        });

        it('Should return empty object if undefined is passed', () => {
            const companyFeeds = CardUtils.removeExpensifyCardFromCompanyCards(undefined);
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
            const feedName = CardUtils.getCardFeedName(feed);
            expect(feedName).toBe('Visa');
        });

        it('Should return a valid name if an OldDot feed variation was provided', () => {
            const feed = 'oauth.americanexpressfdx.com 2003' as OnyxTypes.CompanyCardFeed;
            const feedName = CardUtils.getCardFeedName(feed);
            expect(feedName).toBe('American Express');
        });

        it('Should return empty string if invalid feed was provided', () => {
            const feed = 'vvcf' as OnyxTypes.CompanyCardFeed;
            const feedName = CardUtils.getCardFeedName(feed);
            expect(feedName).toBe('');
        });
    });

    describe('getFilteredCardList', () => {
        it('Should return filtered custom feed cards list', () => {
            const cardsList = CardUtils.getFilteredCardList(customFeedCardsList, undefined);
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(cardsList).toStrictEqual({'480801XXXXXX2111': 'ENCRYPTED_CARD_NUMBER', '480801XXXXXX2566': 'ENCRYPTED_CARD_NUMBER'});
        });

        it('Should return filtered direct feed cards list with a single card', () => {
            const cardsList = CardUtils.getFilteredCardList(directFeedCardsSingleList, directFeeds[CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE]);
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(cardsList).toStrictEqual({'CREDIT CARD...6607': 'CREDIT CARD...6607'});
        });

        it('Should return filtered direct feed cards list with multiple cards', () => {
            const cardsList = CardUtils.getFilteredCardList(directFeedCardsMultipleList, directFeeds[CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE]);
            // eslint-disable-next-line @typescript-eslint/naming-convention
            expect(cardsList).toStrictEqual({'CREDIT CARD...1233': 'CREDIT CARD...1233', 'CREDIT CARD...3333': 'CREDIT CARD...3333', 'CREDIT CARD...7788': 'CREDIT CARD...7788'});
        });

        it('Should return empty object if no data was provided', () => {
            const cardsList = CardUtils.getFilteredCardList(undefined, undefined);
            expect(cardsList).toStrictEqual({});
        });
    });
});

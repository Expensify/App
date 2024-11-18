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
        accountList: ['CREDIT CARD...6607'],
        credentials: 'xxxxx',
        expiration: 1730998958,
    },
};
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

        it('Should return empty string if undefined feed was provided', () => {
            const cardNumber = '480801XXXXXX2554';
            const maskedCardNumber = CardUtils.maskCardNumber(cardNumber, undefined);
            expect(maskedCardNumber).toBe('');
        });

        it('Should return empty string if invalid card name was provided', () => {
            const maskedCardNumber = CardUtils.maskCardNumber('', CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD);
            expect(maskedCardNumber).toBe('');
        });
    });
});

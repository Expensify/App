import {rand, randAmount, randNumber, randPastDate, randWord} from '@ngneat/falso';
import {format} from 'date-fns';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';
import type {PossibleFraudData} from '@src/types/onyx/Card';
import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';

export default function createRandomCard(
    index: number,
    options?: {
        bank?: CardFeedWithNumber;
        fundID?: string;
        state?: ValueOf<typeof CONST.EXPENSIFY_CARD.STATE>;
        fraud?: ValueOf<typeof CONST.EXPENSIFY_CARD.FRAUD_TYPES>;
        accountID?: number;
        domainName?: string;
        possibleFraud?: PossibleFraudData;
    },
): Card {
    const cardID = index > 0 ? index : randNumber();
    const bank =
        options?.bank ??
        (rand([
            CONST.EXPENSIFY_CARD.BANK,
            CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
            CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE,
            CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
            CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
        ]) as CardFeedWithNumber);
    const state = options?.state ?? rand(Object.values(CONST.EXPENSIFY_CARD.STATE));
    const fraud = options?.fraud ?? rand(Object.values(CONST.EXPENSIFY_CARD.FRAUD_TYPES));
    const accountID = options?.accountID ?? randNumber();
    const domainName = options?.domainName ?? `expensify-policy${randNumber()}.exfy`;

    // Only generate fundID if not explicitly set (including undefined) and it's an Expensify Card
    let fundID: string | undefined;
    if (options && 'fundID' in options) {
        fundID = options.fundID;
    } else if (bank === CONST.EXPENSIFY_CARD.BANK) {
        fundID = randNumber().toString();
    } else {
        fundID = undefined;
    }

    return {
        cardID,
        state,
        bank,
        domainName,
        lastUpdated: format(randPastDate(), CONST.DATE.FNS_DB_FORMAT_STRING),
        fraud,
        availableSpend: randAmount(),
        unapprovedSpend: -randAmount(),
        totalSpend: -randAmount(),
        lastFourPAN: randNumber().toString(),
        cardName: `${randWord()}...${randNumber()}`,
        fundID: bank === CONST.EXPENSIFY_CARD.BANK ? fundID : undefined,
        accountID,
        isLoading: false,
        isLoadingLastUpdated: false,
        lastScrape: format(randPastDate(), CONST.DATE.FNS_DB_FORMAT_STRING),
        lastScrapeResult: randNumber(),
        scrapeMinDate: format(randPastDate(), CONST.DATE.FNS_DB_FORMAT_STRING),
        errors: {},
        errorFields: {},
        ...(options?.possibleFraud ? {nameValuePairs: {possibleFraud: options.possibleFraud} as Card['nameValuePairs']} : {}),
    };
}

/**
 * Creates a random Expensify Card (with bank === 'Expensify Card')
 */
function createRandomExpensifyCard(
    index: number,
    options?: {
        fundID?: string;
        state?: ValueOf<typeof CONST.EXPENSIFY_CARD.STATE>;
        fraud?: ValueOf<typeof CONST.EXPENSIFY_CARD.FRAUD_TYPES>;
        accountID?: number;
        domainName?: string;
        possibleFraud?: PossibleFraudData;
    },
): Card {
    return createRandomCard(index, {
        ...options,
        bank: CONST.EXPENSIFY_CARD.BANK,
    });
}

/**
 * Creates a random company card (non-Expensify card)
 */
function createRandomCompanyCard(
    index: number,
    options?: {
        bank?: CardFeedWithNumber;
        accountID?: number;
        domainName?: string;
    },
): Card {
    const banks = [
        CONST.COMPANY_CARD.FEED_BANK_NAME.VISA,
        CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE,
        CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE,
        CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE,
        CONST.COMPANY_CARD.FEED_BANK_NAME.CITIBANK,
    ];
    return createRandomCard(index, {
        ...options,
        bank: options?.bank ?? rand(banks),
        fundID: undefined, // Company cards don't have fundID
    });
}

export {createRandomExpensifyCard, createRandomCompanyCard};

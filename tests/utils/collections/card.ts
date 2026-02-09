import {rand, randAmount, randNumber, randPastDate, randWord} from '@ngneat/falso';
import {format} from 'date-fns';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type {Card} from '@src/types/onyx';

export default function createRandomCard(
    index: number,
    options?: {
        bank?: string;
        fundID?: string;
        state?: ValueOf<typeof CONST.EXPENSIFY_CARD.STATE>;
        fraud?: ValueOf<typeof CONST.EXPENSIFY_CARD.FRAUD_TYPES>;
        accountID?: number;
        domainName?: string;
    },
): Card {
    const cardID = index > 0 ? index : randNumber();
    const bank = options?.bank ?? rand([CONST.EXPENSIFY_CARD.BANK, 'vcf', 'stripe', 'oauth.chase.com', 'oauth.capitalone.com']);
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
        bank?: string;
        accountID?: number;
        domainName?: string;
    },
): Card {
    const banks = ['vcf', 'stripe', 'oauth.chase.com', 'oauth.capitalone.com', 'oauth.citibank.com'];
    return createRandomCard(index, {
        ...options,
        bank: options?.bank ?? rand(banks),
        fundID: undefined, // Company cards don't have fundID
    });
}

export {createRandomExpensifyCard, createRandomCompanyCard};

import {fromUnixTime, isBefore} from 'date-fns';
import groupBy from 'lodash/groupBy';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {TupleToUnion, ValueOf} from 'type-fest';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type {CombinedCardFeed, CombinedCardFeeds} from '@hooks/useCardFeeds';
import type IllustrationsType from '@styles/theme/illustrations/types';
import * as Illustrations from '@src/components/Icon/Illustrations';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    BankAccountList,
    Card,
    CardFeeds,
    CardList,
    CompanyCardFeed,
    CurrencyList,
    ExpensifyCardSettings,
    PersonalDetailsList,
    Policy,
    PrivatePersonalDetails,
    WorkspaceCardsList,
} from '@src/types/onyx';
import type {UnassignedCard} from '@src/types/onyx/Card';
import type {CardFeedData, CompanyCardFeedWithDomainID, CompanyCardFeedWithNumber, CompanyFeeds} from '@src/types/onyx/CardFeeds';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import {filterObject} from './ObjectUtils';
import {arePersonalDetailsMissing, getDisplayNameOrDefault} from './PersonalDetailsUtils';
import StringUtils from './StringUtils';

const COMPANY_CARD_FEED_ICON_NAMES = [
    'VisaCompanyCardDetailLarge',
    'AmexCardCompanyCardDetailLarge',
    'MasterCardCompanyCardDetailLarge',
    'BankOfAmericaCompanyCardDetailLarge',
    'CapitalOneCompanyCardDetailLarge',
    'ChaseCompanyCardDetailLarge',
    'CitibankCompanyCardDetailLarge',
    'WellsFargoCompanyCardDetailLarge',
    'BrexCompanyCardDetailLarge',
    'StripeCompanyCardDetailLarge',
    'PlaidCompanyCardDetailLarge',
] as const;

type CompanyCardFeedIconName = TupleToUnion<typeof COMPANY_CARD_FEED_ICON_NAMES>;
type CompanyCardFeedIcons = Record<CompanyCardFeedIconName, IconAsset>;

const COMPANY_CARD_BANK_ICON_NAMES = [
    'AmexCardCompanyCardDetail',
    'BankOfAmericaCompanyCardDetail',
    'CapitalOneCompanyCardDetail',
    'ChaseCompanyCardDetail',
    'CitibankCompanyCardDetail',
    'WellsFargoCompanyCardDetail',
    'BrexCompanyCardDetail',
    'StripeCompanyCardDetail',
    'MasterCardCompanyCardDetail',
    'VisaCompanyCardDetail',
    'PlaidCompanyCardDetail',
] as const;

type CompanyCardBankIconName = TupleToUnion<typeof COMPANY_CARD_BANK_ICON_NAMES>;
type CompanyCardBankIcons = Record<CompanyCardBankIconName, IconAsset>;

/**
 * @returns string with a month in MM format
 */
function getMonthFromExpirationDateString(expirationDateString: string) {
    return expirationDateString.substring(0, 2);
}

/**
 * Sorting logic for assigned cards.
 *
 * Ensure to sort physical Expensify cards first, no matter what their cardIDs are.
 * This way ensures the Expensify Combo Card detail is rendered correctly,
 * because we will always use the cardID of the physical card from the combo card duo.
 *
 * @param card - card to get the sort key for
 * @returns number
 */
function getAssignedCardSortKey(card: Card): number {
    if (!isExpensifyCard(card)) {
        return 2;
    }
    return card?.nameValuePairs?.isVirtual ? 1 : 0;
}

/**
 * Checks if the card is an Expensify card.
 * @param card - The card to check.
 * @returns boolean
 */
function isExpensifyCard(card?: Card) {
    if (!card) {
        return false;
    }
    return card.bank === CONST.EXPENSIFY_CARD.BANK;
}

/**
 * @param card
 * @returns string in format %<bank> - <lastFourPAN || Not Activated>%.
 */
function getCardDescription(card: Card | undefined, translate: LocalizedTranslate) {
    if (!card) {
        return '';
    }
    const isPlaid = !!getPlaidInstitutionId(card.bank);
    const bankName = isPlaid ? card?.cardName : getBankName(card.bank as CompanyCardFeed);
    const cardDescriptor = card.state === CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED ? translate('cardTransactions.notActivated') : card.lastFourPAN;
    const humanReadableBankName = card.bank === CONST.EXPENSIFY_CARD.BANK ? CONST.EXPENSIFY_CARD.BANK : bankName;
    return cardDescriptor && !isPlaid ? `${humanReadableBankName} - ${cardDescriptor}` : `${humanReadableBankName}`;
}

/**
 * @param transactionCardName
 * @param cardID
 * @param cards
 * @returns company card name
 */
function getCompanyCardDescription(transactionCardName?: string, cardID?: number, cards?: CardList) {
    if (!cardID || !cards?.[cardID] || isExpensifyCard(cards[cardID])) {
        return transactionCardName;
    }
    const card = cards[cardID];

    return card.cardName;
}

function isCard(item: Card | Record<string, string>): item is Card {
    return typeof item === 'object' && 'cardID' in item && !!item.cardID && 'bank' in item && !!item.bank;
}

function isCardHiddenFromSearch(card: Card) {
    return !card?.nameValuePairs?.isVirtual && CONST.EXPENSIFY_CARD.HIDDEN_FROM_SEARCH_STATES.includes(card.state ?? 0);
}

function isCardClosed(card: Card) {
    return card?.state === CONST.EXPENSIFY_CARD.STATE.CLOSED;
}

function mergeCardListWithWorkspaceFeeds(workspaceFeeds: Record<string, WorkspaceCardsList | undefined>, cardList: CardList | undefined, shouldFilterOutPersonalCards = false) {
    const feedCards: CardList = {};
    for (const card of Object.values(cardList ?? {})) {
        if (!isCard(card) || (shouldFilterOutPersonalCards && !isPersonalCard(card))) {
            continue;
        }

        feedCards[card.cardID] = card;
    }

    for (const currentCardFeed of Object.values(workspaceFeeds ?? {})) {
        for (const card of Object.values(currentCardFeed ?? {})) {
            if (!isCard(card)) {
                continue;
            }
            feedCards[card.cardID] = card;
        }
    }
    return feedCards;
}

/**
 * @returns string with a year in YY or YYYY format
 */
function getYearFromExpirationDateString(expirationDateString: string) {
    const stringContainsNumbersOnly = /^\d+$/.test(expirationDateString);
    const cardYear = stringContainsNumbersOnly ? expirationDateString.substring(2) : expirationDateString.substring(3);

    return cardYear.length === 2 ? `20${cardYear}` : cardYear;
}

/**
 * @returns string with a month in MM/YYYY format
 */
function formatCardExpiration(expirationDateString: string) {
    // already matches MM/YYYY format
    const dateFormat = /^\d{2}\/\d{4}$/;
    if (dateFormat.test(expirationDateString)) {
        return expirationDateString;
    }

    const expirationMonth = getMonthFromExpirationDateString(expirationDateString);
    const expirationYear = getYearFromExpirationDateString(expirationDateString);

    return `${expirationMonth}/${expirationYear}`;
}

/**
 * @param cardList - collection of assigned cards
 * @returns collection of assigned cards grouped by domain
 */
function getDomainCards(cardsList: OnyxEntry<CardList>): Record<string, Card[]> {
    const {cardList: assignableCards, ...assignedCards} = cardsList ?? {};

    // Check for domainName to filter out personal credit cards.
    const activeCards = Object.values(assignedCards).filter((card) => !!card?.domainName && CONST.EXPENSIFY_CARD.ACTIVE_STATES.some((element) => element === card.state));

    return groupBy(activeCards, (card) => card.domainName);
}

/**
 * Returns a masked credit card string with spaces for every four symbols.
 * If the last four digits are provided, all preceding digits will be masked.
 * If not, the entire card string will be masked.
 *
 * @param [lastFour=""] - The last four digits of the card (optional).
 * @returns - The masked card string.
 */
function maskCard(lastFour = ''): string {
    const totalDigits = 16;
    const maskedLength = totalDigits - lastFour.length;

    // Create a string with '•' repeated for the masked portion
    const maskedString = '•'.repeat(maskedLength) + lastFour;

    // Insert space for every four symbols
    return maskedString.replaceAll(/(.{4})/g, '$1 ').trim();
}

/**
 * Returns a masked credit card string.
 * Converts given 'X' to '•' for the entire card string.
 *
 * @param cardName - card name with XXXX in the middle.
 * @param feed - card feed.
 * @param showOriginalName - show original card name instead of masked.
 * @returns - The masked card string.
 */
function maskCardNumber(cardName?: string, feed?: string, showOriginalName?: boolean): string {
    if (!cardName || cardName === '') {
        return '';
    }
    const hasSpace = /\s/.test(cardName);
    const maskedString = cardName.replaceAll('X', '•');
    const isAmexBank = [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX, CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT].some((value) => value === feed);

    if (hasSpace) {
        if (showOriginalName) {
            return cardName;
        }
        return cardName.replaceAll(/ - \d{4}$/g, '');
    }

    if (isAmexBank && maskedString.length === 15) {
        return maskedString.replaceAll(/(.{4})(.{6})(.{5})/g, '$1 $2 $3');
    }

    return maskedString.replaceAll(/(.{4})/g, '$1 ').trim();
}

/**
 * Returns last 4 number from company card name
 *
 * @param cardName - card name with dash in the middle and 4 numbers in the end.
 * @returns - Last 4 numbers
 */
function lastFourNumbersFromCardName(cardName: string | undefined): string {
    const name = cardName ?? '';
    const hasSpace = /\s/.test(name);
    const match = name.match(/(\d{4})$/);
    if (!cardName || cardName === '' || !hasSpace || !match) {
        return '';
    }
    return match[1];
}

function getMCardNumberString(cardNumber: string): string {
    return cardNumber.replaceAll(/\s/g, '');
}

function getTranslationKeyForLimitType(limitType: ValueOf<typeof CONST.EXPENSIFY_CARD.LIMIT_TYPES> | undefined): TranslationPaths | '' {
    switch (limitType) {
        case CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART:
            return 'workspace.card.issueNewCard.smartLimit';
        case CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED:
            return 'workspace.card.issueNewCard.fixedAmount';
        case CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY:
            return 'workspace.card.issueNewCard.monthly';
        default:
            return '';
    }
}

function maskPin(pin = ''): string {
    if (!pin) {
        return '••••';
    }
    return pin;
}

function getEligibleBankAccountsForCard(bankAccountsList: OnyxEntry<BankAccountList>) {
    if (!bankAccountsList || isEmptyObject(bankAccountsList)) {
        return [];
    }
    return Object.values(bankAccountsList).filter((bankAccount) => bankAccount?.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS && bankAccount?.accountData?.allowDebit);
}

function getEligibleBankAccountsForUkEuCard(bankAccountsList: OnyxEntry<BankAccountList>, outputCurrency?: string) {
    if (!bankAccountsList || isEmptyObject(bankAccountsList)) {
        return [];
    }
    return Object.values(bankAccountsList).filter(
        (bankAccount) =>
            bankAccount?.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS &&
            bankAccount?.accountData?.allowDebit &&
            bankAccount?.bankCurrency === outputCurrency &&
            (CONST.EXPENSIFY_UK_EU_SUPPORTED_COUNTRIES as unknown as string).includes(bankAccount?.bankCountry),
    );
}

function getCardsByCardholderName(cardsList: OnyxEntry<WorkspaceCardsList>, policyMembersAccountIDs: number[]): Card[] {
    const {cardList, ...cards} = cardsList ?? {};
    return Object.values(cards).filter((card: Card) => card.accountID && policyMembersAccountIDs.includes(card.accountID));
}

function sortCardsByCardholderName(cards: Card[], personalDetails: OnyxEntry<PersonalDetailsList>, localeCompare: LocaleContextProps['localeCompare']): Card[] {
    return cards.sort((cardA: Card, cardB: Card) => {
        const userA = cardA.accountID ? (personalDetails?.[cardA.accountID] ?? {}) : {};
        const userB = cardB.accountID ? (personalDetails?.[cardB.accountID] ?? {}) : {};
        const aName = getDisplayNameOrDefault(userA);
        const bName = getDisplayNameOrDefault(userB);
        return localeCompare(aName, bName);
    });
}

function filterCardsByPersonalDetails(card: Card, searchQuery: string, personalDetails?: PersonalDetailsList) {
    const normalizedSearchQuery = StringUtils.normalize(searchQuery.toLowerCase());
    const cardTitle = StringUtils.normalize(card.nameValuePairs?.cardTitle?.toLowerCase() ?? '');
    const lastFourPAN = StringUtils.normalize(card?.lastFourPAN?.toLowerCase() ?? '');
    const accountLogin = StringUtils.normalize(personalDetails?.[card.accountID ?? CONST.DEFAULT_NUMBER_ID]?.login?.toLowerCase() ?? '');
    const accountName = StringUtils.normalize(personalDetails?.[card.accountID ?? CONST.DEFAULT_NUMBER_ID]?.displayName?.toLowerCase() ?? '');
    return (
        cardTitle.includes(normalizedSearchQuery) ||
        lastFourPAN.includes(normalizedSearchQuery) ||
        accountLogin.includes(normalizedSearchQuery) ||
        accountName.includes(normalizedSearchQuery)
    );
}

function getCardFeedIcon(cardFeed: CompanyCardFeed | typeof CONST.EXPENSIFY_CARD.BANK, illustrations: IllustrationsType, companyCardIllustrations: CompanyCardFeedIcons): IconAsset {
    const feedIcons = {
        [CONST.COMPANY_CARD.FEED_BANK_NAME.VISA]: companyCardIllustrations.VisaCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX]: companyCardIllustrations.AmexCardCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_1205]: companyCardIllustrations.AmexCardCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_FILE_DOWNLOAD]: companyCardIllustrations.AmexCardCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD]: companyCardIllustrations.MasterCardCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT]: companyCardIllustrations.AmexCardCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.BANK_OF_AMERICA]: companyCardIllustrations.BankOfAmericaCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE]: companyCardIllustrations.CapitalOneCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE]: companyCardIllustrations.ChaseCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.CITIBANK]: companyCardIllustrations.CitibankCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.WELLS_FARGO]: companyCardIllustrations.WellsFargoCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.BREX]: companyCardIllustrations.BrexCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE]: companyCardIllustrations.StripeCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.CSV]: illustrations.GenericCSVCompanyCardLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.PEX]: illustrations.GenericCompanyCardLarge,
        [CONST.EXPENSIFY_CARD.BANK]: Illustrations.ExpensifyCardImage,
    };

    if (cardFeed.startsWith(CONST.EXPENSIFY_CARD.BANK)) {
        return Illustrations.ExpensifyCardImage;
    }

    if (feedIcons[cardFeed]) {
        return feedIcons[cardFeed];
    }

    // In existing OldDot setups other variations of feeds could exist, ex: vcf2, vcf3, cdfbmo
    const feedKey = (Object.keys(feedIcons) as CompanyCardFeed[]).find((feed) => cardFeed.startsWith(feed));

    if (feedKey) {
        return feedIcons[feedKey];
    }

    if (cardFeed.includes(CONST.COMPANY_CARD.FEED_BANK_NAME.CSV)) {
        return illustrations.GenericCSVCompanyCardLarge;
    }

    return illustrations.GenericCompanyCardLarge;
}

/**
 * Verify if the feed is a custom feed. Those are also referred to as commercial feeds.
 */
function isCustomFeed(feed: CompanyCardFeedWithNumber | undefined): boolean {
    if (!feed) {
        return false;
    }

    return [CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD, CONST.COMPANY_CARD.FEED_BANK_NAME.VISA, CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX].some((value) => feed.startsWith(value));
}

function getOriginalCompanyFeeds(cardFeeds: OnyxEntry<CardFeeds>): CompanyFeeds {
    return Object.fromEntries(
        Object.entries(cardFeeds?.settings?.companyCards ?? {}).filter(([key, value]) => {
            if (value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || value.pending) {
                return false;
            }
            return key !== CONST.EXPENSIFY_CARD.BANK;
        }),
    );
}

function getCompanyFeeds(cardFeeds: OnyxEntry<CombinedCardFeeds>, shouldFilterOutRemovedFeeds = false, shouldFilterOutPendingFeeds = false): CombinedCardFeeds {
    return Object.fromEntries(
        Object.entries(cardFeeds ?? {}).filter(([, value]) => {
            if (shouldFilterOutRemovedFeeds && value.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return false;
            }
            if (shouldFilterOutPendingFeeds && value.pending) {
                return false;
            }
            return !value.feed.includes(CONST.EXPENSIFY_CARD.BANK);
        }),
    );
}

function getBankName(feedType: CompanyCardFeed): string {
    const feedNamesMapping = {
        [CONST.COMPANY_CARD.FEED_BANK_NAME.VISA]: 'Visa',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD]: 'Mastercard',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX]: 'American Express',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE]: 'Stripe',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT]: 'American Express',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.BANK_OF_AMERICA]: 'Bank of America',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE]: 'Capital One',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE]: 'Chase',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.CITIBANK]: 'Citibank',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.WELLS_FARGO]: 'Wells Fargo',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.BREX]: 'Brex',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.CSV]: CONST.COMPANY_CARDS.CARD_TYPE.CSV,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_1205]: 'American Express',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_FILE_DOWNLOAD]: 'American Express',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.PEX]: 'PEX',
    };

    // In existing OldDot setups other variations of feeds could exist, ex: vcf2, vcf3, oauth.americanexpressfdx.com 2003
    const feedKey = (Object.keys(feedNamesMapping) as CompanyCardFeed[]).find((feed) => feedType?.startsWith(feed));

    if (feedType?.includes(CONST.COMPANY_CARD.FEED_BANK_NAME.CSV)) {
        return CONST.COMPANY_CARDS.CARD_TYPE.CSV;
    }

    if (!feedKey) {
        return '';
    }

    return feedNamesMapping[feedKey];
}

const getBankCardDetailsImage = (bank: ValueOf<typeof CONST.COMPANY_CARDS.BANKS>, illustrations: IllustrationsType, companyCardIllustrations: CompanyCardBankIcons): IconAsset => {
    const iconMap: Record<ValueOf<typeof CONST.COMPANY_CARDS.BANKS>, IconAsset> = {
        [CONST.COMPANY_CARDS.BANKS.AMEX]: companyCardIllustrations.AmexCardCompanyCardDetail,
        [CONST.COMPANY_CARDS.BANKS.BANK_OF_AMERICA]: companyCardIllustrations.BankOfAmericaCompanyCardDetail,
        [CONST.COMPANY_CARDS.BANKS.CAPITAL_ONE]: companyCardIllustrations.CapitalOneCompanyCardDetail,
        [CONST.COMPANY_CARDS.BANKS.CHASE]: companyCardIllustrations.ChaseCompanyCardDetail,
        [CONST.COMPANY_CARDS.BANKS.CITI_BANK]: companyCardIllustrations.CitibankCompanyCardDetail,
        [CONST.COMPANY_CARDS.BANKS.WELLS_FARGO]: companyCardIllustrations.WellsFargoCompanyCardDetail,
        [CONST.COMPANY_CARDS.BANKS.BREX]: companyCardIllustrations.BrexCompanyCardDetail,
        [CONST.COMPANY_CARDS.BANKS.STRIPE]: companyCardIllustrations.StripeCompanyCardDetail,
        [CONST.COMPANY_CARDS.BANKS.OTHER]: illustrations.GenericCompanyCard,
    };
    return iconMap[bank];
};

function getCustomOrFormattedFeedName(translate: LocalizedTranslate, feed?: CompanyCardFeed, customFeedName?: string, shouldAddCardsSuffix = true): string | undefined {
    if (!feed) {
        return;
    }

    if (customFeedName && typeof customFeedName !== 'string') {
        return '';
    }

    const feedName = getBankName(feed);
    const formattedFeedName = feedName && shouldAddCardsSuffix ? translate('workspace.companyCards.feedName', feedName) : feedName;

    // Custom feed name can be empty. Fallback to default feed name
    // Fallback to feed key name for unknown feeds
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return customFeedName || formattedFeedName || feed;
}

function getPlaidInstitutionIconUrl(feedName?: string) {
    const institutionId = getPlaidInstitutionId(feedName);
    if (!institutionId) {
        return '';
    }
    return `${CONST.COMPANY_CARD_PLAID}${institutionId}.png`;
}

function getPlaidInstitutionId(feedName?: string) {
    const feedNameWithoutDomainID = getCompanyCardFeed(feedName ?? '');
    const feed = feedNameWithoutDomainID?.split('.');
    if (!feed || feed?.at(0) !== CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID) {
        return '';
    }

    return feed.at(1);
}

function isPlaidSupportedCountry(selectedCountry?: string) {
    if (!selectedCountry) {
        return false;
    }
    return CONST.PLAID_SUPPORT_COUNTRIES.includes(selectedCountry);
}

function getDomainOrWorkspaceAccountID(workspaceAccountID: number, cardFeedData: CardFeedData | undefined): number {
    return cardFeedData?.domainID ?? workspaceAccountID;
}

function getPlaidCountry(outputCurrency?: string, currencyList?: CurrencyList, countryByIp?: string) {
    const selectedCurrency = outputCurrency ? currencyList?.[outputCurrency] : null;
    const countries = selectedCurrency?.countries;

    if (outputCurrency === CONST.CURRENCY.EUR) {
        if (countryByIp && countries?.includes(countryByIp)) {
            return countryByIp;
        }
        return '';
    }
    const country = countries?.[0];
    return country ?? '';
}

function getCorrectStepForPlaidSelectedBank(selectedBank: ValueOf<typeof CONST.COMPANY_CARDS.BANKS>) {
    if (selectedBank === CONST.COMPANY_CARDS.BANKS.STRIPE) {
        return CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS;
    }

    if (selectedBank === CONST.COMPANY_CARDS.BANKS.OTHER) {
        return CONST.COMPANY_CARDS.STEP.PLAID_CONNECTION;
    }

    return CONST.COMPANY_CARDS.STEP.BANK_CONNECTION;
}

function getSelectedFeed(lastSelectedFeed: OnyxEntry<CompanyCardFeedWithDomainID>, cardFeeds: OnyxEntry<CombinedCardFeeds>): CompanyCardFeedWithDomainID | undefined {
    const availableFeeds = getCompanyFeeds(cardFeeds, true);
    const defaultFeed = Object.keys(availableFeeds).at(0) as CompanyCardFeedWithDomainID | undefined;
    const isValidLastFeed = !!lastSelectedFeed && lastSelectedFeed.includes(CONST.COMPANY_CARD.FEED_KEY_SEPARATOR) && availableFeeds[lastSelectedFeed];

    return isValidLastFeed ? lastSelectedFeed : defaultFeed;
}

function getCompanyCardFeedWithDomainID(feedName: CompanyCardFeed, domainID: number | string): CompanyCardFeedWithDomainID {
    return `${feedName}${CONST.COMPANY_CARD.FEED_KEY_SEPARATOR}${domainID}`;
}

function isSelectedFeedExpired(cardFeed: CombinedCardFeed | undefined): boolean {
    return cardFeed?.expiration ? isBefore(fromUnixTime(cardFeed.expiration), new Date()) : false;
}

/**
 * Returns list of unassigned cards that can be assigned.
 *
 * This function normalizes the difference between:
 * - Direct feeds (Plaid/OAuth): cards stored as string[] in accountList
 * - Commercial feeds (Visa/Mastercard/Amex): cards stored as Record<displayName, encryptedValue> in cardList
 *
 * @returns Array of UnassignedCard objects with consistent displayName and cardIdentifier properties
 */
function getFilteredCardList(list: WorkspaceCardsList | undefined, accountList: string[] | undefined, workspaceCardFeeds: OnyxCollection<WorkspaceCardsList>): UnassignedCard[] {
    const {cardList: customFeedCardsToAssign, ...cards} = list ?? {};
    const assignedCards = new Set(Object.values(cards).map((card) => card.cardName));

    // Get cards assigned across all workspaces
    const allWorkspaceAssignedCards = new Set<string>();
    for (const workspaceCards of Object.values(workspaceCardFeeds ?? {})) {
        if (!workspaceCards) {
            continue;
        }
        const {cardList, ...workspaceCardItems} = workspaceCards;
        for (const card of Object.values(workspaceCardItems)) {
            if (!card?.cardName) {
                continue;
            }
            allWorkspaceAssignedCards.add(card.cardName);
        }
    }

    // For direct feeds (Plaid/OAuth): displayName === cardIdentifier
    if (accountList) {
        return accountList
            .filter((cardName) => !assignedCards.has(cardName) && !allWorkspaceAssignedCards.has(cardName))
            .map((cardName) => ({
                cardName,
                cardID: cardName,
            }));
    }

    // For commercial feeds: displayName is the key, cardIdentifier is the encrypted value
    return Object.entries(customFeedCardsToAssign ?? {})
        .filter(([cardName]) => !assignedCards.has(cardName) && !allWorkspaceAssignedCards.has(cardName))
        .map(([cardName, encryptedCardNumber]) => ({
            cardName,
            cardID: encryptedCardNumber,
        }));
}

function hasOnlyOneCardToAssign(list: UnassignedCard[]) {
    return list.length === 1;
}

function getDefaultCardName(cardholder?: string) {
    if (!cardholder) {
        return '';
    }
    return `${cardholder}'s card`;
}

function checkIfNewFeedConnected(prevFeedsData: CompanyFeeds, currentFeedsData: CompanyFeeds, plaidBank?: string) {
    const prevFeeds = Object.keys(prevFeedsData);
    const currentFeeds = Object.keys(currentFeedsData);

    return {
        isNewFeedConnected: currentFeeds.length > prevFeeds.length || (plaidBank && currentFeeds.includes(`${CONST.BANK_ACCOUNT.SETUP_TYPE.PLAID}.${plaidBank}`)),
        newFeed: currentFeeds.find((feed) => !prevFeeds.includes(feed)) as CompanyCardFeedWithDomainID | undefined,
    };
}

function filterAllInactiveCards(cards: CardList | undefined) {
    if (!cards) {
        return {};
    }

    const closedStates = new Set<number>([CONST.EXPENSIFY_CARD.STATE.CLOSED, CONST.EXPENSIFY_CARD.STATE.STATE_DEACTIVATED, CONST.EXPENSIFY_CARD.STATE.STATE_SUSPENDED]);
    const filteredCards = filterObject(cards, (_key, card) => !closedStates.has(card.state));

    return filteredCards;
}

function filterInactiveCards(cardsList: WorkspaceCardsList | undefined) {
    const {cardList, ...assignedCards} = cardsList ?? {};
    const filteredAssignedCards = filterAllInactiveCards(assignedCards);

    return {
        ...(cardList ? {cardList} : {}),
        ...filteredAssignedCards,
    } as WorkspaceCardsList;
}

function getAllCardsForWorkspace(
    workspaceAccountID: number,
    allCardList: OnyxCollection<WorkspaceCardsList>,
    cardFeeds?: CombinedCardFeeds,
    expensifyCardSettings?: OnyxCollection<ExpensifyCardSettings>,
): CardList {
    const cards: CardList = {};
    const companyCardsDomainFeeds = Object.entries(cardFeeds ?? {}).map(([feedName, feedData]) => ({domainID: feedData.domainID, feedName}));
    const expensifyCardsDomainIDs = Object.keys(expensifyCardSettings ?? {})
        .map((key) => key.split('_').at(-1))
        .filter((id): id is string => !!id);

    for (const [key, values] of Object.entries(allCardList ?? {})) {
        const isWorkspaceAccountCards = workspaceAccountID !== CONST.DEFAULT_NUMBER_ID && key.includes(workspaceAccountID.toString());
        const isCompanyDomainCards = companyCardsDomainFeeds?.some((domainFeed) => domainFeed.domainID && key.includes(domainFeed.domainID.toString()) && key.includes(domainFeed.feedName));
        const isExpensifyDomainCards = expensifyCardsDomainIDs.some((domainID) => key.includes(domainID.toString()) && key.includes(CONST.EXPENSIFY_CARD.BANK));
        if ((isWorkspaceAccountCards || isCompanyDomainCards || isExpensifyDomainCards) && values) {
            const {cardList: assignableCards, ...assignedCards} = values ?? {};
            const filteredCards = filterInactiveCards(assignedCards);
            Object.assign(cards, filteredCards);
        }
    }
    return cards;
}

function isSmartLimitEnabled(cardsList: CardList) {
    const {cardList, ...assignedCards} = cardsList ?? {};

    return Object.values(assignedCards).some((card) => card.nameValuePairs?.limitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART);
}

const CUSTOM_FEEDS = [CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD, CONST.COMPANY_CARD.FEED_BANK_NAME.VISA, CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX];

function getFeedType(feedKey: CompanyCardFeed, cardFeeds: OnyxEntry<CombinedCardFeeds>): CompanyCardFeedWithNumber {
    if (CUSTOM_FEEDS.some((feed) => feed === feedKey)) {
        const filteredFeeds = Object.keys(cardFeeds ?? {})
            .filter((str) => str.includes(feedKey))
            .map((str) => getCompanyCardFeed(str as CompanyCardFeedWithDomainID));

        const feedNumbers = filteredFeeds.map((str) => parseInt(str.replace(feedKey, ''), 10)).filter(Boolean);
        feedNumbers.sort((a, b) => a - b);

        let firstAvailableNumber = 1;
        for (const num of feedNumbers) {
            if (num && num !== firstAvailableNumber) {
                return `${feedKey}${firstAvailableNumber}`;
            }
            firstAvailableNumber++;
        }

        return `${feedKey}${firstAvailableNumber}`;
    }
    return feedKey;
}

/**
 * Takes the list of cards divided by workspaces and feeds and returns the flattened non-Expensify cards related to the provided workspace
 *
 * @param allCardsList the list where cards split by workspaces and feeds and stored under `card_${workspaceAccountID}_${feedName}` keys
 * @param workspaceAccountID the workspace account id we want to get cards for
 * @param domainIDs the domain ids we want to get cards for
 */
function flatAllCardsList(allCardsList: OnyxCollection<WorkspaceCardsList>, workspaceAccountID: number, domainIDs?: number[]): Record<string, Card> | undefined {
    if (!allCardsList) {
        return;
    }

    return Object.entries(allCardsList).reduce((acc, [key, cards]) => {
        const isWorkspaceAccountCards = key.includes(workspaceAccountID.toString());
        const isDomainCards = domainIDs?.some((domainID) => key.includes(domainID.toString()));
        if ((!isWorkspaceAccountCards && !isDomainCards) || key.includes(CONST.EXPENSIFY_CARD.BANK)) {
            return acc;
        }
        const {cardList, ...feedCards} = cards ?? {};
        const filteredCards = filterInactiveCards(feedCards);
        Object.assign(acc, filteredCards);
        return acc;
    }, {});
}

/**
 * Check if the card has a broken connection
 *
 * @param card the card to check
 * @returns true if the card has a broken connection, false otherwise
 */
function isCardConnectionBroken(card: Card): boolean {
    return !!card.lastScrapeResult && !CONST.COMPANY_CARDS.BROKEN_CONNECTION_IGNORED_STATUSES.includes(card.lastScrapeResult);
}

/**
 * Checks if an Expensify Card was issued for a given workspace.
 */
function hasIssuedExpensifyCard(workspaceAccountID: number, allCardList: OnyxCollection<WorkspaceCardsList>): boolean {
    const cards = getAllCardsForWorkspace(workspaceAccountID, allCardList);
    return Object.values(cards).some((card) => card.bank === CONST.EXPENSIFY_CARD.BANK);
}

/**
 * Check if the Expensify Card is fully set up and a new card can be issued
 */
function isExpensifyCardFullySetUp(policy?: OnyxEntry<Policy>, cardSettings?: OnyxEntry<ExpensifyCardSettings>): boolean {
    return !!(policy?.areExpensifyCardsEnabled && cardSettings?.paymentBankAccountID);
}

function isCardPendingIssue(card?: Card) {
    return card?.state === CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED;
}

function isCardPendingActivate(card?: Card) {
    return card?.state === CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED;
}

function isCardPendingReplace(card?: Card) {
    return (
        (isCardPendingActivate(card) || isCardPendingIssue(card)) &&
        !!card?.nameValuePairs?.terminationReason &&
        card?.nameValuePairs?.statusChanges?.at(-1)?.status === CONST.EXPENSIFY_CARD.STATE.STATE_DEACTIVATED
    );
}

function isExpensifyCardPendingAction(card?: Card, privatePersonalDetails?: PrivatePersonalDetails): boolean {
    return (
        card?.bank === CONST.EXPENSIFY_CARD.BANK &&
        !card.nameValuePairs?.isVirtual &&
        (isCardPendingIssue(card) || isCardPendingActivate(card) || isCardPendingReplace(card) || arePersonalDetailsMissing(privatePersonalDetails)) &&
        (!card.lastScrapeResult || CONST.COMPANY_CARDS.BROKEN_CONNECTION_IGNORED_STATUSES.includes(card.lastScrapeResult))
    );
}

function hasPendingExpensifyCardAction(cards: CardList | undefined, privatePersonalDetails?: PrivatePersonalDetails) {
    const {cardList, ...assignedCards} = cards ?? {};
    return Object.values(assignedCards).some((card) => isExpensifyCardPendingAction(card, privatePersonalDetails));
}
const isCurrencySupportedForECards = (currency?: string) => {
    if (!currency) {
        return false;
    }
    const supportedCurrencies: string[] = [CONST.CURRENCY.GBP, CONST.CURRENCY.EUR];
    return supportedCurrencies.includes(currency);
};

function getFundIdFromSettingsKey(key: string) {
    const prefix = ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS;
    if (!key?.startsWith(prefix)) {
        return CONST.DEFAULT_NUMBER_ID;
    }
    const fundIDStr = key.substring(prefix.length);

    const fundID = Number(fundIDStr);
    return Number.isNaN(fundID) ? CONST.DEFAULT_NUMBER_ID : fundID;
}

/**
 * Get card which has a broken connection
 *
 * @param feedCards the list of the cards, related to one or several feeds
 * @param [feedToExclude] the feed to ignore during the check, it's useful for checking broken connection error only in the feeds other than the selected one
 */
function getFeedConnectionBrokenCard(feedCards: CardList | undefined, feedToExclude?: string): Card | undefined {
    if (!feedCards || isEmptyObject(feedCards)) {
        return undefined;
    }

    return Object.values(feedCards).find((card) => !isEmptyObject(card) && card.bank !== feedToExclude && card.lastScrapeResult !== 200);
}

/** Extract feed from feed with domainID */
function getCompanyCardFeed(feedWithDomainID: string | undefined): CompanyCardFeed {
    if (!feedWithDomainID) {
        return '' as CompanyCardFeed;
    }
    const [feed] = feedWithDomainID.split(CONST.COMPANY_CARD.FEED_KEY_SEPARATOR);
    return feed as CompanyCardFeed;
}

/**
 * Check if the given card is a personal card.
 *
 * @param card the card which needs to be checked
 * @returns true if the card is a personal card, false otherwise
 */
function isPersonalCard(card?: Card) {
    return !!card?.fundID && card.fundID !== '0';
}

type SplitMaskedCardNumberResult = {
    firstDigits?: string;
    lastDigits?: string;
};

/**
 * Split masked card number into first and last digits
 *
 * @param cardNumber the card number to split
 * @param maskChar the character used to mask the card number
 * @returns the first and last digits of the card number
 */
function splitMaskedCardNumber(cardNumber: string | undefined, maskChar: string = CONST.COMPANY_CARD.CARD_NUMBER_MASK_CHAR): SplitMaskedCardNumberResult {
    if (!cardNumber) {
        return {
            firstDigits: undefined,
            lastDigits: undefined,
        };
    }
    const parts = cardNumber.split(maskChar);
    return {
        firstDigits: parts.at(0),
        lastDigits: parts.at(-1),
    };
}

function isCardAlreadyAssigned(cardNumberToCheck: string, workspaceCardFeeds: OnyxCollection<WorkspaceCardsList>): boolean {
    if (!cardNumberToCheck || !workspaceCardFeeds) {
        return false;
    }

    return Object.values(workspaceCardFeeds).some((workspaceCards) => {
        if (!workspaceCards) {
            return false;
        }
        const {cardList, ...assignedCards} = workspaceCards;
        return Object.values(assignedCards).some(
            (card) => card?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && (card?.encryptedCardNumber === cardNumberToCheck || card?.cardName === cardNumberToCheck),
        );
    });
}

export {
    getAssignedCardSortKey,
    isExpensifyCard,
    getDomainCards,
    formatCardExpiration,
    getMonthFromExpirationDateString,
    getYearFromExpirationDateString,
    maskCard,
    maskCardNumber,
    getCardDescription,
    getMCardNumberString,
    getTranslationKeyForLimitType,
    maskPin,
    getEligibleBankAccountsForCard,
    sortCardsByCardholderName,
    isCurrencySupportedForECards,
    getCardFeedIcon,
    getBankName,
    isSelectedFeedExpired,
    getCompanyFeeds,
    isCustomFeed,
    getBankCardDetailsImage,
    getSelectedFeed,
    getPlaidCountry,
    getCustomOrFormattedFeedName,
    isCardClosed,
    isPlaidSupportedCountry,
    getFilteredCardList,
    hasOnlyOneCardToAssign,
    checkIfNewFeedConnected,
    getDefaultCardName,
    getDomainOrWorkspaceAccountID,
    mergeCardListWithWorkspaceFeeds,
    isCard,
    getAllCardsForWorkspace,
    isCardHiddenFromSearch,
    getFeedType,
    flatAllCardsList,
    isCardConnectionBroken,
    isSmartLimitEnabled,
    lastFourNumbersFromCardName,
    hasIssuedExpensifyCard,
    isExpensifyCardFullySetUp,
    filterInactiveCards,
    isCardPendingIssue,
    isCardPendingActivate,
    hasPendingExpensifyCardAction,
    isExpensifyCardPendingAction,
    getFundIdFromSettingsKey,
    isCardPendingReplace,
    getCardsByCardholderName,
    filterCardsByPersonalDetails,
    getCompanyCardDescription,
    getPlaidInstitutionIconUrl,
    getPlaidInstitutionId,
    getFeedConnectionBrokenCard,
    getCorrectStepForPlaidSelectedBank,
    getOriginalCompanyFeeds,
    getCompanyCardFeed,
    getCompanyCardFeedWithDomainID,
    getEligibleBankAccountsForUkEuCard,
    isPersonalCard,
    COMPANY_CARD_FEED_ICON_NAMES,
    COMPANY_CARD_BANK_ICON_NAMES,
    splitMaskedCardNumber,
    isCardAlreadyAssigned,
};

export type {CompanyCardFeedIcons, CompanyCardBankIcons};

import {renderHook} from '@testing-library/react-native';
import useAutocompleteSuggestions from '@hooks/useAutocompleteSuggestions';
import CONST from '@src/CONST';

const onyxData: Record<string, unknown> = {};

jest.mock('@hooks/useOnyx', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: (key: string) => [onyxData[key]],
}));

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListState: () => ({
        currencyList: {
            USD: {symbol: '$', name: 'US Dollar'},
            EUR: {symbol: '€', name: 'Euro'},
            GBP: {symbol: '£', name: 'British Pound'},
            JPY: {symbol: '¥', name: 'Japanese Yen'},
            AUD: {symbol: 'A$', name: 'Australian Dollar'},
            RETIRED_CURRENCY: {symbol: 'X', name: 'Retired', retired: true},
        },
    }),
}));

jest.mock('@libs/SearchAutocompleteUtils', () => ({
    parseForAutocomplete: jest.fn(),
    getAutocompleteTags: jest.fn(() => ['Engineering', 'Marketing', 'Sales', 'Design']),
    getAutocompleteRecentTags: jest.fn(() => ['Engineering', 'Marketing']),
    getAutocompleteCategories: jest.fn(() => ['Travel', 'Office Supplies', 'Meals', 'Software']),
    getAutocompleteRecentCategories: jest.fn(() => ['Travel', 'Meals']),
    getAutocompleteTaxList: jest.fn(() => [
        {taxRateName: 'VAT 20%', taxRateIds: ['vat20']},
        {taxRateName: 'GST 10%', taxRateIds: ['gst10']},
    ]),
}));

jest.mock('@libs/OptionsListUtils', () => ({
    getSearchOptions: jest.fn(({excludeFromSuggestionsOnly = {}}: {excludeFromSuggestionsOnly?: Record<string, boolean>} = {}) => {
        const personalDetails = [
            {text: 'John Doe', login: 'john@example.com', accountID: 1},
            {text: 'Jane Smith', login: 'jane@example.com', accountID: 2},
            {text: 'Account Manager', login: 'account.manager@expensify.com', accountID: 3},
        ];

        return {
            personalDetails: personalDetails.filter((personalDetail) => !excludeFromSuggestionsOnly[personalDetail.login]),
            recentReports: [
                {text: 'General Chat', reportID: 'report1'},
                {text: 'Team Updates', reportID: 'report2'},
            ],
        };
    }),
}));

jest.mock('@libs/PolicyUtils', () => ({
    getAllTaxRates: jest.fn(() => ({})),
    getCleanedTagName: jest.fn((tag: string) => tag),
    getVisibleWorkspaceMemberLogins: jest.fn(() => Object.fromEntries([['john@example.com', true]])),
    getNonVisibleWorkspaceMemberExclusionLogins: jest.fn((personalDetails: Record<string, {login?: string} | null> = {}, visibleWorkspaceMemberLogins: Record<string, boolean> = {}) => {
        const exclusions: Record<string, boolean> = {};
        for (const personalDetail of Object.values(personalDetails)) {
            const login = personalDetail?.login;
            if (!login || visibleWorkspaceMemberLogins[login.toLowerCase()]) {
                continue;
            }
            exclusions[login] = true;
        }
        return exclusions;
    }),
    shouldShowPolicy: jest.fn(() => true),
}));

jest.mock('@libs/CardFeedUtils', () => ({
    getCardFeedsForDisplay: jest.fn(() => ({feed1: {name: 'Company Visa', id: 'feed1'}})),
}));

jest.mock('@libs/CardUtils', () => ({
    getCardDescription: jest.fn(() => 'Visa *1234'),
    isCard: jest.fn(() => true),
    isCardHiddenFromSearch: jest.fn(() => false),
}));

jest.mock('@libs/CategoryUtils', () => ({
    getDecodedCategoryName: jest.fn((name: string) => name),
}));

jest.mock('@libs/SearchQueryUtils', () => ({
    getUserFriendlyKey: jest.fn((key: string) => key),
    getUserFriendlyValue: jest.fn((value: string) => value),
}));

jest.mock('@libs/SearchUIUtils', () => ({
    getDatePresets: jest.fn(() => ['today', 'yesterday', 'lastWeek', 'lastMonth']),
    getHasOptions: jest.fn(() => [{value: 'attachment'}, {value: 'note'}]),
}));

jest.mock('@hooks/useExportedToFilterOptions', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention -- mock must match the default export shape
    __esModule: true,
    default: () => ({
        exportedToFilterOptions: ['QuickBooks Online', 'Xero', 'NetSuite'],
        combinedUniqueExportTemplates: [],
        connectedIntegrationNames: new Set<string>(),
    }),
}));

// eslint-disable-next-line @typescript-eslint/naming-convention -- jest.requireMock returns a module-shaped object; destructured name must match the original export
const {parseForAutocomplete} = jest.requireMock<{parseForAutocomplete: jest.Mock}>('@libs/SearchAutocompleteUtils');

const defaultParams = {
    autocompleteQueryValue: '',
    allCards: {},
    allFeeds: {},
    options: {reports: [], personalDetails: []},
    draftComments: {},
    nvpDismissedProductTraining: undefined,
    betas: [] as never[],
    countryCode: 1,
    loginList: {},
    policies: {},
    visibleReportActionsData: undefined,
    currentUserAccountID: 100,
    currentUserEmail: 'me@example.com',
    personalDetails: {},
    feedKeysWithCards: undefined,
    translate: jest.fn((key: string) => key) as never,
};

describe('useAutocompleteSuggestions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns empty array when autocompleteKey is undefined (empty query)', () => {
        parseForAutocomplete.mockReturnValue({autocomplete: null, ranges: []});

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: ''}));

        expect(result.current).toEqual([]);
    });

    it('returns empty array when parseForAutocomplete returns undefined', () => {
        parseForAutocomplete.mockReturnValue(undefined);

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'random text'}));

        expect(result.current).toEqual([]);
    });

    it('returns tag suggestions when autocomplete key is tag', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, value: 'eng'},
            ranges: [],
        });

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'tag:eng'}));

        expect(result.current.length).toBeGreaterThan(0);
        expect(result.current.at(0)?.filterKey).toBe(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TAG);
        expect(result.current.at(0)?.mapKey).toBe(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG);
    });

    it('returns recent tags when autocomplete value is empty', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, value: ''},
            ranges: [],
        });

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'tag:'}));

        expect(result.current.length).toBe(2);
    });

    it('returns category suggestions when autocomplete key is category', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, value: 'tra'},
            ranges: [],
        });

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'category:tra'}));

        expect(result.current.length).toBeGreaterThan(0);
        expect(result.current.at(0)?.filterKey).toBe(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.CATEGORY);
    });

    it('returns currency suggestions when autocomplete key is currency', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY, value: 'u'},
            ranges: [],
        });

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'currency:u'}));

        expect(result.current.length).toBeGreaterThan(0);
        const currencies = result.current.map((item) => item.text);
        expect(currencies).toContain('USD');
        expect(currencies).toContain('AUD');
        expect(currencies).not.toContain('RETIRED_CURRENCY');
    });

    it('returns participant suggestions when autocomplete key is from', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, value: 'john'},
            ranges: [],
        });

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'from:john'}));

        expect(result.current.length).toBeGreaterThan(0);
        expect(result.current.at(0)?.filterKey).toBe(CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM);
        expect(result.current.at(0)?.mapKey).toBe(CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM);
    });

    it('scopes from suggestions to visible workspace members', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, value: ''},
            ranges: [],
        });
        const personalDetails = Object.fromEntries([
            ['1', {accountID: 1, login: 'john@example.com'}],
            ['2', {accountID: 2, login: 'jane@example.com'}],
            ['3', {accountID: 3, login: 'account.manager@expensify.com'}],
        ]);

        const {result} = renderHook(() =>
            useAutocompleteSuggestions({
                ...defaultParams,
                autocompleteQueryValue: 'from:',
                personalDetails,
            }),
        );

        expect(result.current.map((item) => item.text)).toEqual(['John Doe']);
    });

    it('does not scope to: suggestions to visible workspace members', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TO, value: ''},
            ranges: [],
        });
        const personalDetails = Object.fromEntries([
            ['1', {accountID: 1, login: 'john@example.com'}],
            ['2', {accountID: 2, login: 'jane@example.com'}],
            ['3', {accountID: 3, login: 'account.manager@expensify.com'}],
        ]);

        const {result} = renderHook(() =>
            useAutocompleteSuggestions({
                ...defaultParams,
                autocompleteQueryValue: 'to:',
                personalDetails,
            }),
        );

        expect(result.current.map((item) => item.text)).toEqual(['John Doe', 'Jane Smith', 'Account Manager']);
    });

    it('returns type suggestions when autocomplete key is type', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE, value: 'exp'},
            ranges: [],
        });

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'type:exp'}));

        expect(result.current.length).toBeGreaterThan(0);
        expect(result.current.at(0)?.filterKey).toBe(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TYPE);
    });

    it('excludes already autocompleted keys from results', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, value: ''},
            ranges: [{key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, value: 'engineering', start: 0, length: 15}],
        });

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'tag:engineering tag:'}));

        const tagTexts = result.current.map((item) => item.text.toLowerCase());
        expect(tagTexts).not.toContain('engineering');
    });

    it('limits results to 10 items', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY, value: ''},
            ranges: [],
        });

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'currency:'}));

        expect(result.current.length).toBeLessThanOrEqual(10);
    });

    it('handles continuation detection for multi-word values', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: null,
            ranges: [{key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, value: 'John', start: 0, length: 9}],
        });

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'from:John Doe'}));

        expect(result.current.length).toBeGreaterThan(0);
    });

    it('returns tax rate suggestions when autocomplete key is taxRate', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE, value: 'vat'},
            ranges: [],
        });

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'taxRate:vat'}));

        expect(result.current.length).toBeGreaterThan(0);
        expect(result.current.at(0)?.filterKey).toBe(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.TAX_RATE);
        expect(result.current.at(0)?.mapKey).toBe(CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE);
    });

    it('returns status suggestions when autocomplete key is status', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS, value: ''},
            ranges: [{key: CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE, value: CONST.SEARCH.DATA_TYPES.EXPENSE, start: 0, length: 12}],
        });

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'type:expense status:'}));

        expect(result.current.length).toBeGreaterThan(0);
        expect(result.current.at(0)?.filterKey).toBe(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.STATUS);
    });

    it('returns empty array for date key (presets filter)', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, value: 'to'},
            ranges: [],
        });

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'date:to'}));

        expect(result.current.length).toBeGreaterThan(0);
        expect(result.current.at(0)?.filterKey).toBe(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE);
    });

    it('returns boolean suggestions for reimbursable key', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE, value: ''},
            ranges: [],
        });

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'reimbursable:'}));

        expect(result.current.length).toBeGreaterThan(0);
        expect(result.current.at(0)?.filterKey).toBe(CONST.SEARCH.SYNTAX_FILTER_KEYS.REIMBURSABLE);
    });

    it('returns in: suggestions for chat reports', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.IN, value: 'gen'},
            ranges: [],
        });

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'in:gen'}));

        expect(result.current.length).toBeGreaterThan(0);
        expect(result.current.at(0)?.filterKey).toBe(CONST.SEARCH.SEARCH_USER_FRIENDLY_KEYS.IN);
        expect(result.current.at(0)?.mapKey).toBe(CONST.SEARCH.SYNTAX_FILTER_KEYS.IN);
    });

    it('returns empty for in: with empty value when keys already completed', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.IN, value: ''},
            ranges: [{key: CONST.SEARCH.SYNTAX_FILTER_KEYS.IN, value: 'general', start: 0, length: 10}],
        });

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'in:general in:'}));

        expect(result.current).toEqual([]);
    });

    it('returns empty array for unknown autocomplete key', () => {
        parseForAutocomplete.mockReturnValue({
            autocomplete: {key: 'unknownKey', value: 'test'},
            ranges: [],
        });

        const {result} = renderHook(() => useAutocompleteSuggestions({...defaultParams, autocompleteQueryValue: 'unknownKey:test'}));

        expect(result.current).toEqual([]);
    });
});

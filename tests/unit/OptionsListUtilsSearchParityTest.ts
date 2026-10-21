import SEARCH_ROUTER_OPTIONS_CONFIG from '@components/Search/SearchRouter/searchRouterOptionsConfig';

// cspell:disable -- names and queries deliberately use diacritics, non-Latin scripts and misspelled forms
import type {OptionList, Options, SearchOptionData} from '@libs/OptionsListUtils';
import {
    clearAlternateTextCache,
    clearFilteredOptionListCache,
    combineOrderingOfReportsAndPersonalDetails,
    createFilteredOptionList,
    getSearchOptions,
    hydrateContactOption,
} from '@libs/OptionsListUtils';
import type {OptionsResult} from '@libs/OptionsListUtils/types';

import initOnyxDerivedValues from '@userActions/OnyxDerived';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Rule} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type {SearchFixture} from '../utils/searchParity/generateSearchFixture';

import {CURRENT_USER_ACCOUNT_ID, CURRENT_USER_EMAIL, generateSearchFixture, OWN_POLICY_ID, SEARCH_QUERIES, writeSearchFixtureToOnyx} from '../utils/searchParity/generateSearchFixture';
import {convertToDisplayString, convertToDisplayStringWithoutCurrency, formatPhoneNumber, localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@src/libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    dismissModal: jest.fn(),
    goBack: jest.fn(),
    getTopmostReportId: jest.fn(() => undefined),
    setNavigationActionToMicrotaskQueue: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    getReportRHPActiveRoute: jest.fn(),
}));

// Baseline snapshot for the search option pipeline (createFilteredOptionList to getSearchOptions).
// Only re-record (jest -u) against pre-migration search on main so the migration never becomes its own baseline.
const fixture = generateSearchFixture();

/** Drops every cache the search keeps between calls, so the next build starts cold. */
function clearSearchCaches() {
    clearFilteredOptionListCache();
    clearAlternateTextCache();
}

/**
 * Serializes options into "<keyForList> <text> [flags] [alt: ...] [accID: ...]" lines to pin option ordering and content rather than rendering details.
 * Invited users include their login when different from text to distinguish email from phone invites.
 */
function createOptionSerializer() {
    function serializeOption(option: SearchOptionData | null | undefined, {isUserToInvite = false}: {isUserToInvite?: boolean} = {}): string | null {
        if (!option) {
            return null;
        }
        const flags = [
            option.isSelected ? ' [selected]' : '',
            option.isDisabled ? ' [disabled]' : '',
            option.isBold ? ' [bold]' : '',
            option.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.INFO ? ' [gbr]' : '',
            option.brickRoadIndicator === CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR ? ' [rbr]' : '',
        ].join('');
        const invitedLogin = isUserToInvite && option.login !== option.text ? ` ${option.login ?? ''}` : '';
        const altText = option.alternateText ? ` [alt: ${option.alternateText}]` : '';
        const accountID = option.accountID ? ` [accID: ${option.accountID}]` : '';
        return `${option.keyForList ?? ''} ${option.text ?? ''}${flags}${altText}${accountID}${invitedLogin}`;
    }

    function serializeResult({options, hasMore}: OptionsResult | {options: Options; hasMore?: boolean}) {
        return {
            recentReports: options.recentReports.map((option) => serializeOption(option)),
            personalDetails: options.personalDetails.map((option) => serializeOption(option)),
            workspaceChats: options.workspaceChats?.map((option) => serializeOption(option)),
            selfDMChat: serializeOption(options.selfDMChat),
            currentUserOption: serializeOption(options.currentUserOption),
            userToInvite: serializeOption(options.userToInvite, {
                isUserToInvite: true,
            }),
            hasMore: !!hasMore,
        };
    }

    /** Preserves pipeline ordering, but sorts unordered collections to ensure deterministic snapshots. */
    function serializeOptionList(optionList: OptionList, {isOrderMeaningful}: {isOrderMeaningful: boolean}) {
        const sortIfUnordered = (references: Array<string | null>) => (isOrderMeaningful ? references : [...references].sort());
        return {
            reports: sortIfUnordered(optionList.reports.map((option) => serializeOption(option))),
            // Shells are compared both as built and after hydration, so the shell/hydrator split stays invisible
            personalDetails: optionList.personalDetails.map((shell) => `${shell.reportID} | ${shell.accountID} | ${shell.login ?? ''}`).sort(),
            hydratedPersonalDetails: optionList.personalDetails.map((shell) => serializeOption(hydrateContactOption(shell))).sort(),
        };
    }

    return {serializeOption, serializeResult, serializeOptionList};
}

function expectToMatchGoldenMaster(value: unknown) {
    expect(value).toMatchSnapshot();
}

/**
 * Cap for the SearchRouter idle list. Production uses 100, which keeps all fixture reports. Setting this to 10 forces evictions.
 */
const SEARCH_ROUTER_IDLE_REPORTS_CAP = 10;

const RULES: OnyxCollection<Rule> = {};

type BuildOptionListConfig = {
    isSearching: boolean;
    maxRecentReports?: number;
    deferContactsUntilSearch?: boolean;
    includeP2P?: boolean;
};

/** Builds the list as useFilteredOptions does, keeping whatever search cached from earlier builds. */
function buildOptionList(sourceFixture: SearchFixture, {isSearching, maxRecentReports, deferContactsUntilSearch, includeP2P = true}: BuildOptionListConfig): OptionList {
    const {sortedActions, lastActions, transactionThreadIDs} = sourceFixture.derived.sortedReportActions;
    return createFilteredOptionList(
        sourceFixture.personalDetails,
        sourceFixture.reports,
        sourceFixture.derived.reportAttributes,
        sourceFixture.privateIsArchivedMap,
        sourceFixture.policies,
        {
            currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
            currentUserLogin: CURRENT_USER_EMAIL,
            transactionThreadIDs,
            lastActions,
            dateFnsLocale: undefined,
            convertToDisplayString,
            conciergeReportID: sourceFixture.conciergeReportID,
            includeP2P,
            isSearching,
            maxRecentReports,
            deferContactsUntilSearch,
            formatPhoneNumber,
        },
        RULES,
        undefined,
        undefined,
        undefined,
        sortedActions,
    );
}

function buildSearchRouterIdleOptionList(sourceFixture: SearchFixture, maxRecentReports: number): OptionList {
    return buildOptionList(sourceFixture, {
        isSearching: false,
        maxRecentReports,
        deferContactsUntilSearch: SEARCH_ROUTER_OPTIONS_CONFIG.deferContactsUntilSearch,
        includeP2P: SEARCH_ROUTER_OPTIONS_CONFIG.includeP2P,
    });
}

// Passed to combineOrderingOfReportsAndPersonalDetails. Only affects workspace chat ordering, which displayed passes do not show.
const ACTIVE_POLICY_ID = OWN_POLICY_ID;

type SearchCallSite = (options: OptionList, query: string) => OptionsResult;

/**
 * Keeps getReportByID stable for identical fixture.reports references as useCallback(..., [allReports]) does in useFilteredOptions,
 * so the preview cache is not invalidated between keystrokes when reports have not changed.
 */
const reportGettersByReports = new WeakMap<SearchFixture['reports'], (reportID: string | undefined) => Report | undefined>();

function getOrCreateReportByID(reports: SearchFixture['reports']) {
    let getter = reportGettersByReports.get(reports);
    if (!getter) {
        getter = (reportID: string | undefined): Report | undefined => (reportID ? (reports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] ?? undefined) : undefined);
        reportGettersByReports.set(reports, getter);
    }
    return getter;
}

/**
 * Builds frozen copies of the production SearchRouter search configurations for the given fixture.
 * Includes the screen-side ranking step (combineOrderingOfReportsAndPersonalDetails) while omitting pure styling steps.
 */
function createCallSites(sourceFixture: SearchFixture) {
    const getReportByID = getOrCreateReportByID(sourceFixture.reports);
    const {sortedActions, lastActions, transactionThreadIDs} = sourceFixture.derived.sortedReportActions;
    const visibleReportActionsData = sourceFixture.derived.visibleReportActions;

    // Configuration every getSearchOptions screen passes
    const baseSearchConfig = {
        dateFnsLocale: undefined,
        convertToDisplayString,
        draftComments: sourceFixture.draftComments,
        countryCode: CONST.DEFAULT_COUNTRY_CODE,
        loginList: sourceFixture.loginList,
        currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
        currentUserEmail: CURRENT_USER_EMAIL,
        policyCollection: sourceFixture.policies,
        personalDetails: sourceFixture.personalDetails,
        sortedActions,
        conciergeReportID: sourceFixture.conciergeReportID,
        translate: translateLocal,
        formatPhoneNumber,
        getReportByID,
        rules: RULES,
    };
    // SearchAutocompleteList server pass
    const serverPassConfig = {
        ...baseSearchConfig,
        visibleReportActionsData,
    };
    // SearchAutocompleteList local pass
    const commonSearchConfig = {
        ...baseSearchConfig,
        convertToDisplayStringWithoutCurrency,
        currentUserLogin: CURRENT_USER_EMAIL,
        visibleReportActionsData,
        transactionThreadIDs,
        lastActions,
        reportAttributesDerived: sourceFixture.derived.reportAttributes,
        localeCompare,
    };

    // SearchAutocompleteList's local pass, which its displayed pass then reorders
    const runSearchRouterSearch = (options: OptionList, query: string) =>
        getSearchOptions({
            ...commonSearchConfig,
            options,
            isDefaultRoomsBetaEnabled: true,
            isUsedInChatFinder: true,
            includeReadOnly: true,
            searchQuery: query,
            maxResults: CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS,
            includeUserToInvite: true,
            includeRecentReports: true,
            includeCurrentUser: true,
            shouldShowGBR: false,
            shouldUnreadBeBold: true,
        });

    const searchCallSites = {
        searchRouterLocal: (options, query) => runSearchRouterSearch(options, query),
        // Replicates the displayed ranking and capping pass from SearchAutocompleteList
        searchRouterDisplayed: (options, query) => {
            const result = runSearchRouterSearch(options, query);

            if (!query.trim()) {
                return {
                    options: {
                        ...result.options,
                        recentReports: result.options.recentReports.slice(0, CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS),
                    },
                    hasMore: result.hasMore,
                };
            }

            // SearchAutocompleteList ranks by the raw autocomplete value, not the trimmed one
            const ordered = combineOrderingOfReportsAndPersonalDetails(result.options, query, ACTIVE_POLICY_ID, {
                sortByReportTypeInSearch: true,
                preferChatRoomsOverThreads: true,
            });
            const displayedReports = [...ordered.recentReports, ...ordered.personalDetails];
            if (result.options.userToInvite) {
                displayedReports.push(result.options.userToInvite);
            }

            return {
                options: {
                    ...result.options,
                    recentReports: displayedReports.slice(0, CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS),
                    personalDetails: ordered.personalDetails,
                },
                hasMore: result.hasMore,
            };
        },
    } satisfies Record<string, SearchCallSite>;

    return {searchCallSites, serverPassConfig};
}

// Extracts call site names for test parameterization. Actual instances are created in beforeAll once Onyx derives report values.
const CALL_SITE_NAMES = Object.keys(createCallSites(fixture).searchCallSites);

type OptionListKind = 'searching' | 'searchRouterIdle';

// Maps call sites to the option list used when query is blank (the small idle list, or the searching list for any other query).
const BLANK_QUERY_OPTION_LIST: Record<string, OptionListKind> = {
    searchRouterLocal: 'searchRouterIdle',
    searchRouterDisplayed: 'searchRouterIdle',
};

function getOptionListKind(callSite: string, query: string): OptionListKind {
    if (query.trim()) {
        return 'searching';
    }
    const kind = BLANK_QUERY_OPTION_LIST[callSite];
    if (!kind) {
        throw new Error(`Call site ${callSite} does not say which list it searches with a blank query`);
    }
    return kind;
}

// Reports returned by the SearchAutocompleteList server pass in Auth ranking order, including a self-DM that the pass drops.
const SERVER_PASS_REPORT_NAMES = [
    '#admins',
    '#announce',
    '#vít-room',
    'Weekend Hiking',
    'Current User (you)',
    'Book flights',
    'Offsite expenses',
    'Thread about the offsite',
    'İsmail Yılmaz',
    "Mary-Jane O'Brien (archived) ",
];

/** Finds a fixture report by its name, so a test never depends on the reportIDs the fixture assigns. */
function getReportIDByName(sourceFixture: SearchFixture, reportName: string): string {
    const reportID = Object.values(sourceFixture.reports).find((report) => report?.reportName === reportName)?.reportID;
    if (!reportID) {
        throw new Error(`No fixture report is named ${reportName}`);
    }
    return reportID;
}

/** Computes every recorded pass over the fixture, starting from cold caches. */
function computeGoldenMaster(sourceFixture: SearchFixture) {
    const {serializeOption, serializeResult, serializeOptionList} = createOptionSerializer();
    const {searchCallSites, serverPassConfig} = createCallSites(sourceFixture);
    clearSearchCaches();

    const searching = buildOptionList(sourceFixture, {isSearching: true});
    const idle = buildOptionList(sourceFixture, {isSearching: false});
    const buildSearchRouterIdleList = (maxRecentReports: number) => buildSearchRouterIdleOptionList(sourceFixture, maxRecentReports);
    const searchRouterIdle = buildSearchRouterIdleList(SEARCH_ROUTER_IDLE_REPORTS_CAP);
    const searchRouterIdleAtProductionCap = buildSearchRouterIdleList(SEARCH_ROUTER_OPTIONS_CONFIG.maxRecentReports);

    const optionLists = {
        // The searching list keeps the collection's iteration order, which the search ranks later, so only its content is recorded
        searching: serializeOptionList(searching, {isOrderMeaningful: false}),
        idle: serializeOptionList(idle, {isOrderMeaningful: true}),
        searchRouterIdle: serializeOptionList(searchRouterIdle, {
            isOrderMeaningful: true,
        }),
        searchRouterIdleAtProductionCap: serializeOptionList(searchRouterIdleAtProductionCap, {isOrderMeaningful: true}),
    };

    const optionListsByKind: Record<OptionListKind, OptionList> = {
        searching,
        searchRouterIdle,
    };
    const callSites = Object.fromEntries(
        Object.entries(searchCallSites).map(([callSite, run]) => [
            callSite,
            Object.fromEntries(SEARCH_QUERIES.map((query) => [query, serializeResult(run(optionListsByKind[getOptionListKind(callSite, query)], query))])),
        ]),
    );

    const orderedServerReportIDs = SERVER_PASS_REPORT_NAMES.map((reportName) => getReportIDByName(sourceFixture, reportName)).slice(
        0,
        CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS,
    );
    const serverReportIDs = new Set(orderedServerReportIDs);
    // SearchAutocompleteList server pass reads derived attributes from Onyx because reportAttributesDerived is omitted
    const serverPassOptions = getSearchOptions({
        ...serverPassConfig,
        options: {
            reports: searching.reports.filter((option) => serverReportIDs.has(option.reportID)),
            personalDetails: [],
        },
        isDefaultRoomsBetaEnabled: true,
        isUsedInChatFinder: true,
        includeReadOnly: true,
        searchQuery: '',
        maxResults: orderedServerReportIDs.length,
        includeUserToInvite: false,
        includeRecentReports: true,
        includeCurrentUser: false,
        shouldShowGBR: false,
        shouldUnreadBeBold: true,
    }).options;
    // The pass then puts the rows back in Auth's order and drops the self-DM
    const serverPassOptionsByReportID = new Map(serverPassOptions.recentReports.map((option) => [option.reportID, option]));
    const serverPass = orderedServerReportIDs.map((reportID) => serverPassOptionsByReportID.get(reportID)).filter((option) => !!option && !option.isSelfDM);

    // When the idle cap hides reports and shows fewer rows than available slots, rebuild with all reports via loadAll
    const totalReports = Object.keys(sourceFixture.reports).length;
    const searchRouterBlankAtSmallCap = searchCallSites.searchRouterDisplayed(searchRouterIdle, '');
    const shouldLoadAllReports =
        searchRouterBlankAtSmallCap.options.recentReports.length < CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS && SEARCH_ROUTER_IDLE_REPORTS_CAP < totalReports;
    const searchRouterIdleAfterLoadAll = shouldLoadAllReports ? buildSearchRouterIdleList(totalReports) : searchRouterIdle;
    const runSearchRouterBlank = (optionList: OptionList) => ({
        local: serializeResult(searchCallSites.searchRouterLocal(optionList, '')),
        displayed: serializeResult(searchCallSites.searchRouterDisplayed(optionList, '')),
    });

    const passes = {
        searchRouterBlank: {
            atProductionCap: runSearchRouterBlank(searchRouterIdleAtProductionCap),
            afterLoadAll: {
                didLoadAll: shouldLoadAllReports,
                ...runSearchRouterBlank(searchRouterIdleAfterLoadAll),
            },
        },
        serverPass: serverPass.map((option) => serializeOption(option)),
    };

    return {optionLists, callSites, passes};
}

describe('OptionsListUtils search parity (golden master)', () => {
    let goldenMaster: ReturnType<typeof computeGoldenMaster>;

    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await IntlStore.load(CONST.LOCALES.EN);
        initOnyxDerivedValues();
        await waitForBatchedUpdates();
        // The fixture starts without derived values. Writing to Onyx derives them for subsequent reads.
        fixture.derived = await writeSearchFixtureToOnyx(fixture);
        goldenMaster = computeGoldenMaster(fixture);
    });

    beforeEach(() => {
        clearSearchCaches();
    });

    it('builds searching, idle and SearchRouter idle option lists that match the golden master', () => {
        // Given the fixture account with every report type and contact quirk
        // When the option list is built for search (every report), for the idle state (top-N, sorted) and for the SearchRouter idle state (small top-N, contacts deferred)
        // Then every option keeps its identity, flags and, where it matters, its order
        expectToMatchGoldenMaster(goldenMaster.optionLists);
    });

    it.each(CALL_SITE_NAMES)('call site %s matches the golden master for every query', (callSite) => {
        // Given a production getSearchOptions config and the option list it searches (the full list, or its idle list while the query is blank)
        // When every query in the matrix runs through it
        // Then the sections and their order match the recorded golden master
        expectToMatchGoldenMaster(goldenMaster.callSites[callSite]);
    });

    it('SearchRouter blank query and server-ID pass match the golden master', () => {
        // Given the SearchRouter idle list at the production cap and after loading all reports, and the SearchAutocompleteList server pass (a fixed set of reports in Auth's order, no query)
        // When they run through their production configs
        // Then both match the recorded golden master
        expectToMatchGoldenMaster(goldenMaster.passes);
    });
});

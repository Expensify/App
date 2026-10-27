// cspell:disable -- names and queries deliberately use diacritics, non-Latin scripts and misspelled forms
import SEARCH_ROUTER_OPTIONS_CONFIG from '@components/Search/SearchRouter/searchRouterOptionsConfig';

import type {OptionList, SearchOptionData} from '@libs/OptionsListUtils';
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
import Navigation from '@src/libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Rule} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';

import Onyx from 'react-native-onyx';

import type {SearchFixture} from '../utils/searchParity/generateSearchFixture';

import {ACCOUNT_IDS, CURRENT_USER_EMAIL, generateSearchFixture, POLICY_IDS, SEARCH_QUERIES, writeSearchFixtureToOnyx} from '../utils/searchParity/generateSearchFixture';
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
 * Serializes options into "<keyForList> <text> [flags] [alt: ...] [sub: ...] [accID: ...] [nav: ...]" lines to pin option ordering and content rather than rendering details.
 * [sub: ...] is only emitted for rooms and workspace chats, because that is what search matches for them.
 * [nav: ...] is the row's navigation target (reportID, else login, else none), emitted only when it differs from keyForList: report rows navigate by reportID, which equals keyForList today, so only a divergence shows.
 * The userToInvite login target is not emitted, because it is already visible as the text or the trailing invited login.
 * participantsList, icons and ownerAccountID are left out because the SearchRouter only renders them or never reads them. policyID and item are read for contextual search and FullStory masking, but only the canonical builders set them, so they are left out too.
 */
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
        option.private_isArchived ? ' [archived]' : '',
    ].join('');
    const invitedLogin = isUserToInvite && option.login !== option.text ? ` ${option.login ?? ''}` : '';
    const altText = option.alternateText ? ` [alt: ${option.alternateText}]` : '';
    const subtitle = (option.isChatRoom || option.isPolicyExpenseChat) && option.subtitle ? ` [sub: ${option.subtitle}]` : '';
    const accountID = option.accountID ? ` [accID: ${option.accountID}]` : '';
    const navigationTarget = option.reportID || option.login;
    const isLoginShownAlready = isUserToInvite && !option.reportID;
    const navigation = !isLoginShownAlready && String(navigationTarget ?? '') !== (option.keyForList ?? '') ? ` [nav: ${navigationTarget || 'none'}]` : '';
    return `${option.keyForList ?? ''} ${option.text ?? ''}${flags}${altText}${subtitle}${accountID}${navigation}${invitedLogin}`;
}

/** What the screen shows: one flat list of rows, in order. */
type DisplayedResult = {displayedRows: SearchOptionData[]; hasMore?: boolean};

function serializeResult(result: OptionsResult | DisplayedResult) {
    if ('displayedRows' in result) {
        return {
            displayedRows: result.displayedRows.map((option) => serializeOption(option)),
            hasMore: !!result.hasMore,
        };
    }
    const {options, hasMore} = result;
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

/**
 * Cap for the SearchRouter idle list recorded in optionLists, which only exists to record evictions in createFilteredOptionList. No call site searches this list.
 * The production cap (SEARCH_ROUTER_OPTIONS_CONFIG.maxRecentReports) keeps all fixture reports, while setting this to 10 forces evictions.
 * The value is arbitrary: any cap below the fixture report count forces evictions, and 10 just keeps the recorded idle list short. No particular sort rule sits at the boundary.
 */
const SEARCH_ROUTER_IDLE_REPORTS_CAP = 10;

// The fixture account has no intro selection (not a track-intent user), no Onyx rules and no policy tags, which is what SearchAutocompleteList reads for it.
// allPolicyTags is omitted because it only reaches modified-expense previews and the fixture has none, so changes to tag names, rules or the track-intent welcome text are not pinned here.
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
            currentUserAccountID: ACCOUNT_IDS.CURRENT_USER,
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
const ACTIVE_POLICY_ID = POLICY_IDS.OWN;

type SearchCallSite = (options: OptionList, query: string) => OptionsResult | DisplayedResult;

const CALL_SITE_NAMES = ['searchRouterLocal', 'searchRouterDisplayed'] as const;

type SearchCallSiteName = TupleToUnion<typeof CALL_SITE_NAMES>;

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
        currentUserAccountID: ACCOUNT_IDS.CURRENT_USER,
        currentUserEmail: CURRENT_USER_EMAIL,
        policyCollection: sourceFixture.policies,
        personalDetails: sourceFixture.personalDetails,
        sortedActions,
        conciergeReportID: sourceFixture.conciergeReportID,
        translate: translateLocal,
        formatPhoneNumber,
        getReportByID,
        rules: RULES,
        isTrackIntentUser: false,
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
                    displayedRows: result.options.recentReports.slice(0, CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS),
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
                displayedRows: displayedReports.slice(0, CONST.AUTO_COMPLETE_SUGGESTER.MAX_AMOUNT_OF_SUGGESTIONS),
                hasMore: result.hasMore,
            };
        },
    } satisfies Record<SearchCallSiteName, SearchCallSite>;

    return {searchCallSites, serverPassConfig};
}

// Reports returned by the SearchAutocompleteList server pass in Auth ranking order, including a self-DM that the pass drops and reports the canonical filter rejects.
const SERVER_PASS_REPORT_NAMES = [
    '#admins',
    '#announce',
    'Hidden thread',
    '#vít-room',
    'Weekend Hiking',
    'Current User (you)',
    'Empty thread',
    'Book flights',
    'Offsite expenses',
    'Empty submitted report',
    'Thread about the offsite',
    'İsmail Yılmaz',
    "Mary-Jane O'Brien (archived) ",
];

// An ID Auth returns for a report the client has not loaded, which the pass drops because it has no local option. No fixture report uses it.
const UNKNOWN_SERVER_REPORT_ID = '999999';

/** Finds a fixture report by its name, so a test never depends on the reportIDs the fixture assigns. */
function getReportIDByName(sourceFixture: SearchFixture, reportName: string): string {
    const reportID = Object.values(sourceFixture.reports).find((report) => report?.reportName === reportName)?.reportID;
    if (!reportID) {
        throw new Error(`No fixture report is named ${reportName}`);
    }
    return reportID;
}

// Dropped from the list unless focused, because the focused report skips the checks that drop empty threads and empty submitted reports
const FOCUSED_REPORT_NAMES = ['Empty thread', 'Empty submitted report'];

// The thread ranks past the MAX_AMOUNT_OF_SUGGESTIONS rows the blank list shows, so its focused blank result equals the unfocused one and only the query is recorded for it
const FOCUSED_REPORT_NAME_WITH_BLANK = 'Empty submitted report';

// Matches both focused reports, so the pass shows whether they come back while a query is typed
const FOCUSED_REPORT_QUERY = 'empty';

/** Runs with the report focused, as when Cmd+K opens over it, then goes back to nothing focused so no other pass sees it. */
function withFocusedReport<T>(reportID: string, run: () => T): T {
    jest.mocked(Navigation.getTopmostReportId).mockReturnValue(reportID);
    try {
        return run();
    } finally {
        jest.mocked(Navigation.getTopmostReportId).mockReturnValue(undefined);
    }
}

/** Computes every recorded pass over the fixture, starting from cold caches. */
function computeGoldenMaster(sourceFixture: SearchFixture) {
    const {searchCallSites, serverPassConfig} = createCallSites(sourceFixture);
    clearSearchCaches();

    const searching = buildOptionList(sourceFixture, {isSearching: true});
    const buildSearchRouterIdleList = (maxRecentReports: number) => buildSearchRouterIdleOptionList(sourceFixture, maxRecentReports);
    const searchRouterIdle = buildSearchRouterIdleList(SEARCH_ROUTER_IDLE_REPORTS_CAP);
    const searchRouterIdleAtProductionCap = buildSearchRouterIdleList(SEARCH_ROUTER_OPTIONS_CONFIG.maxRecentReports);

    const optionLists = {
        // The searching list keeps the collection's iteration order, which the search ranks later, so only its content is recorded
        searching: serializeOptionList(searching, {isOrderMeaningful: false}),
        searchRouterIdle: serializeOptionList(searchRouterIdle, {
            isOrderMeaningful: true,
        }),
        searchRouterIdleAtProductionCap: serializeOptionList(searchRouterIdleAtProductionCap, {isOrderMeaningful: true}),
    };

    // The SearchRouter starts at the production cap, and its loadAll effect expands a list that has fewer than 20 rows, so a blank query never searches the small idle list
    const getCallSiteOptionList = (query: string) => (query.trim() ? searching : searchRouterIdleAtProductionCap);
    const callSites = Object.fromEntries(
        CALL_SITE_NAMES.map((callSite) => [
            callSite,
            Object.fromEntries(SEARCH_QUERIES.map((query) => [query, serializeResult(searchCallSites[callSite](getCallSiteOptionList(query), query))])),
        ]),
    );

    const orderedServerReportIDs = [...SERVER_PASS_REPORT_NAMES.map((reportName) => getReportIDByName(sourceFixture, reportName)), UNKNOWN_SERVER_REPORT_ID].slice(
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

    const passes = {
        serverPass: serverPass.map((option) => serializeOption(option)),

        // Recorded after the passes above, which run with nothing focused
        focusedReport: Object.fromEntries(
            FOCUSED_REPORT_NAMES.map((reportName) => [
                reportName,
                withFocusedReport(getReportIDByName(sourceFixture, reportName), () => ({
                    ...(reportName === FOCUSED_REPORT_NAME_WITH_BLANK ? {blank: serializeResult(searchCallSites.searchRouterDisplayed(searchRouterIdleAtProductionCap, ''))} : {}),
                    [FOCUSED_REPORT_QUERY]: serializeResult(searchCallSites.searchRouterDisplayed(searching, FOCUSED_REPORT_QUERY)),
                })),
            ]),
        ),
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

    it('builds searching and SearchRouter idle option lists that match the golden master', () => {
        // Given the fixture account with every report type and contact quirk
        // When the option list is built for search (every report) and for the SearchRouter idle state (top-N, contacts deferred) at the small cap and the production cap
        // Then every option keeps its identity, flags and, where it matters, its order
        expect(goldenMaster.optionLists).toMatchSnapshot();
    });

    it.each(CALL_SITE_NAMES)('call site %s matches the golden master for every query', (callSite) => {
        // Given a production getSearchOptions config and the option list it searches (the full list, or the production-cap idle list while the query is blank)
        // When every query in the matrix runs through it
        // Then the sections and their order match the recorded golden master
        expect(goldenMaster.callSites[callSite]).toMatchSnapshot();
    });

    it('SearchRouter blank query and server-ID pass match the golden master', () => {
        // Given the SearchAutocompleteList server pass (a fixed set of reports in Auth's order, no query, including rejected and unknown IDs that it drops) and the SearchRouter opened over a focused empty thread or empty submitted report
        // When they run through their production configs, the focused ones for a query matching the focused report, and for a blank query only where the report lands within the displayed rows
        // Then all match the recorded golden master, with the focused report shown only while it is focused
        expect(goldenMaster.passes).toMatchSnapshot();
    });
});

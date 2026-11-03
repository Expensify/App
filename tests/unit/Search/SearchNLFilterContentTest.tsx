import {act, fireEvent, render, screen} from '@testing-library/react-native';

import SearchNLFilterContent from '@components/Search/FilterComponents/AdvancedFilters/SearchNLFilterContent';

import ROUTES from '@src/ROUTES';

import React from 'react';
import {Platform} from 'react-native';

import type * as TestHelper from '../../utils/TestHelper';

type ParseResult = {success: true; searchURL: string; humanReadableSummary: string} | {success: false; message: string} | undefined;

// jest.mock factories can't reference imported bindings, but `mock`-prefixed locals are allowed.
const mockParseExpenseFilters = jest.fn<Promise<ParseResult>, [string, string | undefined]>();
const mockIsEnterWhileComposition = jest.fn<boolean, []>();
const mockIsOffline = jest.fn<boolean, []>();

jest.mock('@libs/actions/Search', () => ({
    parseExpenseFilters: (nlQuery: string, policyID?: string) => mockParseExpenseFilters(nlQuery, policyID),
}));

jest.mock('@libs/KeyboardShortcut/isEnterWhileComposition', () => ({
    __esModule: true,
    default: () => mockIsEnterWhileComposition(),
}));

jest.mock('@components/Search/SearchContext', () => ({
    useSearchQueryContext: () => ({currentSearchQueryJSON: undefined}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined, {status: 'loaded'}],
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline()}),
}));

// The default locale context translates every label to an empty string, and the tests find the input and button by their labels.
jest.mock('@hooks/useLocalize', () => {
    const {translateLocal, localeCompare} = jest.requireActual<typeof TestHelper>('../../utils/TestHelper');
    return () => ({translate: translateLocal, localeCompare});
});

const NL_QUERY = 'expenses over $20';
const SEARCH_URL = 'https://dev.new.expensify.com/search?q=type%3Aexpense%20amount%3E2000';

function translate(path: 'search.filters.describeSearch.inputLabel' | 'search.filters.describeSearch.buttonText' | 'common.genericErrorMessage') {
    const {translateLocal} = jest.requireActual<typeof TestHelper>('../../utils/TestHelper');
    return translateLocal(path);
}

function renderContent() {
    const onSuccess = jest.fn();
    render(<SearchNLFilterContent onSuccess={onSuccess} />);
    return {onSuccess};
}

function getInput() {
    return screen.getByLabelText(translate('search.filters.describeSearch.inputLabel'));
}

function getApplyButton() {
    return screen.getByRole('button', {name: translate('search.filters.describeSearch.buttonText')});
}

function typeQuery(text: string) {
    fireEvent.changeText(getInput(), text);
}

/** Presses a key in the input and returns the `preventDefault` spy the handler received. */
function pressKey(key: string, {shiftKey = false}: {shiftKey?: boolean} = {}) {
    const preventDefault = jest.fn();
    fireEvent(getInput(), 'keyPress', {nativeEvent: {key, shiftKey}, preventDefault});
    return preventDefault;
}

/** Lets the promise returned by the mocked parse request settle and flushes the resulting state updates. */
async function flushParse() {
    await act(async () => {
        await Promise.resolve();
    });
}

describe('SearchNLFilterContent', () => {
    beforeEach(() => {
        mockParseExpenseFilters.mockReset();
        mockParseExpenseFilters.mockReturnValue(new Promise(() => {}));
        mockIsEnterWhileComposition.mockReset();
        mockIsEnterWhileComposition.mockReturnValue(false);
        mockIsOffline.mockReset();
        mockIsOffline.mockReturnValue(false);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Apply button', () => {
        it('is disabled until the input holds text that is not only whitespace', () => {
            // Given the Describe your search input with nothing typed, so there is no query to parse
            renderContent();
            expect(getApplyButton()).toBeDisabled();

            // When the user types only spaces, which trim to an empty query
            typeQuery('   ');

            // Then Apply stays disabled because submitting would send an empty query to the server
            expect(getApplyButton()).toBeDisabled();

            // When the user types a real query, which gives the parser something to work with
            typeQuery(NL_QUERY);

            // Then Apply becomes enabled because there is now a query worth submitting
            expect(getApplyButton()).toBeEnabled();
        });

        it('is disabled while offline and enabled again once the connection returns', () => {
            // Given the user is offline with a query typed, because parsing the query needs the server
            mockIsOffline.mockReturnValue(true);
            const onSuccess = jest.fn();
            const {rerender} = render(<SearchNLFilterContent onSuccess={onSuccess} />);
            typeQuery(NL_QUERY);

            // Then Apply is disabled, since a press could only fail without telling the user why
            expect(getApplyButton()).toBeDisabled();

            // When the user presses the disabled button anyway
            fireEvent.press(getApplyButton());

            // Then no request is sent
            expect(mockParseExpenseFilters).not.toHaveBeenCalled();

            // When the connection returns
            mockIsOffline.mockReturnValue(false);
            rerender(<SearchNLFilterContent onSuccess={onSuccess} />);

            // Then Apply becomes enabled, because the typed query can now be parsed
            expect(getApplyButton()).toBeEnabled();
        });

        it('sends the trimmed query to the parser when pressed', () => {
            // Given a query typed with stray whitespace around it
            renderContent();
            typeQuery(`  ${NL_QUERY}  `);

            // When the user presses Apply, the button that submits on every platform
            fireEvent.press(getApplyButton());

            // Then the server receives the trimmed text, because the padding carries no meaning for the parser
            expect(mockParseExpenseFilters).toHaveBeenCalledTimes(1);
            expect(mockParseExpenseFilters).toHaveBeenCalledWith(NL_QUERY, undefined);
        });
    });

    describe('Enter key on web', () => {
        beforeEach(() => {
            // Enter handling only exists on web, where the multiline input would otherwise insert a newline.
            jest.replaceProperty(Platform, 'OS', 'web');
        });

        it('submits the query once and blocks the newline', () => {
            // Given a typed query on web, where Enter would add a line break to the multiline input
            renderContent();
            typeQuery(NL_QUERY);

            // When the user presses Enter, the keyboard shortcut for submitting on web
            const preventDefault = pressKey('Enter');

            // Then the default newline is blocked so the text stays on one line, and the query is submitted exactly once
            expect(preventDefault).toHaveBeenCalledTimes(1);
            expect(mockParseExpenseFilters).toHaveBeenCalledTimes(1);
            expect(mockParseExpenseFilters).toHaveBeenCalledWith(NL_QUERY, undefined);
        });

        it('does not submit a second request while the first is still loading', () => {
            // Given a query whose parse request has not returned yet
            renderContent();
            typeQuery(NL_QUERY);
            pressKey('Enter');

            // When the user presses Enter again before the response arrives
            pressKey('Enter');

            // Then no duplicate request is sent, because the loading guard ignores it
            expect(mockParseExpenseFilters).toHaveBeenCalledTimes(1);
        });

        it('does not submit while offline', () => {
            // Given a typed query while the user is offline, because parsing needs the server
            mockIsOffline.mockReturnValue(true);
            renderContent();
            typeQuery(NL_QUERY);

            // When the user presses Enter, which submits without going through the disabled Apply button
            pressKey('Enter');

            // Then no request is sent, because the offline guard applies to every way of submitting
            expect(mockParseExpenseFilters).not.toHaveBeenCalled();
        });

        it('does nothing for Enter on an empty input', () => {
            // Given an input with no text
            renderContent();

            // When the user presses Enter without typing anything first
            pressKey('Enter');

            // Then no request is sent, because there is no query to parse
            expect(mockParseExpenseFilters).not.toHaveBeenCalled();
        });

        it('lets Shift+Enter insert a newline instead of submitting', () => {
            // Given a typed query, where the user wants a second line
            renderContent();
            typeQuery(NL_QUERY);

            // When the user presses Shift+Enter
            const preventDefault = pressKey('Enter', {shiftKey: true});

            // Then the default newline is kept and nothing is submitted
            expect(preventDefault).not.toHaveBeenCalled();
            expect(mockParseExpenseFilters).not.toHaveBeenCalled();
        });

        it('does not submit when Enter confirms an IME composition', () => {
            // Given a query being composed in an IME, where Enter only confirms the candidate text
            mockIsEnterWhileComposition.mockReturnValue(true);
            renderContent();
            typeQuery(NL_QUERY);

            // When the user presses Enter to confirm the composition
            const preventDefault = pressKey('Enter');

            // Then the key is left to the IME and nothing is submitted
            expect(preventDefault).not.toHaveBeenCalled();
            expect(mockParseExpenseFilters).not.toHaveBeenCalled();
        });

        it('ignores keys other than Enter', () => {
            // Given a typed query
            renderContent();
            typeQuery(NL_QUERY);

            // When the user presses a different key
            const preventDefault = pressKey('a');

            // Then typing is untouched and nothing is submitted
            expect(preventDefault).not.toHaveBeenCalled();
            expect(mockParseExpenseFilters).not.toHaveBeenCalled();
        });
    });

    describe('Enter key on native', () => {
        it('does not intercept Enter', () => {
            // Given a typed query on a native platform, where the keyboard's return key inserts a newline and Apply is the way to submit
            jest.replaceProperty(Platform, 'OS', 'ios');
            renderContent();
            typeQuery(NL_QUERY);

            // When the key press event reports Enter
            const preventDefault = pressKey('Enter');

            // Then the handler leaves it alone and nothing is submitted
            expect(preventDefault).not.toHaveBeenCalled();
            expect(mockParseExpenseFilters).not.toHaveBeenCalled();
        });
    });

    describe('Parse results', () => {
        it('navigates to the search route built from the parsed URL', async () => {
            // Given a query the server parses into a search URL
            mockParseExpenseFilters.mockResolvedValue({success: true, searchURL: SEARCH_URL, humanReadableSummary: 'Expenses over $20'});
            const {onSuccess} = renderContent();
            typeQuery(NL_QUERY);

            // When the user presses Apply and the response arrives, which is the point where the parsed URL is used
            fireEvent.press(getApplyButton());
            await flushParse();

            // Then the caller receives the search route carrying the parsed `q` value, because the search page filters on that value
            expect(onSuccess).toHaveBeenCalledTimes(1);
            expect(onSuccess).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: 'type:expense amount>2000'}));
        });

        it('shows the generic error and does not navigate when the returned search URL is malformed', async () => {
            // Given a server response whose searchURL cannot be parsed as a URL
            mockParseExpenseFilters.mockResolvedValue({success: true, searchURL: 'not a url', humanReadableSummary: ''});
            const {onSuccess} = renderContent();
            typeQuery(NL_QUERY);

            // When the user presses Apply and the response arrives, so the bad URL reaches the code that reads it
            fireEvent.press(getApplyButton());
            await flushParse();

            // Then the user sees the generic error instead of a crash, and no navigation happens
            expect(screen.getByText(translate('common.genericErrorMessage'))).toBeOnTheScreen();
            expect(onSuccess).not.toHaveBeenCalled();
        });

        it('shows the generic error when the request fails', async () => {
            // Given a parse request that rejects, such as when the network is down
            mockParseExpenseFilters.mockRejectedValue(new Error('Network error'));
            const {onSuccess} = renderContent();
            typeQuery(NL_QUERY);

            // When the user presses Apply and the request fails, so the component has to handle the rejection
            fireEvent.press(getApplyButton());
            await flushParse();

            // Then the user sees the generic error, because they need to know the request did not work, and no navigation happens
            expect(screen.getByText(translate('common.genericErrorMessage'))).toBeOnTheScreen();
            expect(onSuccess).not.toHaveBeenCalled();
        });

        it('shows the server message when the query cannot be turned into filters', async () => {
            // Given a server response that rejects the query with a message the user can act on
            const message = 'We couldn\'t turn your description into filters. Try rephrasing, like "meals over $50 last month."';
            mockParseExpenseFilters.mockResolvedValue({success: false, message});
            const {onSuccess} = renderContent();
            typeQuery(NL_QUERY);

            // When the user presses Apply and the response arrives with success set to false
            fireEvent.press(getApplyButton());
            await flushParse();

            // Then the message is shown so the user can rephrase, and no navigation happens
            expect(screen.getByText(message)).toBeOnTheScreen();
            expect(onSuccess).not.toHaveBeenCalled();
        });

        it('lets the user retry after a failure', async () => {
            // Given a first request that failed and left an error on screen
            mockParseExpenseFilters.mockRejectedValueOnce(new Error('Network error'));
            renderContent();
            typeQuery(NL_QUERY);
            fireEvent.press(getApplyButton());
            await flushParse();
            expect(screen.getByText(translate('common.genericErrorMessage'))).toBeOnTheScreen();

            // When the user presses Apply again, to try the same query after the failure
            fireEvent.press(getApplyButton());

            // Then a new request is sent and the stale error is cleared while it loads
            expect(mockParseExpenseFilters).toHaveBeenCalledTimes(2);
            expect(screen.queryByText(translate('common.genericErrorMessage'))).not.toBeOnTheScreen();
        });
    });
});

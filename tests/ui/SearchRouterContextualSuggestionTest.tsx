import {fireEvent, render, screen} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import type {GetAdditionalSectionsCallback} from '@components/Search/SearchAutocompleteList';
import type {SearchQueryItem} from '@components/Search/SearchList/ListItem/SearchQueryListItem';
import SearchRouter from '@components/Search/SearchRouter/SearchRouter';

import type {SearchOptionData} from '@libs/OptionsListUtils/types';

import ComposeProviders from '@src/components/ComposeProviders';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../utils/collections/reportActions';
import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const REPORT_ID = '1';
const PARENT_REPORT_ID = '2';
const PARENT_REPORT_ACTION_ID = '3';
const CURRENT_USER_ACCOUNT_ID = 4;
const OTHER_USER_ACCOUNT_ID = 5;

let mockGetAdditionalSections: GetAdditionalSectionsCallback | undefined;

jest.mock('@components/Search/DeferredSearchAutocompleteList', () => ({
    __esModule: true,
    default: ({getAdditionalSections}: {getAdditionalSections?: GetAdditionalSectionsCallback}) => {
        mockGetAdditionalSections = getAdditionalSections;
        return null;
    },
}));

jest.mock('@src/libs/Log');

jest.mock('@src/libs/API', () => ({
    write: jest.fn(),
    makeRequestWithSideEffects: jest.fn(),
    read: jest.fn(),
}));

jest.mock('@src/libs/Navigation/Navigation', () => ({
    dismissModalWithReport: jest.fn(),
    getTopmostReportId: jest.fn(),
    isNavigationReady: jest.fn(() => Promise.resolve()),
    isDisplayedInModal: jest.fn(() => false),
    getActiveRouteWithoutParams: jest.fn(() => ''),
}));

jest.mock('@src/hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: () => ({
        contextualReportID: '1',
        isSearchRouterScreen: false,
    }),
}));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useFocusEffect: jest.fn(),
        useIsFocused: () => true,
        useRoute: () => jest.fn(),
        usePreventRemove: () => jest.fn(),
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: () => jest.fn(),
        }),
        createNavigationContainerRef: () => ({
            addListener: () => jest.fn(),
            removeListener: () => jest.fn(),
            isReady: () => jest.fn(),
            getCurrentRoute: () => jest.fn(),
            getState: () => jest.fn(),
            getRootState: () => undefined,
        }),
        useNavigationState: () => ({
            routes: [],
        }),
    };
});

jest.mock('@src/components/ConfirmedRoute.tsx');

/** Builds the contextual suggestion, passing the report in the recent reports only when a name is given */
function getContextualSuggestionText(reportName?: string) {
    const recentReports: SearchOptionData[] = reportName === undefined ? [] : [{reportID: REPORT_ID, keyForList: REPORT_ID, text: reportName}];
    const sections = mockGetAdditionalSections?.({recentReports, personalDetails: [], userToInvite: null, currentUserOption: null}, 0);
    return (sections?.at(0)?.data.at(0) as SearchQueryItem | undefined)?.text;
}

async function renderSearchRouter(report: Report) {
    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
    render(
        <ComposeProviders components={[OnyxListItemProvider, LocaleContextProvider]}>
            <SearchRouter
                onRouterClose={jest.fn()}
                isSearchRouterDisplayed
            />
        </ComposeProviders>,
    );
    await waitForBatchedUpdatesWithAct();
}

function createHiddenReport(type: Report['type'], chatType?: Report['chatType']): Report {
    return {
        ...createRandomReport(Number(REPORT_ID), chatType),
        reportID: REPORT_ID,
        type,
        reportName: 'Hidden report',
        parentReportID: undefined,
        parentReportActionID: undefined,
        participants: {[CURRENT_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN}},
    };
}

describe('SearchRouter contextual "Search in" suggestion', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        mockGetAdditionalSections = undefined;
    });

    afterEach(async () => {
        await Onyx.clear();
    });

    describe('when the report is not in the recent reports', () => {
        beforeEach(async () => {
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: CURRENT_USER_ACCOUNT_ID});
        });

        it('shows the suggestion for an expense report that is hidden for the current user', async () => {
            // Given an expense report that is hidden for its owner, like the new report created for a held expense on submit
            await renderSearchRouter(createHiddenReport(CONST.REPORT.TYPE.EXPENSE));

            // When the contextual suggestion is built without the report in the recent reports
            const text = getContextualSuggestionText();

            // Then the suggestion is still shown, because hidden is the default preference for the owner of a money request report
            expect(text).toBe('Search in Hidden report');
        });

        it('shows the suggestion for an invoice report that is hidden for the current user', async () => {
            // Given an invoice report that is hidden for the current user, which is how invoice reports are created
            await renderSearchRouter(createHiddenReport(CONST.REPORT.TYPE.INVOICE));

            // When the contextual suggestion is built without the report in the recent reports
            const text = getContextualSuggestionText();

            // Then the suggestion is still shown, because hidden is the default preference for invoice reports
            expect(text).toBe('Search in Hidden report');
        });

        it('does not show the suggestion for a chat that is hidden for the current user', async () => {
            // Given a room that is hidden for the current user, like a room they left
            await renderSearchRouter(createHiddenReport(CONST.REPORT.TYPE.CHAT, CONST.REPORT.CHAT_TYPE.POLICY_ROOM));

            // When the contextual suggestion is built without the report in the recent reports
            const text = getContextualSuggestionText();

            // Then no suggestion is shown, because the user should not search in a chat they no longer see
            expect(text).toBeUndefined();
        });

        it('does not show the suggestion for a chat where the current user is not a participant', async () => {
            // Given a room where only another user is a participant
            await renderSearchRouter({
                ...createHiddenReport(CONST.REPORT.TYPE.CHAT, CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
                participants: {[OTHER_USER_ACCOUNT_ID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}},
            });

            // When the contextual suggestion is built without the report in the recent reports
            const text = getContextualSuggestionText();

            // Then no suggestion is shown, because a missing participant is treated as hidden
            expect(text).toBeUndefined();
        });

        it('does not show the suggestion for a hidden expense report once the user types', async () => {
            // Given an expense report that is hidden for its owner
            await renderSearchRouter(createHiddenReport(CONST.REPORT.TYPE.EXPENSE));

            // When the user types in the search input
            fireEvent.changeText(screen.getByTestId('search-autocomplete-text-input'), 'taxi');
            await waitForBatchedUpdatesWithAct();
            const text = getContextualSuggestionText();

            // Then the suggestion is not shown, because it is only offered while the input is empty
            expect(text).toBeUndefined();
        });
    });

    it('keeps angle brackets in the name of a report with no parent action', async () => {
        // Given a group chat named "`< >`" that has no parent report action
        await renderSearchRouter({...createRandomReport(Number(REPORT_ID), CONST.REPORT.CHAT_TYPE.GROUP), reportID: REPORT_ID, parentReportID: undefined, parentReportActionID: undefined});

        // When the contextual suggestion is built for that chat
        const text = getContextualSuggestionText('`< >`');

        // Then the name is shown as-is, because a user-typed name must not be parsed as HTML
        expect(text).toBe('Search in `< >`');
    });

    it('keeps angle brackets in the name of a thread whose parent action is a comment', async () => {
        // Given a thread whose parent action is a user comment
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {
            [PARENT_REPORT_ACTION_ID]: {...createRandomReportAction(Number(PARENT_REPORT_ACTION_ID)), actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT},
        });
        await renderSearchRouter({
            ...createRandomReport(Number(REPORT_ID), undefined),
            reportID: REPORT_ID,
            parentReportID: PARENT_REPORT_ID,
            parentReportActionID: PARENT_REPORT_ACTION_ID,
        });

        // When the contextual suggestion is built for that thread
        const text = getContextualSuggestionText('<b>');

        // Then the name is shown as-is, because it comes from user-typed text
        expect(text).toBe('Search in <b>');
    });

    it('strips HTML from the name of a thread whose parent action is a system message', async () => {
        // Given a thread whose parent action is a system message, so its name may contain HTML
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`, {
            [PARENT_REPORT_ACTION_ID]: {...createRandomReportAction(Number(PARENT_REPORT_ACTION_ID)), actionName: CONST.REPORT.ACTIONS.TYPE.MOVED},
        });
        await renderSearchRouter({
            ...createRandomReport(Number(REPORT_ID), undefined),
            reportID: REPORT_ID,
            parentReportID: PARENT_REPORT_ID,
            parentReportActionID: PARENT_REPORT_ACTION_ID,
        });

        // When the contextual suggestion is built for that thread
        const text = getContextualSuggestionText('moved this <a href="https://example.com">report</a>');

        // Then the HTML tags are removed
        expect(text).toBe('Search in moved this report');
    });
});

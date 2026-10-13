import {render} from '@testing-library/react-native';

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

function getContextualSuggestionText(reportName: string) {
    const recentReports: SearchOptionData[] = [{reportID: REPORT_ID, keyForList: REPORT_ID, text: reportName}];
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

import {act, render} from '@testing-library/react-native';

import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SearchAutocompleteList from '@components/Search/SearchAutocompleteList';

import useFilteredOptions from '@hooks/useFilteredOptions';

import {combineOrderingOfReportsAndPersonalDetails} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import type {OptionData} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomReportAction from '../../utils/collections/reportActions';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

jest.mock('@src/components/ConfirmedRoute.tsx');

jest.mock('@react-navigation/native', () => ({
    useIsFocused: jest.fn(),
    useRoute: jest.fn(),
    usePreventRemove: jest.fn(),
    createNavigationContainerRef: jest.fn(() => ({
        getCurrentRoute: jest.fn(),
        addListener: jest.fn(() => jest.fn()),
        removeListener: jest.fn(),
        isReady: jest.fn(() => true),
        getState: jest.fn(),
    })),
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        shouldUseNarrowLayout: true,
        isSmallScreenWidth: true,
    })),
}));

jest.mock('@hooks/useFilteredOptions', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        options: {
            reports: [],
            personalDetails: [],
        },
        isLoading: false,
        loadMore: jest.fn(),
        hasMore: false,
        isLoadingMore: false,
    })),
}));

jest.mock('@libs/OptionsListUtils', () => ({
    getSearchOptions: jest.fn(() => ({
        options: {
            recentReports: [
                {
                    reportID: '10',
                    keyForList: '10',
                    text: 'Test Report',
                    alternateText: 'alternate text',
                    lastMessageText: 'last message',
                },
            ],
            personalDetails: [],
            currentUserOption: null,
            userToInvite: null,
            categoryOptions: [],
        },
        hasMore: false,
    })),
    combineOrderingOfReportsAndPersonalDetails: jest.fn(() => ({recentReports: [], personalDetails: []})),
    getAlternateText: jest.fn(),
}));

describe('SearchAutocompleteList', () => {
    let mockHtmlToText: jest.SpyInstance;

    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        mockHtmlToText = jest.spyOn(Parser, 'htmlToText');
    });

    beforeEach(() => {
        mockHtmlToText.mockClear();
        // Restore the default mock behavior so tests are order-independent (the frozen-rank
        // test below reconfigures these mocks per phase).
        jest.mocked(useFilteredOptions).mockReturnValue({
            options: {reports: [], personalDetails: []},
            isLoading: false,
            loadMore: jest.fn(),
            hasMore: false,
            isLoadingMore: false,
        });
        jest.mocked(combineOrderingOfReportsAndPersonalDetails).mockReturnValue({recentReports: [], personalDetails: []});
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('should not call Parser.htmlToText when parentReportAction is ADD_COMMENT', async () => {
        const reportID = '10';
        const parentReportID = '20';
        const parentActionID = '100';

        const parentReportAction = {
            ...createRandomReportAction(Number(parentActionID)),
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        };

        const reportData = {
            reportID,
            parentReportID,
            parentReportActionID: parentActionID,
        };

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, reportData);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
                [parentActionID]: parentReportAction,
            });
        });

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <SearchAutocompleteList
                        autocompleteQueryValue=""
                        handleSearch={jest.fn()}
                        onListItemPress={jest.fn()}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        expect(mockHtmlToText).not.toHaveBeenCalled();
    });

    it('should call Parser.htmlToText when parentReportAction is not ADD_COMMENT', async () => {
        const reportID = '10';
        const parentReportID = '20';
        const parentActionID = '100';
        const parentReportAction = {
            ...createRandomReportAction(Number(parentActionID)),
            actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
        };

        const reportData = {
            reportID,
            parentReportID,
            parentReportActionID: parentActionID,
        };
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, reportData);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
                [parentActionID]: parentReportAction,
            });
        });

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <SearchAutocompleteList
                        autocompleteQueryValue=""
                        handleSearch={jest.fn()}
                        onListItemPress={jest.fn()}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        expect(mockHtmlToText).toHaveBeenCalled();
    });

    it('keeps a known DM pinned in the local "Recent chats" section after its keyForList flips from accountID to reportID', async () => {
        const mockUseFilteredOptions = jest.mocked(useFilteredOptions);
        const mockCombineOrdering = jest.mocked(combineOrderingOfReportsAndPersonalDetails);

        // Phase 1: the DM is only known locally as a personal-detail option, so its `keyForList`
        // is the participant's accountID and the DM report is not yet in Onyx.
        const dmAsPersonalDetail: OptionData = {reportID: '', keyForList: '123', accountID: 123, text: 'Alice', alternateText: '', lastMessageText: ''};
        mockCombineOrdering.mockReturnValue({recentReports: [dmAsPersonalDetail], personalDetails: []});

        const {rerender, toJSON} = render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <SearchAutocompleteList
                        autocompleteQueryValue="te"
                        handleSearch={jest.fn()}
                        onListItemPress={jest.fn()}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        // The rank of the DM is frozen and it renders under "Recent chats".
        const treeAfterFreeze = JSON.stringify(toJSON());
        expect(treeAfterFreeze).toContain('Recent chats');
        expect(treeAfterFreeze).toContain('Alice');
        expect(treeAfterFreeze.indexOf('Recent chats')).toBeLessThan(treeAfterFreeze.indexOf('Alice'));

        // Phase 2: the server search returns. The DM report lands in Onyx (so its `keyForList`
        // flips to the reportID while `accountID` stays the same), and a brand-new report shows up.
        // A fresh (distinct) listOptions reference is returned to force the memoized options to recompute
        // without changing the query (which would otherwise rebuild the frozen rank map).
        const dmAsReport: OptionData = {reportID: '456', keyForList: '456', accountID: 123, text: 'Alice', alternateText: '', lastMessageText: ''};
        const brandNewServerReport: OptionData = {reportID: '789', keyForList: '789', accountID: 0, text: 'Bob', alternateText: '', lastMessageText: ''};
        mockUseFilteredOptions.mockReturnValue({
            options: {reports: [], personalDetails: []},
            isLoading: false,
            loadMore: jest.fn(),
            hasMore: false,
            isLoadingMore: false,
        });
        mockCombineOrdering.mockReturnValue({recentReports: [dmAsReport, brandNewServerReport], personalDetails: []});

        rerender(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <SearchAutocompleteList
                        autocompleteQueryValue="te"
                        handleSearch={jest.fn()}
                        onListItemPress={jest.fn()}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        const treeAfterServer = JSON.stringify(toJSON());
        const recentChatsIndex = treeAfterServer.indexOf('Recent chats');
        const aliceIndex = treeAfterServer.indexOf('Alice');
        const serverResultsIndex = treeAfterServer.indexOf('Search results');
        const bobIndex = treeAfterServer.indexOf('Bob');

        // Both sections and both rows are present.
        expect(recentChatsIndex).toBeGreaterThanOrEqual(0);
        expect(serverResultsIndex).toBeGreaterThan(recentChatsIndex);
        expect(aliceIndex).toBeGreaterThanOrEqual(0);
        expect(bobIndex).toBeGreaterThanOrEqual(0);

        // The DM stayed in the frozen local section (before the "Search results" header) instead of
        // being knocked into the server section by the keyForList flip, and the new report is server-side.
        expect(aliceIndex).toBeGreaterThan(recentChatsIndex);
        expect(aliceIndex).toBeLessThan(serverResultsIndex);
        expect(bobIndex).toBeGreaterThan(serverResultsIndex);
    });
});

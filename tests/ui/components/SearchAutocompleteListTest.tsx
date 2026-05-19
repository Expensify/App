import {act, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SearchAutocompleteList from '@components/Search/SearchAutocompleteList';
import Parser from '@libs/Parser';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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

    it('should set alternateText to "Invite" on the userToInvite row when autocompleteQueryValue is non-empty', async () => {
        // Regression test for #88730: when userToInvite is present and the query is non-empty,
        // recentReportsOptions spreads it with alternateText: translate('common.invite').
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const OptionsListUtils = jest.requireMock('@libs/OptionsListUtils') as {
            getSearchOptions: jest.Mock;
            combineOrderingOfReportsAndPersonalDetails: jest.Mock;
        };

        const inviteOption = {
            reportID: undefined,
            keyForList: 'unknown@example.com',
            login: 'unknown@example.com',
            text: 'unknown@example.com',
            alternateText: '',
        };

        OptionsListUtils.getSearchOptions.mockImplementation(() => ({
            recentReports: [],
            personalDetails: [],
            currentUserOption: null,
            userToInvite: inviteOption,
            categoryOptions: [],
        }));
        OptionsListUtils.combineOrderingOfReportsAndPersonalDetails.mockImplementation(() => ({recentReports: [], personalDetails: []}));

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <SearchAutocompleteList
                        autocompleteQueryValue="unknown@example.com"
                        handleSearch={jest.fn()}
                        onListItemPress={jest.fn()}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        expect(screen.getByText('Invite')).toBeTruthy();

        // Restore default mock so other tests are not affected
        OptionsListUtils.getSearchOptions.mockImplementation(() => ({
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
        }));
        OptionsListUtils.combineOrderingOfReportsAndPersonalDetails.mockImplementation(() => ({recentReports: [], personalDetails: []}));
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
});

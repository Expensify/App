import {act, render} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import SearchAutocompleteList from '@components/Search/SearchAutocompleteList';
import Parser from '@libs/Parser';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockGetReportOrDraftReport = jest.fn();
const mockGetReportSubtitlePrefix = jest.fn(() => '');

jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual('@libs/ReportUtils'),
    getReportOrDraftReport: (...args: Parameters<typeof mockGetReportOrDraftReport>) => mockGetReportOrDraftReport(...args),
    getReportSubtitlePrefix: (...args: Parameters<typeof mockGetReportSubtitlePrefix>) => mockGetReportSubtitlePrefix(...args),
}));

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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: jest.fn(() => ({
        shouldUseNarrowLayout: true,
        isSmallScreenWidth: true,
    })),
}));

jest.mock('@components/OptionListContextProvider', () => ({
    useOptionsList: jest.fn(() => ({
        options: {},
        areOptionsInitialized: true,
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
        mockGetReportOrDraftReport.mockReset();
        mockGetReportSubtitlePrefix.mockReturnValue('');
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
    });

    it('should not call Parser.htmlToText when lastActionType is ADD_COMMENT', async () => {
        const reportID = '10';

        mockGetReportOrDraftReport.mockReturnValue({
            reportID,
            lastActionType: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        });

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <SearchAutocompleteList
                        autocompleteQueryValue=""
                        handleSearch={jest.fn()}
                        onListItemPress={jest.fn()}
                        personalDetails={undefined}
                        reports={undefined}
                        allFeeds={undefined}
                        allCards={undefined}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        expect(mockHtmlToText).not.toHaveBeenCalled();
    });

    it('should call Parser.htmlToText when lastActionType is not ADD_COMMENT', async () => {
        const reportID = '10';

        mockGetReportOrDraftReport.mockReturnValue({
            reportID,
        });

        render(
            <OnyxListItemProvider>
                <LocaleContextProvider>
                    <SearchAutocompleteList
                        autocompleteQueryValue=""
                        handleSearch={jest.fn()}
                        onListItemPress={jest.fn()}
                        personalDetails={undefined}
                        reports={undefined}
                        allFeeds={undefined}
                        allCards={undefined}
                    />
                </LocaleContextProvider>
            </OnyxListItemProvider>,
        );

        await waitForBatchedUpdatesWithAct();

        expect(mockHtmlToText).toHaveBeenCalled();
    });
});

import {render, screen} from '@testing-library/react-native';
import React from 'react';
import MentionReportRenderer from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import useOnyx from '@hooks/useOnyx';
import * as MentionUtils from '@libs/MentionUtils';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(() => ({
        link: {},
    })),
);

jest.mock('@hooks/useStyleUtils', () =>
    jest.fn(() => ({
        getMentionStyle: jest.fn(() => ({})),
        getMentionTextColor: jest.fn(() => '#000000'),
    })),
);

jest.mock('@hooks/useCurrentReportID', () => jest.fn(() => ({currentReportID: '1'})));

jest.mock('@hooks/useOnyx', () => jest.fn());
const mockUseOnyx = useOnyx as jest.Mock;

jest.mock('@navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => 'Home'),
}));

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn(() => false));

const mockGetReportMentionDetails = jest.spyOn(MentionUtils, 'getReportMentionDetails');

describe('MentionUtils', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getReportMentionDetails', () => {
        it('uses formatted report name when reportID attribute is present', () => {
            mockGetReportName.mockReturnValueOnce('$55.00 for dupe');
            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}123`]: {
                    reportID: '123',
                    reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
                },
            };

            const result = mockGetReportMentionDetails('123', {} as never, reports, {} as never);

            expect(result?.reportID).toBe('123');
            expect(result?.mentionDisplayText).toBe('$55.00 for dupe');
        });

        it('falls back to formatted report name when matching by text', () => {
            mockGetReportName.mockReturnValue('$42.00 for lunch');

            const reports = {
                [`${ONYXKEYS.COLLECTION.REPORT}456`]: {
                    reportID: '456',
                    reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
                    policyID: 'ABC',
                },
            };

            const currentReport = {policyID: 'ABC'};
            const result = mockGetReportMentionDetails('', currentReport as never, reports, {data: '#$42.00 for lunch'} as never);

            expect(result?.reportID).toBe('456');
            expect(result?.mentionDisplayText).toBe('$42.00 for lunch');
        });
    });

    describe('MentionReportRenderer', () => {
        const tnode = {
            attributes: {reportid: '789'},
        } as never;

        const defaultRendererProps = {} as never;

        const renderMention = () =>
            render(
                <ShowContextMenuContext.Provider
                    value={{
                        showContextMenu: jest.fn(),
                        closeContextMenu: jest.fn(),
                        anchorRef: {current: null},
                    }}
                >
                    <MentionReportRenderer
                        style={{}}
                        tnode={tnode}
                        TDefaultRenderer={() => null}
                        {...defaultRendererProps}
                    />
                </ShowContextMenuContext.Provider>,
            );

        it('renders transaction thread mention without hash prefix', () => {
            mockGetReportMentionDetails.mockReturnValueOnce({reportID: '789', mentionDisplayText: '$99.00 for team lunch'});
            mockUseOnyx.mockImplementation((key: string) => {
                if (key === ONYXKEYS.COLLECTION.REPORT) {
                    return [
                        {
                            [`${ONYXKEYS.COLLECTION.REPORT}789`]: {
                                reportID: '789',
                                isTransactionThread: true,
                            },
                        },
                    ];
                }
                return [{policyID: 'XYZ'}];
            });

            const {getByText} = renderMention();

            expect(getByText('$99.00 for team lunch')).toBeTruthy();
        });

        it('renders non-transaction mention with hash prefix', () => {
            mockGetReportMentionDetails.mockReturnValueOnce({reportID: '101', mentionDisplayText: 'General chat'});
            mockUseOnyx.mockImplementation((key: string) => {
                if (key === ONYXKEYS.COLLECTION.REPORT) {
                    return [
                        {
                            [`${ONYXKEYS.COLLECTION.REPORT}101`]: {
                                reportID: '101',
                            },
                        },
                    ];
                }
                return [{policyID: 'XYZ'}];
            });

            const {getByText} = renderMention();

            expect(getByText('#General chat')).toBeTruthy();
        });
    });
});

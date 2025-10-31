import {render} from '@testing-library/react-native';
import React from 'react';
import MentionReportRenderer from '@components/HTMLEngineProvider/HTMLRenderers/MentionReportRenderer';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import useOnyx from '@hooks/useOnyx';
import * as MentionUtils from '@libs/MentionUtils';
import * as ReportUtils from '@libs/ReportUtils';
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
const mockIsDefaultRoom = jest.spyOn(ReportUtils, 'isDefaultRoom');
const mockIsUserCreatedPolicyRoom = jest.spyOn(ReportUtils, 'isUserCreatedPolicyRoom');

describe('MentionUtils', () => {
    afterEach(() => {
        jest.clearAllMocks();
        mockIsDefaultRoom.mockImplementation(() => false);
        mockIsUserCreatedPolicyRoom.mockImplementation(() => false);
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

        it('renders mention without hash prefix for non-policy chat threads', () => {
            mockGetReportMentionDetails.mockReturnValueOnce({reportID: '789', mentionDisplayText: '$99.00 for team lunch'});
            mockIsDefaultRoom.mockImplementation(() => false);
            mockIsUserCreatedPolicyRoom.mockImplementation(() => false);
            mockUseOnyx.mockImplementation((key: string) => {
                if (key === ONYXKEYS.COLLECTION.REPORT) {
                    return [
                        {
                            [`${ONYXKEYS.COLLECTION.REPORT}789`]: {
                                reportID: '789',
                            },
                        },
                    ];
                }
                return [{policyID: 'XYZ'}];
            });

            const {getByText} = renderMention();

            expect(getByText('$99.00 for team lunch')).toBeTruthy();
        });

        it('renders mention with hash prefix for default room', () => {
            mockGetReportMentionDetails.mockReturnValueOnce({reportID: '101', mentionDisplayText: 'General chat'});
            mockIsDefaultRoom.mockImplementation(() => true);
            mockIsUserCreatedPolicyRoom.mockImplementation(() => false);
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

        it('renders mention with hash prefix for user-created policy room', () => {
            mockGetReportMentionDetails.mockReturnValueOnce({reportID: '202', mentionDisplayText: 'Team room'});
            mockIsDefaultRoom.mockImplementation(() => false);
            mockIsUserCreatedPolicyRoom.mockImplementation(() => true);
            mockUseOnyx.mockImplementation((key: string) => {
                if (key === ONYXKEYS.COLLECTION.REPORT) {
                    return [
                        {
                            [`${ONYXKEYS.COLLECTION.REPORT}202`]: {
                                reportID: '202',
                            },
                        },
                    ];
                }
                return [{policyID: 'XYZ'}];
            });

            const {getByText} = renderMention();

            expect(getByText('#Team room')).toBeTruthy();
        });
    });
});

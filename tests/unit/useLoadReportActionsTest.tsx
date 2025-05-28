import {renderHook} from '@testing-library/react-native';
import useLoadReportActions from '@hooks/useLoadReportActions';
import type Navigation from '@libs/Navigation/Navigation';

jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));

jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof Navigation>('@react-navigation/native');
    return {
        ...actualNav,
        useNavigationState: () => true,
        useRoute: jest.fn(),
        useFocusEffect: jest.fn(),
        useIsFocused: () => true,
        useNavigation: () => ({
            navigate: jest.fn(),
            addListener: jest.fn(),
        }),
        createNavigationContainerRef: jest.fn(),
    };
});

describe('useLoadReportActions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Base test data from your example
    const baseProps = {
        reportID: '6549335221793525',
        reportActions: [
            /* your 4 reportActions array here */
        ],
        allReportActionIDs: ['8759152536123291182', '2034215190990675144', '186758379215594799'],
        transactionThreadReport: undefined,
        hasOlderActions: true,
        hasNewerActions: false,
    };

    describe('Base cases', () => {
        test('correctly identifies current report actions', () => {
            jest.doMock('@userActions/Report', () => ({
                getNewerActions: (_: string | undefined, reportActionID: string | undefined) => {
                    expect(reportActionID).toBe('186758379215594799');
                },
                getOlderActions: (_: string | undefined, reportActionID: string | undefined) => {
                    expect(reportActionID).toBe('8759152536123291182');
                },
            }));
            const {result} = renderHook(() => useLoadReportActions(baseProps));

            result.current.loadOlderChats();
            result.current.loadNewerChats();
        });

        test('handles transaction thread report actions', () => {
            jest.doMock('@userActions/Report', () => ({
                getNewerActions: (_: string | undefined, reportActionID: string | undefined) => {
                    expect(reportActionID).toBe('186758379215594799');
                },
                getOlderActions: (_: string | undefined, reportActionID: string | undefined) => {
                    expect(reportActionID).toBe('2034215190990675144');
                },
            }));

            const propsWithTransaction = {
                ...baseProps,
                transactionThreadReport: {reportID: '186758379215594798'},
                allReportActionIDs: ['8759152536123291182'], // Only first action belongs to main report
            };

            const {result} = renderHook(() => useLoadReportActions(propsWithTransaction));

            result.current.loadOlderChats();
            result.current.loadNewerChats();
        });
    });

    describe('loadOlderChats behavior', () => {
        test('loads older actions for current report', () => {
            jest.doMock('@userActions/Report', () => ({
                getNewerActions: jest.fn(),
                getOlderActions: (reportID: string | undefined, reportActionID: string | undefined) => {
                    expect(reportID).toBe('6549335221793525');
                    expect(reportActionID).toBe('186758379215594799');
                },
            }));
            const {result} = renderHook(() => useLoadReportActions(baseProps));
            result.current.loadOlderChats();
        });

        test('loads actions for both reports when transaction thread exists', () => {
            jest.doMock('@userActions/Report', () => ({
                getNewerActions: jest.fn(),
                getOlderActions: (reportID: string | undefined, reportActionID: string | undefined) => {
                    if (reportID !== 'TRANSACTION_THREAD_REPORT') {
                        expect(reportID).toBe('8759152536123291182');
                        expect(reportActionID).toBe('6549335221793525');
                    } else {
                        expect(reportID).toBe('TRANSACTION_THREAD_REPORT');
                        expect(reportActionID).toBe('186758379215594799');
                    }
                },
            }));
            const props = {
                ...baseProps,
                transactionThreadReport: {reportID: 'TRANSACTION_THREAD_REPORT'},
            };

            const {result} = renderHook(() => useLoadReportActions(props));
            result.current.loadOlderChats();
        });
    });

    describe('loadNewerChats behavior', () => {
        test('loads newer actions when conditions met', () => {
            jest.doMock('@userActions/Report', () => ({
                getNewerActions: (reportID: string | undefined, reportActionID: string | undefined) => {
                    expect(reportID).toBe('6549335221793525');
                    expect(reportActionID).toBe('8759152536123291182');
                },
                getOlderActions: jest.fn(),
            }));
            const props = {
                ...baseProps,
                hasNewerActions: true,
                reportActionID: 'EXISTING_ACTION_ID',
            };

            const {result} = renderHook(() => useLoadReportActions(props));
            result.current.loadNewerChats();
        });

        test('handles transaction thread newer actions', () => {
            jest.doMock('@userActions/Report', () => ({
                getNewerActions: (reportID: string | undefined, reportActionID: string | undefined) => {
                    if (reportID !== 'TRANSACTION_THREAD_REPORT') {
                        expect(reportID).toBe('6549335221793525');
                        expect(reportActionID).toBe('8759152536123291182');
                    } else {
                        expect(reportID).toBe('TRANSACTION_THREAD_REPORT');
                        expect(reportActionID).toBe('2034215190990675144');
                    }
                },
                getOlderActions: jest.fn(),
            }));
            const props = {
                ...baseProps,
                transactionThreadReport: {reportID: 'TRANSACTION_THREAD_REPORT'},
                hasNewerActions: true,
            };

            const {result} = renderHook(() => useLoadReportActions(props));
            result.current.loadNewerChats();
        });
    });

    describe('Edge cases', () => {
        test('handles empty reportActions', () => {
            const mockGetOlderActions = jest.fn();
            const mockGetNewerActions = jest.fn();
            jest.doMock('@userActions/Report', () => ({
                getNewerActions: mockGetNewerActions,
                getOlderActions: mockGetOlderActions,
            }));
            const props = {
                ...baseProps,
                reportActions: [],
            };

            const {result} = renderHook(() => useLoadReportActions(props));
            result.current.loadOlderChats();
            result.current.loadNewerChats();

            expect(mockGetOlderActions).not.toHaveBeenCalled();
            expect(mockGetNewerActions).not.toHaveBeenCalled();
        });
    });
});

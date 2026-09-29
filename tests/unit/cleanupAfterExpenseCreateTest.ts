import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import Navigation from '@libs/Navigation/Navigation';

import SCREENS from '@src/SCREENS';
import type {ReportAction} from '@src/types/onyx';

import type HybridAppModuleType from '@expensify/react-native-hybrid-app/src/types';

import createMock from '../utils/createMock';

// Target-local mock: the owned Jest environment has no ReactNativeHybridApp module, which Navigation/Log loads during initialization.
jest.mock('@expensify/react-native-hybrid-app', () => {
    return {
        __esModule: true,
        default: {
            isHybridApp: jest.fn<ReturnType<HybridAppModuleType['isHybridApp']>, Parameters<HybridAppModuleType['isHybridApp']>>(() => false),
        },
    };
});

const mockRemoveDraftTransactionsByIDs = jest.fn<void, [string[] | undefined]>();

jest.mock('@libs/actions/TransactionEdit', () => ({
    removeDraftTransactionsByIDs: (ids: string[] | undefined) => {
        mockRemoveDraftTransactionsByIDs(ids);
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    getReportRouteByID: jest.fn(),
    removeScreenByKey: jest.fn(),
}));

describe('cleanupAfterExpenseCreate', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should remove draft transactions when draftTransactionIDs is provided', () => {
        cleanupAfterExpenseCreate({
            draftTransactionIDs: ['txn-1', 'txn-2'],
        });

        expect(mockRemoveDraftTransactionsByIDs).toHaveBeenCalledTimes(1);
        expect(mockRemoveDraftTransactionsByIDs).toHaveBeenCalledWith(['txn-1', 'txn-2']);
    });

    it('should forward undefined draftTransactionIDs to removeDraftTransactionsByIDs', () => {
        cleanupAfterExpenseCreate({
            draftTransactionIDs: undefined,
        });

        expect(mockRemoveDraftTransactionsByIDs).toHaveBeenCalledTimes(1);
        expect(mockRemoveDraftTransactionsByIDs).toHaveBeenCalledWith(undefined);
    });

    it('should pop the linked child report screen when linkedTrackedExpenseReportAction has a childReportID and the route is found', () => {
        jest.mocked(Navigation.getReportRouteByID).mockReturnValue({name: SCREENS.REPORT, key: 'rhp-key-123'});
        const linkedTrackedExpenseReportAction = createMock<ReportAction>({childReportID: 'child-report-456'});

        cleanupAfterExpenseCreate({
            draftTransactionIDs: [],
            linkedTrackedExpenseReportAction,
        });

        expect(Navigation.getReportRouteByID).toHaveBeenCalledWith('child-report-456');
        expect(Navigation.removeScreenByKey).toHaveBeenCalledWith('rhp-key-123');
    });

    it('should NOT pop any screen when linkedTrackedExpenseReportAction is undefined', () => {
        cleanupAfterExpenseCreate({
            draftTransactionIDs: ['txn-1'],
        });

        expect(Navigation.getReportRouteByID).not.toHaveBeenCalled();
        expect(Navigation.removeScreenByKey).not.toHaveBeenCalled();
    });

    it('should NOT call removeScreenByKey when getReportRouteByID returns null', () => {
        jest.mocked(Navigation.getReportRouteByID).mockReturnValue(null);
        const linkedTrackedExpenseReportAction = createMock<ReportAction>({childReportID: 'child-report-456'});

        cleanupAfterExpenseCreate({
            draftTransactionIDs: [],
            linkedTrackedExpenseReportAction,
        });

        expect(Navigation.getReportRouteByID).toHaveBeenCalledWith('child-report-456');
        expect(Navigation.removeScreenByKey).not.toHaveBeenCalled();
    });
});

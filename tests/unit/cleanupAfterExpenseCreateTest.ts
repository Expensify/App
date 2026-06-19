import type {OnyxEntry} from 'react-native-onyx';
import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import Navigation from '@libs/Navigation/Navigation';
import type {ReportAction} from '@src/types/onyx';

const mockRemoveDraftTransactionsByIDs = jest.fn();

jest.mock('@libs/actions/TransactionEdit', () => ({
    removeDraftTransactionsByIDs: (ids: string[] | undefined) => mockRemoveDraftTransactionsByIDs(ids) as void,
}));

jest.mock('react-native', () => ({
    InteractionManager: {
        runAfterInteractions: (callback: () => void) => {
            callback();
            return {then: (cb: () => void) => cb(), cancel: jest.fn()};
        },
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

    it('should remove draft transactions via InteractionManager when draftTransactionIDs is provided', () => {
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
        (Navigation.getReportRouteByID as jest.Mock).mockReturnValue({key: 'rhp-key-123'});
        const linkedTrackedExpenseReportAction = {childReportID: 'child-report-456'} as OnyxEntry<ReportAction>;

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

    it('should NOT call removeScreenByKey when getReportRouteByID returns undefined', () => {
        (Navigation.getReportRouteByID as jest.Mock).mockReturnValue(undefined);
        const linkedTrackedExpenseReportAction = {childReportID: 'child-report-456'} as OnyxEntry<ReportAction>;

        cleanupAfterExpenseCreate({
            draftTransactionIDs: [],
            linkedTrackedExpenseReportAction,
        });

        expect(Navigation.getReportRouteByID).toHaveBeenCalledWith('child-report-456');
        expect(Navigation.removeScreenByKey).not.toHaveBeenCalled();
    });
});

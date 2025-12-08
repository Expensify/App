import Onyx from 'react-native-onyx';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
    setNavigationActionToMicrotaskQueue: jest.fn((callback: () => void) => {
        callback();
    }),
}));

const mockedNavigation = Navigation as jest.Mocked<typeof Navigation>;

describe('TransactionDuplicate Confirmation Navigation', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
    });

    describe('closeReviewDuplicates behavior', () => {
        it('should navigate to SEARCH_MONEY_REQUEST_REPORT when reportID exists before dismissing modal', async () => {
            const reportID = 'testReportID123';

            const closeReviewDuplicates = (reviewDuplicatesReportID: string | undefined) => {
                if (reviewDuplicatesReportID) {
                    Navigation.setNavigationActionToMicrotaskQueue(() => {
                        Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: reviewDuplicatesReportID}), {forceReplace: true});
                    });
                }
                Navigation.dismissModal();
            };

            closeReviewDuplicates(reportID);
            await waitForBatchedUpdates();

            expect(mockedNavigation.setNavigationActionToMicrotaskQueue).toHaveBeenCalledTimes(1);
            expect(mockedNavigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID}), {forceReplace: true});
            expect(mockedNavigation.dismissModal).toHaveBeenCalledTimes(1);
        });

        it('should only dismiss modal when reportID is undefined', async () => {
            const closeReviewDuplicates = (reviewDuplicatesReportID: string | undefined) => {
                if (reviewDuplicatesReportID) {
                    Navigation.setNavigationActionToMicrotaskQueue(() => {
                        Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: reviewDuplicatesReportID}), {forceReplace: true});
                    });
                }
                Navigation.dismissModal();
            };

            closeReviewDuplicates(undefined);
            await waitForBatchedUpdates();

            expect(mockedNavigation.setNavigationActionToMicrotaskQueue).not.toHaveBeenCalled();
            expect(mockedNavigation.navigate).not.toHaveBeenCalled();
            expect(mockedNavigation.dismissModal).toHaveBeenCalledTimes(1);
        });

        it('should only dismiss modal when reportID is empty string', async () => {
            const closeReviewDuplicates = (reviewDuplicatesReportID: string | undefined) => {
                if (reviewDuplicatesReportID) {
                    Navigation.setNavigationActionToMicrotaskQueue(() => {
                        Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: reviewDuplicatesReportID}), {forceReplace: true});
                    });
                }
                Navigation.dismissModal();
            };

            closeReviewDuplicates('');
            await waitForBatchedUpdates();

            expect(mockedNavigation.setNavigationActionToMicrotaskQueue).not.toHaveBeenCalled();
            expect(mockedNavigation.navigate).not.toHaveBeenCalled();
            expect(mockedNavigation.dismissModal).toHaveBeenCalledTimes(1);
        });
    });

    describe('mergeDuplicates navigation flow', () => {
        it('should close review duplicates before calling IOU.mergeDuplicates', async () => {
            const reportID = 'testReportID456';
            const callOrder: string[] = [];

            const closeReviewDuplicates = (reviewDuplicatesReportID: string | undefined) => {
                callOrder.push('closeReviewDuplicates');
                if (reviewDuplicatesReportID) {
                    Navigation.setNavigationActionToMicrotaskQueue(() => {
                        Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: reviewDuplicatesReportID}), {forceReplace: true});
                    });
                }
                Navigation.dismissModal();
            };

            const mockMergeDuplicates = jest.fn(() => {
                callOrder.push('mergeDuplicates');
            });

            const mergeDuplicates = () => {
                closeReviewDuplicates(reportID);
                mockMergeDuplicates();
            };

            mergeDuplicates();
            await waitForBatchedUpdates();

            expect(callOrder).toEqual(['closeReviewDuplicates', 'mergeDuplicates']);
            expect(mockedNavigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID}), {forceReplace: true});
            expect(mockedNavigation.dismissModal).toHaveBeenCalledTimes(1);
        });
    });

    describe('resolveDuplicates navigation flow', () => {
        it('should close review duplicates before calling IOU.resolveDuplicates', async () => {
            const reportID = 'testReportID789';
            const callOrder: string[] = [];

            const closeReviewDuplicates = (reviewDuplicatesReportID: string | undefined) => {
                callOrder.push('closeReviewDuplicates');
                if (reviewDuplicatesReportID) {
                    Navigation.setNavigationActionToMicrotaskQueue(() => {
                        Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: reviewDuplicatesReportID}), {forceReplace: true});
                    });
                }
                Navigation.dismissModal();
            };

            const mockResolveDuplicates = jest.fn(() => {
                callOrder.push('resolveDuplicates');
            });

            const resolveDuplicates = () => {
                closeReviewDuplicates(reportID);
                mockResolveDuplicates();
            };

            resolveDuplicates();
            await waitForBatchedUpdates();

            expect(callOrder).toEqual(['closeReviewDuplicates', 'resolveDuplicates']);
            expect(mockedNavigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID}), {forceReplace: true});
            expect(mockedNavigation.dismissModal).toHaveBeenCalledTimes(1);
        });
    });
});

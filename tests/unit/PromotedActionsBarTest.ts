import {PromotedActions} from '@components/PromotedActionsBar';
import {navigateToAndOpenReport, navigateToAndOpenReportWithAccountIDs} from '@userActions/Report';
import CONST from '@src/CONST';

jest.mock('@userActions/Report', () => ({
    navigateToAndOpenReport: jest.fn(),
    navigateToAndOpenReportWithAccountIDs: jest.fn(),
    joinRoom: jest.fn(),
}));

jest.mock('@userActions/Session', () => ({
    callFunctionIfActionIsAllowed: (fn: () => void) => fn,
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    dismissModal: jest.fn(),
}));

const mockNavigateToAndOpenReport = jest.mocked(navigateToAndOpenReport);
const mockNavigateToAndOpenReportWithAccountIDs = jest.mocked(navigateToAndOpenReportWithAccountIDs);

describe('PromotedActions.message', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should pass introSelected to navigateToAndOpenReport when login is provided', () => {
        const introSelected = {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM};
        const action = PromotedActions.message({
            login: 'test@example.com',
            currentUserAccountID: 1,
            introSelected,
            isSelfTourViewed: false,
        });

        action.onSelected();

        expect(mockNavigateToAndOpenReport).toHaveBeenCalledWith(['test@example.com'], 1, introSelected, false, false);
    });

    it('should pass introSelected to navigateToAndOpenReportWithAccountIDs when accountID is provided', () => {
        const introSelected = {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM};
        const action = PromotedActions.message({
            accountID: 42,
            currentUserAccountID: 1,
            introSelected,
            isSelfTourViewed: false,
        });

        action.onSelected();

        expect(mockNavigateToAndOpenReportWithAccountIDs).toHaveBeenCalledWith([42], 1, introSelected);
    });

    it('should pass undefined introSelected when not provided', () => {
        const action = PromotedActions.message({
            accountID: 42,
            currentUserAccountID: 1,
            introSelected: undefined,
            isSelfTourViewed: undefined,
        });

        action.onSelected();

        expect(mockNavigateToAndOpenReportWithAccountIDs).toHaveBeenCalledWith([42], 1, undefined);
    });

    it('should navigate to report directly when reportID is provided', () => {
        const action = PromotedActions.message({
            reportID: 'report123',
            currentUserAccountID: 1,
            introSelected: undefined,
            isSelfTourViewed: undefined,
        });

        action.onSelected();

        expect(mockNavigateToAndOpenReport).not.toHaveBeenCalled();
        expect(mockNavigateToAndOpenReportWithAccountIDs).not.toHaveBeenCalled();
    });

    it('should prefer login over accountID when both are provided', () => {
        const introSelected = {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM};
        const action = PromotedActions.message({
            accountID: 42,
            login: 'test@example.com',
            currentUserAccountID: 1,
            introSelected,
            isSelfTourViewed: false,
        });

        action.onSelected();

        expect(mockNavigateToAndOpenReport).toHaveBeenCalledWith(['test@example.com'], 1, introSelected, false, false);
        expect(mockNavigateToAndOpenReportWithAccountIDs).not.toHaveBeenCalled();
    });
});

import {PromotedActions} from '@components/PromotedActionsBar';
import Navigation from '@libs/Navigation/Navigation';
import {navigateToAndOpenReport, navigateToAndOpenReportWithAccountIDs} from '@userActions/Report';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

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
const mockNavigation = jest.mocked(Navigation);

describe('PromotedActions.message', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should pass introSelected to navigateToAndOpenReport when login is provided', () => {
        const introSelected = {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM};
        const action = PromotedActions.message({
            login: 'test@example.com',
            currentUserAccountID: 1,
            personalDetails: {},
            introSelected,
            isSelfTourViewed: false,
            betas: undefined,
        });

        action.onSelected();

        expect(mockNavigateToAndOpenReport).toHaveBeenCalledWith(['test@example.com'], {}, 1, introSelected, false, undefined, false, true);
    });

    it('should pass introSelected to navigateToAndOpenReportWithAccountIDs when accountID is provided', () => {
        const introSelected = {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM};
        const action = PromotedActions.message({
            accountID: 42,
            currentUserAccountID: 1,
            personalDetails: {},
            introSelected,
            isSelfTourViewed: false,
            betas: undefined,
        });

        action.onSelected();

        expect(mockNavigateToAndOpenReportWithAccountIDs).toHaveBeenCalledWith([42], 1, introSelected, false, undefined, {}, true);
    });

    it('should pass undefined introSelected when not provided', () => {
        const action = PromotedActions.message({
            accountID: 42,
            currentUserAccountID: 1,
            personalDetails: {},
            introSelected: undefined,
            isSelfTourViewed: undefined,
            betas: undefined,
        });

        action.onSelected();

        expect(mockNavigateToAndOpenReportWithAccountIDs).toHaveBeenCalledWith([42], 1, undefined, undefined, undefined, {}, true);
    });

    it('should navigate to report directly when reportID is provided', () => {
        const action = PromotedActions.message({
            reportID: 'report123',
            currentUserAccountID: 1,
            personalDetails: {},
            introSelected: undefined,
            isSelfTourViewed: undefined,
            betas: undefined,
        });

        action.onSelected();

        expect(mockNavigateToAndOpenReport).not.toHaveBeenCalled();
        expect(mockNavigateToAndOpenReportWithAccountIDs).not.toHaveBeenCalled();
        expect(mockNavigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('report123'));
    });

    it('should prefer login over accountID when both are provided', () => {
        const introSelected = {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM};
        const action = PromotedActions.message({
            accountID: 42,
            personalDetails: {},
            login: 'test@example.com',
            currentUserAccountID: 1,
            introSelected,
            isSelfTourViewed: false,
            betas: undefined,
        });

        action.onSelected();

        expect(mockNavigateToAndOpenReport).toHaveBeenCalledWith(['test@example.com'], {}, 1, introSelected, false, undefined, false, true);
        expect(mockNavigateToAndOpenReportWithAccountIDs).not.toHaveBeenCalled();
    });

    it('should pass betas to navigateToAndOpenReportWithAccountIDs when accountID is provided', () => {
        const introSelected = {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM};
        const betas = [CONST.BETAS.ALL];
        const action = PromotedActions.message({
            accountID: 42,
            personalDetails: {},
            currentUserAccountID: 1,
            introSelected,
            isSelfTourViewed: false,
            betas,
        });

        action.onSelected();

        expect(mockNavigateToAndOpenReportWithAccountIDs).toHaveBeenCalledWith([42], 1, introSelected, false, betas, {}, true);
    });

    it('should call navigateToAndOpenReportWithAccountIDs with isSelfTourViewed=true when self tour has been viewed and accountID is provided', () => {
        const introSelected = {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM};
        const action = PromotedActions.message({
            accountID: 42,
            currentUserAccountID: 1,
            introSelected,
            isSelfTourViewed: true,
            betas: undefined,
            personalDetails: {},
        });

        action.onSelected();

        expect(mockNavigateToAndOpenReportWithAccountIDs).toHaveBeenCalledWith([42], 1, introSelected, true, undefined, {}, true);
    });

    it('should pass betas to navigateToAndOpenReport when login is provided', () => {
        const introSelected = {choice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM};
        const betas = [CONST.BETAS.ALL];
        const action = PromotedActions.message({
            login: 'test@example.com',
            currentUserAccountID: 1,
            introSelected,
            personalDetails: {},
            isSelfTourViewed: false,
            betas,
        });

        action.onSelected();

        expect(mockNavigateToAndOpenReport).toHaveBeenCalledWith(['test@example.com'], {}, 1, introSelected, false, betas, false, true);
    });

    it('should prefer reportID for self profile message action', () => {
        const action = PromotedActions.message({
            reportID: 'selfReport123',
            accountID: 1,
            currentUserAccountID: 1,
            personalDetails: {},
            introSelected: undefined,
            isSelfTourViewed: undefined,
            betas: undefined,
        });

        action.onSelected();

        expect(mockNavigation.navigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute('selfReport123'));
        expect(mockNavigateToAndOpenReport).not.toHaveBeenCalled();
        expect(mockNavigateToAndOpenReportWithAccountIDs).not.toHaveBeenCalled();
    });
});

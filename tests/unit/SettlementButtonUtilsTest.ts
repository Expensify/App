import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';
import {getSettlementButtonPaymentMethods, handleUnvalidatedUserNavigation} from '@libs/SettlementButtonUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation');

const mockTranslate = jest.fn((key: string) => key);

jest.mock('@hooks/useLocalize', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        translate: mockTranslate,
    }),
}));

describe('handleUnvalidatedUserNavigation', () => {
    const mockReportID = '123456789';
    const mockChatReportID = '987654321';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // handleUnvalidatedUserNavigation navigates to the correct route
    it.each([
        {
            description: 'navigate to ROUTES.SEARCH_ROOT_VERIFY_ACCOUNT when active route is ROUTES.SEARCH_ROOT',
            mockActiveRoute: ROUTES.SEARCH_ROOT.getRoute({query: ''}),
            expectedRouteToNavigate: ROUTES.SEARCH_ROOT_VERIFY_ACCOUNT,
        },
        {
            description: 'navigate to ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT when active route is ROUTES.SEARCH_REPORT',
            mockActiveRoute: ROUTES.SEARCH_REPORT.getRoute({reportID: mockReportID}),
            expectedRouteToNavigate: ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT.getRoute(mockReportID),
        },
        {
            description: 'navigate to ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT when active route is ROUTES.SEARCH_MONEY_REQUEST_REPORT',
            mockActiveRoute: ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: mockReportID}),
            expectedRouteToNavigate: ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT.getRoute(mockReportID),
        },
        {
            description: 'navigate to ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(chatReportID) when active route is ROUTES.REPORT_WITH_ID.getRoute(chatReportID)',
            mockActiveRoute: ROUTES.REPORT_WITH_ID.getRoute(mockChatReportID),
            expectedRouteToNavigate: ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(mockChatReportID),
        },
        {
            description: 'navigate to ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(reportID) when active route is ROUTES.REPORT_WITH_ID.getRoute(reportID)',
            mockActiveRoute: ROUTES.REPORT_WITH_ID.getRoute(mockReportID),
            expectedRouteToNavigate: ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(mockReportID),
        },
        {
            description: 'navigate to ROUTES.MONEY_REQUEST_STEP_CONFIRMATION_VERIFY_ACCOUNT when active route is ROUTES.MONEY_REQUEST_STEP_CONFIRMATION',
            mockActiveRoute: ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, mockChatReportID),
            expectedRouteToNavigate: ROUTES.MONEY_REQUEST_STEP_CONFIRMATION_VERIFY_ACCOUNT.getRoute(
                CONST.IOU.ACTION.CREATE,
                CONST.IOU.TYPE.PAY,
                CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
                mockChatReportID,
            ),
        },
    ])('$description', ({mockActiveRoute, expectedRouteToNavigate}) => {
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).toHaveBeenCalledWith(expectedRouteToNavigate);
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
    });

    // handleUnvalidatedUserNavigation does not navigate to the route that require reportID, when reportID is undefined
    it.each([
        {
            description: 'do not navigate to ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT when reportID is undefined',
            mockActiveRoute: ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: mockReportID}),
        },
        {
            description: 'do not navigate to ROUTES.SEARCH_REPORT_VERIFY_ACCOUNT when reportID is undefined',
            mockActiveRoute: ROUTES.SEARCH_REPORT.getRoute({reportID: mockReportID}),
        },
        {
            description: 'do not navigate when active route is ROUTES.REPORT_WITH_ID.getRoute(reportID) and reportID is undefined',
            mockActiveRoute: ROUTES.REPORT_WITH_ID.getRoute(mockReportID),
        },
    ])('$description', ({mockActiveRoute}) => {
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });

    // handleUnvalidatedUserNavigation matches the first applicable route when multiple conditions could match
    it('match ROUTES.SEARCH_MONEY_REQUEST_REPORT over ROUTES.REPORT_WITH_ID', () => {
        const mockActiveRoute = ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: mockReportID});
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue(mockActiveRoute);
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT.getRoute(mockReportID));
        expect(Navigation.navigate).not.toHaveBeenCalledWith(ROUTES.REPORT_VERIFY_ACCOUNT.getRoute(mockReportID));
    });

    // handleUnvalidatedUserNavigation does not navigate when no route mapping matches
    it('when no route mapping matches, user should not be navigated', () => {
        (Navigation.getActiveRoute as jest.Mock).mockReturnValue('/just/unmatched/route');
        handleUnvalidatedUserNavigation(mockChatReportID, mockReportID);
        expect(Navigation.navigate).not.toHaveBeenCalled();
    });
});

describe('getSettlementButtonPaymentMethods', () => {
    const {translate} = useLocalize();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return payment method with wallet for PERSONAL_BANK_ACCOUNT when hasActivatedWallet is true', () => {
        const result = getSettlementButtonPaymentMethods(true, translate);
        expect(result[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]).toEqual({
            text: translate('iou.settleWallet', {formattedAmount: ''}),
            icon: Expensicons.User,
            value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        });
    });

    it('should return payment method with personal bank account for PERSONAL_BANK_ACCOUNT when hasActivatedWallet is false', () => {
        const result = getSettlementButtonPaymentMethods(false, translate);
        expect(result[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]).toEqual({
            text: translate('iou.settlePersonal', {formattedAmount: ''}),
            icon: Expensicons.User,
            value: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
        });
    });

    it('should return payment method with business bank account for BUSINESS_BANK_ACCOUNT', () => {
        const result = getSettlementButtonPaymentMethods(true, translate);
        expect(result[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]).toEqual({
            text: translate('iou.settleBusiness', {formattedAmount: ''}),
            icon: Expensicons.Building,
            value: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
        });
    });

    it('should return payment method elsewhere for ELSEWHERE', () => {
        const result = getSettlementButtonPaymentMethods(true, translate);
        expect(result[CONST.IOU.PAYMENT_TYPE.ELSEWHERE]).toEqual({
            text: translate('iou.payElsewhere', {formattedAmount: ''}),
            icon: Expensicons.CheckCircle,
            value: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            shouldUpdateSelectedIndex: false,
        });
    });

    it('should return all three payment methods', () => {
        const result = getSettlementButtonPaymentMethods(true, translate);
        expect(Object.keys(result)).toHaveLength(3);
        expect(result).toHaveProperty(CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT);
        expect(result).toHaveProperty(CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT);
        expect(result).toHaveProperty(CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
    });

    it.each([
        {hasActivatedWallet: true, expectedPersonalKey: 'iou.settleWallet'},
        {hasActivatedWallet: false, expectedPersonalKey: 'iou.settlePersonal'},
    ])('should use correct texts for each payment method when hasActivatedWallet is $hasActivatedWallet', ({hasActivatedWallet, expectedPersonalKey}) => {
        const result = getSettlementButtonPaymentMethods(hasActivatedWallet, translate);
        expect(translate).toHaveBeenCalledTimes(3);
        expect(translate).toHaveBeenCalledWith(expectedPersonalKey, {formattedAmount: ''});
        expect(translate).toHaveBeenCalledWith('iou.settleBusiness', {formattedAmount: ''});
        expect(translate).toHaveBeenCalledWith('iou.payElsewhere', {formattedAmount: ''});
        expect(result[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT].text).toBe(expectedPersonalKey);
        expect(result[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT].text).toBe('iou.settleBusiness');
        expect(result[CONST.IOU.PAYMENT_TYPE.ELSEWHERE].text).toBe('iou.payElsewhere');
    });

    it.each([
        {
            method: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            expectedIcon: Expensicons.User,
            expectedValue: CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT,
            description: 'PERSONAL_BANK_ACCOUNT',
        },
        {
            method: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            expectedIcon: Expensicons.Building,
            expectedValue: CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT,
            description: 'BUSINESS_BANK_ACCOUNT',
        },
        {
            method: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            expectedIcon: Expensicons.CheckCircle,
            expectedValue: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            description: 'ELSEWHERE',
        },
    ])('should use correct icon and value for $description regardless of hasActivatedWallet', ({method, expectedIcon, expectedValue}) => {
        const resultWithWallet = getSettlementButtonPaymentMethods(true, translate);
        const resultWithoutWallet = getSettlementButtonPaymentMethods(false, translate);
        [resultWithWallet, resultWithoutWallet].forEach((result) => {
            const paymentMethod = result[method];
            expect(paymentMethod.icon).toBe(expectedIcon);
            expect(paymentMethod.value).toBe(expectedValue);
        });
    });

    it('should only set shouldUpdateSelectedIndex for elsewhere payment type', () => {
        const result = getSettlementButtonPaymentMethods(true, translate);
        expect(result[CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT]).not.toHaveProperty('shouldUpdateSelectedIndex');
        expect(result[CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT]).not.toHaveProperty('shouldUpdateSelectedIndex');
        expect(result[CONST.IOU.PAYMENT_TYPE.ELSEWHERE].shouldUpdateSelectedIndex).toBe(false);
    });
});

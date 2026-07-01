import buildConfirmAction from '@components/MoneyRequestConfirmationList/confirmAction';
import type {hasInvoicingDetails} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type {Participant} from '@src/types/onyx/IOU';

const mockNavigate = jest.fn();
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: (...args: unknown[]) => mockNavigate(...args) as unknown,
    getActiveRoute: () => '/',
}));
jest.mock('@userActions/Policy/Policy', () => ({hasInvoicingDetails: jest.fn(() => true)}));

type Params = Parameters<typeof buildConfirmAction>[0];

const selectedParticipants = [{accountID: 1}] as unknown as Participant[];

function makeBase(overrides: Partial<Params> = {}): Params {
    return {
        iouType: CONST.IOU.TYPE.SUBMIT,
        policy: undefined,
        transactionID: 'txn1',
        reportID: 'report1',
        routeError: undefined,
        formError: '',
        selectedParticipants,
        isDelegateAccessRestricted: false,
        validate: jest.fn(() => ({errorKey: null})),
        setFormError: jest.fn(),
        setDidConfirmSplit: jest.fn(),
        showDelegateNoAccessModal: jest.fn(),
        onConfirm: jest.fn(),
        onSendMoney: jest.fn(),
        ...overrides,
    };
}

describe('buildConfirmAction', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls onConfirm when validation passes for non-PAY type', () => {
        const params = makeBase();
        const handler = buildConfirmAction(params);
        handler({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
        expect(params.onConfirm).toHaveBeenCalledWith(selectedParticipants);
        expect(params.onSendMoney).not.toHaveBeenCalled();
    });

    it('returns without calling onConfirm when validate returns null', () => {
        const params = makeBase({validate: jest.fn(() => null)});
        buildConfirmAction(params)({paymentType: undefined});
        expect(params.onConfirm).not.toHaveBeenCalled();
        expect(params.setFormError).not.toHaveBeenCalled();
    });

    it('sets form error when validation returns an errorKey', () => {
        const params = makeBase({validate: jest.fn(() => ({errorKey: 'iou.error.invalidMerchant'}))});
        buildConfirmAction(params)({paymentType: undefined});
        expect(params.setFormError).toHaveBeenCalledWith('iou.error.invalidMerchant');
        expect(params.onConfirm).not.toHaveBeenCalled();
    });

    it('sets didConfirmSplit when validation result has shouldSetDidConfirmSplit', () => {
        const params = makeBase({
            validate: jest.fn(() => ({errorKey: 'iou.error.genericSmartscanFailureMessage', shouldSetDidConfirmSplit: true})),
        });
        buildConfirmAction(params)({paymentType: undefined});
        expect(params.setDidConfirmSplit).toHaveBeenCalledWith(true);
        expect(params.setFormError).toHaveBeenCalledWith('iou.error.genericSmartscanFailureMessage');
    });

    it('does not call onConfirm when formError is already set', () => {
        const params = makeBase({formError: 'iou.error.invalidMerchant'});
        buildConfirmAction(params)({paymentType: undefined});
        expect(params.onConfirm).not.toHaveBeenCalled();
    });

    it('navigates to company-info step for invoice with no invoicing details', () => {
        const policyMock = jest.requireMock<{hasInvoicingDetails: typeof hasInvoicingDetails}>('@userActions/Policy/Policy');
        (policyMock.hasInvoicingDetails as jest.Mock).mockReturnValueOnce(false);
        const params = makeBase({iouType: CONST.IOU.TYPE.INVOICE});
        buildConfirmAction(params)({paymentType: undefined});
        expect(mockNavigate).toHaveBeenCalled();
        expect(params.validate).not.toHaveBeenCalled();
        expect(params.onConfirm).not.toHaveBeenCalled();
    });

    it('does not navigate to company-info step when routeError is set', () => {
        const policyMock = jest.requireMock<{hasInvoicingDetails: typeof hasInvoicingDetails}>('@userActions/Policy/Policy');
        (policyMock.hasInvoicingDetails as jest.Mock).mockReturnValueOnce(false);
        const params = makeBase({iouType: CONST.IOU.TYPE.INVOICE, routeError: 'route error'});
        buildConfirmAction(params)({paymentType: undefined});
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('calls onSendMoney for PAY type with valid payment method', () => {
        const params = makeBase({iouType: CONST.IOU.TYPE.PAY});
        buildConfirmAction(params)({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
        expect(params.onSendMoney).toHaveBeenCalledWith(CONST.IOU.PAYMENT_TYPE.ELSEWHERE);
        expect(params.onConfirm).not.toHaveBeenCalled();
    });

    it('does not call onSendMoney for PAY type without payment method', () => {
        const params = makeBase({iouType: CONST.IOU.TYPE.PAY});
        buildConfirmAction(params)({paymentType: undefined});
        expect(params.onSendMoney).not.toHaveBeenCalled();
    });

    it('shows delegate modal for PAY when delegate access restricted', () => {
        const params = makeBase({iouType: CONST.IOU.TYPE.PAY, isDelegateAccessRestricted: true});
        buildConfirmAction(params)({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
        expect(params.showDelegateNoAccessModal).toHaveBeenCalled();
        expect(params.onSendMoney).not.toHaveBeenCalled();
    });

    it('does not call onSendMoney when formError is set on PAY branch', () => {
        const params = makeBase({iouType: CONST.IOU.TYPE.PAY, formError: 'iou.error.invalidMerchant'});
        buildConfirmAction(params)({paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE});
        expect(params.onSendMoney).not.toHaveBeenCalled();
    });
});

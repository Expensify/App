import buildConfirmAction from '@components/MoneyRequestConfirmationList/confirmAction';

import {hasInvoicingDetails} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';

const mockNavigate = jest.fn();
jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: (...args: unknown[]) => mockNavigate(...args) as unknown,
    getActiveRoute: () => '/',
}));
jest.mock('@userActions/Policy/Policy', () => ({hasInvoicingDetails: jest.fn(() => true)}));

const mockHasInvoicingDetails = jest.mocked(hasInvoicingDetails);

type Params = Parameters<typeof buildConfirmAction>[0];

function makeBase(overrides: Partial<Params> = {}): Params {
    return {
        iouType: CONST.IOU.TYPE.SUBMIT,
        policy: undefined,
        transactionID: 'txn1',
        routeError: undefined,
        formError: '',
        isDelegateAccessRestricted: false,
        validate: jest.fn(() => ({errorKey: null})),
        setConfirmError: jest.fn(),
        clearConfirmError: jest.fn(),
        revealFieldErrors: jest.fn(),
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
        expect(params.onConfirm).toHaveBeenCalledWith();
        expect(params.onSendMoney).not.toHaveBeenCalled();
    });

    it('returns without calling onConfirm when validate returns null', () => {
        // Given a confirmation whose validation stops it without an error to show
        const params = makeBase({validate: jest.fn(() => null)});

        // When the user confirms
        buildConfirmAction(params)({paymentType: undefined});

        // Then nothing is submitted and no error is set, since validation already handled the press
        expect(params.onConfirm).not.toHaveBeenCalled();
        expect(params.setConfirmError).not.toHaveBeenCalled();
    });

    it('sets form error when validation returns an errorKey', () => {
        // Given a confirmation with no participant, an error that has no field of its own
        const params = makeBase({validate: jest.fn(() => ({errorKey: 'iou.error.noParticipantSelected'}))});

        // When the user confirms
        buildConfirmAction(params)({paymentType: undefined});

        // Then the error becomes the form error shown above the button, and no field errors are revealed
        expect(params.setConfirmError).toHaveBeenCalledWith('iou.error.noParticipantSelected');
        expect(params.revealFieldErrors).not.toHaveBeenCalled();
        expect(params.onConfirm).not.toHaveBeenCalled();
    });

    it('reveals a field error on its field and drops the error an earlier confirm set', () => {
        // Given a confirmation whose amount field is missing a value, while an error from an earlier confirm is still set
        const params = makeBase({formError: 'violations.categoryOutOfPolicy', validate: jest.fn(() => ({isFieldError: true as const}))});

        // When the user confirms
        buildConfirmAction(params)({paymentType: undefined});

        // Then the field errors are revealed and the earlier confirm's error is dropped, since validation checks it again on the next confirm
        expect(params.revealFieldErrors).toHaveBeenCalledTimes(1);
        expect(params.clearConfirmError).toHaveBeenCalledTimes(1);
        expect(params.onConfirm).not.toHaveBeenCalled();
    });

    it('sets didConfirmSplit when validation result has shouldSetDidConfirmSplit', () => {
        // Given an edited split whose SmartScan failed, so validation asks to remember that the split was confirmed
        const params = makeBase({
            validate: jest.fn(() => ({errorKey: 'iou.error.genericSmartscanFailureMessage', shouldSetDidConfirmSplit: true})),
        });

        // When the user confirms
        buildConfirmAction(params)({paymentType: undefined});

        // Then the split is marked as confirmed and the SmartScan failure becomes the form error
        expect(params.setDidConfirmSplit).toHaveBeenCalledWith(true);
        expect(params.setConfirmError).toHaveBeenCalledWith('iou.error.genericSmartscanFailureMessage');
    });

    it('does not call onConfirm when formError is already set', () => {
        const params = makeBase({formError: 'iou.error.invalidMerchant'});
        buildConfirmAction(params)({paymentType: undefined});
        expect(params.onConfirm).not.toHaveBeenCalled();
    });

    it('navigates to company-info step for invoice with no invoicing details once the expense is valid', () => {
        mockHasInvoicingDetails.mockReturnValueOnce(false);
        const params = makeBase({iouType: CONST.IOU.TYPE.INVOICE});
        buildConfirmAction(params)({paymentType: undefined});
        expect(params.validate).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalled();
        expect(params.onConfirm).not.toHaveBeenCalled();
    });

    it('blocks the company-info step for an invalid invoice instead of routing past validation (#96579)', () => {
        // Given an invoice whose sender workspace has no company info yet, and a cleared date
        mockHasInvoicingDetails.mockReturnValueOnce(false);
        const params = makeBase({iouType: CONST.IOU.TYPE.INVOICE, validate: jest.fn(() => ({isFieldError: true as const}))});

        // When the user confirms
        buildConfirmAction(params)({paymentType: undefined});

        // Then the error surfaces and the company info step - which sends the invoice without revalidating - is not reached
        expect(params.revealFieldErrors).toHaveBeenCalledTimes(1);
        expect(mockNavigate).not.toHaveBeenCalled();
        expect(params.onConfirm).not.toHaveBeenCalled();
    });

    it('does not navigate to company-info step when routeError is set', () => {
        mockHasInvoicingDetails.mockReturnValueOnce(false);
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

import {act, render} from '@testing-library/react-native';

import type {DecisionModalProps} from '@components/DecisionModal';
import HoldMenuModalWrapper from '@components/Modal/Global/HoldMenuModalWrapper';

import CONST from '@src/CONST';

let mockDecisionModalProps: DecisionModalProps | undefined;
const mockOnSubmit = jest.fn();

jest.mock('@components/DecisionModal', () => {
    return (props: DecisionModalProps) => {
        mockDecisionModalProps = props;
        return null;
    };
});

jest.mock('@hooks/useHoldMenuSubmit', () => ({
    __esModule: true,
    default: () => ({onSubmit: mockOnSubmit, isApprove: true}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined],
}));

function renderWrapper(overrides: {nonHeldAmount?: string; hasNonHeldExpenses?: boolean}, closeModal = jest.fn()) {
    return render(
        <HoldMenuModalWrapper
            closeModal={closeModal}
            resolveModal={jest.fn()}
            reportID="1"
            chatReportID="2"
            requestType={CONST.IOU.REPORT_ACTION_TYPE.APPROVE}
            fullAmount="$100.00"
            transactionCount={2}
            {...overrides}
        />,
    );
}

describe('HoldMenuModalWrapper', () => {
    beforeEach(() => {
        mockDecisionModalProps = undefined;
        mockOnSubmit.mockClear();
    });

    it('offers the partial option when a valid non-held amount is supplied', () => {
        // Given a report whose non-held expenses add up to a meaningful amount
        // When the hold menu is rendered
        renderWrapper({nonHeldAmount: '$40.00', hasNonHeldExpenses: true});

        // Then the partial option offers that amount
        expect(mockDecisionModalProps?.firstOptionText).toContain('$40.00');
    });

    it('omits the partial option when the non-held amount is not meaningful, even though non-held expenses exist', () => {
        // Given a report with non-held expenses whose amounts net out, so the caller sends no amount
        // See https://github.com/Expensify/App/issues/100639
        // When the hold menu is rendered
        renderWrapper({nonHeldAmount: undefined, hasNonHeldExpenses: true});

        // Then the partial option is not offered, rather than offering a zero amount
        expect(mockDecisionModalProps?.firstOptionText).toBeUndefined();
    });

    it('omits the partial option when every expense is on hold', () => {
        // Given a report where every expense is on hold
        // When the hold menu is rendered
        renderWrapper({nonHeldAmount: undefined, hasNonHeldExpenses: false});

        // Then there is nothing to approve partially
        expect(mockDecisionModalProps?.firstOptionText).toBeUndefined();
    });

    it('still shows the full amount option in every case', () => {
        // Given a report with no meaningful non-held amount
        // When the hold menu is rendered
        renderWrapper({nonHeldAmount: undefined, hasNonHeldExpenses: true});

        // Then the full amount option is always available
        expect(mockDecisionModalProps?.secondOptionText).toContain('$100.00');
    });

    it('runs the chosen option only after the modal has hidden', () => {
        // Given an open hold menu, where paying can open the Wise quote modal, which must not stack on top of it
        const closeModal = jest.fn();
        renderWrapper({nonHeldAmount: '$40.00', hasNonHeldExpenses: true}, closeModal);

        // When the admin picks the partial option
        act(() => mockDecisionModalProps?.onFirstOptionSubmit?.());

        // Then nothing runs until the modal finishes hiding
        expect(mockDecisionModalProps?.isVisible).toBe(false);
        expect(mockOnSubmit).not.toHaveBeenCalled();

        // When the modal has hidden
        act(() => mockDecisionModalProps?.onModalHide?.());

        // Then it leaves the modal stack first and runs the partial option after
        expect(closeModal).toHaveBeenCalledWith({action: 'CLOSE'});
        expect(mockOnSubmit).toHaveBeenCalledWith(false);
        expect(closeModal.mock.invocationCallOrder.at(0)).toBeLessThan(mockOnSubmit.mock.invocationCallOrder.at(0) ?? 0);
    });

    it('runs nothing when the modal is dismissed without a choice', () => {
        // Given an open hold menu
        const closeModal = jest.fn();
        renderWrapper({nonHeldAmount: '$40.00', hasNonHeldExpenses: true}, closeModal);

        // When the admin dismisses it and it hides
        act(() => mockDecisionModalProps?.onClose?.());
        act(() => mockDecisionModalProps?.onModalHide?.());

        // Then it leaves the modal stack without paying or approving
        expect(closeModal).toHaveBeenCalledWith({action: 'CLOSE'});
        expect(mockOnSubmit).not.toHaveBeenCalled();
    });
});

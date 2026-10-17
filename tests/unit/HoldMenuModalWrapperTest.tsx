import {render} from '@testing-library/react-native';

import type {DecisionModalProps} from '@components/DecisionModal';
import HoldMenuModalWrapper from '@components/Modal/Global/HoldMenuModalWrapper';

import CONST from '@src/CONST';

let mockDecisionModalProps: DecisionModalProps | undefined;

jest.mock('@components/DecisionModal', () => {
    return (props: DecisionModalProps) => {
        mockDecisionModalProps = props;
        return null;
    };
});

jest.mock('@hooks/useHoldMenuSubmit', () => ({
    __esModule: true,
    default: () => ({onSubmit: jest.fn(), isApprove: true}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined],
}));

function renderWrapper(overrides: {nonHeldAmount?: string; hasNonHeldExpenses?: boolean}) {
    return render(
        <HoldMenuModalWrapper
            closeModal={jest.fn()}
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
});

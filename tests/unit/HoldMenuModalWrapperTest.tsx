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

    it('offers the partial approve option when a valid non-held amount is supplied', () => {
        renderWrapper({nonHeldAmount: '$40.00', hasNonHeldExpenses: true});

        expect(mockDecisionModalProps?.firstOptionText).toContain('$40.00');
    });

    it('omits the partial approve option when the non-held amount is not meaningful, even though non-held expenses exist', () => {
        // The report still has an unheld expense, but its amount nets out against the held one, so the caller
        // sends `undefined` rather than an amount. The modal must not fall back to rendering a zero amount.
        renderWrapper({nonHeldAmount: undefined, hasNonHeldExpenses: true});

        expect(mockDecisionModalProps?.firstOptionText).toBeUndefined();
    });

    it('omits the partial approve option when every expense is on hold', () => {
        renderWrapper({nonHeldAmount: undefined, hasNonHeldExpenses: false});

        expect(mockDecisionModalProps?.firstOptionText).toBeUndefined();
    });
});

import HoldOrRejectEducationalModalContent from '@components/HoldOrRejectEducationalModalContent';

import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import React from 'react';

import useExpenseEducationalModal from './useExpenseEducationalModal';

/** The action the user picked before the hold/reject educational modal was shown, which decides what runs once they dismiss it */
type RejectModalAction = ValueOf<
    | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD
    | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT
    | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_BULK
    | typeof CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT_REPORT
>;

/** Opens the hold/reject educational modal on the global modal stack. */
const useHoldRejectEducationalModal = () => {
    const showModal = useExpenseEducationalModal();

    const showHoldOrRejectEducationalModal = () => {
        return showModal(<HoldOrRejectEducationalModalContent />);
    };

    return {showHoldOrRejectEducationalModal};
};

export default useHoldRejectEducationalModal;
export type {RejectModalAction};

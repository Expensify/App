import HoldSubmitterEducationalModalContent from '@components/HoldSubmitterEducationalModalContent';

import React from 'react';

import useExpenseEducationalModal from './useExpenseEducationalModal';

type HoldSubmitterEducationalModalOptions = {
    /** Whether the expense is from a DM (direct message) report */
    isDM?: boolean;
};

/** Opens the hold submitter educational modal on the global modal stack. */
const useHoldSubmitterEducationalModal = () => {
    const showModal = useExpenseEducationalModal();

    const showHoldSubmitterEducationalModal = (options?: HoldSubmitterEducationalModalOptions) => {
        return showModal(<HoldSubmitterEducationalModalContent isDM={options?.isDM} />);
    };

    return {showHoldSubmitterEducationalModal};
};

export default useHoldSubmitterEducationalModal;

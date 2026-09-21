import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';

import {useEffect, useRef} from 'react';

function useSubmissionViolations() {
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const transactionViolationsRef = useRef(transactionViolations);

    useEffect(() => {
        transactionViolationsRef.current = transactionViolations;
    }, [transactionViolations]);

    return {transactionViolations, transactionViolationsRef};
}

export default useSubmissionViolations;

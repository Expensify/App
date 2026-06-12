import {useEffect, useRef} from 'react';
import {endSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';

type ConfirmationTelemetryProps = {
    transactionID: string | undefined;
};

/**
 * Side-effect-only component that ends the confirmation list ready
 * telemetry span once the transaction ID becomes available.
 */
function ConfirmationTelemetry({transactionID}: ConfirmationTelemetryProps) {
    const hasEndedListReadySpan = useRef(false);

    useEffect(() => {
        if (hasEndedListReadySpan.current || !transactionID) {
            return;
        }
        hasEndedListReadySpan.current = true;
        endSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_LIST_READY);
    }, [transactionID]);

    return null;
}

ConfirmationTelemetry.displayName = 'ConfirmationTelemetry';

export default ConfirmationTelemetry;

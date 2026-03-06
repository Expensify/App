import {useLayoutEffect} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {cancelSpan, endSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
import type Transaction from '@src/types/onyx/Transaction';

/**
 * Ends the scan shortcut Sentry span when the Scan page finishes first render,
 * only when the flow was started from the green receipt FAB (isFromFloatingActionButton + request type SCAN).
 */
function useScanShortcutSpan(initialTransaction: OnyxEntry<Transaction>) {
    const isFromScanShortcut = initialTransaction?.isFromFloatingActionButton === true && initialTransaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.SCAN;
    useLayoutEffect(() => {
        if (!isFromScanShortcut) {
            return;
        }
        endSpan(CONST.TELEMETRY.SPAN_SCAN_SHORTCUT);
        return () => cancelSpan(CONST.TELEMETRY.SPAN_SCAN_SHORTCUT);
    }, [isFromScanShortcut]);
}

export default useScanShortcutSpan;

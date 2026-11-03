/**
 * During dismiss_modal_and_open_report, defers non-essential report UI (composer, receipt panel, invisible handlers)
 * until the report gains focus and the navigation transition after it ends, so the first render is lighter.
 */
import NavigationDeferredMount from '@components/NavigationDeferredMount';

import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import {useIsFocused} from '@react-navigation/native';
import {useState} from 'react';

type ReportNonEssentialsDeferredMountProps = {
    /** The report the screen shows, matched against the pending submit follow-up action */
    reportID: string | undefined;

    /** Shown while the children are deferred */
    placeholder?: ReactNode;

    /** UI that is not needed for the first paint of the report */
    children: ReactNode;
};

function isOpeningReportAfterSubmit(reportID: string | undefined): boolean {
    const pending = getPendingSubmitFollowUpAction();
    return pending?.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT && pending?.reportID === reportID;
}

type FocusGatedDeferredMountProps = Omit<ReportNonEssentialsDeferredMountProps, 'reportID'>;

/** Starts the deferred mount on first focus, so a report mounted under the RHP also waits for the dismiss. */
function FocusGatedDeferredMount({placeholder, children}: FocusGatedDeferredMountProps): ReactNode {
    const isFocused = useIsFocused();

    // Latched so a later blur does not unmount the deferred UI once it has started mounting.
    const [hasBeenFocused, setHasBeenFocused] = useState(isFocused);
    if (isFocused && !hasBeenFocused) {
        setHasBeenFocused(true);
    }

    if (!hasBeenFocused) {
        return placeholder;
    }

    return <NavigationDeferredMount placeholder={placeholder}>{children}</NavigationDeferredMount>;
}

function ReportNonEssentialsDeferredMount({reportID, placeholder, children}: ReportNonEssentialsDeferredMountProps): ReactNode {
    // Read once at mount: the pending action is cleared when the report gains focus, which must not cut the deferral short.
    const [shouldDefer] = useState(() => isOpeningReportAfterSubmit(reportID));

    if (!shouldDefer) {
        return children;
    }

    return <FocusGatedDeferredMount placeholder={placeholder}>{children}</FocusGatedDeferredMount>;
}

export default ReportNonEssentialsDeferredMount;

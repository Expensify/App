/**
 * During dismiss_modal_and_open_report, defers non-essential report UI (composer, receipt panel, invisible handlers)
 * until the navigation transition ends, so the first render of the report content is lighter.
 */
import NavigationDeferredMount from '@components/NavigationDeferredMount';

import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

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

function ReportNonEssentialsDeferredMount({reportID, placeholder, children}: ReportNonEssentialsDeferredMountProps): ReactNode {
    // Read once at mount: the pending action is cleared when the report gains focus, which must not cut the deferral short.
    const [shouldDefer] = useState(() => isOpeningReportAfterSubmit(reportID));

    if (!shouldDefer) {
        return children;
    }

    return <NavigationDeferredMount placeholder={placeholder}>{children}</NavigationDeferredMount>;
}

export default ReportNonEssentialsDeferredMount;

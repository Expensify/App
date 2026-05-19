import React from 'react';
import type {ReactNode} from 'react';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import type {OptionData} from '@libs/ReportUtils';

type OfflineWrapperProps = {
    /** Pending action forwarded to OfflineWithFeedback to drive opacity and strikethrough. */
    pendingAction: OptionData['pendingAction'];

    /** Errors forwarded to OfflineWithFeedback. Error messages themselves are hidden in the LHN. */
    errors: OptionData['allReportErrors'];

    /** Row content to wrap. */
    children: ReactNode;
};

function OfflineWrapper({pendingAction, errors, children}: OfflineWrapperProps) {
    return (
        <OfflineWithFeedback
            pendingAction={pendingAction}
            errors={errors}
            shouldShowErrorMessages={false}
            needsOffscreenAlphaCompositing
        >
            {children}
        </OfflineWithFeedback>
    );
}

OfflineWrapper.displayName = 'OptionRow.OfflineWrapper';

export default OfflineWrapper;

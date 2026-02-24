import React from 'react';
import FABPopoverContentInner from './FABPopoverContentInner';
import type {FABPopoverContentProps} from './types';

type FABPopoverContentExtraProps = FABPopoverContentProps & {
    reportID: string;
    activePolicyID: string | undefined;
};

function FABPopoverContent({isVisible, onClose, onItemSelected, anchorRef, reportID, activePolicyID}: FABPopoverContentExtraProps) {
    return (
        <FABPopoverContentInner
            isVisible={isVisible}
            onClose={onClose}
            onItemSelected={onItemSelected}
            anchorRef={anchorRef}
            reportID={reportID}
            activePolicyID={activePolicyID}
        />
    );
}

FABPopoverContent.displayName = 'FABPopoverContent';

export default FABPopoverContent;

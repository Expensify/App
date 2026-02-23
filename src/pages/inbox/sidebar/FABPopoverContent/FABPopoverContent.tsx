import React from 'react';
import FABPopoverContentInner from './FABPopoverContentInner';
import type {FABPopoverContentProps} from './types';

type FABPopoverContentExtraProps = FABPopoverContentProps & {
    reportID: string;
    activePolicyID: string | undefined;
};

function FABPopoverContent({
    isMenuMounted,
    isVisible,
    onClose,
    onItemSelected,
    onModalHide,
    anchorPosition,
    anchorRef,
    shouldUseNarrowLayout,
    reportID,
    activePolicyID,
}: FABPopoverContentExtraProps) {
    if (!isMenuMounted) {
        return null;
    }

    return (
        <FABPopoverContentInner
            isVisible={isVisible}
            onClose={onClose}
            onItemSelected={onItemSelected}
            onModalHide={onModalHide}
            anchorPosition={anchorPosition}
            anchorRef={anchorRef}
            shouldUseNarrowLayout={shouldUseNarrowLayout}
            reportID={reportID}
            activePolicyID={activePolicyID}
        />
    );
}

FABPopoverContent.displayName = 'FABPopoverContent';

export default FABPopoverContent;

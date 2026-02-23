import React from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import type * as OnyxTypes from '@src/types/onyx';
import FABPopoverContentInner from './FABPopoverContentInner';
import type {FABPopoverContentProps} from './types';

type FABPopoverContentExtraProps = FABPopoverContentProps & {
    reportID: string;
    activePolicyID: string | undefined;
    session: {email?: string; accountID?: number} | undefined;
    policyChatForActivePolicy: OnyxTypes.Report | undefined;
    allTransactionDrafts: OnyxCollection<OnyxTypes.Transaction>;
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
    session,
    policyChatForActivePolicy,
    allTransactionDrafts,
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
            session={session}
            policyChatForActivePolicy={policyChatForActivePolicy}
            allTransactionDrafts={allTransactionDrafts}
        />
    );
}

FABPopoverContent.displayName = 'FABPopoverContent';

export default FABPopoverContent;

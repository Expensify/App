import React from 'react';
import CONST from '@src/CONST';
import FABPopoverMenu from './FABPopoverMenu';
import CreateReportMenuItem from './menuItems/CreateReportMenuItem';
import ExpenseMenuItem from './menuItems/ExpenseMenuItem';
import InvoiceMenuItem from './menuItems/InvoiceMenuItem';
import NewChatMenuItem from './menuItems/NewChatMenuItem';
import NewWorkspaceMenuItem from './menuItems/NewWorkspaceMenuItem';
import QuickActionMenuItem from './menuItems/QuickActionMenuItem';
import TestDriveMenuItem from './menuItems/TestDriveMenuItem';
import TrackDistanceMenuItem from './menuItems/TrackDistanceMenuItem';
import TravelMenuItem from './menuItems/TravelMenuItem';
import type {FABPopoverContentProps} from './types';

type FABPopoverContentInnerProps = FABPopoverContentProps & {
    reportID: string;
    activePolicyID: string | undefined;
};

function FABPopoverContentInner({isVisible, onClose, onItemSelected, anchorRef, reportID, activePolicyID}: FABPopoverContentInnerProps) {
    return (
        <FABPopoverMenu
            isVisible={isVisible}
            onClose={onClose}
            onItemSelected={onItemSelected}
            anchorRef={anchorRef}
            animationInTiming={CONST.MODAL.ANIMATION_TIMING.FAB_IN}
            animationOutTiming={CONST.MODAL.ANIMATION_TIMING.FAB_OUT}
        >
            <QuickActionMenuItem reportID={reportID} />
            <ExpenseMenuItem reportID={reportID} />
            <TrackDistanceMenuItem reportID={reportID} />
            <CreateReportMenuItem activePolicyID={activePolicyID} />
            <NewChatMenuItem />
            <InvoiceMenuItem reportID={reportID} />
            <TravelMenuItem activePolicyID={activePolicyID} />
            <TestDriveMenuItem />
            <NewWorkspaceMenuItem />
        </FABPopoverMenu>
    );
}

FABPopoverContentInner.displayName = 'FABPopoverContentInner';

export default FABPopoverContentInner;

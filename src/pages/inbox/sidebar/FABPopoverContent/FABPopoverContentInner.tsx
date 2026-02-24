import React from 'react';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
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
import type {FABPopoverContentInnerProps} from './types';

type FABPopoverContentInnerExtraProps = FABPopoverContentInnerProps & {
    reportID: string;
    activePolicyID: string | undefined;
};

function FABPopoverContentInner({isVisible, onClose, onItemSelected, onModalHide, anchorRef, reportID, activePolicyID}: FABPopoverContentInnerExtraProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <FABPopoverMenu
            isVisible={isVisible}
            onClose={onClose}
            onItemSelected={onItemSelected}
            onModalHide={onModalHide}
            anchorRef={anchorRef}
            fromSidebarMediumScreen={!shouldUseNarrowLayout}
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

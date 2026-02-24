import React from 'react';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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

function FABPopoverContentInner({isVisible, onClose, onItemSelected, onModalHide, anchorPosition, anchorRef, reportID, activePolicyID}: FABPopoverContentInnerExtraProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const icons = useMemoizedLazyExpensifyIcons([
        'CalendarSolid',
        'Document',
        'NewWorkspace',
        'NewWindow',
        'Binoculars',
        'Car',
        'Location',
        'Suitcase',
        'Task',
        'InvoiceGeneric',
        'ReceiptScan',
        'ChatBubble',
        'Coins',
        'Receipt',
        'Cash',
        'Transfer',
        'MoneyCircle',
        'Clock',
    ] as const);

    return (
        <FABPopoverMenu
            isVisible={isVisible}
            onClose={onClose}
            onItemSelected={onItemSelected}
            onModalHide={onModalHide}
            anchorPosition={anchorPosition}
            anchorRef={anchorRef}
            fromSidebarMediumScreen={!shouldUseNarrowLayout}
            animationInTiming={CONST.MODAL.ANIMATION_TIMING.FAB_IN}
            animationOutTiming={CONST.MODAL.ANIMATION_TIMING.FAB_OUT}
        >
            <QuickActionMenuItem
                icons={icons}
                reportID={reportID}
            />
            <ExpenseMenuItem
                icons={icons}
                reportID={reportID}
            />
            <TrackDistanceMenuItem
                icons={icons}
                reportID={reportID}
            />
            <CreateReportMenuItem
                icons={icons}
                activePolicyID={activePolicyID}
            />
            <NewChatMenuItem icons={icons} />
            <InvoiceMenuItem
                icons={icons}
                reportID={reportID}
            />
            <TravelMenuItem
                icons={icons}
                activePolicyID={activePolicyID}
            />
            <TestDriveMenuItem icons={icons} />
            <NewWorkspaceMenuItem icons={icons} />
        </FABPopoverMenu>
    );
}

FABPopoverContentInner.displayName = 'FABPopoverContentInner';

export default FABPopoverContentInner;
